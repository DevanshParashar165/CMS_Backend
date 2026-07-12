import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000,
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.refreshToken;
  return userObj;
};

const generateTokensForUser = async (userOrId) => {
  const user = userOrId._id ? userOrId : await User.findById(userOrId);
  if (!user) {
    throw new Error('User not found');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      role,
      contact_number,
      country_code,
      date_of_birth,
      gender,
      address1,
      address2,
      city,
      state,
      country,
      clinic_id,
    } = req.body;

    if (!username || !email || !password || !first_name) {
      return res.status(400).json({
        message: 'Username, email, password, and first name are required',
      });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const newUser = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      first_name,
      last_name,
      role,
      contact_number,
      country_code,
      date_of_birth,
      gender,
      address1,
      address2,
      city,
      state,
      country,
      clinic_id,
      last_login: new Date(),
    });

    return res
      .status(201)
      .json({ message: 'User registered successfully', user: sanitizeUser(newUser) });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.is_active) {
      return res.status(404).json({ message: 'User not found or inactive' });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.last_login = new Date();
    const { accessToken, refreshToken } = await generateTokensForUser(user);
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', refreshToken, cookieOptions)
      .json({ message: 'User logged in successfully', user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in user', error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging out user', error: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload._id);
    if (!user || user.refreshToken !== refreshToken || !user.is_active) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokensForUser(user);

    return res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', newRefreshToken, cookieOptions)
      .json({ message: 'Access token refreshed successfully' });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token expired or invalid', error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({ user: sanitizeUser(req.user) });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching current user', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }

    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken');
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }

    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updates = { ...req.body };
    delete updates.password;
    delete updates.refreshToken;
    delete updates.is_active;

    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
      delete updates.role;
      delete updates.clinic_id;
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const permanent = req.query.permanent === 'true';

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }

    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (permanent && req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can permanently delete users' });
    }

    if (permanent) {
      await User.findByIdAndDelete(userId);
      return res.status(200).json({ message: 'User permanently deleted' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { is_active: false },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deactivated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }

      const isPasswordValid = await user.isPasswordCorrect(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }

    user.password = newPassword;
    user.refreshToken = null;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;
    const profilePictureUrl = req.body.profilePictureUrl || req.body.profile_picture;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }

    if (!profilePictureUrl) {
      return res.status(400).json({ message: 'Profile picture URL is required' });
    }

    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profile_picture: profilePictureUrl },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Profile picture updated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating profile picture', error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const regex = new RegExp(q, 'i');
    const users = await User.find({
      is_active: true,
      $or: [
        { first_name: regex },
        { last_name: regex },
        { username: regex },
        { email: regex },
        { role: regex },
      ],
    }).select('-password -refreshToken');

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Error searching users', error: error.message });
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const users = await User.find({ role, is_active: true }).select('-password -refreshToken');
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users by role', error: error.message });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { is_active: true },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User activated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Error activating user', error: error.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { is_active: false },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deactivated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Error deactivating user', error: error.message });
  }
};
