import express from "express";
const router = express.Router();
import userController from "../controllers/user";
import authMiddleware from "../common/auth_middleware";

/**
 * @swagger
 * tags:
 *   name: User
 *   description: The User API
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
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: id
 *         name:
 *           type: string
 *           description: The user name
 *         email:
 *           type: string
 *           description: The user email
 *         password:
 *           type: string
 *           description: The user password
 *         phoneNumber:
 *           type: string
 *           description: The user phone number
 *         imgUrl:
 *           type: string
 *           description: The user imgUrl
 *         refreshTokens:
 *           type: string[]
 *           description: The user refresh tokens
 *         likedPosts:
 *           type: Array
 *           description: Array of objectIds of liked posts
 *           items:
 *             type: string
 *       example:
 *         name: 'bob'
 *         email: 'bob@gmail.com'
 *         password: '123456'
 *         phoneNumber: '054-2355489'
 *         imgUrl: ''
 *         refreshTokens: ["56cb91bdc3464f14678934ca", "56cb91bdc3464f14678934ca"]
 *         likedPosts: ["56cb91bdc3464f14678934ca", "56cb91bdc3464f14678934ca"]
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SecuredUser:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: id
 *         name:
 *           type: string
 *           description: The user name
 *         email:
 *           type: string
 *           description: The user email
 *         phoneNumber:
 *           type: string
 *           description: The user phone number
 *         imgUrl:
 *           type: string
 *           description: The user imgUrl
 *         likedPosts:
 *           type: Array
 *           description: Array of objectIds of liked posts
 *           items:
 *             type: string
 *       example:
 *         name: 'bob'
 *         email: 'bob@gmail.com'
 *         phoneNumber: '054-2355489'
 *         imgUrl: ''
 *         likedPosts: ["56cb91bdc3464f14678934ca", "56cb91bdc3464f14678934ca"]
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ReducedUser:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           description: The user name
 *         email:
 *           type: string
 *           description: The user email
 *         imgUrl:
 *           type: string
 *           description: The user imgUrl
 *       example:
 *         name: 'bob'
 *         email: 'bob@gmail.com'
 *         imgUrl: ''
 */

/**
 * @swagger
 * /user/{userId}/likedPosts:
 *   get:
 *     summary: Get liked posts by user ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likedPosts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:userId/likedPosts",
  authMiddleware,
  userController.getLikedPosts.bind(userController)
);

/**
 * @swagger
 * /user/{userId}/likedPosts:
 *   post:
 *     summary: add liked post
 *     tags: [User]
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             _id:string
 *     responses:
 *       200:
 *         description: The Post was added to user liked posts
 *       500:
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Fail: {error message}"
 */
router.post(
  "/:userId/likedPosts",
  authMiddleware,
  userController.addLikedPost.bind(userController)
);


/**
 * @swagger
 * /user/{userId}/likedPosts/{postId}:
 *   delete:
 *     summary: remove liked post
 *     tags: [User]
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 * 
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post Id
 *     responses:
 *       200:
 *         description: The Post was removed to user liked posts
 *       500:
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Fail: {error message}"
 */
router.delete(
  "/:userId/likedPosts/:postId",
  authMiddleware,
  userController.removeLikedPost.bind(userController)
);
export default router;
