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
    connectString: process.env.DBHOST + '/' + process.env.DBNAME
  });
  warehouseDB = pool;
}
initializeWarehouseDB();

let operationalDB;
async function initializeOperationalDB() {
  const pool = await oracledb.createPool({
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    connectString: process.env.DBHOST + '/' + process.env.DBNAME
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

  //#region Bowsers
  app.get('/bowsers', async function (req, res, next) {
    let connection = await warehouseDB.getConnection();
    const result = await connection.execute(
      'SELECT bowserId, lat, lon, size, createdOn, lastTopUp, status, capacityPercentage FROM bowsers WHERE deletedState=0'
    );
    res.status(200).json(result.rows);
    connection.release();
  });

  app.get('/bowsers/:id', async function (req, res, next) {
    let connection = await warehouseDB.getConnection();
    const result = await connection.execute(
      'SELECT bowserId, lat, lon, size, createdOn, lastTopUp, status, capacityPercentage FROM bowsers WHERE bowserId=:id AND deletedState=0',
      {id: req.params.id}
    );
    res.status(200).json(result.rows);
    connection.release();
  });

  //#endregion

  //#region Tickets

  // Get all tickets
  app.get('/tickets', async function (req, res, next) {
    let connection = await warehouseDB.getConnection();
    const result = await connection.execute(
      'SELECT requestId, title, description, type, status, lat, lon, priority FROM tickets WHERE deletedState=0'
    );
    res.status(200).json(result.rows);
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
