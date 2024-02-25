import { Request, Response, NextFunction } from 'express';
import { AuthResquest } from "./auth_middleware"
import PostModel, { Post } from '../models/post';
import CommentModel, { Comment } from "../models/comment"
import { ObjectId } from 'mongoose';

export interface CommentRequest extends AuthResquest {
  comment?: Comment,
  post?: Post
}

export const commentMiddleware = async (req: CommentRequest, res: Response, next: NextFunction) => {
  try {
    const comment: Comment = await CommentModel.findById(req.params.commentId);
    const post: Post = await PostModel.findById(req.params.postId);
    if (!post.comments.includes(comment._id )) {
      res.status(400).send("Comment does not belong to post")
    }
    req.comment = comment
    req.post = post
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  next();

}

export const securedCommentMiddleware = async (req: CommentRequest, res: Response, next: NextFunction) => {
  try {
    const comment: Comment = await CommentModel.findById(req.params.commentId);
    const post: Post = await PostModel.findById(req.params.postId);
    if (!post.comments.includes(comment._id)) {
      res.status(400).send("Comment does not belong to post")
    }
    if (req.user._id != (String(comment._id))) {
      res.status(401).send("Comment does not belong to user")
    }
    req.comment = comment
    req.post = post
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  next();

}
