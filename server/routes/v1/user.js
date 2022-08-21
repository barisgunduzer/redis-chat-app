import express from 'express';
import { verifyToken } from '../../middlewares/auth.js';
import {
  getActiveUser,
  getUsersByIds,
  getUserById,
  getOnlineUsers,
  loginUser,
  logoutUser,
} from '../../controllers/user.js';

const router = express.Router();

/**
 * @openapi
 *  /users:
 *  get:
 *     tags:
 *     - User
 *     security:
 *     - bearerAuth: []
 *     summary: Retrieve the users based on given ids
 *     parameters:
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *           minItems: 1
 *         style: form
 *         explode: true
 *         description: User ids
 *     responses:
 *       200:
 *         description: Get users specifed by ids
 *       404:
 *         description: Some users are missing
 */

router.get(`/`, verifyToken, getUsersByIds);

/**
 * @openapi
 *  /users/me:
 *  get:
 *     tags:
 *     - User
 *     security:
 *     - bearerAuth: []
 *     summary: Get my user info
 *     responses:
 *       200:
 *         description: Show my user info
 *       401:
 *         description: User does not exist
 */

router.get('/me', getActiveUser);

/**
 * @openapi
 *  /users/{id}:
 *  get:
 *     tags:
 *     - User
 *     security:
 *     - bearerAuth: []
 *     summary: Get user info by id
 *     parameters:
 *       - in: path
 *         name: id
 *         description: User id
 *         required: true
 *     responses:
 *       200:
 *         description: Show user info
 *       401:
 *         description: User does not exist
 */

router.get('/:id', verifyToken, getUserById);

/**
 * @openapi
 *  /users/0/online:
 *  get:
 *     tags:
 *     - User
 *     security:
 *     - bearerAuth: []
 *     summary: Get online users
 *     responses:
 *       200:
 *         description: Get online users
 *       500:
 *         description: Something went wrong
 */

router.get(`/0/online`, verifyToken, getOnlineUsers);

/**
//  * @openapi
 *  /users/register:
 *  post:
 *     tags:
 *     - User
 *     name: Register a user
 *     summary: Register a user
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user_register_payload
 *         description: The user to create
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UserRegisterPayload'
 *     responses:
 *       200:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 */

// router.post('/register', registerUser);

/**
 * @openapi
 *  /users/login:
 *  post:
 *     tags:
 *     - User
 *     summary: Login a user
 *     parameters:
 *       - in: body
 *         name: user_login_payload
 *         required: true
 *         type: String
 *         description: The user to login
 *         schema:
 *           $ref: '#/definitions/UserLoginPayload'
 *     responses:
 *       200:
 *         description: User logged successfully
 *       401:
 *         description: User does not exist
 */

router.post('/login', loginUser);

/**
 * @openapi
 *  /users/logout:
 *  post:
 *     tags:
 *     - User
 *     summary: Logout user (destroys user session)
 *     responses:
 *       200:
 *         description: User successfully logged out
 *       401:
 *         description: User already logged out
 */

router.post('/logout', verifyToken, logoutUser);

/**
 * @openapi
 * definitions:
 *   UserRegisterPayload:
 *     type: object
 *     description: Contains default properties
 *     required:
 *     - username
 *     - password
 *     properties:
 *       username:
 *         type: string
 *         example: johndoexxx
 *       password:
 *         type: password
 *         example: supersecretpassword
 *   UserLoginPayload:
 *     type: object
 *     description: Contains default properties
 *     required:
 *     - username
 *     - password
 *     properties:
 *       username:
 *         type: string
 *         example: Ahmet
 *       password:
 *         type: password
 *         example: password123
 */

export default router;
