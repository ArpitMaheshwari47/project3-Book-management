const bookModel = require("../models/bookModel")
const moment = require("moment")


const registerBook = async function(req,res){
    try
    
     {      let body = req.body
         const book = await bookModel.create(body)
    res.status(201).send({status:true,message:"Success",data:book})
    }
    catch (error) {
        res.status(500).send({status:false,message:error.message})
    }
}       
        

module.exports.registerBook = registerBook