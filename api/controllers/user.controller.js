import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import { errorHandler } from "../utils/error.js";

export const test = (req, res) => {
  res.json({
    message: "Api route is working properly",
  });
};

export const updateUser = async (req, res, next) => {
  // Validate JSON payload first
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(errorHandler(400, "Request body is empty or invalid JSON"));
  }

  // Check authorization - CONVERT TO STRING for comparison
  if (req.user.id !== req.params.id.toString()) {
    return next(errorHandler(403, "You can update only your account!"));
  }

  try {
    // Build update object with only provided fields
    const updateData = {};
    
    if (req.body.username) updateData.username = req.body.username;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.avatar) updateData.avatar = req.body.avatar;
    
    // Hash password if provided
    if (req.body.password) {
      updateData.password = bcrypt.hashSync(req.body.password, 10);
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, select: '-password' } // ✅ Exclude password from query result
    );

    // Check if user exists
    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }
    
    console.log("✅ User updated successfully");
    
    return res.status(200).json(updatedUser); // ✅ No need to manually remove password
    
  } catch (error) {
    console.error("❌ Update user error:", error);
    next(error);
  }
};