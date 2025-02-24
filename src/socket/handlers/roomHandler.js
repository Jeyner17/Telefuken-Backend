// src/socket/handlers/roomHandler.js
class RoomHandler {
    constructor(socket, io, roomService) {
        this.socket = socket;
        this.io = io;
        this.roomService = roomService;
    }

    handleConnection() {
        this.socket.on('createRoom', this.createRoom.bind(this));
        this.socket.on('joinRoom', this.joinRoom.bind(this));
        this.socket.on('leaveRoom', this.leaveRoom.bind(this));
        this.socket.on('disconnect', this.handleDisconnect.bind(this));
        this.socket.on('updateScore', this.updateScore.bind(this));
        this.socket.on('startGame', this.startGame.bind(this));
    }

    createRoom(data, callback) {
        const player = {
            id: this.socket.id,
            name: data.playerName,
            avatar: data.avatar,
            isHost: true
        };

        const room = this.roomService.createRoom(
            data.roomName,
            data.numPlayers,
            player
        );

        if (room) {
            this.socket.join(room.code);
            callback({ code: room.code });
        } else {
            callback({ error: 'No se pudo crear la sala' });
        }
    }

    async joinRoom(data, callback) {
        try {
            const room = this.roomService.getRoomDetails(data.roomCode);

            if (!room) {
                return callback({ success: false, message: 'Sala no encontrada' });
            }

            const player = {
                id: this.socket.id,
                name: data.playerName,
                avatar: data.avatar,
                isHost: false
            };

            const joined = await this.roomService.joinRoom(data.roomCode, player);

            if (joined) {
                await this.socket.join(data.roomCode);
                this.io.to(data.roomCode).emit('playerJoined', {
                    name: data.playerName,
                    avatar: data.avatar
                });
                return callback({ success: true });
            } else {
                return callback({ success: false, message: 'Sala llena' });
            }
        } catch (error) {
            console.error('Error en joinRoom:', error);
            return callback({ success: false, message: 'Error al unirse a la sala' });
        }
    }

    startGame(data, callback) {
        const { roomCode } = data;
        const room = this.roomService.getRoomDetails(roomCode);

        if (room && room.host === this.socket.id) {
            room.gameStarted = true;
            room.currentRound = 0;
            this.io.to(roomCode).emit('gameStarted');
            callback({ success: true });
        } else {
            callback({ success: false });
        }
    }




    
    leaveRoom(roomCode) {
        this.roomService.leaveRoom(roomCode, this.socket.id);
        this.socket.leave(roomCode);
        this.io.to(roomCode).emit('playerLeft', this.socket.id);
    }

    handleDisconnect() {
        const room = this.roomService.getRoomDetails(this.socket.id);
        if (room) {
            this.leaveRoom(room.code);
        }
    }

    updateScore(data) {
        const updated = this.roomService.updateScores(
            data.roomCode,
            data.playerName,
            data.scores
        );

        if (updated) {
            this.io.to(data.roomCode).emit('scoreUpdate', {
                playerName: data.playerName,
                scores: data.scores
            });
        }
    }
}

module.exports = RoomHandler;