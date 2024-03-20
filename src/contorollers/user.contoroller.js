import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCludinary } from "../utils/cloudnairy.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const genrateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = await user.genrateAccessToken();
  const refreshToken = await user.genrateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //vaildate all the data
  //upload files to multer and then to cloudinary
  //create docoment in database and put all the data
  //remove password and access token filed from response
  //check for user creation
  //return response

  const { email, fullname, password, userName } = req.body;
  if ([email, fullname, password, userName].some((item) => item.trim() == "")) {
    throw new ApiError(400, "All the fields are required");
  }
  let isExisting = await User.findOne({
    $or: [{ email: email }, { userName: userName }],
  });
  if (isExisting) {
    throw new ApiError(409, "user this email or username already exist");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  //const coverImageLocalPath=req.files?.coverImage[0]?.path

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCludinary(avatarLocalPath);
  const cover = await uploadOnCludinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.create({
    fullname: fullname,
    avatar: avatar.url || "",
    coverImage: cover?.url || "",
    email: email,
    password: password,
    userName: userName.toLowerCase(),
  });

  const isUserCreated = await User.findById(user._id).select({
    password: 0,
    refreshToken: 0,
  });
  if (!isUserCreated) {
    throw new ApiError(500, "Somthing went wrong while registring the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, isUserCreated, "User registerd successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  //get information form the user using req.body
  //chek if informaton is valid
  //check i fuser  is existng
  //check if pssword is correct
  //genrate access and refresh tokens
  //send cookies

  const { userName, email, password } = req.body;

  if (!userName && !email) {
    throw new ApiError(400, "Username or email is required ");
  }
  const user = await User.findOne({
    $or: [{ userName: userName }, { email: email }],
  });
  if (!user) {
    throw new ApiError(404, "User dose not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "invaild user credentials");
  }
  const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
    user._id
  );

  const LogedInUser = await User.findById(user._id).select({
    password: 0,
    refreshToken: 0,
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: LogedInUser,
          accessToken,
          refreshToken,
        },
        "User LogedIn successfully"
      )
    );
});

const LogoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logedOut"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const token = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(token?._id);
    if (!user) {
      throw new ApiError(400, "Invalid refresh Token");
    }
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(400, "refresh token is expired");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { refreshToken, accessToken } = await genrateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(accessToken, refreshToken),
        "access token refreshed successfully"
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old Password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User Fetched successfully"));
});
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError(400, "All fileds are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullname: fullname, email: email } },
    { new: true }
  ).select({ passwors: 0 });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
const updateUserAvatar = asyncHandler(async (req, res) => {
  //todo delete previous file from cloudinary
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const newAvatar = await uploadOnCludinary(avatarLocalPath);

  if (!newAvatar.url) {
    throw new ApiError(500, "Error while uploading file to couldinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { set: { avatar: newAvatar.url } },
    { new: true }
  ).select({ password: 0 });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar is updated successfully"));
});
const updateUserCover = asyncHandler(async (req, res) => {
  //todo delete previous file from cloudinary
  const coverLocalPath = req.file?.path;
  if (!coverLocalPath) {
    throw new ApiError(400, "Cover Image file is missing");
  }
  const newCover = await uploadOnCludinary(coverLocalPath);

  if (!newCover.url) {
    throw new ApiError(500, "Error while uploading cover file to couldinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { set: { coverImage: newCover.url } },
    { new: true }
  ).select({ password: 0 });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image is updated successfully"));
});
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.prams;
  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "chennel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond:{
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          }
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404,"Channel dose not exist")
  }
  return res.status(200).json(new ApiResponse(200,channel[0],"Channel fetched successfully"))
});

const getWatchHistory=asyncHandler(async(req,res)=>{
  const user=await User.aggregate([
    {
      $match:{
         _id:new mongoose.Types.ObjectId(req.user._id)

      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullname:1,
                    userName:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }

        ]
      }
    }
  ])
  return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"wathch history fetched successfully"))
})

export {
  registerUser,
  loginUser,
  LogoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCover,
  getUserChannelProfile,
  getWatchHistory
  
};
