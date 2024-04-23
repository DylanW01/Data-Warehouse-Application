/**
 * @swagger
 * components:
 *   schemas:
 *     login:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *       example:
 *         username: VC
 *         password: VC123!
 *     password:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *       example:
 *         password: VC123!
 */

/**
 * @swagger
 * tags:
 *   name: User Accounts
 *   description: Account management
 * /login:
 *   post:
 *     summary: Logs in user & returns a JWT token
 *     tags: [User Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/login'
 *     responses:
 *       200:
 *         description: User info.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Internal server error
 * /new-password:
 *   post:
 *     security:
 *       - Bearer: []
 *     summary: Change password of logged in user
 *     tags: [User Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/password'
 *     responses:
 *       200:
 *         description: User info.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Invalid token
 *       500:
 *         description: Internal server error
 */