const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bookModel = require("../model/bookModel")




const authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-Api-key"];

        if (!token) token = req.headers["x-api-key"];

             if (!token)             // TOKEN IS NOT PRESENT 
            return res.status(400).send({
                status: false,
                msg: "Token Is Not Present",
            });

        let decodedToken = jwt.verify(token, "project3",function(err, decodedToken){
            return res.status(401).send({
                status: false,
                msg: "token is invalid",

                next();
        })}
        
    }
    catch (err) {
        return res.status(500).send({
            status: false,
            data: err.message
        })
    }
};

        


module.exports.authentication = authentication






