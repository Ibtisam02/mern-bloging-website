import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGEN,//,http://localhost:5173
    credentials:true
}))
console.log(process.env.CORS_ORIGEN)
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
import router from "./routes/user.routes.js"
//import userRouter from "./routes/user.rutes.js"

app.use("/api/v1/users",router)
export {app}