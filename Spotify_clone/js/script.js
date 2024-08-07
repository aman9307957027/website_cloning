document.addEventListener('DOMContentLoaded', main);

async function main() {

    await fetchSongs();
    setupHamburgerMenu();
    setupSearch();
    setupNavigation();
}

async function fetchSongs() {
    try {
        const response = await fetch('/songs/NCS/');
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        const div = document.createElement('div');
        div.innerHTML = text;
        const anchors = div.getElementsByTagName('a');
        const songListUL = document.querySelector('.songList ul');
        songListUL.innerHTML = '';

        for (const anchor of anchors) {
            const href = anchor.getAttribute('href');
            if (href.endsWith('/')) {
                const folderName = href.split('/').slice(-2, -1)[0];
                const songListResponse = await fetch(`/songs/NCS/${folderName}/`);
                const songListText = await songListResponse.text();
                const songListDiv = document.createElement('div');
                songListDiv.innerHTML = songListText;
                const songAnchors = songListDiv.getElementsByTagName('a');

                for (const songAnchor of songAnchors) {
                    const songHref = songAnchor.getAttribute('href');
                    if (songHref.endsWith('.mp3')) {
                        const songName = decodeURIComponent(songHref.split('/').pop().replace('.mp3', ''));
                        const songItem = document.createElement('li');
                        songItem.innerHTML = `
                            <img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${songName}</div>
                                <div></div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                        `;
                        songItem.dataset.folderName = folderName;
                        songItem.dataset.songName = songName;
                        songItem.addEventListener('click', () => {
                            playMusic(folderName, songName);
                            displayCard(folderName, songName);
                            focusSong(songItem);
                        });
                        songListUL.appendChild(songItem);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error fetching songs:', error);
    }


}

function playMusic(folderName, songName) {
    const audioPlayer = document.getElementById('default-audio-player');
    if (audioPlayer) {
        audioPlayer.src = `/songs/NCS/${folderName}/${encodeURIComponent(songName)}.mp3`;
        audioPlayer.play();
    } else {
        console.error('Audio player not found');
    }
}

function displayCard(folderName, songName) {
    const cardContainer = document.querySelector('.card-container');

    cardContainer.innerHTML = `<div class="card">
            <div class="card-header">
                <h3 class="song-title">${songName}</h3>
                <div class="close">
                    <img width="30" class="invert" src="img/close.svg" alt="Close">
                </div>
            </div>
            <img class="card-image" src="/songs/NCS/${folderName}/${encodeURIComponent(songName)}.jpg" alt="${songName}">
            <div class="audio-player">
                <audio id="default-audio-player" controls autoplay>
                    <source src="/songs/NCS/${folderName}/${encodeURIComponent(songName)}.mp3" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </div>
        </div>
    `;

    
    const closeButton = document.querySelector('.card .close img');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            cardContainer.innerHTML = ''; 
            const audioPlayer = document.getElementById('default-audio-player');
            if (audioPlayer) {
                audioPlayer.pause(); 
            }
        });
    } else {
        console.error('Close button not found');
    }
}

function focusSong(songItem) {
    const previouslyFocused = document.querySelector('.songList ul li.focused');
    if (previouslyFocused) {
        previouslyFocused.classList.remove('focused');
    }
    songItem.classList.add('focused');
    songItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const leftMenu = document.querySelector('.left');

    if (hamburger && leftMenu) {
        hamburger.addEventListener('click', () => {
            leftMenu.classList.toggle('open');
        });

        document.addEventListener('click', (event) => {
            if (leftMenu.classList.contains('open') &&
                !leftMenu.contains(event.target) &&
                !hamburger.contains(event.target)) {
                leftMenu.classList.remove('open');
            }
        });
    } else {
        console.error('Hamburger or left menu not found');
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.toLowerCase();
        searchResults.innerHTML = '';

        if (query.trim()) {
            try {
                
                const response = await fetch('/songs/NCS/');
                if (!response.ok) throw new Error('Network response was not ok');
                const text = await response.text();
                const div = document.createElement('div');
                div.innerHTML = text;
                const anchors = div.getElementsByTagName('a');

                for (const anchor of anchors) {
                    const href = anchor.getAttribute('href');
                    if (href.endsWith('/')) {
                        const folderName = href.split('/').slice(-2, -1)[0];
                        const songListResponse = await fetch(`/songs/NCS/${folderName}/`);
                        const songListText = await songListResponse.text();
                        const songListDiv = document.createElement('div');
                        songListDiv.innerHTML = songListText;
                        const songAnchors = songListDiv.getElementsByTagName('a');

                        for (const songAnchor of songAnchors) {
                            const songHref = songAnchor.getAttribute('href');
                            if (songHref.endsWith('.mp3')) {
                                const songName = decodeURIComponent(songHref.split('/').pop().replace('.mp3', ''));
                                if (songName.toLowerCase().includes(query)) {
                                    const searchResultItem = document.createElement('li');
                                    searchResultItem.textContent = songName;
                                    searchResultItem.addEventListener('click', () => {
                                        playMusic(folderName, songName);
                                        displayCard(folderName, songName);
                                    });
                                    searchResults.appendChild(searchResultItem);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error searching songs:', error);
            }
        }
    });
}

function setupNavigation() {
    const homeButton = document.querySelector('.left ul li img[src="img/home.svg"]');
    const searchButton = document.querySelector('.left ul li img[src="img/search.svg"]');


    const searchInput = document.getElementById('search-input');

    if (homeButton) {
        homeButton.style.cursor = 'pointer';
        homeButton.addEventListener('click', () => {
            location.reload();  
        });
    }


    if (searchButton) {
        searchButton.style.cursor = 'pointer';
        searchButton.addEventListener('click', () => {
            searchInput.focus(); 
        });
    }
}
