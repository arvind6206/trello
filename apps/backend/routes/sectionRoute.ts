import {Router} from 'express'
import { addSectionController, getSectionController } from '../controllers/sectionController';
const sectionRouter = Router()

sectionRouter.post('/add', addSectionController)
sectionRouter.get('/:id', getSectionController)
sectionRouter.delete('/:id', deleteSectionController)



export default sectionRouter;