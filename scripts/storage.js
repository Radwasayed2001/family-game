
function savePlayers(players) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  } catch (error) {
    console.error('Failed to save players to localStorage:', error);
  }
}

/**
 * Load players array from localStorage
 * @returns {Array} Array of player names or empty array if not found
 */
function loadPlayers() {
  try {
    const playersJSON = localStorage.getItem(STORAGE_KEY);
    return playersJSON ? JSON.parse(playersJSON) : [];
  } catch (error) {
    console.error('Failed to load players from localStorage:', error);
    return [];
  }
}

/**
 * Clear players data from localStorage
 */
function clearPlayers() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear players from localStorage:', error);
  }
}

