import express, { Request } from 'express'
import userRouter from './routes/userRoute'
import orgRouter from './routes/orgRoute'

const app = express()

app.use(express.json())
const PORT = process.env.PORT

app.use('/api/v1/user', userRouter)
app.use('/api/v1/org', orgRouter)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})