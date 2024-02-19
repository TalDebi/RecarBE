import CarModel, { Car } from "../models/car";
import createController from "./base_controller";

const carController = createController<Car>(CarModel);

export default carController
