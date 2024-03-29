const users = []

const addUser = (id, name, room) => {
    const existingUser = users.find(user => user.name.trim().toLowerCase() === name.trim().toLowerCase())
    const re = /^\w*$/

    if (existingUser) return { error: "Username already exists!" }
    if (!name && !room) return { error: "Username and room are required" }
    if (!name) return { error: "Username is required" }
    else if (!re.test(name)) return { error: "Username can only contain alphanumeric characters." }
    if (!room) return { error: "Room is required" }
    else if (!re.test(room)) return { error: "Room can only contain alphanumeric characters." }

    const user = { id, name, room }
    users.push(user)
    return { user }
}

const getUser = (id) => {
    let user = users.find(user => user.id === id)
    return user
}

const deleteUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) return users.splice(index, 1)[0];
}

const getUsers = (room) => users.filter(user => user.room === room)

module.exports = { addUser, getUser, deleteUser, getUsers }