const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const mysql = require('mysql2/promise');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const appVersion = require("../package.json").version;
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');


//#region DB Setup - Create connection to database - Uses .env file for credentials
var warehouseDB  = mysql.createPool({
  connectionLimit : 10,
  host       : process.env.DBHOST,
  user       : process.env.DBUSER,
  password   : process.env.DBPASS,
  database   : process.env.DBNAME
});

const port = process.env.PORT || 8080;
//#endregion

const app = express()
  .use(cors())
  .use(bodyParser.json())
  .use(express.json())

// Define a rate limiter for the /TotalIncomeFromFinesByDate route
const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});

//#region Swagger setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Data Warehouse API',
    description: 'API to track data from Library Data Warehouse. Use the /login endpoint to get a JWT token to access the other endpoints via the green Authorize button. Queries are scoped to the logged in user so you will recieve an error if you try to access an endpoint that is not for your role.',
    version: appVersion,
    contact: {
      name: "Dylan Warrell",
      email: "hello@dylanwarrell.com",
      url: "https://dylanwarrell.com"
    }
  },
  host: '127.0.0.1:3000'
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['src/swaggerConfig/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//#endregion

//#region Finance Director Queries
app.get('/FineSumByDate/:year/:timeframe/:value', rateLimiter, async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    // Check if decoded.role_id is equal to role for RBAC
    if (decoded.role_id !== 3 && decoded.role_id !== 5) {
      console.log(`Access denied for user ${decoded.sub}. Make sure you are logged into the right account. Role ID: ${decoded.role_id}`);
      res.status(403).json({ status: 'error', message: `Access denied for user ${decoded.sub}. Make sure you are logged into the right account` });
      return;
    }
    let connection = await warehouseDB.getConnection();
    let year = req.params.year;
    let timeframe = req.params.timeframe;
    let value = req.params.value;

    // Validate timeframe
    const allowedTimeframes = ['Year', 'Quarter', 'Month', 'Week'];
    if (!allowedTimeframes.includes(timeframe)) {
      console.log(`/FineSumByDate endpoint blocked due to invalid timeframe by username: ${decoded.sub}`);
      res.status(400).json({ status: 'error', message: 'Invalid timeframe' });
      return; // Exit early if validation fails
    }

    let result = await connection.execute(
      `BEGIN CalculateTotalIncomeByTimeframe(:p_year, :p_timeframe, :p_value, :p_cursor); END;`,
      {
        p_year: year,
        p_timeframe: timeframe,
        p_value: value,
        p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    let resultSet = result.outBinds.p_cursor;
    let row = await resultSet.getRow(); // Get the single row

    await resultSet.close();
    let response = row ? { "Total_Fine": "£" + row.TOTAL_FINE.toFixed(2) } : {}; // Convert the TOTAL_FINE to string and prepend with £

    console.log(`/FineSumByDate endpoint called successfully by username: ${decoded.sub}`);
    res.status(200).json(response); // Return the object directly

    connection.release();
  } catch (err) {
    console.log(err);
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});

app.get('/LateFineSumByDate/:year/:timeframe/:value', rateLimiter, async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    // Check if decoded.role_id is equal to role for RBAC
    if (decoded.role_id !== 3 && decoded.role_id !== 5) {
      console.log(`Access denied for user ${decoded.sub}. Make sure you are logged into the right account. Role ID: ${decoded.role_id}`);
      res.status(403).json({ status: 'error', message: `Access denied for user ${decoded.sub}. Make sure you are logged into the right account` });
      return;
    }
    let connection = await warehouseDB.getConnection();
    let year = req.params.year;
    let timeframe = req.params.timeframe;
    let value = req.params.value;

    // Validate timeframe
    const allowedTimeframes = ['Year', 'Quarter', 'Month', 'Week'];
    if (!allowedTimeframes.includes(timeframe)) {
      //console.log(`/LateFineSumByDate endpoint blocked due to invalid timeframe by username: ${decoded.sub}`);
      res.status(400).json({ status: 'error', message: 'Invalid timeframe' });
      return; // Exit early if validation fails
    }

    let query;
    if (timeframe == 'Year') {
      // Handle the case when timeframe is "Year"
      connection.execute(
        `SELECT SUM(f.fine_amount) AS Total_Fine
         FROM Fact_Loans f
         JOIN Dim_Date d ON f.fine_paid_date = d.DateKey
         WHERE d.Year = :year
         AND (f.fine_paid_date > f.returned_on_date + 7 OR (SYSDATE > f.returned_on_date + 7 AND f.fine_amount IS NOT NULL))`,
        { year: year }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/LateFineSumByDate endpoint called successfully by username: ${decoded.sub}`);
          const totalFine = result.rows[0]?.TOTAL_FINE || 0; // Extract the total fine amount
          res.status(200).json({ Total_Fine: "£" + totalFine });
        }
      );
    } else {
      // Handle other timeframes (Quarter, Month, Week)
      connection.execute(
        `SELECT SUM(f.fine_amount) AS Total_Fine
        FROM Fact_Loans f
        JOIN Dim_Date d ON f.fine_paid_date = d.DateKey
        WHERE UPPER(d.${timeframe}) = UPPER(:value)
        AND d.Year = :year
        AND (f.fine_paid_date > f.returned_on_date + 7 OR (SYSDATE > f.returned_on_date + 7 AND f.fine_amount IS NOT NULL))`,
        { year: year, value: value }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/FineSumByDate endpoint called successfully by username: ${decoded.sub}`);
          const totalFine = result.rows[0]?.TOTAL_FINE || 0; // Extract the total fine amount
          res.status(200).json({ Total_Fine: "£" + totalFine });
        }
      );
    }
    connection.release();
  } catch (err) {
    console.log(err);
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});
//#endregion

