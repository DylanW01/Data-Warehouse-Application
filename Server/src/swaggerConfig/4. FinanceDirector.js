/**
 * @swagger
 * components:
 *   schemas:
 *     financeDirectorResponse:
 *       type: object
 *       properties:
 *         Total_Fine:
 *           type: string
 *           example: "£5"
 */

/**
 * @swagger
 * tags:
 *   name: Finance Director
 *   description: Queries for the Finance Director
 * /FineSumByDate/{year}/{timeframe}/{value}:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Returns the sum of the fines issued, for the selected timeframe.
 *     tags: [Finance Director]
 *     parameters:
 *       - name: year
 *         in: path
 *         description: Year to query.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *       - name: timeframe
 *         in: path
 *         description: Timeframe to query.
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Year, Quarter, Month, Week]
 *       - name: value
 *         in: path
 *         description: The value of the timeframe (If selecting "Year", the values must match). E.G. 2023 for Year, 2 for Quarter, June for Month, 24 for Week.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of fines.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/financeDirectorResponse'
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 * /LateFineSumByDate/{year}/{timeframe}/{value}:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Returns the sum of the fines issued which are late/outstanding for the selected timeframe.
 *     tags: [Finance Director]
 *     parameters:
 *       - name: year
 *         in: path
 *         description: Year to query.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *       - name: timeframe
 *         in: path
 *         description: Timeframe to query.
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Year, Quarter, Month, Week]
 *       - name: value
 *         in: path
 *         description: The value of the timeframe (If selecting "Year", the values must match). E.G. 2023 for Year, 2 for Quarter, June for Month, 24 for Week.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sum of the fines.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/financeDirectorResponse'
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 */