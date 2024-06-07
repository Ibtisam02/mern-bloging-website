import mongoose from "mongoose";

const comentScheema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    comment:{
        type:String,
        required:true
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
},{timestamps:true})
export const Comment=mongoose.model("Comment",comentScheema);