//#region Chief Librarian Queries
app.get('/PopularBooksByMonth/:course_id/:year/:timeframe/:value/:fetchnum', rateLimiter, async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    // Check if decoded.role_id is equal to role for RBAC
    if (decoded.role_id !== 4 && decoded.role_id !== 5) {
      console.log(`Access denied for user ${decoded.sub} at /PopularBooksByMonth. Role ID: ${decoded.role_id}`);
      res.status(403).json({ status: 'error', message: `Access denied for user ${decoded.sub}. Make sure you are logged into the right account` });
      return;
    }
    let connection = await warehouseDB.getConnection();
    let year = req.params.year;
    let timeframe = req.params.timeframe;
    let value = req.params.value;
    let fetchnum = req.params.fetchnum;
    let course_id = req.params.course_id;

    // Validate timeframe
    const allowedTimeframes = ['Year', 'Quarter', 'Month', 'Week'];
    if (!allowedTimeframes.includes(timeframe)) {
      console.log(`/PopularBooksByMonth endpoint blocked due to invalid timeframe by username: ${decoded.sub}`);
      res.status(400).json({ status: 'error', message: 'Invalid timeframe' });
      return; // Exit early if validation fails
    }

    if (timeframe == 'Year') {
      // Handle the case when timeframe is "Year"
      connection.execute(
        `SELECT b.title,
          b.author,
          COUNT(DISTINCT l.loan_id) AS number_of_loans,
          COUNT(DISTINCT CASE WHEN l.fine_amount IS NOT NULL THEN l.loan_id END) AS number_of_fines
        FROM Fact_Loans l
        JOIN Dim_Date d ON l.returned_on_date = d.DateKey
        JOIN Dim_Courses c ON l.course_id = c.course_id
        JOIN Dim_Books b ON l.book_id = b.book_id
          WHERE d.Year = :year
          AND c.course_id = :course_id
        GROUP BY b.title, b.author
        ORDER BY number_of_loans DESC, number_of_fines DESC
        FETCH FIRST :fetchnum ROWS ONLY`,
        { year: year, course_id: course_id, fetchnum: fetchnum }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/PopularBooksByMonth endpoint called successfully by username: ${decoded.sub}`);
          res.status(200).json(result.rows);
        }
      );
    } else {
      // Handle other timeframes (Quarter, Month, Week)
      connection.execute(
        `SELECT b.title,
        b.author,
        COUNT(DISTINCT l.loan_id) AS number_of_loans,
        COUNT(DISTINCT CASE WHEN l.fine_amount IS NOT NULL THEN l.loan_id END) AS number_of_fines
      FROM Fact_Loans l
      JOIN Dim_Date d ON l.returned_on_date = d.DateKey
      JOIN Dim_Courses c ON l.course_id = c.course_id
      JOIN Dim_Books b ON l.book_id = b.book_id
      WHERE d.Year = :year
        AND c.course_id = :course_id
        AND UPPER(d.${timeframe}) = UPPER(:value)
      GROUP BY b.title, b.author
      ORDER BY number_of_loans DESC, number_of_fines DESC
      FETCH FIRST :fetchnum ROWS ONLY`,
        { year: year, value: value, course_id: course_id, fetchnum: fetchnum }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/PopularBooksByMonth endpoint called successfully by username: ${decoded.sub}`);
          res.status(200).json(result.rows);
        }
      );
    }
    connection.release();
  } catch (err) {
    console.log(err);
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});

