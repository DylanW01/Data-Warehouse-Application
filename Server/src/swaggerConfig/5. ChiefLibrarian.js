/**
 * @swagger
 * tags:
 *   name: Chief Librarian
 *   description: Queries for the Chief Librarian
 * /PopularBooksByMonth:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists the most popular books in a selected timeframe for each course.
 *     tags: [Chief Librarian]
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
 *         description: List of books.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 * /ActiveCoursesByMonth:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists courses that borrowed the most books in a selected timeframe.
 *     tags: [Chief Librarian]
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
 *         description: List of courses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 * /LatestStudentsByQuarter:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Courses with students who most commonly return books late, organised by frequency for the selected quarter.
 *     tags: [Chief Librarian]
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
 *       - name: quarter
 *         in: query
 *         description: The quarter (1 to 4) for which to retrieve data.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           maximum: 4
 *     responses:
 *       200:
 *         description: List of courses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 */