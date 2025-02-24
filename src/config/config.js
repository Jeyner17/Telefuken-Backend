// src/config/config.js
require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:4200",
        methods: ["GET", "POST"]
    }
};

module.exports = config;