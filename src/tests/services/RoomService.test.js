const RoomService = require('../../services/RoomService');

describe('RoomService', () => {
  let roomService;

  beforeEach(() => {
    roomService = new RoomService();
  });

  test('should create a new room', () => {
    const host = { id: 'host1', name: 'Host' };
    const room = roomService.createRoom('Test Room', 4, host);

    expect(room.code).toBeDefined();
    expect(room.name).toBe('Test Room');
    expect(room.host).toBe(host.id);
  });

  test('should join a player to the room', () => {
    const host = { id: 'host1', name: 'Host' };
    const room = roomService.createRoom('Test Room', 4, host);

    const player = { id: 'player1', name: 'Player1' };
    const result = roomService.joinRoom(room.code, player);

    expect(result).toBe(true);
    const roomDetails = roomService.getRoomDetails(room.code);
    expect(roomDetails.players.size).toBe(2);
  });

  test('should not join a player if room is full', () => {
    const host = { id: 'host1', name: 'Host' };
    const room = roomService.createRoom('Test Room', 1, host); // Máximo 1 jugador

    const player = { id: 'player1', name: 'Player1' };
    const result = roomService.joinRoom(room.code, player);

    expect(result).toBe(false);
  });
});