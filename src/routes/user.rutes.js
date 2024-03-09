import { Router } from "express";
import { registerUser } from "../contorollers/user.contoroller.js";
const router=Router();
//check if error
router.post("/register",registerUser)

export default router