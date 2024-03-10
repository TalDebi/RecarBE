import { Request, Response } from "express";
import UserModel from "../models/user";
import jwt from "jsonwebtoken";
import { Post } from "../models/post";
import { AuthResquest } from "../common/auth_middleware";

class UserController {
  async getLikedPosts(req: AuthResquest, res: Response) {
    try {
      console.log(1);
      console.log(req.params.userId);
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
