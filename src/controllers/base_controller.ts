import { Request, Response } from "express";
import { Model } from "mongoose";

export class BaseController<ModelType> {
  model: Model<ModelType>;
  constructor(model: Model<ModelType>) {
    this.model = model;
  }

  async get(req: Request, res: Response) {
    console.log("getAll");
    try {
      if (req.query.name) {
        const results = await this.model.find({ name: req.query.name });
        res.send(results);
      } else {
        const results = await this.model.find();
        res.send(results);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getById(req: Request, res: Response) {
    console.log("getById:" + req.params.id);
    try {
      const result = await this.model.findById(req.params.id);
      res.send(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async post(req: Request, res: Response) {
    console.log("post:" + req.body);
    try {
      const obj = await this.model.create(req.body);
      res.status(201).send(obj);
    } catch (err) {
      console.log(err);
      res.status(406).send("fail: " + err.message);
    }
  }

  async putById(req: Request, res: Response) {
    console.log("put:" + req.params.id);

    const oldObject = await this.model.findById(req.params.id);

    if (!oldObject) return res.status(404).send("the ID is not exist...");

    try {
      const newObject = await this.model.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          returnNewDocument: true,
        }
      );
      res.status(201).send("the new object is: " + newObject);
    } catch (err) {
      console.log(err);
      res.status(500).send("fail: " + err.message);
    }
  }

  async deleteById(req: Request, res: Response) {
    console.log("delete:" + req.params.id);

    const oldObject = await this.model.findById(req.params.id);

    if (!oldObject) return res.status(404).send("the ID is not exist...");

    try {
      const deletedObject = await this.model.findByIdAndDelete(req.params.id);

      res.status(201).send("the object deleted: " + deletedObject);
    } catch (err) {
      console.log(err);
      res.status(500).send("fail: " + err.message);
    }
  }
}

const createController = <ModelType>(model: Model<ModelType>) => {
  return new BaseController<ModelType>(model);
};

export default createController;
