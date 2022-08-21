import { Router } from 'express';

const router = Router();

import { verifyToken } from '../../middlewares/auth.js';

import {
  createPrivateRoom,
  getRoomsByUserId,
  getGeneralMessages,
  getRoomMessages,
} from '../../controllers/room.js';

/**
 * @openapi
 *  /rooms:
 *  post:
 *     tags:
 *     - Room
 *     security:
 *     - bearerAuth: []
 *     summary: Create a private room and add users to it
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: create_chat_room_payload
 *         description: The user to create
 *         required: true
 *         schema:
 *           $ref: '#/definitions/CreateChatRoomPayload'
 *     responses:
 *       201:
 *         description: Private room created successfully
 *       400:
 *         description: Something went wrong
 */

router.post('/', verifyToken, createPrivateRoom);

/**
 * @openapi
 *  /rooms/0/preload:
 *  get:
 *     tags:
 *     - Room
 *     summary: Get messages from the general chat (just to avoid loading them only once the user was logged in.)
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       201:
 *         description: Messages fetched succesfully from the general chat
 *       400:
 *         description: Something went wrong
 */

router.get('/0/preload', verifyToken, getGeneralMessages);

/**
 * @openapi
 *  /rooms/{userId}:
 *  get:
 *     tags:
 *     - Room
 *     security:
 *     - bearerAuth: []
 *     summary: Get rooms for the selected user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: User id
 *         required: true
 *     responses:
 *       200:
 *         description: Rooms fetched successfully for the selected user.
 *       400:
 *         description: Something went wrong
 */

router.get(`/:userId`, verifyToken, getRoomsByUserId);

/**
 * @openapi
 *  /rooms/{roomId}/messages:
 *  get:
 *     tags:
 *     - Room
 *     summary: Get messages from a selected room
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         type: string
 *         required: true
 *       - in: query
 *         name: offset
 *         type: integer
 *         required: false
 *       - in: query
 *         name: size
 *         type: integer
 *         required: false
 *     responses:
 *       201:
 *         description: Messages fetched successfully from private room specified by id
 *       400:
 *         description: Something went wrong
 */

router.get('/:id/messages', verifyToken, getRoomMessages);

/**
 * @openapi
 * definitions:
 *   CreateChatRoomPayload:
 *     type: object
 *     description: Contains default properties
 *     required:
 *     - user1
 *     - user2
 *     properties:
 *       user1:
 *         type: number
 *         example: '1'
 *       user2:
 *         type: number
 *         example: '2'
 */

export default router;
