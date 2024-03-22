const express = require("express");
const bodyparser = require('body-parser');
const userRouter = require('./routes/user.router')

const app = express();
app.use(bodyparser.json());

app.use('/' , userRouter);

module.exports = app;