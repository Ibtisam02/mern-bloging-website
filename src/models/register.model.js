import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const scheema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})


scheema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10)
    next()
})

scheema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

scheema.methods.genrateAccessToken=async function () {
    return await jwt.sign({_id:this._id,email:this.email,name:this.name,username:this.username},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1d"/*process.env.REFRESH_TOKEN_SECRET*/})
}
scheema.methods.genrateRefreshToken=async function () {
    return await jwt.sign({_id:this._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"10d"/*process.env.REFRESH_TOKEN_EXPIRY*/})
}



export const Register=mongoose.model("Register",scheema);