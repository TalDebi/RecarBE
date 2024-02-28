import PostModel, { Post } from "../models/post"
import { BaseController } from "./base_controller"
import { Response } from "express";
import CommentModel, { Comment } from "../models/comment"
import { AuthResquest } from "../common/auth_middleware"
import { CommentRequest } from "../common/comment_middleware"
import { ObjectId } from "mongoose";


class PostController extends BaseController<Post>{
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
                                select: ["name", "_id", "email", "imgUrl"]
                            },
                            {
                                path: 'replies',
                                populate: {
                                    path: 'publisher',
                                    select: ["name", "_id", "email", "imgUrl"]
                                }
                            }
                        ]
                    });
                res.send(results);
            } else {
                const results = await this.model.find();
                res.send(results);
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: err.message });
        }
    }

    async addComment(req: AuthResquest, res: Response) {
        console.log("add comment to post: " + req.params.postId);

        const oldObject: Post = await this.model.findById(req.params.postId);
        const newComment = await CommentModel.create(req.body)
        if (!oldObject) return res.status(404).send("the ID is not exist...");

        oldObject.comments.push(newComment._id)

        try {
            const newObject = await this.model.findByIdAndUpdate(
                req.params.postId,
                oldObject,
                {
                    returnDocument: "after",
                }
            );
            res.status(201).send(newObject);
        } catch (err) {
            console.log(err);
            res.status(500).send("fail: " + err.message);
        }
    }

    async post(req: AuthResquest, res: Response) {
        console.log("post:" + req.body);
        const _id = req.user._id;
        req.body.publisher = _id;
        super.post(req, res);
    }

    async getComment(req: CommentRequest, res: Response) {
        console.log("get commnet: " + req.comment._id + " of post " + req.post._id)
        try {
            res.send(req.comment);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: err.message });
        }
    }
    async getPopulatedComment(req: CommentRequest, res: Response) {
        try {
            const comment: Comment = await CommentModel.findById(req.comment._id)
                .populate(
                    "publisher",
                    ["name", "_id", "email", "imgUrl"])
                .populate({
                    path: "replies",
                    populate: {
                        path: 'publisher',
                        select: ["name", "_id", "email", "imgUrl"]
                    },
                });
            
            res.send(comment);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async editComment(req: CommentRequest, res: Response) {
        try {
            const newObject = await this.model.findByIdAndUpdate(
                req.params.commentId,
                req.body,
                {
                    returnDocument: "after",
                }
            );
            res.status(200).send(newObject);
        } catch (err) {
            console.log(err);
            res.status(500).send("fail: " + err.message);
        };
    }

    async deleteById(req: AuthResquest, res: Response) {
        const oldObject = await this.model.findById(req.params.id);

        if (!oldObject) return res.status(404).send("the ID is not exist...");
        for (let commentId of oldObject.comments) {
            await CommentModel.findByIdAndDelete(commentId)
        }
        try {
            const deletedObject = await this.model.findByIdAndDelete(req.params.id);
            res.status(200).send(deletedObject);
        } catch (err) {
            console.log(err);
            res.status(500).send("fail: " + err.message);
        }
    }


    async deleteComment(req: CommentRequest, res: Response) {
        try {
            for (let replyId of req.comment.replies) {
                await CommentModel.findByIdAndDelete(replyId)
            }

            await PostModel.updateOne(
                { _id: req.post._id },
                { $pull: { comments: req.comment._id } }
            )
            const deletedObject = await CommentModel.findByIdAndDelete(req.comment._id);
            res.status(200).send(deletedObject);
        } catch (err) {
            console.log(err);
            res.status(500).send("fail: " + err.message);
        }
    }

    async addReply(req: CommentRequest, res: Response) {
        try {
            const reply: Comment = await CommentModel.create(req.body)
            await CommentModel.updateOne(
                { _id: req.comment._id },
                { $push: { replies: reply._id } }
            )
            res.status(200).send("success");
        } catch (err) {
            console.log(err);
            res.status(500).send("fail: " + err.message);
        }
    }
}


const postController = new PostController(PostModel);

export default postController