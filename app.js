var express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// fileupload module
var fileupload = require('express-fileupload');
app.use(fileupload());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use('/', indexRouter);
app.use('/users', usersRouter);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Location Extraction API',
      version: '1.0.0',
      description: 'API documentation for the Location Extraction service',
    },
    servers: [
      {
        url: 'http://localhost:3001',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API routes directory
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString);
const database = mongoose.connection;
database.on('error', (error) => {
  console.log(error);
});
database.once('connected', () => {
  console.log('Database Connected');
});

// Post method to upload a file to the server
app.post('/upload', function(req, res, next) {
  if (!req.files || !req.files.photo) {
    return res.status(400).send('No file uploaded.');
  }

  const file = req.files.photo;
  file.mv(path.join(__dirname, 'uploads', file.name), function(err) {
    if (err) {
      console.error(err);
      return res.status(500).send('File upload failed.');
    }

    res.send({
      success: true,
      message: 'File uploaded!',
    });
  });
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      stack: req.app.get('env') === 'development' ? err.stack : undefined,
    },
  });
});

app.listen(3000, () => {
  console.log('Started on port: 3000');
});

module.exports = app;
