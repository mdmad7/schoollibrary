import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import index from './routes/index';
import users from './routes/users';
import catalog from './routes/catalog';

const server = express();

//Set up mongoose connection
const mongoDB = 'mongodb://localhost/schoollibrary';
mongoose.connect(mongoDB, {
  useMongoClient: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//server.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
server.use(logger('dev'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());
server.use(express.static(path.join(__dirname, 'public')));

server.use('/', index);
server.use('/users', users);
server.use('/catalog', catalog);

// catch 404 and forward to error handler
server.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
server.use((err, req, res, next) => {
  res.status(500);
  res.render('error', { error: err });
});

server.listen(3000, () => {
  console.log('We are live');
});
