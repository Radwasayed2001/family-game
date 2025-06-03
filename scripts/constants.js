// ==================== constants.js ====================
/**
 * Constants and configuration for the games application
 */

// Game data with player requirements
const GAMES = [
  {
    id: 'balance',
    name: 'التوازن',
    minPlayers: 1,
    maxPlayers: 12,
    description: ''
  },
  {
    id: 'similarPictures',
    name: 'الصور المتشابهة',
    minPlayers: 1,
    maxPlayers: 12,
    description: ''
  },
  {
    id: 'phoneOnHead',
    name: 'جوالك على راسك',
    minPlayers: 2,
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
      id: 'boxes',
      name: 'الصناديق',
      minPlayers: 3,
      maxPlayers: 12,
      description: ''
    },
    {
      id: 'treasure',
      name: 'الكنز',
      minPlayers: 3,
      maxPlayers: 12,
      description: ''
    },
  {
    id: 'outOfTopic',
    name: 'برا السالفة',
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
    id: 'noSpeech',
    name: 'بدون كلام',
    minPlayers: 4,
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
  {
    id: 'ghomza',
    name: 'الدخيل',
    minPlayers: 5,
    maxPlayers: 12,
    description: ''
  },
  {
    id: 'mafia',
    name: 'المافيا',
    minPlayers: 6,
    maxPlayers: 12,
    description: ''
  },
];

// LocalStorage key for players
const STORAGE_KEY = 'players';

// Minimum players required to start
const MIN_PLAYERS_TO_START = 1;

// Maximum players allowed
const MAX_PLAYERS = 12;
