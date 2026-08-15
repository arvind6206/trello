import express, { Request } from 'express'
import userRouter from './routes/userRoute'
import orgRouter from './routes/orgRoute'
import boardRouter from './routes/boardRoute'
import sectionRouter from './routes/sectionRoute'
import issueRouter from './routes/issueRoute'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(express.json())
const PORT = process.env.PORT || 3000

app.use('/api/v1/user', userRouter)
app.use('/api/v1/org', orgRouter)
app.use('/api/v1/board', boardRouter)
app.use('/api/v1/section', sectionRouter)
app.use('/api/v1/issue', issueRouter)


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})