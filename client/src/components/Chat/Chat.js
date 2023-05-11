import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MainContext } from '../../contexts/mainContext'
import { SocketContext } from '../../contexts/socketContext'
import ScrollToBottom from 'react-scroll-to-bottom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css' 
import './Chat.css'
import { BsChatRightTextFill, FiLogOut, FiDownload, RiSendPlaneFill, MdRoomPreferences } from 'react-icons/all'

const aes256 = require('aes256');
const key = process.env.REACT_APP_SECRET_KEY
const endpoint = process.env.REACT_APP_ENDPOINT

const Chat = () => {
    const { name, users, room, setName, setRoom } = useContext(MainContext)
    const socket = useContext(SocketContext)
    const [ message, setMessage ] = useState('')
    const [ typingUsers, setTypingUsers ] = useState([])
    const [ messages, setMessages ] = useState({ room: room, messages: [] })
    const [ data, setData ] = useState({})
    const pingInterval = 30 * 1000
    const navigate = useNavigate()
    const pingTimer = useRef(null)

    window.onpopstate = e => logout()

    // Checks to see if there's a user present
    useEffect(() => {
        if (!name || !room) 
            return navigate('/')
    // eslint-disable-next-line
    }, [name, room]) 

    // Socket.IO operations
    useEffect(() => {

        // Start the keep-alive timer
        pingTimer.current = setInterval(() => {
            socket.emit("ping")
            // console.log("Ping!")
        }, pingInterval)
        
        socket.on("pong", () => {
            // console.log("Server alive!")
            // Server has responded to our ping, connection is still alive!
        })
        
        // When messages are sent/received
        socket.on("message", msg => {
            const decryptedMessage = decryptMessages(msg.text)
            const actualMessage = { message: decryptedMessage, user: msg.user, sent: msg.sent }
            
            setMessages(msgs => ({ ...msgs, messages: [...msgs.messages, actualMessage] }))

            axios.get(`${endpoint}/chats/${room}`, {crossdomain: true}).then(res => {
                setData(res.data[0])
            }).catch(err => console.log(err)) 
        })

        // Append new user to typing array unless they're already present
        socket.on("typing", user => {
            setTypingUsers(prevUsers => {
                if (!prevUsers.includes(user))
                    return [...prevUsers, user]
                else
                    return prevUsers
            })
        })

        // Remove user from typing array when they've stopped
        socket.on("stopTyping", user => {
            setTypingUsers(users => users.filter(u => u !== user))
        })
        
        // Login/Logout/Download notifications
        socket.on("notification", notif => {
            toast.success(notif?.description, {
                toastId: "success",
                position: "top-center",
                autoClose: 3000,
                theme: "dark"
            })
        })

        return () => {
            // Stop the keep-alive timer if the connection is closed.
            clearInterval(pingTimer.current)
            socket.disconnect()
        }
    // eslint-disable-next-line
    }, [socket])

    // Fetch messages from backend /chats/room route
    useEffect(() => {
        axios.get(`${endpoint}/chats/${room}`, {crossdomain: true}).then(res => {
            setData(res.data[0])
        }).catch(err => console.log(err)) 
    // eslint-disable-next-line
    }, [])

    // Emit event if typing, Stop emitting typing events after 2 secs unless still typing
    useEffect(() => {
        if (message)
            socket.emit("typing", { name, room })

        const typingTimeout = setTimeout(() => {
            socket.emit("stopTyping", { name, room })
          }, 2000)
        
        // Clear the timeout if the user starts typing again
        return () => clearTimeout(typingTimeout);
    }, [message, name, room, socket])

    // Decrypts the given message
    const decryptMessages = (message) => {
        return aes256.decrypt(key, message)
    }

    // Exports messages in JSON format for downloadable chat transcripts
    const exportMessages = () => {
        console.log(messages)
        const jsonData = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(messages, undefined, 4))}`
        const link = document.createElement("a")
        link.href = jsonData
        link.download = "chats.json"
        link.click()

        // Emit this in the event someone downloads a chat transcript
        socket.emit("downloadChats", { name, room })
    }

    // Send encrypted message to backend/db
    const handleSendMessage = () => {
        const encryptedMessage = aes256.encrypt(key, message)

        // Calculate local time when the message is sent
        const hours = new Date().getHours()
        var mins = new Date().getMinutes() < 10 ? "0" + new Date().getMinutes() : new Date().getMinutes()
        hours >= 12 ? mins = mins + " PM" : mins = mins + " AM"

        const specMessage = {
            message: encryptedMessage,
            sent: hours > 12 ? (hours - 12) + ":" + mins : hours + ":" + mins
        }
        
        socket.emit('sendMessage', specMessage)
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
        <>
            <img className='image2' alt="" />
            <div className='mainChat'>
                <h1 className='big-1 chat'><BsChatRightTextFill />&emsp;Downpour Chat</h1>
                <div className='room'>
                    <div className='users'>
                        Users online: {users.length}&emsp;({users.map(user => user.name).join(", ")})
                    </div>
                    <div className='navbar'>
                        <FiDownload onClick={exportMessages} cursor='pointer' title='Download JSON Transcript'/>
                        <div className='currUser'>{name}&nbsp;<MdRoomPreferences onClick={() => {
                            navigator.clipboard.writeText(room)
                            toast.info('Copied to clipboard!', {
                                toastId: "info",
                                position: "top-center",
                                autoClose: 3000,
                                theme: "dark"
                            })
                        }} cursor='pointer' title='Room'/></div>
                        <FiLogOut onClick={logout} cursor='pointer' title='Leave Room'/>
                    </div>

                    <ScrollToBottom className='messages' debug={false} initialScrollBehavior='smooth'>
                        {data?.messages !== undefined ?
                            data.messages.map((msg, i) =>
                            (<div key={i} className={`message ${msg.user === name ? "my-message" : ""}`}>
                                <h4>{msg.user}</h4>
                                <h3>{decryptMessages(msg.message)}</h3>
                                <h5>{msg.sent}</h5>
                            </div>)
                            )
                            :
                            <div className='empty'>
                                <h2>No messages</h2>
                            </div>
                        }
                    </ScrollToBottom>
                    
                    <div className='typing'>
                        {typingUsers.length > 0 ? (
                            <span>
                                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                            </span>
                        ) : null}
                    </div>

                    <div className='send'>
                        <input type="text" placeholder='Enter Message' value={message} onChange={e => setMessage(e.target.value)} onKeyDown={(e) => {
                            if (e.key === 'Enter' && message !== '') {
                                handleSendMessage()
                            }
                        }}/>
                        <button onClick={handleSendMessage} disabled={message === '' ? true : false} title='Send'><RiSendPlaneFill size={'2em'} /></button>
                    </div>
                </div>
                <h4>Copyright &copy; <a href='https://github.com/hannesxc' target='_blank' rel='noreferrer'>Aditya Chakravorty</a>, 2023</h4>
            </div>
        </>
    )
}

export default Chat
