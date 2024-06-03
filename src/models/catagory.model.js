import mongoose from "mongoose";

const scheema=new mongoose.Schema({
    catagory:{
        type:String,
        required:true
    }
})

export const Catagory=mongoose.model("Catagory",scheema)