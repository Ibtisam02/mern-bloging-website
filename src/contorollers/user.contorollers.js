import { Post } from "../models/post.model.js";
import { Comment } from "../models/coments.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCludinary } from "../utils/cloudnairy.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js"
import { Catagory } from "../models/catagory.model.js";
import { subCatagoryModel } from "../models/subCatagory.js";
import { Register } from "../models/register.model.js";
import jwt from "jsonwebtoken"

const genrateAccessAndRefreshToken=async(userId)=>{
 const useer=await Register.findById(userId);
 const accessToken=await useer.genrateAccessToken();
 const refreshToken=await useer.genrateRefreshToken();

 useer.refreshToken=refreshToken;
 useer.save({validateBeforeSave:false})
 return {accessToken,refreshToken}
}

const varifyJwt=async(req,res,next)=>{
    
    const token=await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if (!token) {
        console.log("token")
        const rToken=await req.cookies?.refreshToken
        if (!rToken) {
            return res.json({
                error:"unauthorized access"
            })
        }
        const decodedRefreshToken= await jwt.verify(rToken,process.env.REFRESH_TOKEN_SECRET)
        const getUser=await Register.findById(decodedRefreshToken?._id).select({password:0,refreshToken:0})
        if (!getUser) {
            return res.json({
                error:"invalid refresh token"
            })
            
        }
        req.user=getUser
        next();
    }
    const decoded=await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user=await Register.findById(decoded?._id).select({password:0,refreshToken:0})
    if (!user) {
        return res.json({
            error:"invalid Access token"
        })
    }
    req.user=user
    console.log(req.user)
    next()
}
const varifyAdmin=async(req,res,next)=>{
    console.log(req.user)
    console.log(req.user?.email=="ali1@g.com")
   if ( !(req.user?.email=="ali1@g.com")) {
    
        return res.json({
            error:"Unauthorized access (Please login as admin to create post)"
        })
    
      
    }
    next();
}


const createPost=(async(req,res)=>{
    try {

        const {title,description,content,privat,subCatagor,catagor}=req.body;
    if (!title || !description || !content || !privat ||!catagor ||!subCatagor) {
       
        return res.json({
            error:"every filed is required"
        })
    }
    const imageLocalPath=req.file?.path;
    if (!imageLocalPath) {
        return res.json({
            error:"image filed is required"
        })
    }
    
    console.log(imageLocalPath)
    const newImage=await uploadOnCludinary(imageLocalPath)
    const imgUrl=newImage.url;
    if (!imgUrl) {
        return res.json({
            error:"cloudinary upload error"
        })
    }
    
    const post=await Post.create({
        title:title,
        description:description,
        content:content,
        image:imgUrl,
        privat:privat,
        catagor:catagor,
        subCatagor:subCatagor
    })
    res.status(200).json(new ApiResponse(200,post,"post created successfully"))
    } catch (error) {
        console.log("error in create post ", error)
    }
    
})
const getPosts=async(req,res)=>{
    const posts= await Post.find({privat:false})
    return res.status(200).json(new ApiResponse(200,posts,"posts ftched successfully"))
}
const getPrivatePosts=async(req,res)=>{
    const posts= await Post.find({privat:true})
    return res.status(200).json(new ApiResponse(200,posts,"posts ftched successfully"))
}
const getOnePost=async(req,res)=>{
    const {id}=req.params;
    const prepost=await Post.findById({_id:id});
    if(!prepost){
        return res.json({
            error:"post not found"
        })
    }

    const post=await Post.aggregate([
        {
             $match: { $expr : { $eq: [ '$_id' , { $toObjectId: id } ] } } 
        },
        {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "post",
              as: "comments"
            }
          }
    ])
    if (!post) {
        console.log("no")
    }
    return res.status(200).json(new ApiResponse(200,post,"post fetched"))
}
const addCatagory=async(req,res)=>{
    const {catagory}=req.body;
    if (!catagory) {
        throw new ApiError(401,"Catagory is required")
    }
    await Catagory.create({
        catagory:catagory
    })
    return res.status(200).json(new ApiResponse(200,{},"Catagory created successfully"))
}
const addSubCatagory=async(req,res)=>{
    const {subCatagory}=req.body;
    if (!subCatagory) {
        throw new ApiError(401,"Catagory is required")
    }
    await subCatagoryModel.create({
        subCatagory:subCatagory
    })
    return res.status(200).json(new ApiResponse(200,{},"Sub Catagory created successfully"))
}

