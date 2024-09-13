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
 *     responses:
 *       200:
 *         description: List of books.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 * /ActiveCoursesByMonth:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists courses that borrowed the most books in a selected timeframe.
 *     tags: [Chief Librarian]
 *     responses:
 *       200:
 *         description: List of courses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 * /LatestStudentsByQuarter:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Courses with students who most commonly return books late, organised by frequency for the selected quarter.
 *     tags: [Chief Librarian]
 *     responses:
 *       200:
 *         description: List of courses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */