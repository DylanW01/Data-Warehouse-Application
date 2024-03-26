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
    description: 'API to track data from Library Data Warehouse. Use the /login endpoint to get a JWT token to access the other endpoints via the green Authorize button.',
    version: appVersion,
    contact: {
      name: "Dylan Warrell",
      email: "s4002608@glos.ac.uk",
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

app.get('/ping', function (req, res) {
  res.status(200).json({status: 'success', message: 'pong'});
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
          res.status(200).json(result.rows); // only return rows
        }
      );
      connection.release();
    } catch(err) {
      res.status(401).json({status: 'error', message: 'Invalid Token'});
    }
  });

  app.get('/books', async function (req, res) {
    try {
      var token = req.headers.authorization.split(' ')[1];
      var decoded = jwt.verify(token, process.env.JWTSECRET);
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
  } catch(err) {
    res.status(401).json({status: 'error', message: 'Invalid Token'});
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
          res.status(200).json(result.rows); // only return rows
        }
      );
      connection.release();
    } catch(err) {
      res.status(401).json({status: 'error', message: 'Invalid Token'});
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
        res.status(200).json(result.rows); // only return rows
      }
    );
    connection.release();
    } catch(err) {
      res.status(401).json({status: 'error', message: 'Invalid Token'});
    }
  });
  //#endregion

  //#region User Accounts
  app.post('/login', async function (req, res) {
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
      {username, hashedInputPassword},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }, // query result format
    );
  
    if (result.rows.length > 0) {
      var user = result.rows[0];
      // User found
  
      // Create a JWT token and send it to the client along with the user details
      payload = {
        iss: 'localhost',
        sub: user.USERNAME,
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
      res.status(200).json({
        user: userWithoutPassword,
        token: jwt.sign(payload, process.env.JWTSECRET, {expiresIn: '1h'})
      });
    } else {
      // User not found or invalid password
      res.status(401).json({status: 'error', message: 'Invalid username or password'});
    }
    connection.release();
  });
  
  

  app.post('/new-password', async function (req, res) {
    try {
      // check for valid token and get the username of the authenticated user
      var token = req.headers.authorization.split(' ')[1];
      var decoded = jwt.verify(token, process.env.JWTSECRET);
      const username = decoded.sub
      let connection = await operationalDB.getConnection();
      const { password } = req.body;
  
      // Hash the new password using SHA256
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
      // Update the password hash in the database
      const result = await connection.execute(
        `UPDATE USERS SET PASSWORD=:hashedPassword WHERE USERNAME=:username`,
        {
          hashedPassword: {val: hashedPassword, type: oracledb.STRING},
          username: {val: username, type: oracledb.STRING}
        }
      );
      connection.commit();
      res.status(200).json(result);
      connection.release();
    } catch(err) {
      res.status(401).json({status: 'error', message: 'Invalid Token'});
    }
  });
  
  //#endregion 

// START APP
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
  console.log(`UI available at http://localhost:${port}/swagger`);
});
