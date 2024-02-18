import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    avatar: {
      type: String, // Cloudinary url
      required: true,
    },

    coverImage: {
      type: String, // Cloudinary url
    },

    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// pre-hooks of mongoose
// "save" -> do something before saving a document to the database (e.g., hash passwords)

// ye code ko tabhi chalao when we do password-field modification.
userSchema.pre("save", async function (next) {
  // chech if password field is modified or not
  if (!this.isModified("password")) return next();

  this.password = bcrypt.hash(this.password, 10);
  next();
});

// defining the custom methods.
userSchema.methods.isPasswordCorrect = async function (password) {
  // logic to check the password
  return await bcrypt.compare(password, this.password);
};

// JWT Token - this is how tokens are generated
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// JWT Token - Refreshes every min
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
