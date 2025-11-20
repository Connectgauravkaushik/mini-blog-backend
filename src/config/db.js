const mongoose = require("mongoose");

const connectDB = async()=>{
    await mongoose.connect("mongodb+srv://connectgauravkaushik_db_user:VcJSYrsrhjr1rKNl@cluster0.02ra8ei.mongodb.net/")
}

module.exports =  connectDB;