/**
 * @swagger
 * tags:
 *   name: Vice-Chancellor
 *   description: Queries for the Vice-Chancellor
 * /query1:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Summary of the query
 *     tags: [Vice-Chancellor]
 *     responses:
 *       200:
 *         description: Summary of the query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 * /query2:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Summary of the query
 *     tags: [Vice-Chancellor]
 *     responses:
 *       200:
 *         description: Summary of the query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */