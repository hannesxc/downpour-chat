import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MainContext } from '../../contexts/mainContext'
import { SocketContext } from '../../contexts/socketContext'
import ScrollToBottom from 'react-scroll-to-bottom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css' 
import './Chat.css'
import { FiLogOut } from 'react-icons/fi'
import { RiSendPlaneFill } from 'react-icons/ri'

const aes256 = require('aes256');
const key = process.env.REACT_APP_SECRET_KEY

const Chat = () => {
    const { name, users, room, setName, setRoom } = useContext(MainContext)
    const socket = useContext(SocketContext)
    const [ message, setMessage ] = useState('')
    const [ messages, setMessages ] = useState([])
    const [ data, setData ] = useState({})
    const navigate = useNavigate()

    window.onpopstate = e => logout()

    // Checks to see if there's a user present
    useEffect(() => {
        if (!name) 
            return navigate('/')
    }, [navigate, name])

    // Socket.IO operations
    useEffect(() => {
        // When messages are sent/received
        socket.on("message", msg => {
            const decryptedMessage = decryptMessages(msg.text)
            const actualMessage = {text: decryptedMessage, user: msg.user}
            setMessages(messages => [...messages, actualMessage])
        })
        
        // Login/Logout notifications
        socket.on("notification", notif => {
            toast.success(notif?.description, {
                toastId: "success",
                position: "top-center",
                autoClose: 3000,
                theme: "dark"
            })
        })
    }, [socket])

    // Fetch messages from backend /chats/room route
    axios.get(`https://downpourchatserver.onrender.com/chats/${room}`, {crossdomain: true}).then(res => {
        setData(res.data[0])
    }).catch(err => console.log(err)) 

    // Decrypts the given message
    const decryptMessages = (message) => {
        return aes256.decrypt(key, message)
    }

    // Exports messages in JSON format for downloadable chat transcripts
    const exportMessages = () => {
        console.log(data)
        try {
            data.messages.forEach(msg => {
                const decryptedMsg = decryptMessages(msg.message)
                msg.message = decryptedMsg
            })
            const jsonData = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data, undefined, 4))}`
            const link = document.createElement("a")
            link.href = jsonData
            link.download = "chats.json"
            link.click()
        } catch(err) { console.log(err) }
    }

    // Send encrypted message to backend/db
    const handleSendMessage = () => {
        const encryptedMessage = aes256.encrypt(key, message)
        socket.emit('sendMessage', encryptedMessage, () => setMessage(''))
        setMessage('')
    }

    // Logs out the current user and refreshes their page
    const logout = () => {
        setName('')
        setRoom('')
        navigate('/')
        navigate(0)
    }

    return (
        <div className='room'>
            <div className='heading'>
                <div>
                    {users && users.map(user => {
                        return (
                            <div key={user.id}>
                                <div>{user.name}</div>
                            </div>
                        )
                    })}
                </div>
                <div>
                    <div>{room}</div>
                    <div>{name}</div>
                    <button onClick={exportMessages}>Download Transcript</button>
                </div>
                <FiLogOut onClick={logout} cursor='pointer'/>
            </div>

            <ScrollToBottom className='messages' debug={false} initialScrollBehavior='smooth'>
                {'messages' in data && messages.length > 0 ?
                    data.messages.map((msg, i) =>
                    (<div key={i} className={`message ${msg.user === name ? "my-message" : ""}`}>
                        <h4>{msg.user}</h4>
                        <h3>{decryptMessages(msg.message)}</h3>
                        <h5>{msg.sent}</h5>
                    </div>)
                    )
                    :
                    <div>
                        <h2>No messages</h2>
                    </div>
                }
            </ScrollToBottom>
            
            <div className='send'>
                <input type="text" placeholder='Enter Message' value={message} onChange={e => setMessage(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter' && message !== '') {
                        handleSendMessage()
                    }
                }}/>
                <button onClick={handleSendMessage} disabled={message === '' ? true : false}><RiSendPlaneFill size={'2em'}/></button>
            </div>
        </div>
    )
}

export default Chat
