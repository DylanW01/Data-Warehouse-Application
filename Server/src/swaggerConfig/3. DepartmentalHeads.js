/**
 * @swagger
 * components:
 *   schemas:
 *     MostActiveStudentsByMonthResponse:
 *       type: object
 *       properties:
 *         FIRST_NAME:
 *           type: string
 *         LAST_NAME:
 *           type: string
 *         NUMBER_OF_LOANS:
 *           type: integer
 *         NUMBER_OF_FINES:
 *           type: integer
 *       example:
 *         - FIRST_NAME: William
 *           LAST_NAME: Taylor
 *           NUMBER_OF_LOANS: 4
 *           NUMBER_OF_FINES: 0
 *         - FIRST_NAME: Charles
 *           LAST_NAME: Thompson
 *           NUMBER_OF_LOANS: 5
 *           NUMBER_OF_FINES: 0
 *         - FIRST_NAME: John
 *           LAST_NAME: Doe
 *           NUMBER_OF_LOANS: 5
 *           NUMBER_OF_FINES: 2
 *     MostPopularBooksByPageCountResponse:
 *       type: object
 *       properties:
 *         TITLE:
 *           type: string
 *         AUTHOR:
 *           type: string
 *         PAGES:
 *           type: integer
 *         ISBN:
 *           type: integer
 *         NUMBER_OF_LOANS:
 *           type: integer
 *       example:
 *         - TITLE: The Lord of the Rings
 *           AUTHOR: John Ronald Reuel Tolkien
 *           PAGES: 1216
 *           ISBN: 9780544003415
 *           NUMBER_OF_LOANS: 2
 *         - TITLE: The Chronicles of Narnia
 *           AUTHOR: C. S. Lewis
 *           PAGES: 767
 *           ISBN: 9780064471190
 *           NUMBER_OF_LOANS: 1
 */

/**
 * @swagger
 * tags:
 *   name: Departmental Heads
 *   description: Queries for the Departmental Heads
 * /MostPopularBooksByPageCount/{year}/{timeframe}/{value}/{fetchnum}/{pagecount}/{operator}:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists books that are loaned most and have a page count greater or less than a certain value
 *     tags: [Departmental Heads]
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
 *       - name: pagecount
 *         in: path
 *         description: The number of pages to filter by.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *       - name: operator
 *         in: path
 *         description: The operator to use for the page count filter.
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["Greater than", "Less than"]
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MostPopularBooksByPageCountResponse'
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 * /MostActiveStudentsByMonth/{course_id}/{year}/{timeframe}/{value}/{fetchnum}:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists the students that are using the library services the most each month
 *     tags: [Departmental Heads]
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
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MostActiveStudentsByMonthResponse'
 *       403:
 *         description: Unauthorised. User does not have permissions to call this query.
 *       401:
 *         description: Unauthorised. Access token required.
 */