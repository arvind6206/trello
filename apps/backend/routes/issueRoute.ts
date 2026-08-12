import {Router} from 'express'
import { addIssueController, getIssueController, updateIssueController } from '../controllers/issueController';
const issueRouter = Router()

issueRouter.post('/add', addIssueController)
issueRouter.get('/:issueId', getIssueController)
issueRouter.put('/', updateIssueController)


export default issueRouter;