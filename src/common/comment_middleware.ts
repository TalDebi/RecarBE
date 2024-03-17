import { Request, Response, NextFunction } from 'express';
import { AuthResquest } from "./auth_middleware"
import PostModel, { Post } from '../models/post';
import CommentModel, { Comment } from "../models/comment"
import { Model, ObjectId, Document } from 'mongoose';

export interface CommentRequest extends AuthResquest {
  comment?: Document<unknown, {}, Comment> & Comment,
  post?: Document<unknown, {}, Post> & Post,
  reply?: Document<unknown, {}, Comment> & Comment
}

export const commentMiddleware = async (req: CommentRequest, res: Response, next: NextFunction) => {
  try {
    const comment = await CommentModel.findById(req.params.commentId);
    const post = await PostModel.findById(req.params.postId);
    if (!post.comments.includes(comment._id)) {
      return res.status(400).send("Comment does not belong to post")
    }
    req.comment = comment
    req.post = post
  } catch (err) {
    return res.status(500).json("Fail: " + err.message);
  }
  next();

}

export const securedCommentMiddleware = async (req: CommentRequest, res: Response, next: NextFunction) => {
  try {
    const comment = await CommentModel.findById(req.params.commentId);
    const post = await PostModel.findById(req.params.postId);
    if (!post.comments.includes(comment._id)) {
      return res.status(400).send("Comment does not belong to post")
    }
    if (req.user._id !== (String(comment.publisher))) {
      return res.status(401).send("Comment does not belong to user")
    }
    req.comment = comment
    req.post = post
  } catch (err) {
    return res.status(500).json("Fail: " + err.message);
  }
  next();

}

export const securedReplyMiddleware = async (req: CommentRequest, res: Response, next: NextFunction) => {
  try {
    const reply = await CommentModel.findById(req.params.replyId);
    const comment = await CommentModel.findById(req.params.commentId);
    const post = await PostModel.findById(req.params.postId);
    if (!post.comments.includes(comment._id)) {
      return res.status(400).send("Comment does not belong to post")
    }
    if (!comment.replies.includes(reply._id)) {
      return res.status(400).send("Reply does not belong to comment")
    }
    if (req.user._id !== (String(reply.publisher))) {
      return res.status(401).send("Reply does not belong to user")
    }
    req.comment = comment
    req.post = post
    req.reply = reply
  } catch (err) {
    return res.status(500).json("Fail: " + err.message);
  }
  next();

}
