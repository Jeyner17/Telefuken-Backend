const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const GameDBService = require('../../services/GameDBService');
const Game = require('../../models/Game');

// Aumenta el timeout a 30 segundos
jest.setTimeout(30000);

let mongoServer;

describe('GameDBService', () => {
  beforeAll(async () => {
    // Crear servidor MongoDB en memoria
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();

    // Conectar a la base de datos en memoria
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Desconectar y detener el servidor
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // Limpiar la colección después de cada prueba
  afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      await Game.deleteMany({});
    }
  });

  test('should create a new game in the database', async () => {
    const roomCode = 'TEST123';
    const host = 'HostPlayer';
    const maxPlayers = 4;

    const game = await GameDBService.createGame(roomCode, host, maxPlayers);

    expect(game.roomCode).toBe(roomCode);
    expect(game.host).toBe(host);
    expect(game.maxPlayers).toBe(maxPlayers);
    expect(game.players).toHaveLength(1);
  });

  test('should add a player to the game', async () => {
    const roomCode = 'TEST123';
    const host = 'HostPlayer';
    const maxPlayers = 4;

    await GameDBService.createGame(roomCode, host, maxPlayers);
    const updatedGame = await GameDBService.addPlayer(roomCode, 'Player1');

    expect(updatedGame.players).toHaveLength(2);
    expect(updatedGame.players.some(p => p.playerName === 'Player1')).toBe(true);
  });

  test('should update player score', async () => {
    const roomCode = 'TEST123';
    const host = 'HostPlayer';
    const maxPlayers = 4;

    await GameDBService.createGame(roomCode, host, maxPlayers);
    await GameDBService.addPlayer(roomCode, 'Player1');

    const updatedGame = await GameDBService.updateScore(roomCode, 'Player1', 'round1', 100);

    const player = updatedGame.players.find(p => p.playerName === 'Player1');
    expect(player.scores.get('round1')).toBe(100);
    expect(player.total).toBe(100);
  });
});