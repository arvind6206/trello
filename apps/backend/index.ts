import express, { Request } from 'express'
import {prisma} from 'db/client'

const app = express()

app.use(express.json())

app.post('/signup', (req, res) => {
    const {username, password} = req.body
    prisma.user.create({
        data: {
            username,
            password
        }
    })
    res.json({
        msg: "Signed up"
    })
})

app.listen(3000)