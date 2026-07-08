import { User } from '../models/user.model.js';

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error('Error generating tokens');
  }
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, first_name, role } = req.body;
    if (!username || !email || !password || !first_name) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Username or email already exists' });
    }
    const login = Date.now();
    const newUser = await User.create({
      username: username.toLowerCase().trim(),
      email,
      password,
      first_name,
      role,
      last_login: login,
    });
    const createdUser = await User.findById(newUser._id).select(
      '-password -refreshToken'
    );
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      createdUser._id
    );

    if (!createdUser) {
      return res.status(400).json({ message: 'Error registering user' });
    }

    console.log('User registered successfully:', createdUser, ' at ', login);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };

    res
      .status(201)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json({ message: 'User registered successfully', user: createdUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error registering user', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.last_login = new Date();

    // Generate tokens
    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(user);

    // Save last login
    await user.save({ validateBeforeSave: false });

    // Remove sensitive fields
    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json({
        message: 'User logged in successfully',
        user: loggedInUser,
      });
  } catch (error) {
    console.error('Login Error:', error);

    return res.status(500).json({
      message: 'Error logging in user',
      error: error.message,
    });
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
    console.log('User logged out successfully:', user, ' at ', Date.now());
    await user.save({ validateBeforeSave: false });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      updateData
    } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
        updateData,
      { new: true }
    ).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.log('Error', error);
    return res
      .status(500)
      .json({ message: 'Error while updating user details', Error: error });
  }
};

const updateUserRole = async(req,res) => {
    try {
        const {adminId,userId} = req.params;
        const {role} = req.body;
        const admin = await User.findById(adminId);
        if(admin.role!=="superAdmin" && admin.role!=="admin"){
            return res.status(400)
                      .json({message : 'Only admin or super admin can update role'});
        }
        const user = await User.findByIdAndUpdate(userId,{role});
        if(!user){
            return res.status(404)
                      .json({message : 'User not found'})
        }
        return res.status(200)
                  .json({message:"User role is updated Successfully"})
    } catch (error) {
        console.log("Error : ",error);
        return res.status(400).json({message : 'Error encountered while updating user role',Error : error})
    }
}