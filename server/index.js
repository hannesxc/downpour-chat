const app = require('express')()
const http = require('http').createServer(app)
const cors = require('cors')
const PORT = process.env.PORT || 5000
const io = require('socket.io')(http)
const { MongoClient, ServerApiVersion } = require('mongodb')
const { addUser, getUser, deleteUser, getUsers } = require('./users')
require('dotenv').config()

// Express middleware
app.use(cors())

// MongoDB initialization
const uri = process.env.NODE_APP_MONGODB_URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
const collection = client.db("chat-app").collection("chats")

// Listen for Socket.IO events
io.on('connection', (socket) => {

    // Handle user login
    socket.on('login', ({ name, room }, callback) => {
        const { user, error } = addUser(socket.id, name, room)
        if (error) return callback(error)
        socket.join(user.room)
        socket.in(room).emit('notification', { description: `${user.name} just entered the room.` })
        io.in(room).emit('users', getUsers(room))

        // Create a new document if room doesn't already exist, else update previous
        const addDoc = async () => {
            await collection.updateOne(
                { room: user.room }, 
                { $setOnInsert: { room: user.room }}, { upsert: true }
            )
        }
        addDoc()

        // Create a new /chats/room route to handle data/messages 
        app.get(`/chats/${user.room}`, async (req, res) => {
            const chats = await collection.find({ room: user.room }).toArray()
            res.send(chats)
        })
        callback()
    })

    // Handle any messages sent
    socket.on('sendMessage', message => {
        const user = getUser(socket.id)
        io.in(user.room).emit('message', { user: user.name, text: message })

        // Calculate local time when the message is sent
        const hours = new Date().getHours()
        var mins = new Date().getMinutes() < 10 ? "0" + new Date().getMinutes() : new Date().getMinutes()
        hours >= 12 ? mins = mins + " PM" : mins = mins + " AM"

        // Update document to include new messages
        const updateDoc = async () => {
            await collection.updateOne(
                { room: user.room }, 
                { $push: { messages: 
                    {
                        user: user.name,
                        message: message,
                        sent: hours > 12 ? (hours - 12) + ":" + mins : hours + ":" + mins
                    }
                }}
            )
        }
        updateDoc()

        // Update /chats/room route to include new messages
        app.get(`/chats/${user.room}`, async (req, res) => {
            const chats = await collection.find({ room: user.room }).toArray()
            res.send(chats)
        })
    })

    // Disconnect a user on logout
    socket.on("disconnect", () => {
        console.log("User disconnected");
        const user = deleteUser(socket.id)
        if (user) {
            io.in(user.room).emit('notification', { description: `${user.name} just left the room.` })
            io.in(user.room).emit('users', getUsers(user.room))
        }
        const remDoc = async () => {
            try {
                /*await collection.updateOne({ room: user.room }, {
                    $set: { users: getUsers(user.room).map(user => {
                        return user.name
                    }) }
                })*/
                // Delete the document if session gets terminated.
                if (getUsers(user.room).length === 0) {
                    await collection.deleteOne({ room: user.room })
                }
            } catch(err) {}
        }
        remDoc()
    })
})

app.get('/', (req, res) => {
    res.send("Server is up and running")
})

http.listen(PORT, () => {
    console.log(`Listening to ${PORT}`)
})