app.get('/BooksReturnedLate/:year/:timeframe/:value/:fetchnum', rateLimiter, async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    // Check if decoded.role_id is equal to role for RBAC
    if (decoded.role_id !== 4 && decoded.role_id !== 5) {
      console.log(`Access denied for user ${decoded.sub} at /BooksReturnedLate. Role ID: ${decoded.role_id}`);
      res.status(403).json({ status: 'error', message: `Access denied for user ${decoded.sub}. Make sure you are logged into the right account` });
      return;
    }
    let connection = await warehouseDB.getConnection();
    let year = req.params.year;
    let timeframe = req.params.timeframe;
    let value = req.params.value;
    let fetchnum = req.params.fetchnum;

    // Validate timeframe
    const allowedTimeframes = ['Year', 'Quarter', 'Month', 'Week'];
    if (!allowedTimeframes.includes(timeframe)) {
      console.log(`/BooksReturnedLate endpoint blocked due to invalid timeframe by username: ${decoded.sub}`);
      res.status(400).json({ status: 'error', message: 'Invalid timeframe' });
      return; // Exit early if validation fails
    }

    if (timeframe == 'Year') {
      // Handle the case when timeframe is "Year"
      connection.execute(
        `SELECT b.title,
          b.author,
          COUNT(DISTINCT CASE WHEN l.returned_on_date > l.return_by_date THEN l.loan_id END) AS number_of_late_returns
        FROM Fact_Loans l
        JOIN Dim_Date d ON l.returned_on_date = d.DateKey
        JOIN Dim_Courses c ON l.course_id = c.course_id
        JOIN Dim_Books b ON l.book_id = b.book_id
          WHERE d.Year = :year
        GROUP BY b.title, b.author
        ORDER BY number_of_late_returns DESC
        FETCH FIRST :fetchnum ROWS ONLY`,
        { year: year, fetchnum: fetchnum }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/BooksReturnedLate endpoint called successfully by username: ${decoded.sub}`);
          res.status(200).json(result.rows);
        }
      );
    } else {
      // Handle other timeframes (Quarter, Month, Week)
      connection.execute(
        `SELECT b.title,
        b.author,
        COUNT(DISTINCT CASE WHEN l.returned_on_date > l.return_by_date THEN l.loan_id END) AS number_of_late_returns
      FROM Fact_Loans l
      JOIN Dim_Date d ON l.returned_on_date = d.DateKey
      JOIN Dim_Courses c ON l.course_id = c.course_id
      JOIN Dim_Books b ON l.book_id = b.book_id
      WHERE d.Year = :year
        AND UPPER(d.${timeframe}) = UPPER(:value)
      GROUP BY b.title, b.author
      ORDER BY number_of_late_returns DESC
      FETCH FIRST :fetchnum ROWS ONLY`,
        { year: year, value: value, fetchnum: fetchnum }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/BooksReturnedLate endpoint called successfully by username: ${decoded.sub}`);
          res.status(200).json(result.rows);
        }
      );
    }
    connection.release();
  } catch (err) {
    console.log(err);
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});

//#endregion

