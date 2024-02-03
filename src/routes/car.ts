import express from "express";
const router = express.Router();
import CarController from "../controllers/car";
import authMiddleware from "../common/auth_middleware";

router.get("/", authMiddleware, CarController.get.bind(CarController));

router.get("/:id", authMiddleware, CarController.getById.bind(CarController));

router.post("/", authMiddleware, CarController.post.bind(CarController));

router.put("/:id", authMiddleware, CarController.putById.bind(CarController));

router.delete("/:id", authMiddleware, CarController.deleteById.bind(CarController));

export default router;
