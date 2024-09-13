/**
 * @swagger
 * tags:
 *   name: Operational DB Queries
 *   description: Perform queries on the operational database
 * /users:
 *   get:
 *     security:
 *       - Bearer: []
 *     deprecated: true
 *     summary: Lists all the users
 *     tags: [Operational DB Queries]
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Unauthorized. Access token required.
 *       500:
 *         description: Internal Server Error. Something went wrong on the server.
 * /books:
 *   get:
 *     security:
 *       - Bearer: []
 *     deprecated: true
 *     summary: Lists all the books
 *     tags: [Operational DB Queries]
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Unauthorized. Access token required.
 *       500:
 *         description: Internal Server Error. Something went wrong on the server.
 * /loans:
 *   get:
 *     security:
 *       - Bearer: []
 *     deprecated: true
 *     summary: Lists all the loans
 *     tags: [Operational DB Queries]
 *     responses:
 *       200:
 *         description: The list of the loans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Unauthorized. Access token required.
 *       500:
 *         description: Internal Server Error. Something went wrong on the server.
 * /fines:
 *   get:
 *     security:
 *       - Bearer: []
 *     deprecated: true
 *     summary: Lists all issued fines
 *     tags: [Operational DB Queries]
 *     responses:
 *       200:
 *         description: The list of issued fines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Unauthorized. Access token required.
 *       500:
 *         description: Internal Server Error. Something went wrong on the server.
 */