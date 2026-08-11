import {Router} from 'express'
import { createOrgController } from '../controllers/orgController'
import { authMiddleware } from '../middleware/auth'
const orgRouter = Router()

orgRouter.post('/create',authMiddleware, createOrgController)
orgRouter.delete('/:id',authMiddleware, deleteOrgController)


export default orgRouter