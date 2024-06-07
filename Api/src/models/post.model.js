import mongoose, { Schema } from "mongoose";

const postScheems=new mongoose.Schema({

    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    catagor:{
        type:String,
        required:true
    },
    subCatagor:{
        type:String,
        required:true
    },
    privat:{
        type:Boolean,
        required:true
    },

})

export const Post=mongoose.model("Post",postScheems);