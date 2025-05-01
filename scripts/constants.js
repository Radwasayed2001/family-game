// ==================== constants.js ====================
/**
 * Constants and configuration for the games application
 */

// Game data with player requirements
const GAMES = [
  {
    id: 'mafia',
    name: 'المافيا',
    minPlayers: 5,
    maxPlayers: 12,
    description: ''
  },
  {
    id: 'outOfTopic',
    name: 'خارج الموضوع',
    minPlayers: 3,
    maxPlayers: 12,
    description: ''
    },
  {
    id: 'phoneOnHead',
    name: 'الجوال على الرأس',
    minPlayers: 3,
    maxPlayers: 12,
    description: ''
    },
  {
    id: 'whoAmongUs',
    name: 'مين فينا؟',
    minPlayers: 3,
    maxPlayers: 12,
    description: ''
  },
  {
    id: 'similarPictures',
    name: 'الصور المتشابهة',
    minPlayers: 3,
    maxPlayers: 12,
    description: ''
  },
  {
    id: 'boxes',
    name: 'الصناديق',
    minPlayers: 3,
    maxPlayers: 12,
    description: ''
  },
  {
    id: 'fastest',
    name: 'الأسرع',
    minPlayers: 3,
    maxPlayers: 12,
    description: ''
  },
  {
    id: 'balance',
    name: 'التوازن',
    minPlayers: 3,
    maxPlayers: 12,
    description: ''
  },
  {
    id: 'noSpeech',
    name: 'بدون كلام',
    minPlayers: 4,
    maxPlayers: 12,
    description: ''
  },
  {
    id: 'ghomza',
    name: 'غمزة',
    minPlayers: 5,
    maxPlayers: 12,
    description: ''
  },
  {
    id: 'jassos',
    name: 'الجاسوس',
    minPlayers: 5,
    maxPlayers: 8,
    description: ''
  },
];

// LocalStorage key for players
const STORAGE_KEY = 'players';

// Minimum players required to start
const MIN_PLAYERS_TO_START = 3;

// Maximum players allowed
const MAX_PLAYERS = 12;