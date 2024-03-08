import { v2 as cloudinary } from "cloudinary";
import fs from "fs"    
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCludinary=async (localFilePath)=>{
    try {
        if (!localFilePath) return null
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file is uploaded
        console.log("file is uploaded on cloudinary successfully ",response.url)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally sved file
        return null;
    }
}

export {uploadOnCludinary}