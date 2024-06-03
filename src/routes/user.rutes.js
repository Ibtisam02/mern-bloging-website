import { Router } from "express";
import { LogoutUser, changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCover } from "../contorollers/user.contoroller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {varifyJwt} from "../middlewares/auth.middleware.js"
const router=Router();
//check if error
router.post("/register",upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser)
router.post("/login",loginUser)
//secured routes
router.post("/logout",varifyJwt,LogoutUser)
router.post("/refresh-token",refreshAccessToken)
router.post("/change-password",varifyJwt,changeCurrentPassword)
router.get("/current-user",varifyJwt,getCurrentUser)
router.patch("/update-details",varifyJwt,updateAccountDetails)
router.patch("./avatar",varifyJwt,upload.single("avatar"),updateUserAvatar)
router.patch("./cover-image",varifyJwt,upload.single("coverImage"),updateUserCover)
router.get("/c/:username",varifyJwt,getUserChannelProfile)
router.get("/history",varifyJwt,getWatchHistory)

export default router