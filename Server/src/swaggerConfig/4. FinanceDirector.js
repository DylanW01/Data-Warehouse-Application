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
 *     parameters:
 *       - name: timeframe
 *         in: query
 *         description: Select either 'month' or 'week'.
 *         required: true
 *         schema:
 *           type: string
 *           enum: [month, week]
 *       - name: year
 *         in: query
 *         description: The year for which to retrieve data.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 2018
 *           maximum: 2024
 *       - name: month
 *         in: query
 *         description: The month (1 to 12) for which to retrieve data.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           maximum: 12
 *       - name: week
 *         in: query
 *         description: The week number (1 to 52) for which to retrieve data.
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           maximum: 52
 *         required:
 *           - name: timeframe
 *             value: week
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
 *     parameters:
 *       - name: timeframe
 *         in: query
 *         description: Select either 'month' or 'week'.
 *         required: true
 *         schema:
 *           type: string
 *           enum: [month, week]
 *       - name: year
 *         in: query
 *         description: The year for which to retrieve data.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 2018
 *           maximum: 2024
 *       - name: month
 *         in: query
 *         description: The month (1 to 12) for which to retrieve data.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           maximum: 12
 *       - name: week
 *         in: query
 *         description: The week number (1 to 52) for which to retrieve data.
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           maximum: 52
 *         required:
 *           - name: timeframe
 *             value: week
 *     responses:
 *       200:
 *         description: Sum of the fines.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */