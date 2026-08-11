import {Router} from 'express'
import { addSectionController } from '../controllers/sectionController';
const sectionRouter = Router()

sectionRouter.post('/add', addSectionController)

export default sectionRouter;