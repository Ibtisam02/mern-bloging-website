import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()
cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,//, "dj0k9z7tr"
  api_key:process.env.CLOUDINARY_API_KEY, //, "994816924895392"
  api_secret: process.env.CLOUDINARY_API_SECRET// "OaF0Z7YZcCryD4B8-RecKsWPBng"
})


const uploadOnCludinary=async (localFilePath)=>{
    try {
        if (!localFilePath) return null
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally sved file
        console.log("error while uploading files",error)
        return null;
    }
}

export {uploadOnCludinary}