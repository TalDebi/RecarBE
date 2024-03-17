import CarModel, { Car } from "../models/car";
import { Request, Response } from "express";
import createController, { BaseController } from "./base_controller";
class CarController extends BaseController<Car> {
  async getColors(req: Request, res: Response) {
    try {
      return res.status(200).send(await this.model.distinct("color"));
    } catch (err) {
      console.log(err)
      return res.status(500).send("failed: " + err.message);
    }
  };


  async getCities(req: Request, res: Response) {
    try {
      return res.status(200).send(await this.model.distinct("city"));
    } catch (err) {
      console.log(err)
      return res.status(500).send("failed: " + err.message);
    }
  };
}

const carController = new CarController(CarModel);

export default carController
