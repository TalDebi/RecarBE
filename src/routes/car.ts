import express from "express";
const router = express.Router();
import CarController from "../controllers/car";
import authMiddleware from "../common/auth_middleware";

/**
 * @swagger
 * tags:
 *   name: Car
 *   description: Car API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - make
 *         - model
 *         - year
 *         - price
 *         - hand
 *         - color
 *         - mileage
 *       properties:
 *         _id:
 *           type: string
 *           description: id
 *         make:
 *           type: string
 *           description: The car's make
 *         model:
 *           type: string
 *           description: The car's model
 *         year:
 *           type: number
 *           description: The car's year of making
 *         price:
 *           type: number
 *           description: The car's price
 *         hand:
 *           type: number
 *           description: The car's hand
 *         color:
 *           type: string
 *           description: The car's color
 *         mileage:
 *           type: number
 *           description: The car's mileage
 *       example:
 *         _id: '1234567891'
 *         make: 'toyota'
 *         model: 'camry'
 *         year: 1993
 *         price: 20000
 *         hand: 3
 *         color : 'white'
 *         mileage: 200000
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ArrayOfCars:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Car'
 *       example:
 *         - _id: '1234567891'
 *           make: 'toyota'
 *           model: 'camry'
 *           year: 1993
 *           price: 20000
 *           hand: 3
 *           color : 'white'
 *           mileage: 200000
 *         - _id: '1234567892'
 *           make: 'toyota'
 *           model: 'camry'
 *           year: 2010
 *           price: 40000
 *           hand: 2
 *           color : 'black'
 *           mileage: 100000
 */

/**
 * @swagger
 * /car/:
 *  get:
 *      summary: get all cars
 *      tags: [Car]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: all cars
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ArrayOfCars'
 */
router.get("/", authMiddleware, CarController.get.bind(CarController));

/**
 * @swagger
 * /car/{carId}:
 *  get:
 *      summary: get a car by id
 *      tags: [Car]
 *      description: need to provide the id of the specific car
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: carId
 *          schema:
 *            type: string
 *          required: true
 *          description: ID of the car to get
 *      responses:
 *          200:
 *              description: a car
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Car'
 */
router.get("/:id", authMiddleware, CarController.getById.bind(CarController));

/**
 * @swagger
 * /car/:
 *   post:
 *     summary: post a car
 *     tags: [Car]
 *     security:
 *         - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: The car posted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 */
router.post("/", authMiddleware, CarController.post.bind(CarController));

/**
 * @swagger
 * /car/{carId}:
 *   post:
 *     summary: patch a car
 *     tags: [Car]
 *     description: need to provide the id of the specific car
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the car to patch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: The car patched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 */
router.put("/:id", authMiddleware, CarController.putById.bind(CarController));

/**
 * @swagger
 * /car/{carId}:
 *   post:
 *     summary: delete a car
 *     tags: [Car]
 *     description: need to provide the id of the specific car
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the car to delete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: The car deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 */
router.delete(
  "/:id",
  authMiddleware,
  CarController.deleteById.bind(CarController)
);

export default router;
