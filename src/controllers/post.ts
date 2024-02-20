import PostModel, { Post } from "../models/post"
import createController, { BaseController } from "./base_controller"
import { Request, Response } from "express";


class PostController extends BaseController<Post>{
    async get_complete(req: Request, res: Response) {
        console.log("getAll");
        try {
            if (req.query.name) {
                const results = await this.model
                    .find({ name: req.query.name })
                    .populate("publisher")
                    .populate({
                        path: "comments",
                        populate: [
                            { path: 'user' },
                            {
                                path: 'replies',
                                populate: { 'path': 'user' }
                            }
                        ]
                    });
                res.send(results);
            } else {
                const results = await this.model.find();
                res.send(results);
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async addComment(req: Request, res: Response) {
        console.log("put:" + req.params.id);

        const oldObject: Post = await this.model.findById(req.params.id);

        if (!oldObject) return res.status(404).send("the ID is not exist...");
        oldObject.comments.push(req.body)

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
}

const postController = new PostController(PostModel);

export default postController