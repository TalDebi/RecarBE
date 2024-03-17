import { Request, Response } from "express";
import UserModel, { User } from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { Document } from "mongoose";
import { randomBytes } from "crypto";
import mongoose from "mongoose";

const client = new OAuth2Client();

class AuthController {
  async googleSignIn(req: Request, res: Response) {
    try {
      if (!req.body.credential) {
        return res
          .status(400)
          .json({ message: "Missing credential field in request body" });
      }
      const ticket = await client.verifyIdToken({
        idToken: req.body.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = payload?.email;
      if (email != null) {
        let user = await UserModel.findOne({ email: email });
        if (user == null) {
          user = await UserModel.create({
            name: payload?.name,
            email: email,
            password: randomBytes(10).toString("hex"),
            phoneNumber: "",
            imgUrl: payload?.picture,
          });
        }
        const tokens = await this.generateTokens(user);
        const {
          refreshTokens,
          password: userPassword,
          ...securedUser
        } = user.toObject();
        return res.status(201).send({
          user: securedUser,
          tokens,
        });
      }
    } catch (err) {
      if (
        err.name === "FirebaseAuthError" &&
        err.code === "auth/id-token-expired"
      ) {
        return res.status(401).send("ID token expired");
      }

      return res.status(500).send(err.message);
    }
  }

  async register(req: Request, res: Response) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const phoneNumber = req.body.phoneNumber;
    const imgUrl = req.body.imgUrl;
    if (!email || !password) {
      return res.status(400).send("missing email or password");
    }
    try {
      const rs = await UserModel.findOne({ email: email });
      if (rs != null) {
        return res.status(409).send("email already exists");
      }
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      const rs2 = await UserModel.create({
        name: name,
        email: email,
        password: encryptedPassword,
        phoneNumber: phoneNumber,
        imgUrl: imgUrl,
      });
      const tokens = await this.generateTokens(rs2);
      const {
        refreshTokens,
        password: userPassword,
        ...securedUser
      } = rs2.toObject();
      return res.status(201).send({
        user: securedUser,
        tokens,
      });
    } catch (err) {
      return res.status(500).send("Internal Server Error");
    }
  }

  async generateTokens(user: Document & User) {
    const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_SECRET
    );
    if (user.refreshTokens == null) {
      user.refreshTokens = [refreshToken];
    } else {
      user.refreshTokens.push(refreshToken);
    }
    await user.save();
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async login(req: Request, res: Response) {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      return res.status(400).send("missing email or password");
    }
    try {
      const user = await UserModel.findOne({ email: email });
      if (user == null) {
        return res.status(401).send("email or password incorrect");
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).send("email or password incorrect");
      }

      const tokens = await this.generateTokens(user);
      const {
        refreshTokens,
        password: userPassword,
        ...SecuredUser
      } = user.toObject();
      return res.status(200).send({ user: SecuredUser, tokens });
    } catch (err) {
      return res.status(500).send("Internal Server Error");
    }
  }

  async logout(req: Request, res: Response) {
    const authHeader = req.headers["authorization"];
    const refreshToken = authHeader && authHeader.split(" ")[1]; // Bearer <token>
    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, user: { _id: string }) => {
        if (err) {
          return res.sendStatus(401);
        }
        try {
          const userDb = await UserModel.findOne({ _id: user._id });
          if (
            !userDb.refreshTokens ||
            !userDb.refreshTokens.includes(refreshToken)
          ) {
            userDb.refreshTokens = [];
            await userDb.save();
            return res.sendStatus(401);
          } else {
            userDb.refreshTokens = userDb.refreshTokens.filter(
              (t) => t !== refreshToken
            );
            await userDb.save();
            return res.sendStatus(200);
          }
        } catch (err) {
          return res.sendStatus(500).send(err.message);
        }
      }
    );
  }

  async refresh(req: Request, res: Response) {
    const authHeader = req.headers["authorization"];
    const refreshToken = authHeader && authHeader.split(" ")[1]; // Bearer <token>
    if (refreshToken == null) return res.sendStatus(400);
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, user: { _id: string }) => {
        if (err) {
          return res.sendStatus(401);
        }
        try {
          const userDb = await UserModel.findOne({ _id: user._id });
          if (
            !userDb.refreshTokens ||
            !userDb.refreshTokens.includes(refreshToken)
          ) {
            userDb.refreshTokens = [];
            await userDb.save();
            return res.sendStatus(401);
          }
          const accessToken = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
          );
          const newRefreshToken = jwt.sign(
            { _id: user._id },
            process.env.JWT_REFRESH_SECRET
          );
          userDb.refreshTokens = userDb.refreshTokens.filter(
            (t) => t !== refreshToken
          );
          userDb.refreshTokens.push(newRefreshToken);
          await userDb.save();
          return res.status(200).send({
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
        } catch (err) {
          return res.sendStatus(500).send(err.message);
        }
      }
    );
  }

  async putById(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, password, phoneNumber, imgUrl } = req.body;

    if (!id || !name || !email || !password) {
      return res.status(400).send("Missing required fields");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid user ID");
    }

    try {
      const existingUser = await UserModel.findById(id);

      if (!existingUser) {
        return res.status(404).send("User not found");
      }

      const userWithSameEmail = await UserModel.findOne({ email: email });
      if (userWithSameEmail && userWithSameEmail._id.toString() !== id) {
        return res.status(409).send("Email already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        {
          name: name,
          email: email,
          password: encryptedPassword,
          phoneNumber: phoneNumber,
          imgUrl: imgUrl,
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      const {
        refreshTokens,
        password: userPassword,
        ...securedUser
      } = updatedUser.toObject();

      return res.status(200).send(securedUser);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }
}

const authController = new AuthController();

export default authController;
