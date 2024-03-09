import express from "express";
const router = express.Router();
import authMiddleware from "../common/auth_middleware";
import {
  commentMiddleware,
  securedCommentMiddleware,
  securedReplyMiddleware,
} from "../common/comment_middleware";
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
 *     Reply:
 *       type: object
 *       required:
 *         - publisher
 *         - text
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
 *       example:
 *         text: "Nice car!"
 *         publisher: "56cb91bdc3464f14678934ca"
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
 *     PopulatedComment:
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
 *          publisher:
 *            name: 'Fred'
 *            email: 'Fred@gmail.com'
 *            imgUrl: ''
 *          replies:
 *            - text: "Thanks!"
 *              publisher:
 *                name: 'bob'
 *                email: 'bob@gmail.com'
 *                imgUrl: ''
 */

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
 * components:
 *   schemas:
 *     Range:
 *       type: object
 *       properties:
 *         max:
 *           type: number
 *         min:
 *           type: number
 */

/**
 * @swagger
 * /post:
 *  get:
 *      summary: get all posts
 *      tags: [Post]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *       - in: query
 *         name: make
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: [string]
 *       - in: query
 *         name: model
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: [string]
 *       - in: query
 *         name: color
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: [string]
 *       - in: query
 *         name: city
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: [string]
 *       - in: query
 *         name: hand
 *         schema:
 *           oneOf:
 *             - type: numebr
 *             - type: [number]
 *       - in: query
 *         name: year
 *         style: deepObject
 *         explode: true
 *         schema:
 *           $ref:
 *             '#/components/schemas/Range'
 *       - in: query
 *         name: price
 *         style: deepObject
 *         explode: true
 *         schema:
 *           $ref:
 *             '#/components/schemas/Range'
 *       - in: query
 *         name: milage
 *         style: deepObject
 *         explode: true
 *         schema:
 *           $ref:
 *             '#/components/schemas/Range'
 *      responses:
 *          200:
 *              description: all Posts
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Post'
 *          401:
 *              description: Unauthorised
 *              content:
 *                  text/plain:
 *                      schema:
 *                          type: string
 *                          example: Unauthorized
 *          500:
 *              description: Unidentified error
 *              content:
 *                  text/plain:
 *                      schema:
 *                          type: string
 *                          example: "Fail: {error message}"
 */
router.get("/", authMiddleware, postController.search.bind(postController));

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
 *          401:
 *              description: Unauthorised
 *              content:
 *                  text/plain:
 *                      schema:
 *                          type: string
 *                          example: Unauthorized
 *          500:
 *              description: Unidentified error
 *              content:
 *                  text/plain:
 *                      schema:
 *                          type: string
 *                          example: "Fail: {error message}"
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
 *          401:
 *              description: Unauthorised
 *              content:
 *                  text/plain:
 *                      schema:
 *                          type: string
 *                          example: Unauthorized
 *          500:
 *              description: Unidentified error
 *              content:
 *                  text/plain:
 *                      schema:
 *                          type: string
 *                          example: "Fail: {error message}"
 */
router.get(
  "/:id/populated",
  authMiddleware,
  postController.getPopulatedPost.bind(postController)
);

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
 *       400:
 *         description: Invalid body
 *         content:
 *            text/plain:
 *             schema:
 *               type: string
 *               example: "Invalid parameters"
 *       409:
 *         description: Duplicate object
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Duplicate: {error messgae}"
 *       500:
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Fail: {error message}"
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
 *       404:
 *         description: Post not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "The post does not exist"
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
 *               example: "Fail: {error message}"
 */
router.post(
  "/:postId/comment",
  authMiddleware,
  postController.addComment.bind(postController)
);

/**
 * @swagger
 * /post/{postId}/comment/{commentId}/reply:
 *   post:
 *     summary: post a reply to a comment
 *     tags: [Post]
 *     security:
 *         - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reply'
 *     parameters:
 *        - in: path
 *          name: postId
 *          schema:
 *            type: string
 *          required: true
 *          description: ID of the post
 *        - in: path
 *          name: commentId
 *          schema:
 *            type: string
 *          required: true
 *          description: ID of the comment
 *     responses:
 *       201:
 *         description: The comment posted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Comment and post missmatch
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Comment does not belong to post
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
 *               example: "Fail: {error message}"
 */
