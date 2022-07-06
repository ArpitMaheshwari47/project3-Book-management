const userModel = require("../models/userModel")


const registerUser = async function(req,res){
    try
     {
        let body = req.body
    const user = await userModel.create(body)
    res.status(201).send({status:true,message:"Success",data:user})
    }
    catch (error) {
        res.status(500).send({status:false,message:error.message})
    }
}       
        

module.exports.registerUser = registerUser