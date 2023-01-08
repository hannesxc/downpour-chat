import React, { useContext, useEffect, useState } from 'react'
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

const Chat = () => {
    const { name, users, room, setName, setRoom } = useContext(MainContext)
    const socket = useContext(SocketContext)
    const [ message, setMessage ] = useState('')
    // eslint-disable-next-line
    const [ messages, setMessages ] = useState([])
    const [ data, setData ] = useState({})
    const navigate = useNavigate()

    window.onpopstate = e => logout()

    // Checks to see if there's a user present
    useEffect(() => {
        if (!name || !room) 
            return navigate('/')
    // eslint-disable-next-line
    }, [name, room]) 

    // Socket.IO operations
    useEffect(() => {
        // When messages are sent/received
        socket.on("message", msg => {
            const decryptedMessage = decryptMessages(msg.text)
            const actualMessage = {text: decryptedMessage, user: msg.user, sent: msg.sent}
            setMessages(messages => [...messages, actualMessage])
            axios.get(`https://downpourchatserver.onrender.com/chats/${room}`, {crossdomain: true}).then(res => {
                setData(res.data[0])
            }).catch(err => console.log(err)) 
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
    // eslint-disable-next-line
    }, [socket])

    // Fetch messages from backend /chats/room route
    useEffect(() => {
        axios.get(`https://downpourchatserver.onrender.com/chats/${room}`, {crossdomain: true}).then(res => {
            setData(res.data[0])
        }).catch(err => console.log(err)) 
    // eslint-disable-next-line
    }, [])

    // Decrypts the given message
    const decryptMessages = (message) => {
        try {
            return aes256.decrypt(key, message)
        } catch(err) {}
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

        // Calculate local time when the message is sent
        const hours = new Date().getHours()
        var mins = new Date().getMinutes() < 10 ? "0" + new Date().getMinutes() : new Date().getMinutes()
        hours >= 12 ? mins = mins + " PM" : mins = mins + " AM"

        const specMessage = {
            message: encryptedMessage,
            sent: hours > 12 ? (hours - 12) + ":" + mins : hours + ":" + mins
        }
        
        socket.emit('sendMessage', specMessage, () => setMessage(''))
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
        <div className='mainChat'>
            <h1 className='big-1 chat'><BsChatRightTextFill />&emsp;Downpour Chat</h1>
            <div className='room'>
                <div className='users'>
                    Users online: { users.length }&emsp; 
                    ({users && users.map(user => {
                        return (
                            <React.Fragment key={user.id}>
                                {user.name} ---&ensp;
                            </React.Fragment>
                        )
                    })})
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
                    {data.messages !== undefined ?
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
                
                <div className='send'>
                    <input type="text" placeholder='Enter Message' value={message} onChange={e => setMessage(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter' && message !== '') {
                            handleSendMessage()
                        }
                    }}/>
                    <button onClick={handleSendMessage} disabled={message === '' ? true : false} title='Send'><RiSendPlaneFill size={'2em'} color='lightgray'/></button>
                </div>
            </div>
            <h4>Copyright &copy; <a href='https://github.com/hannesxc' target='_blank' rel='noreferrer'>Aditya Chakravorty</a>, 2023</h4>
        </div>
    )
}

export default Chat
