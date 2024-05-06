/**
 * @swagger
 * tags:
 *   name: Vice-Chancellor
 *   description: Queries for the Vice-Chancellor
 * /MostActiveDepartmentByMonth:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists the most active department (most loans) in a selected timeframe.
 *     tags: [Vice-Chancellor]
 *     parameters:
 *       - name: month
 *         in: query
 *         description: The month for which to retrieve data.
 *         required: true
 *         schema:
 *           type: string
 *           format: month
 *       - name: year
 *         in: query
 *         description: The year for which to retrieve data.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *       - name: departmentId
 *         in: query
 *         description: The ID of the department.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       200:
 *         description: List of departments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 * /TotalIncomeFromFinesByDate:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists the total income from fines for the selected timeframe.
 *     tags: [Vice-Chancellor]
 *     parameters:
 *       - name: startDate
 *         in: query
 *         description: The start date for which to retrieve data.
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: The end date for which to retrieve data.
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Total income
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 */