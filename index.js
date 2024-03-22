const express = require("express");
const bodyParser = require('body-parser');
const userRouter = require('./routes/user.router');
const s3bucketRouter = require('./routes/s3bucket.router');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Server is running");
});

app.use('/', userRouter);
app.use('/', s3bucketRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
