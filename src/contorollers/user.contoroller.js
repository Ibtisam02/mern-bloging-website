import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCludinary } from "../utils/cloudnairy.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser=asyncHandler(async(req,res)=>{
   //get user details from frontend
   //vaildate all the data
   //upload files to multer and then to cloudinary 
   //create docoment in database and put all the data
   //remove password and access token filed from response
   //check for user creation
   //return response

   const {email,fullname,password,userName}=req.body
   if ([email,fullname,password,userName].some((item)=>(
    item.trim()==""
   ))) {
    throw new ApiError(400,'All the fields are required')
   }
   let isExisting=await User.findOne({$or:[{email:email},{userName:userName}]})
   if (isExisting) {
    throw new ApiError(409,"user this email or username already exist")
   }
   const avatarLocalPath=req.files?.avatar[0]?.path
   const coverImageLocalPath=req.files?.coverImage[0]?.path
   if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is required")
   }

   const avatar= await uploadOnCludinary(avatarLocalPath)
   const cover=await uploadOnCludinary(coverImageLocalPath)

   if (!avatar) {
    throw new ApiError(400,"Avatar is required")
   }

   const user= await User.create({
    fullname:fullname,
    avatar:avatar.url,
    coverImage:cover?.url || "",
    email:email,
    fullname:fullname,
    password:password,
    userName:userName.toLowerCase()
   })

  const isUserCreated=await User.findById(user._id).select({password:0,refreshToken:0})
  if (!isUserCreated) {
    throw new ApiError(500,"Somthing went wrong while registring the user")
  }

  return res.status(201).json(
    new ApiResponse(200,isUserCreated,"User registerd successfully!")
  )
})


export {registerUser}