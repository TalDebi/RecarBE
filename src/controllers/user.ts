import { Request, Response } from "express";
import UserModel from "../models/user";
import jwt from "jsonwebtoken";
import { Post } from "../models/post";
import { AuthResquest } from "../common/auth_middleware";

class UserController {
  async addLikedPost(req: AuthResquest, res: Response) {
    const user = await UserModel.findById(req.params.userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    try {
      await user.updateOne({ $push: { likedPosts: req.body._id } });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
    return res.status(200).send();
  }

  async removeLikedPost(req: AuthResquest, res: Response) {
    const user = await UserModel.findById(req.params.userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    try {
      await user.updateOne({ $pull: { likedPosts: req.params.postId } });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
    return res.status(200).send();
  }
  async getLikedPosts(req: AuthResquest, res: Response) {
    try {
      const user = await UserModel.findById(req.params.userId);

      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      const likedPosts: (Post | string)[] = user.likedPosts || [];

      const filteredLikedPosts: Post[] = likedPosts.filter(
        (post) => typeof post !== "string"
      ) as Post[];

      return res.status(200).send({ likedPosts: filteredLikedPosts });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
}

const userController = new UserController();

export default userController;
