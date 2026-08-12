import {Router} from 'express'
import { createOrgController, deleteOrgController, getOrgController, getSingleOrgController, updateOrgController } from '../controllers/orgController'
import { authMiddleware } from '../middleware/auth'
const orgRouter = Router()

orgRouter.post('/create',authMiddleware, createOrgController)
orgRouter.get('/',authMiddleware, getOrgController)
orgRouter.get('/:orgId',authMiddleware, getSingleOrgController)
orgRouter.put('/:orgId',authMiddleware, updateOrgController)
orgRouter.delete('/:orgId',authMiddleware, deleteOrgController)


export default orgRouter