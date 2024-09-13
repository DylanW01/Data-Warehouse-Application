const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const oracledb = require('oracledb');
const crypto = require('crypto');
require('dotenv').config();
const appVersion = require("../package.json").version;


//#region DB Setup - Create connection to database - Uses .env file for credentials
let warehouseDB;
async function initializeWarehouseDB() {
  const pool = await oracledb.createPool({
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    connectString: process.env.CONNECTIONSTR
  });
  warehouseDB = pool;
}
initializeWarehouseDB();

let operationalDB;
async function initializeOperationalDB() {
  const pool = await oracledb.createPool({
    user: process.env.DBUSEROP,
    password: process.env.DBPASSOP,
    connectString: process.env.CONNECTIONSTR
  });
  operationalDB = pool;
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
    description: 'API to track data from Library Data Warehouse.',
    version: appVersion,
    contact: {
      email: "s4002608@glos.ac.uk"
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

  //#region Operational DB Queries
  app.get('/users', async function (req, res, next) {
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
        res.status(200).json(result.rows); // only return rows
      }
    );
    connection.release();
  });

  app.get('/books', async function (req, res, next) {
    let connection = await operationalDB.getConnection();
    connection.execute(
      'SELECT b.BOOK_ID BOOK_ID, b.TITLE TITLE, b.AUTHOR_ID AUTHOR_ID, b.ISBN ISBN, b.PAGES PAGES, b.CREATED CREATED, b.ON_LOAN ON_LOAN, a.FIRST_NAME FIRST_NAME, a.LAST_NAME LAST_NAME FROM BOOKS b inner join authors a ON a.author_id = b.author_id',
      {}, // no bind variables
      { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
      (err, result) => {
        if (err) {
          console.error(err.message);
          return;
        }
        res.status(200).json(result.rows); // only return rows
      }
    );
    connection.release();
  });

  app.get('/fines', async function (req, res, next) {
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
        res.status(200).json(result.rows); // only return rows
      }
    );
    connection.release();
  });

  app.get('/loans', async function (req, res, next) {
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
        res.status(200).json(result.rows); // only return rows
      }
    );
    connection.release();
  });
  //#endregion

  //#region User Accounts
  app.post('/login', async function (req, res, next) {
    let connection = await operationalDB.getConnection();
    const { username, password } = req.body;
  
    // Hash the password
    const hash = crypto.createHash('sha256');
    hash.update(password);
    const hashedPassword = hash.digest('hex');
  
    // Query the database
    const result = await connection.execute(
      'SELECT * FROM users WHERE username=:username AND password=:password',
      {username, password: hashedPassword}
    );
  
    if (result.rows.length > 0) {
      // User found
      res.status(200).json(result.rows[0]);
    } else {
      // User not found
      res.status(401).json({status: 'error', message: 'Invalid username or password'});
    }
  
    connection.release();
  });
  //#endregion 

// START APP
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
  console.log(`UI available at http://localhost:${port}/swagger`);
});
