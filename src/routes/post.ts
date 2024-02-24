import express from "express";
const router = express.Router();
import authMiddleware from "../common/auth_middleware";
import postController from "../controllers/post";

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Post API
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
 *     Comment:
 *       type: object
 *       required:
 *         - publisher
 *         - text
 *         - replies
 *       properties:
 *         _id:
 *           type: string
 *           description: objectId of the comment
 *         text:
 *           type: string
 *           description: content of the comment
 *         publisher:
 *           type: string
 *           description: objectId of the user who published the post
 *         replies:
 *           type: Array
 *           description: Array of objectIds of replies
 *           items:
 *             type: string
 *       example:
 *         text: "Nice car!"
 *         publisher: "56cb91bdc3464f14678934ca"
 *         replies: ["56cb91bdc3464f14678934ca", "56cb91bdc3464f14678934ca"]
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - car
 *         - publisher
 *       properties:
 *         _id:
 *           type: string
 *           description: objectId of the post
 *         car:
 *           type: string
 *           description: objectId of car to be published in the post
 *         publisher:
 *           type: string
 *           description: objectId of the user who published the post
 *         comments:
 *           type: Array
 *           description: Array of objectIds of comments
 *           items:
 *             type: string
 *       example:
 *         car: "56cb91bdc3464f14678934ca"
 *         publisher: "56cb91bdc3464f14678934ca"
 *         comments: ["56cb91bdc3464f14678934ca", "56cb91bdc3464f14678934ca"]
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     populatedComment:
 *       type: object
 *       required:
 *         - publisher
 *         - text
 *         - replies
 *       properties:
 *         _id:
 *           type: string
 *           description: objectId of the comment
 *         text:
 *           type: string
 *           description: content of the comment
 *         publisher:
 *           $ref: '#/components/schemas/ReducedUser'
 *         replies:
 *           type: Array
 *           description: Array of replies
 *           items:
 *             type: 
 *               _id:
 *                 type: string
 *                 description: objectId of the comment
 *               text:
 *                 type: string
 *                 description: content of the comment
 *               publisher:
 *                 $ref: '#/components/schemas/ReducedUser'
 *       example:
 *          text: "Nice car!"
 *            publisher: 
 *              name: 'Fred'
 *              email: 'Fred@gmail.com'
 *              imgUrl: ''
 *            replies: 
 *              - text: "Thanks!"
 *                publisher: 
 *                  name: 'bob'
 *                  email: 'bob@gmail.com'
 *                  imgUrl: ''

/**
 * @swagger
 * components:
 *   schemas:
 *     PopulatedPost:
 *       type: object
 *       required:
 *         - car
 *         - publisher
 *         - comment
 *       properties:
 *         _id:
 *           type: string
 *           description: objectId of the post
 *         car:
 *           $ref: '#/components/schemas/Car'
 *         publisher:
 *           $ref: '#/components/schemas/ReducedUser'
 *         comments:
 *           type: Array
 *           description: Array of objectIds of comments
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *       example:
 *         car: 
 *           make: 'toyota'
 *           model: 'camry'
 *           year: 1993
 *           price: 20000
 *           hand: 3
 *           color : 'white'
 *           mileage: 200000
 *           city: 'holon'
 *           owner: '1234567'
 *         publisher:
 *           name: 'bob'
 *           email: 'bob@gmail.com'
 *           imgUrl: ''
 *         comments:
 *           - text: "Nice car!"
 *             publisher: 
 *               name: 'Fred'
 *               email: 'Fred@gmail.com'
 *               imgUrl: ''
 *             replies: 
 *               - text: "Thanks!"
 *                 publisher: 
 *                   name: 'bob'
 *                   email: 'bob@gmail.com'
 *                   imgUrl: ''
 */

/**
 * @swagger
 * /post:
 *  get:
 *      summary: get all posts
 *      tags: [Post]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: all Posts
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Post'
 */
router.get("/", authMiddleware, postController.get.bind(postController));

/**
 * @swagger
 * /post/{postId}:
 *  get:
 *      summary: get a post by id
 *      tags: [Post]
 *      description: Get a post by Id
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: postId
 *          schema:
 *            type: string
 *          required: true
 *          description: ID of the post to get
 *      responses:
 *          200:
 *              description: a post
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Post'
 */
router.get("/:id", authMiddleware, postController.getById.bind(postController));
/**
 * @swagger
 * /post/{postId}/populated:
 *  get:
 *      summary: get a post by id with references already populated
 *      tags: [Post]
 *      description: get a post by id with references already populated
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: postId
 *          schema:
 *            type: string
 *          required: true
 *          description: ID of the post to get
 *      responses:
 *          200:
 *              description: a post
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/PopulatedPost'
 */
router.get("/:id/populated", authMiddleware, postController.getFull.bind(postController));

/**
 * @swagger
 * /post:
 *   post:
 *     summary: post a post
 *     tags: [Post]
 *     security:
 *         - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: The post posted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
router.post("/", authMiddleware, postController.post.bind(postController));


/**
 * @swagger
 * /post/{postId}/comment:
 *   post:
 *     summary: post a comment on post
 *     tags: [Post]
 *     security:
 *         - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     parameters:
 *        - in: path
 *          name: postId
 *          schema:
 *            type: string
 *          required: true
 *          description: ID of the post to post a comment on
 *     responses:
 *       201:
 *         description: The comment posted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */
router.post("/:postId/comment", postController.addComment.bind(postController));

/**
 * @swagger
 * /post/{postId}/comment/{commentId}:
 *   put:
 *     summary: Edit a comment
 *     tags: [Post]
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *        - in: path
 *          name: postId
 *          schema:
 *            type: string
 *          required: true
 *          description: ID of the post that the comment belongo to
 *        - in: path
 *          name: commentId
 *          schema:
 *            type: string
 *          required: true
 *          description: ID of the comment to be edited
 *  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: The comment posted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */
router.put("/:postId/comment/:commentId", postController.editComment.bind(postController))

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: Edit a post
 *     tags: [Post]
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the car to put
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: The car puted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 */
router.put("/:id", authMiddleware, postController.putById.bind(postController));

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: delete a post
 *     tags: [Post]
 *     description: need to provide the id of the specific post
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to delete
 *     responses:
 *       200:
 *         description: The post deleted
 */
router.delete(
    "/:id",
    authMiddleware,
    postController.deleteById.bind(postController)
);

export default router;
