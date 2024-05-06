/**
 * @swagger
 * tags:
 *   name: Departmental Heads
 *   description: Queries for the Departmental Heads
 * /MostPopularBooksByGenre:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists books of a specific genre that are loaned most and may require more stock
 *     tags: [Departmental Heads]
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 * /MostActiveStudentsByMonth:
 *   get:
 *     security:
 *       - Bearer: []
 *     summary: Lists the students that are using the library services the most each month
 *     tags: [Departmental Heads]
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */