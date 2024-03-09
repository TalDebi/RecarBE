import express from "express";
const router = express.Router();
import authController from "../controllers/auth";
import authMiddleware from "../common/auth_middleware";
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
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
 * components:
 *   schemas:
 *     Tokens:
 *       type: object
 *       required:
 *         - accessToken
 *         - refreshToken
 *       properties:
 *         accessToken:
 *           type: string
 *           description: The JWT access token
 *         refreshToken:
 *           type: string
 *           description: The JWT refresh token
 *       example:
 *         accessToken: '123cd123x1xx1'
 *         refreshToken: '134r2134cr1x3c'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserCredentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user email
 *         password:
 *           type: string
 *           description: The user password
 *       example:
 *         email: 'bob@gmail.com'
 *         password: '134r2134cr1x3c'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: registers a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The access & refresh tokens along with user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/Tokens'
 *       400:
 *         description: Missing detailes
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "missing email or password"
 *       409:
 *         description: Duplicate user
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "email already exists"
 *       500:
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Internal Server Error"
 */
router.post("/register", authController.register.bind(authController));

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Authenticate user using Google Sign-In
 *     description: Authenticates a user using Google Sign-In and returns user information.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Google ID token obtained from client
 *             required:
 *               - credential
 *     responses:
 *       '201':
 *         description: Successful sign-in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '401':
 *         description: Expired ID
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "ID token expired"
 *       '500':
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "{error message}"
 */
router.post("/google", authController.googleSignUp.bind(authController));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCredentials'
 *     responses:
 *       200:
 *         description: The access & refresh tokens along with user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/Tokens'
 *       401:
 *         description: Wrong credentials
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "email or password incorrect"
 *       500:
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Internal Server Error"
 */
router.post("/login", authController.login.bind(authController));

/**
 * @swagger
 * /auth/{userId}:
 *   put:
 *     summary: edit user details
 *     tags: [Auth]
 *     description: need to provide the id of the specific user
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to put
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The new car
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorised
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       400:
 *         description: Invalid body
 *         content:
 *            text/plain:
 *             schema:
 *               type: string
 *               example: "Invalid parameters"
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "the ID does not exist"
 *       500:
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Fail: {error message}"
 */
router.put("/:id", authMiddleware, authController.putById.bind(authController));

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: logout a user
 *     tags: [Auth]
 *     description: need to provide the refresh token in the auth header
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: logout completed successfully
 *       401:
 *         description: Unauthorised
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       500:
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "{error message}"
 */
router.get("/logout", authController.logout.bind(authController));

/**
 * @swagger
 * /auth/refresh:
 *  get:
 *      summary: get a new access token using the refresh token
 *      tags: [Auth]
 *      description: need to provide the refresh token in the auth header
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *            description: The acess & refresh tokens
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Tokens'
 *       401:
 *         description: Unauthorised
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       500:
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "{error message}"
 */
router.get("/refresh", authController.refresh.bind(authController));

export default router;
