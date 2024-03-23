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
 * /books:
 *   get:
 *     security:
 *       - Bearer: []
 *     deprecated: true
 *     summary: Lists all the books
 *     tags: [Operational DB Queries]
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 * /loans:
 *   get:
 *     security:
 *       - Bearer: []
 *     deprecated: true
 *     summary: Lists all the loans
 *     tags: [Operational DB Queries]
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 * /fines:
 *   get:
 *     security:
 *       - Bearer: []
 *     deprecated: true
 *     summary: Lists all issued fines
 *     tags: [Operational DB Queries]
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */