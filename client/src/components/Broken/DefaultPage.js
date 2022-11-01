import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AiFillStop } from 'react-icons/ai'
import '../../App.css'

export default function DefaultPage() {
    const navigate = useNavigate()
    const redirect = () => navigate('/')
    return (
        <div className='broken'>
            <AiFillStop onClick={redirect} cursor='pointer' size={'15em'}/>
            Uh oh! You've stumbled upon a page you don't have access to!
        </div>
    )
}
