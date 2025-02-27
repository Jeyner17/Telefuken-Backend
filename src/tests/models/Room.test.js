const RoomManager = require('../../models/Room');

describe('RoomManager', () => {
  let roomManager;

  beforeEach(() => {
    roomManager = new RoomManager();
  });

  test('should create a new room', () => {
    const host = { id: 'host1', name: 'Host' };
    const room = roomManager.createRoom('Test Room', 4, host);

    expect(room.code).toBeDefined();
    expect(room.name).toBe('Test Room');
    expect(room.host).toBe(host.id);
    expect(room.players.size).toBe(1);
    expect(room.players.get(host.id)).toEqual(host);
  });

  test('should add a player to the room', () => {
    const host = { id: 'host1', name: 'Host' };
    const room = roomManager.createRoom('Test Room', 4, host);

    const player = { id: 'player1', name: 'Player1' };
    const result = roomManager.addPlayer(room.code, player);

    expect(result).toBe(true);
    expect(room.players.size).toBe(2);
    expect(room.players.get(player.id)).toEqual(player);
  });

  test('should not add a player if room is full', () => {
    const host = { id: 'host1', name: 'Host' };
    const room = roomManager.createRoom('Test Room', 1, host); // Máximo 1 jugador

    const player = { id: 'player1', name: 'Player1' };
    const result = roomManager.addPlayer(room.code, player);

    expect(result).toBe(false);
    expect(room.players.size).toBe(1);
  });

  test('should remove a player from the room', () => {
    const host = { id: 'host1', name: 'Host' };
    const room = roomManager.createRoom('Test Room', 4, host);

    const player = { id: 'player1', name: 'Player1' };
    roomManager.addPlayer(room.code, player);

    roomManager.removePlayer(room.code, player.id);
    expect(room.players.size).toBe(1);
    expect(room.players.has(player.id)).toBe(false);
  });
});