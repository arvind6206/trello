import {WebSocketServer} from 'ws'

import {prisma} from 'db/client'

const server = new WebSocketServer({port: 3002})

const ROOMS: Record<string, Array<{userId: number, socket: any}>> = {}

server.on("connection", (socket) => {
    socket.on("message", (data) => {
        try {
            const parsedData = JSON.parse(data.toString())

            if(parsedData.type === "join"){
                const boardId = parsedData.boardId
                if(!ROOMS[boardId]){
                    ROOMS[boardId] = []
                }

                const newUserId = Math.random()
                
                // Notify existing users in the room about the new user
                for(let i = 0; i < ROOMS[boardId].length; i++){
                    const user = ROOMS[boardId][i];
                    user.socket.send(JSON.stringify({
                        type: "join",
                        userId: newUserId
                    }))
                }
                
                // Add new user to the room
                ROOMS[boardId].push({userId: newUserId, socket: socket})

                // Send initial state to the new user
                socket.send(JSON.stringify({
                    type: "initial_state",
                    users: ROOMS[boardId].filter(x => x.userId !== newUserId).map(u => u.userId)
                }))
            }
        } catch (error) {
            console.error("Error processing message:", error)
        }
    })
    
    socket.on("close", () => {
        Object.entries(ROOMS).forEach(([roomId, users]) => {
            const userExists = users.find(u => u.socket === socket)
            if(userExists){
                // Remove user from the room
                ROOMS[roomId] = users.filter(x => x.socket !== socket);
                
                // Notify remaining users about the leave
                ROOMS[roomId].forEach(({socket: userSocket}) => {
                    userSocket.send(JSON.stringify({
                        type: "leave",
                        userId: userExists.userId
                    }))
                })
            }
        })
    })
    
    socket.on("error", (error) => {
        console.error("WebSocket error:", error)
    })
})