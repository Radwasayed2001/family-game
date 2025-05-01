

/**
* Validate a player name
* @param {string} name - The name to validate
* @param {Array} existingPlayers - Array of existing player names
* @returns {Object} Validation result with isValid flag and error message
*/
function validatePlayerName(name, existingPlayers) {
 // Check if name is empty
 if (!name || name.trim() === '') {
   return {
     isValid: false,
     error: 'الرجاء إدخال اسم اللاعب'
   };
 }
 
 // Trim the name
 const trimmedName = name.trim();
 
 // Check if name is too short
 if (trimmedName.length < 2) {
   return {
     isValid: false,
     error: 'اسم اللاعب قصير جداً'
   };
 }
 
 // Check if name already exists
 if (existingPlayers.some(player => player.toLowerCase() === trimmedName.toLowerCase())) {
   return {
     isValid: false,
     error: 'اسم اللاعب موجود بالفعل'
   };
 }
 
 // Name is valid
 return {
   isValid: true,
   error: null
 };
}

/**
* Check if a game is playable with current number of players
* @param {Object} game - The game object
* @param {number} playerCount - Current number of players
* @returns {boolean} Whether the game is playable
*/
function isGamePlayable(game, playerCount) {
 return playerCount >= game.minPlayers && playerCount <= game.maxPlayers;
}
