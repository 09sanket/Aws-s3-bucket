const express = require("express");
const bodyparser = require('body-parser');
const userRouter = require('./routes/user.router')
const s3bucket = require('./routes/s3bucket.router');

const app = express();
app.use(bodyparser.json());

app.use('/' , userRouter);
app.use('/' , s3bucket);

module.exports = app;