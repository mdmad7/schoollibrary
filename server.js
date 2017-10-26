import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import index from './routes/index';
import users from './routes/users';

const server = express();

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

// catch 404 and forward to error handler
server.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

server.listen(3000, () => {
  console.log('We are live');
});
