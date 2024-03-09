import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userScheema=new mongoose.Schema({
userName:{
    type:String,
    required:true,
    unique:true,
    index:true,
    trim:true,
    lowercase:true,
},
email:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    lowercase:true,
},
fullname:{
    type:String,
    required:true,
    trim:true,
    index:true
},
avatar:{
    type:String, //cloudinary url
    required:true
},
coverImage:{
    type:String, //cloudinary url
},
watchHistory:[
    {
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
],
password:{
    type:String,
    required:true,
    unique:true,

},
refreshToken:{
    type:String
}
},{timestamps:true})
userScheema.pre("save",async function (next){
    if (this.isModified("password")) return next();
     this.password=await bcrypt.hash(this.password,10);
    next();
})
userScheema.methods.isPasswordCorrect=async function (password) {
    return await  bcrypt.compare(password,this.password)
}
userScheema.methods.genrateAccessToken=async function() {
   return await jwt.sign({_id:this._id,email:this.email,fullname:this.fullname},process.env.ACCESS_TOKEN_SECRET,{expiresIn:ACCESS_TOKEN_EXPIRY})
}
userScheema.methods.genrateRefreshToken=async function() {
    return await jwt.sign({_id:this._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:REFRESH_TOKEN_EXPIRY})
}
    

export const User=mongoose.model("User",userScheema)