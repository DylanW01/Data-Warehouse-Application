const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const oracledb = require('oracledb');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const appVersion = require("../package.json").version;


//#region DB Setup - Create connection to database - Uses .env file for credentials
let warehouseDB;
async function initializeWarehouseDB() {
  try {
    const pool = await oracledb.createPool({
      user: process.env.DBUSER,
      password: process.env.DBPASS,
      connectString: process.env.CONNECTIONSTR
    });
    warehouseDB = pool;
  } catch (err) {
    console.error('Failed to create pool for warehouseDB', err);
    process.exit(0);
  }
}
initializeWarehouseDB();

let operationalDB;
async function initializeOperationalDB() {
  try {
    const pool = await oracledb.createPool({
      user: process.env.DBUSEROP,
      password: process.env.DBPASSOP,
      connectString: process.env.CONNECTIONSTR
    });
    operationalDB = pool;
  } catch (err) {
    console.error('Failed to create pool for operationalDB', err);
    process.exit(0);
  }
}
initializeOperationalDB();

const port = process.env.PORT || 8080;
//#endregion

const app = express()
  .use(cors())
  .use(bodyParser.json())
  .use(express.json())

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
app.get('/FineSumByDate/:year/:timeframe/:value', async function (req, res) {
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

    let query;
    if (timeframe == 'Year') {
      // Handle the case when timeframe is "Year"
      connection.execute(
        `SELECT SUM(f.fine_amount) AS Total_Fine
         FROM Fact_Loans f
         JOIN Dim_Date d ON f.fine_paid_date = d.DateKey
         WHERE d.Year = :year`,
        { year: year }, // bind variables
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
    } else {
      // Handle other timeframes (Quarter, Month, Week)
      connection.execute(
        `SELECT SUM(f.fine_amount) AS Total_Fine
        FROM Fact_Loans f
        JOIN Dim_Date d ON f.fine_paid_date = d.DateKey
        WHERE UPPER(d.${timeframe}) = UPPER(:value)
        AND d.Year = :year`,
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

app.get('/LateFineSumByDate/:year/:timeframe/:value', async function (req, res) {
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
app.get('/PopularBooksByMonth/:course_id/:year/:timeframe/:value/:fetchnum', async function (req, res) {
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

app.get('/BooksReturnedLate/:year/:timeframe/:value/:fetchnum', async function (req, res) {
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
app.get('/MostPopularBooksByPageCount/:year/:timeframe/:value/:fetchnum/:pagecount/:operator', async function (req, res) {
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

app.get('/MostActiveStudentsByMonth/:course_id/:year/:timeframe/:value/:fetchnum', async function (req, res) {
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
app.get('/MostActiveDepartmentByMonth/:year/:timeframe/:value/:fetchnum', async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    // Check if decoded.role_id is equal to role for RBAC
    if (decoded.role_id !== 1 && decoded.role_id !== 5) {
      console.log(`Access denied for user ${decoded.sub} at /MostActiveDepartmentByMonth. Role ID: ${decoded.role_id}`);
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
      console.log(`/MostActiveDepartmentByMonth endpoint blocked due to invalid timeframe by username: ${decoded.sub}`);
      res.status(400).json({ status: 'error', message: 'Invalid timeframe' });
      return; // Exit early if validation fails
    }

    let query;
    if (timeframe == 'Year') {
      // Handle the case when timeframe is "Year"
      connection.execute(
        `SELECT c.course_id, c.course_name, COUNT(DISTINCT l.loan_id) AS number_of_loans, COUNT(DISTINCT CASE WHEN l.fine_paid = 1 THEN l.loan_id END) AS number_of_fines
        FROM Fact_Loans l
        JOIN Dim_Date d ON l.returned_on_date = d.DateKey
        JOIN Dim_Courses c ON l.course_id = c.course_id
        WHERE d.Year = :year
        GROUP BY c.course_id, c.course_name
        ORDER BY number_of_loans DESC, number_of_fines DESC
        FETCH FIRST :fetchnum ROWS ONLY`,
        { year: year, fetchnum: fetchnum }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/MostActiveDepartmentByMonth endpoint called successfully by username: ${decoded.sub}`);
          res.status(200).json(result.rows);
        }
      );
    } else {
      // Handle other timeframes (Quarter, Month, Week)
      connection.execute(
        `SELECT c.course_id, c.course_name, COUNT(DISTINCT l.loan_id) AS number_of_loans, COUNT(DISTINCT CASE WHEN l.fine_paid = 1 THEN l.loan_id END) AS number_of_fines
        FROM Fact_Loans l
        JOIN Dim_Date d ON l.returned_on_date = d.DateKey
        JOIN Dim_Courses c ON l.course_id = c.course_id
        WHERE UPPER(d.${timeframe}) = UPPER(:value)
        AND d.Year = :year
        GROUP BY c.course_id, c.course_name
        ORDER BY number_of_loans DESC, number_of_fines DESC
        FETCH FIRST :fetchnum ROWS ONLY`,
        { year: year, value: value, fetchnum: fetchnum }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/MostActiveDepartmentByMonth endpoint called successfully by username: ${decoded.sub}`);
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

app.get('/TotalIncomeFromFinesByDate/:year/:timeframe/:value', async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    // Check if decoded.role_id is equal to role for RBAC
    if (decoded.role_id !== 1 && decoded.role_id !== 5) {
      console.log(`Access denied for user ${decoded.sub} at /TotalIncomeFromFinesByDate. Role ID: ${decoded.role_id}`);
      res.status(403).json({ status: 'error', message: `Access denied for user ${decoded.sub}. Make sure you are logged into the right account.` });
      return;
    }
    let connection = await warehouseDB.getConnection();
    let year = req.params.year;
    let timeframe = req.params.timeframe;
    let value = req.params.value;

    // Validate timeframe
    const allowedTimeframes = ['Year', 'Quarter', 'Month', 'Week'];
    if (!allowedTimeframes.includes(timeframe)) {
      console.log(`/TotalIncomeFromFinesByDate endpoint blocked due to invalid timeframe by username: ${decoded.sub}`);
      res.status(400).json({ status: 'error', message: 'Invalid timeframe' });
      return; // Exit early if validation fails
    }

    if (timeframe == 'Year') {
      // Handle the case when timeframe is "Year"
      connection.execute(
        `SELECT COUNT(DISTINCT l.loan_id) AS number_of_loans,
        SUM(CASE WHEN l.fine_paid_date IS NOT NULL THEN l.fine_amount ELSE 0 END) AS total_fines_income
        FROM Fact_Loans l
        JOIN Dim_Date d ON l.returned_on_date = d.DateKey
        WHERE d.Year = :year`,
        { year: year }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/TotalIncomeFromFinesByDate endpoint called successfully by username: ${decoded.sub}`);
          res.status(200).json(result.rows[0]);
        }
      );
    } else {
      // Handle other timeframes (Quarter, Month, Week)
      connection.execute(
        `SELECT COUNT(DISTINCT l.loan_id) AS number_of_loans,
        SUM(CASE WHEN l.fine_paid_date IS NOT NULL THEN l.fine_amount ELSE 0 END) AS total_fines_income
        FROM Fact_Loans l
        JOIN Dim_Date d ON l.returned_on_date = d.DateKey
        WHERE UPPER(d.${timeframe}) = UPPER(:value)
        AND d.Year = :year`,
        { year: year, value: value }, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log(`/TotalIncomeFromFinesByDate endpoint called successfully by username: ${decoded.sub}`);
          res.status(200).json(result.rows[0]);
        }
      );
    }
    connection.release();
  } catch (err) {
    console.error(err);
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
});
//#endregion

app.get('/ping', function (req, res) {
  res.status(200).json({ status: 'success', message: 'pong' });
});

//#region Operational DB Queries
app.get('/users', async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    let connection = await operationalDB.getConnection();
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

app.get('/books', async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    let connection = await operationalDB.getConnection();
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

app.get('/fines', async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    let connection = await operationalDB.getConnection();
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

app.get('/loans', async function (req, res) {
  try {
    var token = req.headers.authorization.split(' ')[1];
    var decoded = jwt.verify(token, process.env.JWTSECRET);
    let connection = await operationalDB.getConnection();
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
app.post('/login', async function (req, res) {
  try {
    let connection = await operationalDB.getConnection();
    const { username, password } = req.body;

    // Hash the input password using SHA256
    const hashedInputPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Query the database
    const result = await connection.execute(
      `select users.USER_ID USER_ID,
        users.USERNAME USERNAME,
        users.PASSWORD PASSWORD,
        users.NAME NAME,
        users.ROLE_ID ROLE_ID,
        roles.ROLE_NAME ROLE_NAME from users
        inner join roles on roles.role_id = users.role_id
        WHERE users.USERNAME=:username AND users.PASSWORD=:hashedInputPassword`,
      { username, hashedInputPassword },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
    );

    if (result.rows.length > 0) {
      var user = result.rows[0];
      // User found

      // Create a JWT token and send it to the client along with the user details
      payload = {
        iss: 'datawarehouseapi.dylanwarrell.com',
        sub: user.USERNAME,
        name: user.NAME,
        role_id: user.ROLE_ID
      };
      // Create a new user object without the password hash
      const userWithoutPassword = {
        USER_ID: user.USER_ID,
        USERNAME: user.USERNAME,
        NAME: user.NAME,
        ROLE_ID: user.ROLE_ID,
        ROLE_NAME: user.ROLE_NAME
      };
      console.log(`User ${user.USERNAME} logged in successfully`);
      res.status(200).json({
        user: userWithoutPassword,
        token: jwt.sign(payload, process.env.JWTSECRET, { expiresIn: '1h' })
      });
    } else {
      // User not found or invalid password
      console.log(`Login failed for username: ${username}`);
      res.status(401).json({ status: 'error', message: 'Invalid username or password' });
    }
    connection.release();
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Database is unavailable. Contact University of Gloucestershire IT Support.' });
  }
});



app.post('/new-password', async function (req, res) {
  try {
    // Check for a valid token and get the username of the authenticated user
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    const username = decoded.sub;

    // Establish a database connection
    let connection = await operationalDB.getConnection();

    try {
      const { password } = req.body;

      // Hash the new password using SHA256
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      // Update the password hash in the database
      const result = await connection.execute(
        `UPDATE USERS SET PASSWORD=:hashedPassword WHERE USERNAME=:username`,
        {
          hashedPassword: { val: hashedPassword, type: oracledb.STRING },
          username: { val: username, type: oracledb.STRING }
        }
      );

      // Commit the transaction
      connection.commit();

      // Respond with the result
      console.log(`Password changed for username: ${username}`);
      res.status(200).json(result);
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
app.get('/dashboardSummary', async function (req, res) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWTSECRET);

    let connection = await warehouseDB.getConnection();

    // Wrap each query in a new Promise
    let loansAndFinesPromise = new Promise((resolve, reject) => {
      connection.execute(
        `SELECT TO_CHAR(returned_on_date, 'YYYY-MM') AS Month,
          COUNT(*) AS NumberOfLoans,
          COUNT(CASE WHEN fine_amount > 0 THEN 1 END) AS NumberOfFines
        FROM Fact_Loans
        WHERE returned_on_date >= ADD_MONTHS(SYSDATE, -6)
        GROUP BY TO_CHAR(returned_on_date, 'YYYY-MM')
        ORDER BY Month DESC`,
        {}, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ loansAndFines: result.rows });
        }
      );
    });

    let fineIncomePromise = new Promise((resolve, reject) => {
      connection.execute(
        `SELECT TO_CHAR(fine_paid_date, 'YYYY-MM') AS Month, SUM(fine_amount) AS TotalFineIncome
         FROM Fact_Loans
         WHERE fine_paid_date >= ADD_MONTHS(SYSDATE, -6)
         GROUP BY TO_CHAR(fine_paid_date, 'YYYY-MM')
         ORDER BY Month DESC`,
        {}, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ fineIncome: result.rows });
        }
      );
    });

    let quarterlyFineIncomePromise = new Promise((resolve, reject) => {
      connection.execute(
        `WITH quarters AS (
          SELECT Year, Quarter 
          FROM Dim_Date 
          WHERE DateKey IN (
            SELECT MAX(DateKey) 
            FROM Dim_Date 
            WHERE DateKey < ADD_MONTHS(SYSDATE, -3)
            UNION ALL
            SELECT MAX(DateKey) 
            FROM Dim_Date 
            WHERE DateKey < ADD_MONTHS(SYSDATE, -6)
          )
        )
        SELECT d.Year, d.Quarter, SUM(f.fine_amount) AS TotalFineIncome
        FROM Fact_Loans f
        JOIN Dim_Date d ON f.fine_paid_date = d.DateKey
        JOIN quarters q ON d.Year = q.Year AND d.Quarter = q.Quarter
        GROUP BY d.Year, d.Quarter
        ORDER BY d.Year DESC, d.Quarter DESC`,
        {}, // bind variables
        { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ quarterlyFineIncome: result.rows });
        }
      );
    });

    // Use Promise.all to wait for all queries to complete
    Promise.all([loansAndFinesPromise, fineIncomePromise, quarterlyFineIncomePromise])
      .then((results) => {
        // All queries have completed successfully
        console.log(`/dashboardSummary endpoint called successfully by username: ${decoded.sub}`);
        res.status(200).json(Object.assign({}, ...results));
      })
      .catch((err) => {
        // One or more queries failed
        console.error(err.message);
      })
      .finally(() => {
        connection.release();
      });

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
