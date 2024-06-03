import { Router } from "express";
import { addCatagory, addSubCatagory, createPost, getCatagories, getOnePost, getPosts, getSubCatagories,registerUser,loginUser,varifyJwt,varifyAdmin, deletePost } from "../contorollers/user.contorollers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const router=Router();


router.post("/create-post",varifyJwt,varifyAdmin,upload.single("image"),createPost)
router.get("/posts",getPosts) 
router.get("/posts/:id",getOnePost)
router.post("/add-catagory",addCatagory)
router.post("/add-subcatagory",addSubCatagory)
router.get("/catagories",getCatagories)
router.get("/subcatagories",getSubCatagories)
router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/getLogin",varifyJwt,(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"user is loged in"))
})
router.delete("/posts/:id",varifyJwt,varifyAdmin,deletePost)

export default router