// src/services/GameDBService.js
const Game = require('../models/Game');

class GameDBService {
  // Crear una nueva partida
  async createGame(roomCode, host, maxPlayers) {
    try {
      const newGame = new Game({
        roomCode,
        host,
        maxPlayers,
        players: [{
          playerName: host,
          scores: {},
          total: 0
        }]
      });
      
      await newGame.save();
      console.log(`Partida creada en la base de datos: ${roomCode}`);
      return newGame;
    } catch (error) {
      console.error('Error al crear partida en la base de datos:', error);
      throw error;
    }
  }

  // Añadir un jugador a la partida
  async addPlayer(roomCode, playerName) {
    try {
      const game = await Game.findOne({ roomCode });
      if (!game) {
        throw new Error(`Partida no encontrada: ${roomCode}`);
      }

      // Verificar si el jugador ya existe
      const playerExists = game.players.some(p => p.playerName === playerName);
      
      if (!playerExists) {
        game.players.push({
          playerName,
          scores: {},
          total: 0
        });
        
        await game.save();
        console.log(`Jugador ${playerName} añadido a la partida ${roomCode}`);
      }
      
      return game;
    } catch (error) {
      console.error('Error al añadir jugador:', error);
      throw error;
    }
  }

  // Actualizar puntuación
  async updateScore(roomCode, playerName, round, score) {
    try {
      const game = await Game.findOne({ roomCode });
      if (!game) {
        throw new Error(`Partida no encontrada: ${roomCode}`);
      }

      // Encontrar el jugador
      const player = game.players.find(p => p.playerName === playerName);
      if (!player) {
        throw new Error(`Jugador no encontrado: ${playerName}`);
      }

      // Actualizar la puntuación
      player.scores.set(round, score);
      
      // Recalcular el total
      let total = 0;
      player.scores.forEach(value => {
        total += value;
      });
      player.total = total;
      
      await game.save();
      console.log(`Puntuación actualizada para ${playerName} en la ronda ${round}: ${score}`);
      return game;
    } catch (error) {
      console.error('Error al actualizar puntuación:', error);
      throw error;
    }
  }

  // Actualizar ronda actual
  async updateRound(roomCode, round) {
    try {
      const game = await Game.findOneAndUpdate(
        { roomCode },
        { currentRound: round },
        { new: true }
      );
      
      if (!game) {
        throw new Error(`Partida no encontrada: ${roomCode}`);
      }
      
      console.log(`Ronda actualizada para partida ${roomCode}: ${round}`);
      return game;
    } catch (error) {
      console.error('Error al actualizar ronda:', error);
      throw error;
    }
  }

  // Finalizar partida
  async finalizeGame(roomCode) {
    try {
      const game = await Game.findOneAndUpdate(
        { roomCode },
        { 
          isActive: false,
          finalizedAt: new Date()
        },
        { new: true }
      );
      
      if (!game) {
        throw new Error(`Partida no encontrada: ${roomCode}`);
      }
      
      console.log(`Partida ${roomCode} finalizada`);
      return game;
    } catch (error) {
      console.error('Error al finalizar partida:', error);
      throw error;
    }
  }

  // Obtener partida por código
  async getGameByCode(roomCode) {
    try {
      const game = await Game.findOne({ roomCode });
      return game;
    } catch (error) {
      console.error('Error al obtener partida:', error);
      throw error;
    }
  }
}

module.exports = new GameDBService();