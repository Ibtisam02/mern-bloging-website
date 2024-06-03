import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app=express()
app.use(cors({
    origin:"http://localhost:5173",//process.env.CORS_ORIGEN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
import userRouter from "./routes/user.routes.js"
app.use("/",userRouter)
//import userRouter from "./routes/user.rutes.js"

app.use("/api/v1/users",userRouter)
export {app}