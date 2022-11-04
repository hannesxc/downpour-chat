import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainContext } from '../../contexts/mainContext'
import { SocketContext } from '../../contexts/socketContext'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'; 
import './Login.css'
import { BsFillArrowRightCircleFill } from 'react-icons/bs'
import { AiFillCopy } from 'react-icons/ai'

var randomize = require('randomatic')

const Login = () => {
    const socket = useContext(SocketContext)
    const { name, setName, room, setRoom, setUsers } = useContext(MainContext)
    const navigate = useNavigate()

    //Checks to see if there's a user already present
    useEffect(() => {
        socket.on("users", users => {
            setUsers(users)
        })
    })

    //Random 16 digit alphanumeric code
    const handleCopyRoom = () => {
        const rand = randomize('Aa0', 16)
        setRoom(rand)
        console.log(rand)
        navigator.clipboard.writeText(rand)
        toast.success("Copied to clipboard!",{
            toastId: 'success',
            position: 'top-center',
            autoClose: 3000,
            theme: 'dark'
        })
    }

    //Random username
    const handleUsername = () => {
        const rand = 'Anonymous' + randomize('0', 3)
        setName(rand)
    }

    //Emits the login event and if successful redirects to chat and saves user data
    const handleClick = () => {
        socket.emit('login', { name, room }, error => {
            if (error) {
                console.log(error)
                return toast.error(error, {
                    position: "top-center",
                    autoClose: 3000,
                    theme: "dark"
                })
            }
            navigate('/chat')
            return toast.info("Welcome!", {
                position: "top-center",
                autoClose: 3000,
                theme: "dark"
            })
        })
    }

    return (
        <div className='login'>
            <h1>Downpour Chat</h1>
            <div className="form">
                <label>
                    <h3>Username</h3>
                    <input type="text" placeholder='User Name' value={name} onChange={e => setName(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter') 
                            handleClick()
                    }} />
                    <p onClick={handleUsername}><AiFillCopy />Generate random name</p>
                </label>
                <label>
                    <h3>Room Name</h3>
                    <input type="text" placeholder='Room Name' value={room} onChange={e => setRoom(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter') 
                            handleClick()
                    }} />
                    <p onClick={handleCopyRoom}><AiFillCopy />Generate random code</p>
                </label>
                <BsFillArrowRightCircleFill className='icon' size={'3.5em'} onClick={handleClick}/>
            </div>
        </div>
    )
}

export default Login
