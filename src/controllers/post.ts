import PostModel, { Post } from "../models/post";
import { BaseController } from "./base_controller";
import { Response } from "express";
import CommentModel, { Comment } from "../models/comment";
import { AuthResquest } from "../common/auth_middleware";
import { CommentRequest } from "../common/comment_middleware";
import CarModel from "../models/car";
interface range {
  max?: number;
  min?: number;
}

interface SearchQuery {
  make?: string | string[];
  model?: string | string[];
  year?: range;
  price?: range;
  hand?: number | number[];
  color?: string | string[];
  milage?: range;
  city?: string | string[];
}

class PostController extends BaseController<Post> {
  async getPopulatedPost(req: AuthResquest, res: Response) {
    console.log("get populated post");
    try {
      if (req.params.id) {
        const results = await this.model
          .findById(req.params.id)
          .populate("publisher", ["name", "_id", "email", "imgUrl"])
          .populate("car")
          .populate({
            path: "comments",
            populate: [
              {
                path: "publisher",
                select: ["name", "_id", "email", "imgUrl"],
              },
              {
                path: "replies",
                populate: {
                  path: "publisher",
                  select: ["name", "_id", "email", "imgUrl"],
                },
              },
            ],
          });
        return res.send(results);
      } else {
        const results = await this.model.find();
        return res.send(results);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  }

  async addComment(req: AuthResquest, res: Response) {
    console.log("add comment to post: " + req.params.postId);
    req.body.publisher = req.user._id;

    const oldObject: Post = await this.model.findById(req.params.postId);
    const newComment = await CommentModel.create(req.body);
    if (!oldObject) return res.status(404).send("The post does not exist...");

    try {
      const newObject = await this.model.findByIdAndUpdate(
        req.params.postId,
        { $push: { comments: newComment._id } },
        { new: true }
      );
      return res.status(201).send(newObject);
    } catch (err) {
      console.log(err);
      return res.status(500).send("fail: " + err.message);
    }
  }

  async post(req: AuthResquest, res: Response) {
    console.log("post:" + req.body);
    req.body.publisher = req.user._id;
    return super.post(req, res);
  }

  async putById(req: AuthResquest, res: Response) {
    console.log("put:" + req.body);
    req.body.publisher = req.user._id;
    return super.putById(req, res);
  }

  async editComment(req: CommentRequest, res: Response) {
    try {
      const newObject = await CommentModel.findByIdAndUpdate(
        req.params.commentId,
        req.body,
        {
          returnDocument: "after",
        }
      );
      return res.send(newObject);
    } catch (err) {
      console.log(err);
      return res.status(500).send("fail: " + err.message);
    }
  }

  async deleteComment(req: CommentRequest, res: Response) {
    try {
      await PostModel.updateOne(
        { _id: req.post._id },
        { $pull: { comments: req.comment._id } }
      );
      await req.comment.deleteOne();
      return res.status(200).send(req.comment);
    } catch (err) {
      console.log(err);
      return res.status(500).send("fail: " + err.message);
    }
  }

  async deleteReply(req: CommentRequest, res: Response) {
    try {
      await CommentModel.updateOne(
        { _id: req.comment._id },
        { $pull: { replies: req.reply._id } }
      );
      await req.reply.deleteOne();
      return res.status(200).send(req.reply);
    } catch (err) {
      console.log(err);
      return res.status(500).send("fail: " + err.message);
    }
  }

  async addReply(req: CommentRequest, res: Response) {
    req.body.publisher = req.user._id;
    try {
      const reply: Comment = await CommentModel.create(req.body);
      const newComment = await CommentModel.findByIdAndUpdate(
        req.comment._id,
        { $push: { replies: reply._id } },
        { new: true }
      );
      return res.status(201).send(newComment);
    } catch (err) {
      console.log(err);
      return res.status(500).send("fail: " + err.message);
    }
  }

  async editReply(req: CommentRequest, res: Response) {
    try {
      const newObject = await CommentModel.findByIdAndUpdate(
        req.params.replyId,
        req.body,
        {
          returnDocument: "after",
        }
      );
      return res.send(newObject);
    } catch (err) {
      console.log(err);
      return res.status(500).send("fail: " + err.message);
    }
  }

  async search(req: AuthResquest, res: Response) {
    let searchFilters = {};
    let search: SearchQuery = req.query;
    for (let queryKey in search) {
      if (!Object.keys(CarModel.schema.paths).includes(queryKey)) {
        continue;
      }

      if (
        search[queryKey].max !== undefined ||
        search[queryKey].min != undefined
      ) {
        searchFilters[queryKey] = {
          $gte: search[queryKey].min,
          $lte: search[queryKey].max,
        };
        // Removing undefined from object
        Object.keys(searchFilters[queryKey]).forEach((key) =>
          searchFilters[queryKey][key]
            ? {}
            : delete searchFilters[queryKey][key]

        );
      } else if (Array.isArray(search[queryKey])) {
        searchFilters[queryKey] = {
          $in: search[queryKey],
        };
      } else {
        searchFilters[queryKey] = search[queryKey];
      }
    }
    try {
      const cars = await CarModel.find(searchFilters);
      const carIds = [];
      for (let car of cars) {
        carIds.push(car._id);
      }

      return res.status(200).send(
        await PostModel.find({
          car: {
            $in: carIds,
          },
        })
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  }
}

const postController = new PostController(PostModel);

export default postController;
