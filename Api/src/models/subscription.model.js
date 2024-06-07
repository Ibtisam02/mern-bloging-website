import mongoose, { Schema } from "mongoose";
const subscriptionScheema=new mongoose.Schema({
    subscriber:{
    type:Schema.Types.ObjectId, //one who is subscribing
    ref:"User"
    },
    chennel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionScheema)