const mongoose = require('mongoose');

const conn = mongoose.createConnection(`mongodb://localhost:27017/S3bucketlike`).on('open' , ()=> {
    console.log("mongoDB is Connected");

}).on('error' , () => {
    console.log("mongoDb error");
});

module.exports = conn;