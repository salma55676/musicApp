// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('results');
const loadingEl = document.getElementById('loading');
const messageEl = document.getElementById('message');
const audioPlayer = document.getElementById('audioPlayer');

// State
let currentPlayingBtn = null;

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

audioPlayer.addEventListener('ended', () => {
    if (currentPlayingBtn) {
        currentPlayingBtn.textContent = '▶ Play Preview';
        currentPlayingBtn.classList.remove('playing');
        currentPlayingBtn = null;
    }
});

// Main search function using JSONP
function handleSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showMessage('Please enter a song name to search', 'warning');
        return;
    }

    showLoading();
    hideMessage();
    clearResults();

    // Create a unique callback name
    const callbackName = 'deezerCallback_' + Date.now();
    
    // Create the callback function
    window[callbackName] = function(data) {
        hideLoading();
        
        if (data.data && data.data.length > 0) {
            displayResults(data.data);
        } else {
            showMessage(`No results found for "${query}". Try a different search term.`, 'info');
        }
        
        // Cleanup
        delete window[callbackName];
        document.body.removeChild(script);
    };

    // Create script element for JSONP request
    const script = document.createElement('script');
    script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp&callback=${callbackName}`;
    
    // Error handling
    script.onerror = function() {
        hideLoading();
        showMessage('An error occurred while searching. Please try again.', 'error');
        delete window[callbackName];
        document.body.removeChild(script);
    };
    
    document.body.appendChild(script);
}

// Display search results
function displayResults(songs) {
    resultsContainer.innerHTML = '';

    songs.forEach(song => {
        const card = createSongCard(song);
        resultsContainer.appendChild(card);
    });
}

// Create a song card element
function createSongCard(song) {
    const card = document.createElement('div');
    card.className = 'song-card';

    const albumCover = document.createElement('img');
    albumCover.className = 'album-cover';
    albumCover.src = song.album.cover_big || song.album.cover_medium;
    albumCover.alt = `${song.title} album cover`;

    const songInfo = document.createElement('div');
    songInfo.className = 'song-info';

    const title = document.createElement('div');
    title.className = 'song-title';
    title.textContent = song.title;
    title.title = song.title;

    const artist = document.createElement('div');
    artist.className = 'song-artist';
    artist.textContent = song.artist.name;
    artist.title = song.artist.name;

    const playBtn = document.createElement('button');
    playBtn.className = 'play-btn';
    playBtn.textContent = '▶ Play Preview';
    playBtn.onclick = (e) => {
        e.stopPropagation();
        togglePlay(song.preview, playBtn);
    };

    songInfo.appendChild(title);
    songInfo.appendChild(artist);
    songInfo.appendChild(playBtn);

    card.appendChild(albumCover);
    card.appendChild(songInfo);

    return card;
}

// Toggle play/pause for audio preview
function togglePlay(previewUrl, button) {
    if (!previewUrl) {
        showMessage('Preview not available for this song', 'warning');
        setTimeout(hideMessage, 3000);
        return;
    }

    // If clicking the currently playing button, pause it
    if (currentPlayingBtn === button) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        button.textContent = '▶ Play Preview';
        button.classList.remove('playing');
        currentPlayingBtn = null;
        return;
    }

    // Stop any currently playing audio
    if (currentPlayingBtn) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        currentPlayingBtn.textContent = '▶ Play Preview';
        currentPlayingBtn.classList.remove('playing');
    }

    // Play the new audio
    audioPlayer.src = previewUrl;
    audioPlayer.play();
    button.textContent = '⏸ Pause';
    button.classList.add('playing');
    currentPlayingBtn = button;
}

// UI Helper Functions
function showLoading() {
    loadingEl.classList.remove('hidden');
}

function hideLoading() {
    loadingEl.classList.add('hidden');
}

function showMessage(text, type = 'info') {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove('hidden');
}

function hideMessage() {
    messageEl.classList.add('hidden');
}

function clearResults() {
    resultsContainer.innerHTML = '';
    if (currentPlayingBtn) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        currentPlayingBtn.textContent = '▶ Play Preview';
        currentPlayingBtn.classList.remove('playing');
        currentPlayingBtn = null;
    }
}