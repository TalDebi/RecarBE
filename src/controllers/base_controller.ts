import { Request, Response } from "express";
import { Model } from "mongoose";

export class BaseController<ModelType> {
  model: Model<ModelType>;
  constructor(model: Model<ModelType>) {
    this.model = model;
  }

  isValid = (body: Partial<ModelType>): boolean => {
    const schemaPaths = Object.keys(this.model.schema.paths);

    for (const path of schemaPaths) {
      const schemaPath = this.model.schema.paths[path];

      if (schemaPath.isRequired && !body[path]) {
        return false;
      }

      const schemaPathInstance =
        schemaPath.instance.toLowerCase() !== "objectid"
          ? schemaPath.instance.toLowerCase()
          : "string";

      if (
        body[path] &&
        (typeof body[path])?.toString().toLowerCase() !== schemaPathInstance
      ) {
        return false;
      }
    }

    return true;
  };

  async get(req: Request, res: Response) {
    console.log("getAll");
    try {
      if (req.query.name) {
        const results = await this.model.find({ name: req.query.name });
        return res.status(200).send(results);
      } else {
        const results = await this.model.find();
        return res.status(200).send(results);
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  async getById(req: Request, res: Response) {
    console.log("getById:" + req.params.id);
    try {
      const result = await this.model.findById(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Resource not found" });
      }
      return res.status(200).send(result);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  async post(req: Request, res: Response) {
    console.log("post:" + req.body);

    if (!this.isValid(req.body)) {
      return res.status(400).send("Invalid parameters");
    }

    try {
      const obj = await this.model.create(req.body);
      return res.status(201).send(obj);
    } catch (err) {
      console.log(err);
      return res.status(500).send("fail: " + err.message);
    }
  }

  async putById(req: Request, res: Response) {
    console.log("put:" + req.params.id);

    if (!this.isValid(req.body)) {
      return res.status(400).send("Invalid parameters");
    }

    const oldObject = await this.model.findById(req.params.id);

    if (!oldObject) return res.status(404).send("the ID is not exist...");

    try {
      const newObject = await this.model.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          returnDocument: "after",
        }
      );
      return res.status(200).send(newObject);
    } catch (err) {
      console.log(err);
      return res.status(500).send("fail: " + err.message);
    }
  }

  async deleteById(req: Request, res: Response) {
    console.log("delete:" + req.params.id);

    const oldObject = await this.model.findById(req.params.id);

    if (!oldObject) return res.status(404).send("the ID is not exist...");

    try {
      await oldObject.deleteOne();

      return res.status(200).send(oldObject);
    } catch (err) {
      console.log(err);
      return res.status(500).send("fail: " + err.message);
    }
  }
}

const createController = <ModelType>(model: Model<ModelType>) => {
  return new BaseController<ModelType>(model);
};

export default createController;
