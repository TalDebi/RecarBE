import PostModel, { Post } from "../models/post"
import { BaseController } from "./base_controller"
import { Response } from "express";
import CommentModel, { Comment } from "../models/comment"
import { AuthResquest } from "../common/auth_middleware"
import { CommentRequest } from "../common/comment_middleware"
import CarModel, { Car } from '../models/car'
import { ObjectId } from "mongoose";
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
        req.body.publisher = req.user._id;

        const oldObject: Post = await this.model.findById(req.params.postId);
        const newComment = await CommentModel.create(req.body)
        if (!oldObject) return res.status(404).send("The post does not exist...");

        try {
            const newObject = await this.model.findByIdAndUpdate(
                req.params.postId,
                { $push: { comments: newComment._id } },
                { new: true }

            );
            res.status(201).send(newObject);
        } catch (err) {
            console.log(err);
            res.status(500).send("fail: " + err.message);
        }
    }

    async post(req: AuthResquest, res: Response) {
        console.log("post:" + req.body);
        req.body.publisher = req.user._id;
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
        req.body.publisher = req.user._id
        try {
            const reply: Comment = await CommentModel.create(req.body)
            const newComment = await CommentModel.findByIdAndUpdate(
                req.comment._id,
                { $push: { replies: reply._id } },
                { new: true }
            )
            res.status(201).send(newComment);
        } catch (err) {
            console.log(err);
            res.status(500).send("fail: " + err.message);
        }
    }



    async search(req: AuthResquest, res: Response) {
        let searchFilters = {};
        let search: SearchQuery = req.query
        for (let queryKey in search) {
            try {
                search[queryKey] = JSON.parse(search[queryKey])
                if (search[queryKey].max != undefined || search[queryKey].min != undefined) {
                    searchFilters[queryKey] = {
                        "$gte": search[queryKey].min,
                        "$lte": search[queryKey].max
                    }
                    // Removing undefined from object
                    Object.keys(searchFilters[queryKey]).forEach(key => searchFilters[queryKey][key] === undefined ? delete searchFilters[queryKey][key] : {});

                }
                else if (Array.isArray(search[queryKey])) {
                    searchFilters[queryKey] = {
                        "$in": search[queryKey]
                    }
                }
            } catch (err) {
                searchFilters[queryKey] = search[queryKey]
            }

        }

        const cars = await CarModel.find(searchFilters)
        const carIds = []
        for (let car of cars) {
            carIds.push(car._id)
        }

        res.status(200).send(await PostModel.find({
            car: {
                $in: carIds
            }
        }))
    }

}


const postController = new PostController(PostModel);

export default postController