// src/models/Room.js
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    createRoom(name, maxPlayers, host) {
        const code = this.generateRoomCode();
        const room = {
            code,
            name,
            host: host.id,
            players: new Map([[host.id, host]]),
            maxPlayers,
            gameStarted: false,
            scores: new Map()
        };
        this.rooms.set(code, room);
        return room;
    }

    addPlayer(roomCode, player) {
        const room = this.rooms.get(roomCode);
        if (!room || room.players.size >= room.maxPlayers) return false;
        
        room.players.set(player.id, player);
        room.scores.set(player.name, new Array(7).fill(0));
        return true;
    }

    removePlayer(roomCode, playerId) {
        const room = this.rooms.get(roomCode);
        if (room) {
            room.players.delete(playerId);
            if (room.players.size === 0) {
                this.rooms.delete(roomCode);
            } else if (room.host === playerId) {
                room.host = Array.from(room.players.values())[0].id;
            }
        }
    }

    getRoom(code) {
        return this.rooms.get(code);
    }

    getRoomByPlayerId(playerId) {
        for (const [code, room] of this.rooms.entries()) {
            if (room.players.has(playerId)) {
                return room;
            }
        }
        return null;
    }

    updateScore(roomCode, playerName, scores) {
        const room = this.rooms.get(roomCode);
        if (!room) return false;
        
        room.scores.set(playerName, scores);
        return true;
    }
}

module.exports = RoomManager;