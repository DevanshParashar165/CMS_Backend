import router from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  changePassword,
  updateProfilePicture,
  searchUsers,
  getUsersByRole,
  activateUser,
  deactivateUser,
} from '../controllers/user.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const userRouter = router.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/refresh-token', refreshAccessToken);
userRouter.post('/logout', authenticate, logoutUser);

userRouter.get('/me', authenticate, getCurrentUser);
userRouter.get('/', authenticate, authorizeRoles('admin', 'superAdmin'), getAllUsers);
userRouter.get('/search', authenticate, searchUsers);
userRouter.get('/role/:role', authenticate, getUsersByRole);
userRouter.get('/:userId', authenticate, getUserById);

userRouter.put('/:userId', authenticate, updateUser);
userRouter.delete('/:userId', authenticate, deleteUser);
userRouter.put('/:userId/password', authenticate, changePassword);
userRouter.put('/:userId/profile-picture', authenticate, updateProfilePicture);
userRouter.patch('/:userId/activate', authenticate, authorizeRoles('admin', 'superAdmin'), activateUser);
userRouter.patch('/:userId/deactivate', authenticate, authorizeRoles('admin', 'superAdmin'), deactivateUser);

export default userRouter;