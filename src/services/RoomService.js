// src/services/RoomService.js
const RoomManager = require('../models/Room');

class RoomService {
    constructor() {
        this.roomManager = new RoomManager();
    }

    createRoom(name, maxPlayers, host) {
        try {
            return this.roomManager.createRoom(name, maxPlayers, host);
        } catch (error) {
            console.error('Error creating room:', error);
            return null;
        }
    }

    joinRoom(roomCode, player) {
        return this.roomManager.addPlayer(roomCode, player);
    }

    leaveRoom(roomCode, playerId) {
        this.roomManager.removePlayer(roomCode, playerId);
    }

    getRoomDetails(roomCode) {
        return this.roomManager.getRoom(roomCode);
    }

    updateScores(roomCode, playerName, scores) {
        return this.roomManager.updateScore(roomCode, playerName, scores);
    }
}

module.exports = RoomService;