const getCatagories=async(req,res)=>{
    const data=await Catagory.find();
    return res.status(200).json(new ApiResponse(200,data,"catagoies fetched successfully"))
}
const getSubCatagories=async(req,res)=>{
    const data= await subCatagoryModel.find();
    return res.status(200).json(new ApiResponse(200,data,"sub Catagoies fetched successfully"))
}
const registerUser=async(req,res)=>{
    const {name,email,username,password}=req.body;

    if ([name,email,username,password].some((item)=>item.trim()=="")) {
        //throw new ApiError(401,"All fields are required")
        return res.json({
            error:"All fields are required"
        })
    }
    const isUserExisted=await Register.findOne({
        $or:[{email:email},{username:username}]
    })
    
    if (isUserExisted) {
        //throw new ApiError(409,"username or email already exist");
        return res.json({
            error:"username or email already exist"
        })
    }
    const user=await Register.create({
        name:name,
        username:username.toLowerCase(),
        email:email,
        password:password,
    })

    const isUserCreated=await Register.findById(user._id).select({password:0,refreshToken:0})
    if (!isUserCreated) {
        //throw new ApiError(500,"Somthing went wrong while registring user");
        return res.json({
            error:"Somthing went wrong while registring user"
        })
    }

    return res.status(200).json(new ApiResponse(200,isUserCreated,"user created successfully"))
}
const loginUser=async(req,res)=>{
    const {username,email,password}=req.body;
    if (!username&&!email) {
        return res.json({
                error:"Email or username is required"
            })
    }
    const user=await Register.findOne({
        $or:[{username:username},{email:email}]
    })
    if (!user) {
        return res.json({
                error:"User dose'nt exist"
            })
    }
    const isPasswordValid=await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res.json({
            error:"invalid credentials"
        })
    }
    const {refreshToken,accessToken}=await genrateAccessAndRefreshToken(user._id);
    const logedInUser=await Register.findById(user._id).select({password:0,refreshToken:0})
    const options={
        httpOnly:true,
        expires:new Date(Date.now()+process.env.ACCESS_TOKEN_EXPIRY*24*60*60*1000),
     secure:true,
    }
    console.log(options.expires)
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{user:logedInUser,refreshToken,accessToken}))

}
const deletePost=async(req,res)=>{
    const {id}=req.params;
    let post=await Post.findByIdAndDelete({_id:id})
    console.log(post)
    return res.json({
        success:"Post deleted"
    })
}
const changePostPrivacy=async(req,res)=>{
    const {id}=req.params;
    let checkPost=await Post.findOne({_id:id})
    if (!checkPost) {
        return res.json({
            error:"post dose not exixt"
        })
    }
    if (checkPost.privat==true) {
        
        let post=await Post.updateOne({_id:id},{$set:{privat:false}})
        return res.status(200).json(new ApiResponse(200,post,"post set to public"))
    }
    let post=await Post.updateOne({_id:id},{$set:{privat:true}})
        return res.status(200).json(new ApiResponse(200,post,"post set to private"))
    
}
const addComment=async(req,res)=>{
    const {name,text,post}=req.body;
    if ([name,text,post].some((item)=>item.trim()=="")) {
        //throw new ApiError(401,"All fields are required")
        return res.json({
            error:"All fields are required"
        })
    }
    const comment=await Comment.create({
        name:name.toLowerCase(),
        comment:text,
        post:post
    })
    const isCommentAdded=await Comment.findById(comment._id);
    if (!isCommentAdded) {
        return res.json({
            error:"coment is not added"
        })
    }
    return res.status(200).json(new ApiResponse(200,isCommentAdded,"comment added successfully"));
}
const getPostThroughCatagory=async(req,res)=>{
    const {catagory}=req.body;
    if (catagory=="") {
        return res.json({
            error:"please add catagory"
        })
    }
    const posts=await Post.find({$and:[{catagor:catagory},{privat:false}]})
    return res.status(200).json(new ApiResponse(200,posts,"posts fetched successfully"));
}
const getPostThroughSubCatagory=async(req,res)=>{
    const {subCatagory}=req.body;
    if (subCatagory=="") {
        return res.json({
            error:"please add catagory"
        })
    }
    const posts=await Post.find({$and:[{subCatagor:subCatagory},{privat:false}]})
    console.log(posts)
    return res.status(200).json(new ApiResponse(200,posts,"posts fetched successfully"));
}

export {
    createPost,
    getPosts,
    getOnePost,
    addCatagory,
    addSubCatagory,
    getCatagories,
    getSubCatagories,
    registerUser,
    loginUser,
    varifyJwt,
    varifyAdmin,
    deletePost,
    addComment,
    getPostThroughCatagory,
    getPostThroughSubCatagory,
    getPrivatePosts,
    changePostPrivacy
}


