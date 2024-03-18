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
 *         username: demoemail@email.com
 *         password: false
 */

/**
 * @swagger
 * tags:
 *   name: User Accounts
 *   description: Account management
 * /login:
 *   post:
 *     summary: Logs in user
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
 */