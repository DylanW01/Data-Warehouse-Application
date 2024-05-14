/**
 * @swagger
 * components:
 *   schemas:
 *     PopularBooksByMonthResponse:
 *       type: object
 *       properties:
 *         TITLE:
 *           type: string
 *         AUTHOR:
 *           type: string
 *         NUMBER_OF_LOANS:
 *           type: integer
 *         NUMBER_OF_FINES:
 *           type: integer
 *       example:
 *         - TITLE: And Then There Were None
 *           AUTHOR: Agatha Christie
 *           NUMBER_OF_LOANS: 4
 *           NUMBER_OF_FINES: 0
 *         - TITLE: The Running Grave
 *           AUTHOR: J. K. Rowling
 *           NUMBER_OF_LOANS: 5
 *           NUMBER_OF_FINES: 0
 *         - TITLE: The Lord of the Rings
 *           AUTHOR: John Ronald Reuel Tolkien
 *           NUMBER_OF_LOANS: 5
 *           NUMBER_OF_FINES: 2
 */

/**
 * @swagger
 * tags:
 *   name: Chief Librarian
 *   description: Queries for the Chief Librarian
 * /PopularBooksByMonth/{course_id}/{year}/{timeframe}/{value}/{fetchnum}:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists the most popular books in a selected timeframe for the selected course.
 *     tags: [Chief Librarian]
 *     parameters:
 *       - name: course_id
 *         in: path
 *         description: Course to query.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
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
 *         description: List of books.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PopularBooksByMonthResponse'
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