const router = require('express').Router();
const userModel = require('../model/user.model');
const crypto = require("crypto-js");

router.post('/register' , async (req,res) => {
    try{
        const {name} = req.body;
        var str = name + new Date.now();
        const apiKey = crypto.SHA256(str).toString().slice(0 , 20);

        const userCreated = new userModel({name , apiKey});
        await userCreated.save();

        res.json({status: 200 , success: "user Created"});
    } catch(error){
        console.log(error)
    }
});

module.exports = router;