import dotenv from "dotenv"
import connectDB from "./db/connection.js";
import { app } from "./app.js";
dotenv.config({
    path:"./.env"
})


connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log(`thsi is connection error`,error)
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log("app is listning on port no "+process.env.PORT)
    })
})
.catch(error=>console.log(`errror while connecting mongodb `,error))