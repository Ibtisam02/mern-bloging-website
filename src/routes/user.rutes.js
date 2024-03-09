import { Router } from "express";
import { registerUser } from "../contorollers/user.contoroller.js";
import { upload } from "../middlewares/multer.middleware.js";
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

export default router