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
 * components:
 *   schemas:
 *     loginResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             USER_ID:
 *               type: integer
 *             USERNAME:
 *               type: string
 *             NAME:
 *               type: string
 *             ROLE_ID:
 *               type: integer
 *             ROLE_NAME:
 *               type: string
 *           example:
 *             USER_ID: 1
 *             USERNAME: VC
 *             NAME: Vice Chancellor
 *             ROLE_ID: 1
 *             ROLE_NAME: Vice Chancellor
 *         token:
 *           type: string
 *           description: Access token
 *           example: "abcde12345"
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
 *               $ref: '#/components/schemas/loginResponse'
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

/**
 * @swagger
 * tags:
 *   name: Main Dashboard
 *   description: Queries for all users
 * /dashboardSummary:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Summary data for interactive charts on the dashboard
 *     tags: [Main Dashboard]
 *     responses:
 *       200:
 *         description: Summary of loan & fine data for charts on the dashboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/dashboardResponse'
 *       401:
 *         description: Invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     dashboardResponse:
 *       type: object
 *       properties:
 *         loansAndFines:
 *           type: object
 *           properties:
 *             MONTH:
 *               type: string
 *             NUMBEROFLOANS:
 *               type: number
 *             NUMBEROFFINES:
 *               type: number
 *           example:
 *             - MONTH: 2024-03
 *               NUMBEROFLOANS: 2
 *               NUMBEROFFINES: 2
 *             - MONTH: 2024-02
 *               NUMBEROFLOANS: 1
 *               NUMBEROFFINES: 1
 *         fineIncome:
 *           type: object
 *           properties:
 *             MONTH:
 *               type: string
 *             TOTALFINEINCOME:
 *               type: number
 *           example:
 *             - MONTH: 2024-03
 *               TOTALFINEINCOME: 3.5
 *             - MONTH: 2024-02
 *               TOTALFINEINCOME: 1.5
 *             - MONTH: 2024-01
 *               TOTALFINEINCOME: 2
 *         quarterlyFineIncome:
 *           type: object
 *           properties:
 *             YEAR:
 *               type: number
 *             QUARTER:
 *               type: number
 *             TOTALFINEINCOME:
 *               type: number
 *           example:
 *             - YEAR: 2024
 *               QUARTER: 1
 *               TOTALFINEINCOME: 6
 *             - YEAR: 2023
 *               QUARTER: 4
 *               TOTALFINEINCOME: 5
 */