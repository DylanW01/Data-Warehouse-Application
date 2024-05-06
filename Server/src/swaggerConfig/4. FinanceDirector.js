/**
 * @swagger
 * tags:
 *   name: Finance Director
 *   description: Queries for the Finance Director
 * /FineSumByDate:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists the issued fines, sorted by amount, for the selected timeframe.
 *     tags: [Finance Director]
 *     responses:
 *       200:
 *         description: List of fines.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 * /LateFineSumByDate:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Calculates the sum of fines for late returns in the selected timeframe.
 *     tags: [Finance Director]
 *     responses:
 *       200:
 *         description: Sum of the fines.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */