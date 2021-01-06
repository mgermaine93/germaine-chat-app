const users = []

// addUser (tracks new users)
const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate that data is actually there
    if (!username || !room) {
        return {
            error: 'Username name and room are both required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: `Username \"${existingUser.username}\" is already in use!  Try picking a different username.`
        }
    }

    // Store user in the users array
    const user = { id, username, room }
    users.push(user)
    return { user }
}

// removeUser (stops tracking users when they leave the chat)
const removeUser = (id) => {
    // -1 if there's no match, 0 and above for a match
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        // Remove the single item at the position found above
        return users.splice(index, 1)[0] // this returns an array
    }
}

// getUser (fetch an existing user object by id, or returns undefined)
const getUser = (id) => {
    return users.find((user) => user.id === id)
    
}

// getUsers in room (accept name and return array of users in the room, or an empty array)
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room);
}

// Exports the functions above to be used in other files
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}