// src/socket/handlers/roomHandler.js
const GameDBService = require('../../services/GameDBService');

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
        this.socket.on('advanceRound', this.advanceRound.bind(this));
        this.socket.on('requestPlayersList', this.handleRequestPlayersList.bind(this));
    }

    createRoom(data, callback) {
        const player = {
            id: this.socket.id,
            name: data.playerName,
            isHost: true
        };

        const room = this.roomService.createRoom(
            data.roomName,
            data.numPlayers,
            player
        );

        if (room) {
            this.socket.join(room.code);
            // Guardar en la base de datos
            GameDBService.createGame(room.code, data.playerName, data.numPlayers)
                .then(() => {
                    console.log('Partida guardada en la base de datos');
                })
                .catch(error => {
                    console.error('Error al guardar partida en DB:', error);
                });
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
                isHost: false
            };

            const joined = await this.roomService.joinRoom(data.roomCode, player);

            if (joined) {
                await this.socket.join(data.roomCode);
                // Registrar jugador en la base de datos
                await GameDBService.addPlayer(data.roomCode, data.playerName);
                const playerNames = this.roomService.getPlayersList(data.roomCode);
                this.io.to(data.roomCode).emit('playerJoined', {
                    name: data.playerName,
                });

                this.io.to(data.roomCode).emit('playersListUpdate', playerNames);

                return callback({
                    success: true,
                    players: playerNames
                });
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
            this.roomService.startGame(roomCode);
            const playerNames = this.roomService.getPlayersList(roomCode);
            this.io.to(roomCode).emit('playersListUpdate', playerNames);
            this.io.to(roomCode).emit('gameStarted');

            callback({ success: true });
        } else {
            callback({ success: false });
        }
    }

    leaveRoom(roomCode) {
        this.roomService.leaveRoom(roomCode, this.socket.id);
        this.socket.leave(roomCode);
        const playerNames = this.roomService.getPlayersList(roomCode);
        this.io.to(roomCode).emit('playerLeft', this.socket.id);
        this.io.to(roomCode).emit('playersListUpdate', playerNames);
        // Si todos los jugadores han salido, finalizar la partida
        const room = this.roomService.getRoomDetails(roomCode);
        if (!room || room.players.size === 0) {
            GameDBService.finalizeGame(roomCode)
            .then(() => {
                console.log('Partida finalizada en la base de datos');
            })
            .catch(error => {
                console.error('Error al finalizar partida en DB:', error);
            });
        }
    }

    handleDisconnect() {
        const rooms = this.roomService.getRoomsByPlayerId(this.socket.id);

        if (rooms && rooms.length > 0) {
            for (const room of rooms) {
                this.leaveRoom(room.code);
            }
        }
    }

    updateScore(data) {
        const updated = this.roomService.updateScores(
          data.roomCode,
          data.playerName,
          data.score,
          data.round
        );
      
        if (updated) {
          // Actualizar en la base de datos
          const roundNames = ['1/3', '2/3', '1/4', '2/4', '1/5', '2/5', 'Escalera'];
          const roundName = roundNames[data.round];
          
          GameDBService.updateScore(data.roomCode, data.playerName, roundName, data.score)
            .then(() => {
              console.log('Puntuación guardada en la base de datos');
            })
            .catch(error => {
              console.error('Error al guardar puntuación en DB:', error);
            });
          
          this.io.to(data.roomCode).emit('scoreUpdate', {
            playerName: data.playerName,
            round: data.round,
            score: data.score
          });
        }
      }
      

    advanceRound(data) {
        try {
            console.log('Recibido evento advanceRound:', data);
            const { roomCode, roundIndex } = data;
            const room = this.roomService.getRoomDetails(roomCode);

            if (!room) {
                console.error('Sala no encontrada:', roomCode);
                return;
            }

            room.currentRound = roundIndex;
            console.log(`Ronda cambiada a ${roundIndex} en sala ${roomCode}`);

            const roundNames = ['1/3', '2/3', '1/4', '2/4', '1/5', '2/5', 'Escalera'];
            const roundName = roundNames[data.roundIndex];
            
            GameDBService.updateRound(data.roomCode, roundName)
            .then(() => {
                console.log('Ronda actualizada en la base de datos');
            })
            .catch(error => {
                console.error('Error al actualizar ronda en DB:', error);
            });
            

            this.io.to(roomCode).emit('roundChanged', roundIndex);
        } catch (error) {
            console.error('Error al avanzar de ronda:', error);
        }
    }

    handleRequestPlayersList(data) {
        if (!data || !data.roomCode) {
            console.error('Código de sala no proporcionado');
            return;
        }

        const playerNames = this.roomService.getPlayersList(data.roomCode);

        this.socket.emit('playersListUpdate', playerNames);
        console.log(`Lista de jugadores enviada a ${this.socket.id}: ${playerNames.join(', ')}`);
    }
}

module.exports = RoomHandler;