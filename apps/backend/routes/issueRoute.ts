import {Router} from 'express'
import { addIssueController, getIssueController } from '../controllers/issueController';
const issueRouter = Router()

issueRouter.post('/add', addIssueController)
issueRouter.get('/:issueId', getIssueController)

export default issueRouter;