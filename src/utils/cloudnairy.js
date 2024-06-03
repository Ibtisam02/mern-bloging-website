import { v2 as cloudinary } from "cloudinary";
import fs from "fs"    
cloudinary.config({ 
  cloud_name: "dj0k9z7tr",//process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:"994816924895392", //process.env.CLOUDINARY_API_KEY, 
  api_secret:"OaF0Z7YZcCryD4B8-RecKsWPBng" //process.env.CLOUDINARY_API_SECRET 
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