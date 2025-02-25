// src/models/Game.js
const mongoose = require('mongoose');

const playerScoreSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
  },
  scores: {
    type: Map,
    of: Number,
    default: new Map()
  },
  total: {
    type: Number,
    default: 0
  }
});

const gameSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  finalizedAt: {
    type: Date
  },
  maxPlayers: {
    type: Number,
    required: true
  },
  host: {
    type: String,
    required: true
  },
  currentRound: {
    type: String,
    default: '1/3'
  },
  players: [playerScoreSchema],
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Game', gameSchema);
