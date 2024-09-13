/**
 * @swagger
 * components:
 *   schemas:
 *     MostActiveDepartmentByMonthResponse:
 *       type: object
 *       properties:
 *         COURSE_ID:
 *           type: integer
 *         COURSE_NAME:
 *           type: string
 *         NUMBER_OF_LOANS:
 *           type: integer
 *         NUMBER_OF_FINES:
 *           type: integer
 *       example:
 *         - COURSE_ID: 2
 *           COURSE_NAME: Computer Science
 *           NUMBER_OF_LOANS: 4
 *           NUMBER_OF_FINES: 0
 *         - COURSE_ID: 7
 *           COURSE_NAME: Chemistry
 *           NUMBER_OF_LOANS: 5
 *           NUMBER_OF_FINES: 0
 *         - COURSE_ID: 4
 *           COURSE_NAME: Physics
 *           NUMBER_OF_LOANS: 5
 *           NUMBER_OF_FINES: 2
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TotalIncomeFromFinesByDateResponse:
 *       type: object
 *       properties:
 *         NUMBER_OF_LOANS:
 *           type: integer
 *         TOTAL_FINES_INCOME:
 *           type: integer
 *       example:
 *         NUMBER_OF_LOANS: 30
 *         TOTAL_FINES_INCOME: 5
 */

/**
 * @swagger
 * tags:
 *   name: Vice-Chancellor
 *   description: Queries for the Vice-Chancellor
 * /MostActiveDepartmentByMonth/{year}/{timeframe}/{value}/{fetchnum}:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists the most active department (most loans) in a selected timeframe.
 *     tags: [Vice-Chancellor]
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
 *       - name: fetchnum
 *         in: path
 *         description: The number of departments to fetch (Top 3 departments, Top 5 departments etc).
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 2
 *           maximum: 6
 *     responses:
 *       200:
 *         description: List of departments.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MostActiveDepartmentByMonthResponse'
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 * /TotalIncomeFromFinesByDate/{year}/{timeframe}/{value}:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists the total income from fines for the selected timeframe.
 *     tags: [Vice-Chancellor]
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
 *         description: Total income
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalIncomeFromFinesByDateResponse'
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 */