//#region Departmental Heads Queries
app.get('/MostPopularBooksByPageCount/:year/:timeframe/:value/:fetchnum/:pagecount/:operator', rateLimiter, async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    // Check if decoded.role_id is equal to role for RBAC
    if (decoded.role_id !== 2 && decoded.role_id !== 5) {
      console.log(`Access denied for user ${decoded.sub} at /MostPopularBooksByPageCount. Role ID: ${decoded.role_id}`);
      res.status(403).json({ status: 'error', message: `Access denied for user ${decoded.sub}. Make sure you are logged into the right account` });
      return;
    }
    let connection = await warehouseDB.getConnection();
    let year = Number(req.params.year);
    let timeframe = req.params.timeframe;
    let value = Number(req.params.value);
    let fetchnum = Number(req.params.fetchnum);
    let pages = Number(req.params.pagecount);
    let operator = req.params.operator;

    // Validate timeframe
    const allowedTimeframes = ['Year', 'Quarter', 'Month', 'Week'];
    if (!allowedTimeframes.includes(timeframe)) {
      console.log(`/MostPopularBooksByPageCount endpoint blocked due to invalid timeframe by username: ${decoded.sub}`);
      res.status(400).json({ status: 'error', message: 'Invalid timeframe' });
      return; // Exit early if validation fails
    }

    operator = operator == "Greater than" ? ">" : operator == "Less than" ? "<" : operator;
    if (operator != ">" && operator != "<") {
      console.log(`/MostPopularBooksByPageCount endpoint blocked due to invalid operator: ${operator}`);
      res.status(400).json({ status: 'error', message: 'Invalid operator' });
      return; // Exit early if validation fails
    }

    if (timeframe == 'Year') {
      // Handle the case when timeframe is "Year"
      connection.execute(
        `SELECT b.title,
          b.author,
          b.pages,
          b.ISBN,
          COUNT(DISTINCT l.loan_id) AS number_of_loans
          FROM Fact_Loans l
          JOIN Dim_Date d ON l.returned_on_date = d.DateKey
          JOIN Dim_Books b ON l.book_id = b.book_id
          WHERE d.Year = :year
          AND b.pages ${operator} :pages
          GROUP BY b.title, b.author, b.pages, b.ISBN
          ORDER BY number_of_loans DESC
          FETCH FIRST :fetchnum ROWS ONLY`,
        { year: year, pages: pages, fetchnum: fetchnum }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/MostPopularBooksByPageCount endpoint called successfully by username: ${decoded.sub}`);
          res.status(200).json(result.rows);
        }
      );
    } else {
      // Handle other timeframes (Quarter, Month, Week)
      connection.execute(
        `SELECT b.title,
        b.author,
        b.pages,
        b.ISBN,
        COUNT(DISTINCT l.loan_id) AS number_of_loans
        FROM Fact_Loans l
        JOIN Dim_Date d ON l.returned_on_date = d.DateKey
        JOIN Dim_Books b ON l.book_id = b.book_id
        WHERE d.Year = :year
        AND UPPER(d.${timeframe}) = UPPER(:value)
        AND b.pages ${operator} :pages
        GROUP BY b.title, b.author, b.pages, b.ISBN
        ORDER BY number_of_loans DESC
        FETCH FIRST :fetchnum ROWS ONLY`,
        { year: year, value: value, pages: pages, fetchnum: fetchnum }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/MostPopularBooksByPageCount endpoint called successfully by username: ${decoded.sub}`);
          res.status(200).json(result.rows);
        }
      );
    }
    connection.release();
  } catch (err) {
    console.log(err);
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});

