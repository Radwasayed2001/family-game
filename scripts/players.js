// scripts/players.js

// const STORAGE_KEY = 'myGamePlayers';
// scripts/playerList.js
// Dependencies: STORAGE_KEY (your localStorage key), loadPlayers(), showScreen(id) if needed

document.addEventListener('DOMContentLoaded', () => {
    let players = loadPlayers();
    const playerListElement = document.getElementById('playerList');
  
    renderPlayerList(players);
  
    function savePlayers() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    }
  
    function renderPlayerList(list) {
      playerListElement.innerHTML = '';
    
      list.forEach((player, index) => {
        const li = document.createElement('li');
        li.classList.add('player-item');
        li.setAttribute('draggable', 'true');
        li.dataset.index = index;
    
        const nameSpan = document.createElement('span');
        nameSpan.textContent = player;
    
        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-player');
        removeButton.textContent = '×';
        removeButton.dataset.index = index; // ✅ هنا
    
        removeButton.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.index, 10); // ✅ استخدم قيمة حديثة
          players.splice(idx, 1);
          savePlayers();
          renderPlayerList(players);
        });
    
        li.appendChild(nameSpan);
        li.appendChild(removeButton);
        playerListElement.appendChild(li);
    
        // --- Drag & Drop handlers ---
        li.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', index);
          li.classList.add('dragging');
        });
    
        li.addEventListener('dragover', e => {
          e.preventDefault();
          li.classList.add('drag-over');
        });
    
        li.addEventListener('dragleave', () => {
          li.classList.remove('drag-over');
        });
    
        li.addEventListener('drop', e => {
          e.preventDefault();
          const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
          const toIndex = index;
          li.classList.remove('drag-over');
          document.querySelectorAll('.player-item.dragging')
            .forEach(el => el.classList.remove('dragging'));
    
          const [moved] = players.splice(fromIndex, 1);
          players.splice(toIndex, 0, moved);
    
          savePlayers();
          location.reload();
        });
    
        li.addEventListener('dragend', () => {
          li.classList.remove('dragging');
        });
      });
    
      updatePlayerCount(list.length);
    }
    
    function loadPlayers() {
      try {
        const json = localStorage.getItem(STORAGE_KEY);
        return json ? JSON.parse(json) : [];
      } catch (err) {
        console.error('Failed to load players:', err);
        return [];
      }
    }
  
    function updatePlayerCount(count) {
      // Update your UI element showing player count
      document.getElementById('playerCount').textContent = count;
      // <-- removed location.reload() from here
    }
  });
  
