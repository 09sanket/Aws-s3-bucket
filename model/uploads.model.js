const db = require('../config/db');
const mongoose = require('mongoose');
const {Schema} = mongoose;
const userModel = require('../model/user.model');



const uploadSchema = new Schema({
   userId:{
    type:Schema.Types.ObjectId , 
    ref: userModel.modelName
   },
   filename: {
    type:String
   },
   mimeType: {
    type: String
   }, 
   path:{
    type:String
   }
},{timestamps:true});

const uploadModel = db.model('uploads' , uploadSchema);
module.exports = uploadModel;