app.get('/MostActiveStudentsByMonth/:course_id/:year/:timeframe/:value/:fetchnum', rateLimiter, async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    // Check if decoded.role_id is equal to role for RBAC
    if (decoded.role_id !== 2 && decoded.role_id !== 5) {
      console.log(`Access denied for user ${decoded.sub} at /MostActiveStudentsByMonth. Role ID: ${decoded.role_id}`);
      res.status(403).json({ status: 'error', message: `Access denied for user ${decoded.sub}. Make sure you are logged into the right account` });
      return;
    }
    let connection = await warehouseDB.getConnection();
    let year = req.params.year;
    let timeframe = req.params.timeframe;
    let value = req.params.value;
    let fetchnum = req.params.fetchnum;
    let course_id = req.params.course_id;

    // Validate timeframe
    const allowedTimeframes = ['Year', 'Quarter', 'Month', 'Week'];
    if (!allowedTimeframes.includes(timeframe)) {
      console.log(`/MostActiveStudentsByMonth endpoint blocked due to invalid timeframe by username: ${decoded.sub}`);
      res.status(400).json({ status: 'error', message: 'Invalid timeframe' });
      return; // Exit early if validation fails
    }

    if (timeframe == 'Year') {
      // Handle the case when timeframe is "Year"
      connection.execute(
        `SELECT u.first_name,
          u.last_name,
          COUNT(DISTINCT l.loan_id) AS number_of_loans,
          COUNT(DISTINCT CASE WHEN l.fine_amount IS NOT NULL THEN l.loan_id END) AS number_of_fines
          FROM Fact_Loans l
          JOIN Dim_Date d ON l.returned_on_date = d.DateKey
          JOIN Dim_Courses c ON l.course_id = c.course_id
          JOIN Dim_LibraryUsers u ON l.student_id = u.user_id
          WHERE d.Year = :year
            AND c.course_id = :course_id
          GROUP BY u.first_name, u.last_name
          ORDER BY number_of_loans DESC, number_of_fines DESC
          FETCH FIRST :fetchnum ROWS ONLY`,
        { year: year, course_id: course_id, fetchnum: fetchnum }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/MostActiveStudentsByMonth endpoint called successfully by username: ${decoded.sub}`);
          res.status(200).json(result.rows);
        }
      );
    } else {
      // Handle other timeframes (Quarter, Month, Week)
      connection.execute(
        `SELECT u.first_name,
        u.last_name,
        COUNT(DISTINCT l.loan_id) AS number_of_loans,
        COUNT(DISTINCT CASE WHEN l.fine_amount IS NOT NULL THEN l.loan_id END) AS number_of_fines
        FROM Fact_Loans l
        JOIN Dim_Date d ON l.returned_on_date = d.DateKey
        JOIN Dim_Courses c ON l.course_id = c.course_id
        JOIN Dim_LibraryUsers u ON l.student_id = u.user_id
        WHERE d.Year = :year
          AND c.course_id = :course_id
          AND UPPER(d.${timeframe}) = UPPER(:value)
        GROUP BY u.first_name, u.last_name
        ORDER BY number_of_loans DESC, number_of_fines DESC
        FETCH FIRST :fetchnum ROWS ONLY`,
        { year: year, value: value, course_id: course_id, fetchnum: fetchnum }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/MostActiveStudentsByMonth endpoint called successfully by username: ${decoded.sub}`);
          res.status(200).json(result.rows);
        }
      );
    }
    connection.release();
  } catch (err) {
    console.log(err);
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});
//#endregion

//#region Vice Chancellor Queries
app.get('/MostActiveDepartmentByMonth/:year/:timeframe/:value/:fetchnum', rateLimiter, async function (req, res) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWTSECRET);

    // Check if decoded.role_id is equal to role for RBAC
    if (decoded.role_id !== 1 && decoded.role_id !== 5) {
      console.log(`Access denied for user ${decoded.sub} at /MostActiveDepartmentByMonth. Role ID: ${decoded.role_id}`);
      res.status(403).json({ status: 'error', message: `Access denied for user ${decoded.sub}. Make sure you are logged into the right account.` });
      return;
    }

    let connection;
    try {
      connection = await warehouseDB.getConnection();
      const { year, timeframe, value, fetchnum } = req.params;

      // Execute the stored procedure using async/await
      const [rows] = await connection.query(
        `CALL get_most_active_department_by_month(?, ?, ?, ?)`,
        [year, timeframe, value, fetchnum]
      );

      console.log(`/MostActiveDepartmentByMonth endpoint called successfully by username: ${decoded.sub}`);
      res.status(200).json(rows[0] || {});
    } catch (queryErr) {
      console.error('Error executing database query:', queryErr);
      res.status(500).json({ status: 'error', message: 'Database query failed' });
    } finally {
      if (connection) connection.release();
    }
  } catch (err) {
    console.error('Error processing request:', err);
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});

