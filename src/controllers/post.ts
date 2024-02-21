import PostModel, { Post } from "../models/post"
import createController, { BaseController } from "./base_controller"
import { Response } from "express";
import CommentModel from "../models/comment"
import { AuthResquest } from "../common/auth_middleware"


class PostController extends BaseController<Post>{
    async getFull(req: AuthResquest, res: Response) {
        console.log("getAll");
        try {
            if (req.params.id) {
                const results = await this.model
                    .findById(req.params.id)
                    .populate("publisher", ["name", "_id", "email", "imgUrl"])
                    .populate("car")
                    // .populate({
                    //     path: "comments",
                    //     populate: [
                    //         { path: 'user' },
                    //         {
                    //             path: 'replies',
                    //             populate: { 'path': 'user' }
                    //         }
                    //     ]
                    // })
                    .exec();
                res.send(results);
            } else {
                const results = await this.model.find();
                res.send(results);
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async addComment(req: AuthResquest, res: Response) {
        console.log("put:" + req.params.id);

        const oldObject: Post = await this.model.findById(req.params.id);

        if (!oldObject) return res.status(404).send("the ID is not exist...");
        oldObject.comments.push({ ...req.body, user: req.user._id })

        try {
            const newObject = await this.model.findByIdAndUpdate(
                req.params.id,
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
}


const postController = new PostController(PostModel);

export default postController