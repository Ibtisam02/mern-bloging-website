import mongoose from "mongoose";

const scheema=new mongoose.Schema({
    subCatagory:{
        type:String,
        required:true
    }
})

export const subCatagoryModel=mongoose.model("SubCatagoryModel",scheema)