app.get('/TotalIncomeFromFinesByDate/:year/:timeframe/:value', rateLimiter, async function (req, res) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWTSECRET);

    // Check if decoded.role_id is equal to role for RBAC
    if (decoded.role_id !== 1 && decoded.role_id !== 5) {
      console.log(`Access denied for user ${decoded.sub} at /TotalIncomeFromFinesByDate. Role ID: ${decoded.role_id}`);
      res.status(403).json({ status: 'error', message: `Access denied for user ${decoded.sub}. Make sure you are logged into the right account.` });
      return;
    }

    let connection;
    try {
      connection = await warehouseDB.getConnection();
      const { year, timeframe, value } = req.params;

      // Validate timeframe
      const allowedTimeframes = ['Year', 'Quarter', 'Month', 'Week'];
      if (!allowedTimeframes.includes(timeframe)) {
        console.log(`/TotalIncomeFromFinesByDate endpoint blocked due to invalid timeframe by username: ${decoded.sub}`);
        res.status(400).json({ status: 'error', message: 'Invalid timeframe' });
        return; // Exit early if validation fails
      }

      // Execute the stored procedure using async/await
      const [rows] = await connection.query(
        `CALL get_total_income(?, ?, ?)`,
        [year, timeframe, value]
      );

      console.log(`/TotalIncomeFromFinesByDate endpoint called successfully by username: ${decoded.sub}`);
      res.status(200).json(rows[0] || {});
    } catch (queryErr) {
      console.error('Error executing database query:', queryErr);
      res.status(500).json({ status: 'error', message: 'Database query failed' });
    } finally {
      if (connection) connection.release();
    }
  } catch (err) {
    console.error('Error processing request:', err);
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});
//#endregion

app.get('/ping', function (req, res) {
  res.status(200).json({ status: 'success', message: 'pong' });
});

//#region Operational DB Queries
app.get('/users', rateLimiter, async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    let connection = await warehouseDB.getConnection();
    connection.execute(
      `SELECT u.USER_ID USER_ID,
        u.FIRST_NAME FIRST_NAME,
        u.LAST_NAME LAST_NAME,
        u.EMAIL EMAIL,
        u.COURSE_ID COURSE_ID,
        c.COURSE_NAME COURSE_NAME,
        c.COURSE_CODE COURSE_CODE,
        c.COURSE_LEADER COURSE_LEADER FROM LIBRARY_USERS u INNER JOIN COURSES c ON u.COURSE_ID = c.COURSE_ID`,
      {}, // no bind variables
      { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
      (err, result) => {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(`/users endpoint called successfully by username: ${decoded.sub}`);
        res.status(200).json(result.rows); // only return rows
      }
    );
    connection.release();
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});

app.get('/books', rateLimiter, async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    let connection = await warehouseDB.getConnection();
    connection.execute(
      `SELECT b.BOOK_ID BOOK_ID,
        b.TITLE TITLE,
        b.AUTHOR_ID AUTHOR_ID,
        b.ISBN ISBN,
        b.PAGES PAGES,
        b.CREATED CREATED,
        b.ON_LOAN ON_LOAN,
        a.FIRST_NAME FIRST_NAME,
        a.LAST_NAME LAST_NAME
        FROM BOOKS b
        inner join authors a ON a.author_id = b.author_id`,
      {}, // no bind variables
      { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
      (err, result) => {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(`/books endpoint called successfully by username: ${decoded.sub}`);
        res.status(200).json(result.rows); // only return rows
      }
    );
    connection.release();
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});

