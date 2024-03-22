const userModel = require('../model/user.model');

exports.userAuthMiddleware  = async (req , resp , next) => {
    try {
        const apiKey =  req.query.apiKey;

        if(!apiKey){
            return resp.json({status: 400 , message: "apikey is mandatory"})

        }
        const getUser = await userModel.findOne({apiKey:apiKey})

        if(!getUser){
            return resp.json({status:400 , message: "apikey dont exist"})
        }
        req.user = getUser;
        next();

    }catch (error){
        console.log(error)
    }
}