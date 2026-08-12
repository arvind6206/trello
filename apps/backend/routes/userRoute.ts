import {Router} from 'express'
import { getMeController, loginController, signupController } from '../controllers/userController';
import {authMiddleware} from '../middleware/auth'
const userRouter = Router()

userRouter.post('/signup', signupController)
userRouter.post('/login', loginController)
userRouter.get("/me", authMiddleware, getMeController);

export default userRouter;