app.get('/fines', rateLimiter, async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    let connection = await warehouseDB.getConnection();
    connection.execute(
      `SELECT f.FINE_AMOUNT FINE_AMOUNT,
        f.FINE_DATE FINE_DATE,
        f.PAID FINE_PAID,
        l.LOAN_ID LOAN_ID,
        l.BOOK_ID BOOK_ID,
        l.USER_ID USER_ID,
        l.RETURN_BY BOOK_RETURN_BY,
        l.RETURNED_ON BOOK_RETURNED_ON,
        l.RETURNED BOOK_RETURNED,
        b.TITLE BOOK_TITLE,
        b.AUTHOR_ID AUTHOR_ID,
        b.ISBN ISBN,
        b.PAGES PAGES,
        b.CREATED CREATED,
        b.ON_LOAN BOOK_ON_LOAN,
        u.FIRST_NAME FIRST_NAME,
        u.EMAIL EMAIL,
        c.COURSE_NAME,
        c.COURSE_CODE,
        c.COURSE_LEADER
        FROM FINES f
        INNER JOIN LOANS l ON f.LOAN_ID = l.LOAN_ID
        INNER JOIN BOOKS b ON l.BOOK_ID = b.BOOK_ID
        INNER JOIN LIBRARY_USERS u on u.USER_ID = l.USER_ID
        INNER JOIN COURSES c on u.COURSE_ID = c.COURSE_ID`,
      {}, // no bind variables
      { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
      (err, result) => {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(`/fines endpoint called successfully by username: ${decoded.sub}`);
        res.status(200).json(result.rows); // only return rows
      }
    );
    connection.release();
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});

app.get('/loans', rateLimiter, async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    let connection = await warehouseDB.getConnection();
    connection.execute(
      `SELECT l.LOAN_ID LOAN_ID,
      l.RETURN_BY BOOK_RETURN_BY,
      l.RETURNED_ON BOOK_RETURNED_ON,
      l.RETURNED BOOK_RETURNED,
      b.TITLE BOOK_TITLE,
      b.AUTHOR_ID AUTHOR_ID,
      b.ISBN ISBN,
      b.PAGES PAGES,
      b.CREATED CREATED,
      b.ON_LOAN BOOK_ON_LOAN,
      u.FIRST_NAME FIRST_NAME,
      u.EMAIL EMAIL,
      c.COURSE_NAME,
      c.COURSE_CODE,
      c.COURSE_LEADER
      FROM LOANS l
      INNER JOIN BOOKS b ON l.BOOK_ID = b.BOOK_ID
      INNER JOIN LIBRARY_USERS u on u.USER_ID = l.USER_ID
      INNER JOIN COURSES c on u.COURSE_ID = c.COURSE_ID`,
      {}, // no bind variables
      { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
      (err, result) => {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(`/loans endpoint called successfully by username: ${decoded.sub}`);
        res.status(200).json(result.rows); // only return rows
      }
    );
    connection.release();
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});
//#endregion

