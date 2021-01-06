// SERVER

// Load in the core "path" module
const path = require('path');

// Other modules and libraries
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

// Configure the server and get it up and running
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public');

// Serves up the public directory path
app.use(express.static(publicDirectoryPath));

// Print a message to the terminal each time a client connects
io.on('connection', (socket) => {
    console.log("New web socket connection!");

    // Have the server listen for "join"
    socket.on('join', ({ username, room }, callback) => {

        // Add the user to the users array
        const { error, user } = addUser({ id: socket.id, username, room })

        // Stops the program and lets the client know what went wrong if there's an error
        if (error) {
            return callback(error)
        }

        // Passes in the room the user is trying to join
        socket.join(user.room)

        // Welcome the user
        socket.emit('message', generateMessage("Admin", "Welcome!"));

        // Have the server emit a message to everyone BUT the new user when the new user joins
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!`));

        // Notifies everyone in the room, including the new user
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    // Have the server listen for "sendMessage"
    socket.on('sendMessage', (message, callback) => {

        // Use getUser inside "sendMessage" event handler to get user data
        const user = getUser(socket.id)

        // Initialize bad words
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Hey, language!');
        }
        // Send the message to ALL connected clients in the current room
        io.to(user.room).emit('message', generateMessage(user.username, message));
        // This send the event acknowledgment to everyone
        callback();
    })

    // Have the server listen for "sendLocation"
    socket.on('sendLocation', (coords, callback) => {

        // Use getUser inside "sendLocation" event handler to get user data
        const user = getUser(socket.id)

        // When fired, have the server emit "locationMessage" with a google URL to the user's room
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        // Sets up the server to send back the acknowledgment
        callback()
    })

    // Have the server emit a message to everyone once one user has disconnected
    // (The disconnected user won't get this because they're disconnected)
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage("Admin", `${user.username} has left the chat.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });
});

// Start up the actual server
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});