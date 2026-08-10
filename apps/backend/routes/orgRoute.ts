import {Router} from 'express'
import { createOrgController } from '../controllers/orgController'
const orgRouter = Router()

orgRouter.post('/create', createOrgController)

export default orgRouter