import React, { useState } from 'react'

const MainContext = React.createContext()

const MainProvider = ({ children }) => {
    const [name, setName] = useState('')
    const [room, setRoom] = useState('')
    const [users, setUsers] = useState([])

    return (
        <MainContext.Provider value={{ name, room, users, setName, setRoom, setUsers }}>
            {children}
        </MainContext.Provider>
    )
}

export { MainContext, MainProvider } 