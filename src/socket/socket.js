// src/socket/socket.js
const { Server } = require('socket.io');
const RoomHandler = require('./handlers/roomHandler');
const RoomService = require('../services/RoomService');

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:4200",
            methods: ["GET", "POST"]
        }
    });

    const roomService = new RoomService();

    io.on('connection', (socket) => {
        console.log('Cliente conectado:', socket.id);
        
        const roomHandler = new RoomHandler(socket, io, roomService);
        roomHandler.handleConnection();

        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        });
    });

    return io;
}

module.exports = { initializeSocket };