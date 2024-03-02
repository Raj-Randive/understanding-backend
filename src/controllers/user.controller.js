import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResonse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from frontend
  // Validation - not empty
  // check if user already exists: check by username and email
  // Check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object, create entry in Database
  // remove the password and refresh token field from response
  // check for user creation
  // return response else send error
  // **************************************************

  // Destructing the datas
  const { fullName, email, username, password } = req.body;
  console.log("email: ", email);
  console.log("full name: ", fullName);
  console.log("username: ", username);
  console.log("password: ", password);

  // if (fullName === "") {
  //   throw new ApiError(400, "fullname is required");
  // }

  // Advanced javascript
  if ([fullName, email, password, username].some((x) => x?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Handling all the images
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImagePath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImagePath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // create a object and make a entry in database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // check if user is created or not
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // If all things are successfull then return the response
  return res
    .status(201)
    .json(new ApiResonse(200, createdUser, "User registered successfully"));
});

export { registerUser };
