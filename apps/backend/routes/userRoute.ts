import {Router} from 'express'
import { signupController } from '../controllers/userController';

const userRouter = Router()

userRouter.post('/signup', signupController)

export default userRouter;