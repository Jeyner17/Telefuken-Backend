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

    updateScores(roomCode, playerName, score, round) {
        return this.roomManager.updateScore(roomCode, playerName, score, round);
    }

    getPlayersList(roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return [];

        return Array.from(room.players.values()).map(player => player.name);
    }

    setCurrentRound(roomCode, roundIndex) {
        const room = this.roomManager.getRoom(roomCode);
        if (room) {
            room.currentRound = roundIndex;
            return true;
        }
        return false;
    }

    getCurrentRound(roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        return room ? room.currentRound : 0;
    }

    startGame(roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        if (room) {
            room.gameStarted = true;
            room.currentRound = 0;
            return true;
        }
        return false;
    }

    checkRoom(roomCode) {
        return !!this.roomManager.getRoom(roomCode);
    }

    getRoomsByPlayerId(playerId) {
        return this.roomManager.getRoomsByPlayerId(playerId);
    }
}

module.exports = RoomService;