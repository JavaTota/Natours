const mongoose = require('mongoose');
const dotenv = require('dotenv');

//DEALING WITH ERRORS IN SYNCHRONOUS CODE (UNCAUGHT EXCEPTION)

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! ... Shutting down');
  console.log(err.name, err.message);
  process.exit(1);
});
process.on('warning', (warning) => {
  console.log('warning detected');
  console.log(warning.name, warning.message);
});

dotenv.config({
  path: './config.env',
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<DB_PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection succesful');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

//DEALING WITH ERRORS IN ASYNCHRONOUS CODE (UNHANDLED REJECTIONS)

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! ... Shutting down');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('======SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('=========process terminated');
  });
});