//#region User Accounts
app.post('/login', rateLimiter, async function (req, res) {
  try {
    console.log('Received login request');
    const { username, password } = req.body;
    console.log('Username:', username);

    let connection;
    try {
      connection = await warehouseDB.getConnection();
      console.log('Database connection established');
    } catch (connErr) {
      console.error('Failed to establish database connection:', connErr);
      res.status(500).json({ status: 'error', message: 'Database connection failed' });
      return;
    }

    // Query the database for the user
    let rows;
    try {
      [rows] = await connection.execute(
        `SELECT u.USER_ID, u.USERNAME, u.NAME, u.PASSWORD, u.ROLE_ID, r.ROLE_NAME FROM users u INNER JOIN roles r ON u.role_id = r.role_id WHERE USERNAME = ?`,
        [username]
      );
    } catch (queryErr) {
      console.error('Error executing database query:', queryErr);
      res.status(500).json({ status: 'error', message: 'Database query failed' });
      connection.release();
      return;
    }

    if (rows.length > 0) {
      // User found
      const row = rows[0];
      console.log('User found:', row);

      let passwordMatch = false;

      // Check if the stored password is hashed with SHA-256 or bcrypt
      if (row.PASSWORD.length === 64) {
        // SHA-256 hash length is 64 characters
        const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
        if (sha256Hash === row.PASSWORD) {
          // Password matches, rehash with bcrypt
          const saltRounds = 10;
          const bcryptHash = await bcrypt.hash(password, saltRounds);

          // Update the password in the database with the bcrypt hash
          try {
            await connection.execute(
              `UPDATE users SET PASSWORD = ? WHERE USER_ID = ?`,
              [bcryptHash, row.USER_ID]
            );
            console.log(`Password for user ${username} rehashed with bcrypt and updated in the database`);
            passwordMatch = true;
          } catch (updateErr) {
            console.error('Error updating password in the database:', updateErr);
            res.status(500).json({ status: 'error', message: 'Failed to update password' });
            connection.release();
            return;
          }
        }
      } else {
        // Assume it's a bcrypt hash
        passwordMatch = await bcrypt.compare(password, row.PASSWORD);
      }

      if (!passwordMatch) {
        console.log(`Login failed for username: ${username}`);
        res.status(401).json({ status: 'error', message: 'Invalid username or password' });
        connection.release();
        return;
      }

      // Create a JWT token and send it to the client along with the user details
      const payload = {
        iss: 'datawarehouseapi.dylanwarrell.com',
        sub: row.USERNAME,
        name: row.NAME,
        role_id: row.ROLE_ID
      };
      // Create a new user object without the password hash
      const userWithoutPassword = {
        USER_ID: row.USER_ID,
        USERNAME: row.USERNAME,
        NAME: row.NAME,
        ROLE_ID: row.ROLE_ID,
        ROLE_NAME: row.ROLE_NAME
      };
      console.log(`User ${row.USERNAME} logged in successfully`);
      res.status(200).json({
        user: userWithoutPassword,
        token: jwt.sign(payload, process.env.JWTSECRET, { expiresIn: '1h' })
      });
    } else {
      // User not found
      console.log(`Login failed for username: ${username}`);
      res.status(401).json({ status: 'error', message: 'Invalid username or password' });
    }
    connection.release();
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ status: 'error', message: 'Database is unavailable. Contact University of Gloucestershire IT Support.' });
  }
});

app.post('/new-password', rateLimiter, async function (req, res) {
  try {
    // Check for a valid token and get the username of the authenticated user
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    const username = decoded.sub;

    // Establish a database connection
    let connection = await warehouseDB.getConnection();

    try {
      const { password } = req.body;

      // Hash the new password using SHA256
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      // Call the stored procedure to change the password
      await connection.execute(
        `CALL change_password(?, ?)`,
        [username, hashedPassword]
      );

      console.log(`Password changed for username: ${username}`);
      res.status(200).json({ status: 'success', message: `Password changed for username: ${username}` });
    } catch (updateError) {
      // Handle database update error
      console.warn('Error updating password:', updateError);
      res.status(500).json({ status: 'error', message: 'Failed to update password. Please try again later. Contact University of Gloucestershire IT Support if the database remains inaccessible.' });
    } finally {
      // Release the database connection
      connection.release();
    }
  } catch (tokenError) {
    // Handle invalid token error
    console.warn('Invalid token:', tokenError);
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});

//#endregion

//#region Dashboard queries
app.get('/dashboardSummary', rateLimiter, async function (req, res) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWTSECRET);

    let connection = await warehouseDB.getConnection();

    try {
      // Execute the stored procedures using async/await
      const [loansAndFinesResults] = await connection.execute(`CALL get_loans_and_fines()`);
      const [fineIncomeResults] = await connection.execute(`CALL get_fine_income()`);
      const [quarterlyFineIncomeResults] = await connection.execute(`CALL get_quarterly_fine_income()`);

      // Combine the results into a single response object
      const response = {
        loansAndFines: loansAndFinesResults[0],
        fineIncome: fineIncomeResults[0],
        quarterlyFineIncome: quarterlyFineIncomeResults[0]
      };

      console.log(`/dashboardSummary endpoint called successfully by username: ${decoded.sub}`);
      res.status(200).json(response);
    } catch (queryErr) {
      console.error('Error executing database query:', queryErr);
      res.status(500).json({ status: 'error', message: 'Database query failed' });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});

//#endregion

// START APP
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
  console.log(`UI available at http://localhost:${port}/swagger`);
});
