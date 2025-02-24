// src/server.js
const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const { initializeSocket } = require('./socket/socket');
const config = require('./config/config');

const app = express();
app.use(cors(config.cors));

const server = createServer(app);
const io = initializeSocket(server);

server.listen(config.port, () => {
    console.log(`Servidor corriendo en puerto ${config.port}`);
});