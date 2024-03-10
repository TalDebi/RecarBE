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
 *     summary: Registers a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Registration successful. Returns the access & refresh tokens along with user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/SecuredUser'
 *                 tokens:
 *                   $ref: '#/components/schemas/Tokens'
 *       400:
 *         description: Bad request. Missing email or password in request body.
 *       409:
 *         description: Conflict. Email already exists in the database.
 *       500:
 *         description: Internal Server Error. Failed to register the user.
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
 *       '200':
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
 */
router.post("/google", authController.googleSignUp.bind(authController));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCredentials'
 *     responses:
 *       200:
 *         description: Login successful. Returns the access & refresh tokens along with user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/SecuredUser'
 *                 tokens:
 *                   $ref: '#/components/schemas/Tokens'
 *       400:
 *         description: Bad request. Missing email or password in request body.
 *       401:
 *         description: Unauthorized. Incorrect email or password.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/login", authController.login.bind(authController));

/**
 * @swagger
 * /auth/{userId}:
 *   put:
 *     summary: edit user details
 *     tags: [Auth]
 *     description: Update user details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Updated user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SecuredUser'
 *       400:
 *         description: Missing email or password
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Error updating user
 */
router.put("/:id", authMiddleware, authController.putById.bind(authController));

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout a user
 *     tags: [Auth]
 *     description: Logout a user by providing the refresh token in the authorization header.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout completed successfully
 *       401:
 *         description: Unauthorized - Refresh token not provided or invalid
 *       500:
 *         description: Internal Server Error
 */
router.get("/logout", authController.logout.bind(authController));

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Get a new access token using the refresh token
 *     tags: [Auth]
 *     description: Need to provide the refresh token in the Authorization header
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful token refresh. Returns the new access & refresh tokens.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       400:
 *         description: Bad request. Missing refresh token in the request header.
 *       401:
 *         description: Unauthorized. Invalid or missing refresh token.
 *       500:
 *         description: Internal Server Error. Failed to refresh tokens.
 */
router.get("/refresh", authController.refresh.bind(authController));

export default router;