router.post(
  "/:postId/comment/:commentId/reply",
  [authMiddleware, commentMiddleware],
  postController.addReply.bind(postController)
);

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
 *       400:
 *         description: Comment and post missmatch
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Comment does not belong to post
 *       401:
 *         description: User is not the comment publisher or token invalid
 *         content:
 *           text/plain:
 *             schema:
 *               oneOf:
 *                 - type: string
 *                   example: Unauthorized
 *                 - type: string
 *                   example: Comment does not belong to user
 *       500:
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Fail: {error message}"
 */
router.put(
  "/:postId/comment/:commentId",
  [authMiddleware, securedCommentMiddleware],
  postController.editComment.bind(postController)
);

/**
 * @swagger
 * /post/{postId}/comment/{commentId}/reply/{replyId}:
 *   put:
 *     summary: Edit a reply
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
 *          description: ID of the comment the reply belongs to
 *        - in: path
 *          name: replyId
 *          schema:
 *            type: string
 *          required: true
 *          description: ID of the reply to edit
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reply'
 *     responses:
 *       200:
 *         description: The Reply posted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reply'
 *       400:
 *         description: "Comment/Reply and post missmatch"
 *         content:
 *           text/plain:
 *             schema:
 *               oneOf:
 *                 - type: string
 *                   example: Comment does not belong to post
 *                 - type: string
 *                   example: Reply does not belong to comment
 *       401:
 *         description: User is not the reply publisher or token invalid
 *         content:
 *           text/plain:
 *             schema:
 *               oneOf:
 *                 - type: string
 *                   example: Unauthorized
 *                 - type: string
 *                   example: Reply does not belong to user
 *       500:
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Fail: {error message}"
 */

router.put(
  "/:postId/comment/:commentId/reply/:replyId",
  [authMiddleware, securedReplyMiddleware],
  postController.editReply.bind(postController)
);

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
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid body
 *         content:
 *            text/plain:
 *             schema:
 *               type: string
 *               example: "Invalid parameters"
 *       404:
 *         description: Post not found
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorised
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       404:
 *         description: Post not found
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
router.delete(
  "/:id",
  authMiddleware,
  postController.deleteById.bind(postController)
);

/**
 * @swagger
 * /post/{postId}/comment/{commentId}:
 *   delete:
 *     summary: delete a comment
 *     tags: [Post]
 *     description: need to provide the id of the specific post and comment
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post of the comment
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the of the comment
 *     responses:
 *       200:
 *         description: The comment deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Comment and post missmatch
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Comment does not belong to post
 *       401:
 *         description: User is not the comment publisher or token invalid
 *         content:
 *           text/plain:
 *             schema:
 *               oneOf:
 *                 - type: string
 *                   example: Unauthorized
 *                 - type: string
 *                   example: Comment does not belong to user
 *       500:
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Fail: {error message}"
 */
router.delete(
  "/:postId/comment/:commentId",
  [authMiddleware, securedCommentMiddleware],
  postController.deleteComment.bind(postController)
);

/**
 * @swagger
 * /post/{postId}/comment/{commentId}/reply/{reply}:
 *   delete:
 *     summary: delete a reply
 *     tags: [Post]
 *     description: need to provide the id of the specific post, comment and reply
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post of the comment
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the of the comment
 *       - in: path
 *         name: replyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the of the reply
 *     responses:
 *       200:
 *         description: The reply deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: "Comment/Reply and post missmatch"
 *         content:
 *           text/plain:
 *             schema:
 *               oneOf:
 *                 - type: string
 *                   example: Comment does not belong to post
 *                 - type: string
 *                   example: Reply does not belong to comment
 *       401:
 *         description: User is not the reply publisher or token invalid
 *         content:
 *           text/plain:
 *             schema:
 *               oneOf:
 *                 - type: string
 *                   example: Unauthorized
 *                 - type: string
 *                   example: Reply does not belong to user
 *       500:
 *         description: Unidentified error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Fail: {error message}"
 */
router.delete(
  "/:postId/comment/:commentId/reply/:replyId",
  [authMiddleware, securedReplyMiddleware],
  postController.deleteReply.bind(postController)
);
export default router;
