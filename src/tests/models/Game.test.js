const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Game = require('../../models/Game');

// Aumenta el timeout a 30 segundos para dar tiempo suficiente
jest.setTimeout(30000);

let mongoServer;

describe('Game Model', () => {
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

    test('should create a new game', async () => {
      const gameData = {
        roomCode: 'ABC123',
        maxPlayers: 4,
        host: 'HostPlayer',
      };

      const game = new Game(gameData);
      const savedGame = await game.save();

      expect(savedGame.roomCode).toBe(gameData.roomCode);
      expect(savedGame.maxPlayers).toBe(gameData.maxPlayers);
      expect(savedGame.host).toBe(gameData.host);
      expect(savedGame.isActive).toBe(true);
      
      // Asegúrate de verificar correctamente según tu modelo
      // Si tu modelo agrega automáticamente el host a la lista de jugadores
      // expect(savedGame.players).toHaveLength(1);
      // Si no lo hace (verifica tu esquema)
      // expect(savedGame.players).toHaveLength(0);
    });

    test('should not create a game without required fields', async () => {
      const game = new Game({});
      
      let error;
      try {
        await game.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeTruthy();
      expect(error.name).toBe('ValidationError');
    });
});