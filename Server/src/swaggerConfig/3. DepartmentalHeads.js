/**
 * @swagger
 * tags:
 *   name: Departmental Heads
 *   description: Queries for the Departmental Heads
 * /MostPopularBooksByPageCount:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists books that are loaned most and have a page count greater or less than a certain value
 *     tags: [Departmental Heads]
 *     parameters:
 *       - name: timeframe
 *         in: query
 *         description: Select type of query.
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Greater Than, Less Than]
 *       - name: pageCount
 *         in: query
 *         description: The number of pages to query.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 * /MostActiveStudentsByMonth:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists the students that are using the library services the most each month
 *     tags: [Departmental Heads]
 *     parameters:
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
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 */