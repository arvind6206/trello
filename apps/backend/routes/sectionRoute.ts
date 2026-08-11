import {Router} from 'express'
import { addSectionController, deleteSectionController, getSectionController, updateSectionController } from '../controllers/sectionController';
const sectionRouter = Router()

sectionRouter.post('/add', addSectionController)
sectionRouter.get('/:id', getSectionController)
sectionRouter.delete('/:id', deleteSectionController)
sectionRouter.put('/:id', updateSectionController)




export default sectionRouter;