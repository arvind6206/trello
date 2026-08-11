import {WebSocketServer} from 'ws'

import {prisma} from 'db/client'

const server = new WebSocketServer({port: 3002})

const USERS: any = {

}

server.on("connection", (socket) => {
    socket.on("message", (data) => {
        const parsedData = JSON.parse(data)

        if(parsedData.type === "join"){
            const boardId = parsedData.boardId
            if(!USERS[boardId]){
                USERS[boardId] = []
            }

            const newUserId = Math.random()
            USERS[boardId].push({userId: newUserId, socket: socket})
            
            for(let i = 0; i < USERS[boardId].length; i++){
                const user = USERS[boardId][i];
                user.socket.send(JSON.stringify({
                    type: "join",
                    userId:newUserId
                }))
            }
        }
    })
})