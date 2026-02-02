// Boot sequence
setTimeout(() => {
    document.getElementById('boot-screen').classList.add('hidden');
    setTimeout(() => {
        document.getElementById('desktop').classList.add('active');
        // Automatically open the Chrome window after boot
        setTimeout(() => {
            openWindow('chrome');
        }, 300);
    }, 500);
}, 3200);

// Window management
let draggedWindow = null;
let offsetX = 0;
let offsetY = 0;

function openWindow(id) {
    const win = document.getElementById(id);
    win.classList.add('active');
    bringToFront(win);
    if (id === 'resume' || id === 'chrome' || id === 'Music') {
        centerWindow(win);
    }
}

function centerWindow(win) {
    // Subtract 40px from the height for the taskbar at the bottom
    const viewportHeight = window.innerHeight - 40;
    const viewportWidth = window.innerWidth;

    // Get the window's current dimensions (must be set via CSS or inline style)
    const winWidth = win.offsetWidth;
    const winHeight = win.offsetHeight;

    // Calculate center coordinates
    let left = (viewportWidth - winWidth) / 2;
    let top = (viewportHeight - winHeight) / 2;

    // Ensure it doesn't go off-screen (though centering should prevent this)
    left = Math.max(0, left);
    top = Math.max(0, top);

    win.style.left = left + 'px';
    win.style.top = top + 'px';
}

function closeWindow(id) {
    document.getElementById(id).classList.remove('active');
}

function bringToFront(win) {
    const windows = document.querySelectorAll('.window');
    windows.forEach(w => w.style.zIndex = 100);
    win.style.zIndex = 200;
}

function dragStart(e, id) {
    draggedWindow = document.getElementById(id);
    bringToFront(draggedWindow);
    const rect = draggedWindow.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
}

function drag(e) {
    if (!draggedWindow) return;

    let left = e.clientX - offsetX;
    let top = e.clientY - offsetY;

    left = Math.max(0, Math.min(left, window.innerWidth - draggedWindow.offsetWidth));
    top = Math.max(0, Math.min(top, window.innerHeight - 40 - draggedWindow.offsetHeight));

    draggedWindow.style.left = left + 'px';
    draggedWindow.style.top = top + 'px';
}

function dragEnd() {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);
    draggedWindow = null;
}

// Clock
function updateClock() {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
}

setInterval(updateClock, 1000);
updateClock();

// Click windows to bring to front
document.querySelectorAll('.window').forEach(win => {
    win.addEventListener('mousedown', () => bringToFront(win));
});

// Start Menu functions
function toggleStartMenu() {
    const menu = document.getElementById('startMenu');
    menu.classList.toggle('active');
}

function openAllWindows() {
    ['about', 'tech', 'skills', 'projects', 'resume'].forEach((id, index) => {
        setTimeout(() => {
            const win = document.getElementById(id);
            openWindow(id);
            // Center Resume, position others
            if (id === 'resume') {
                centerWindow(win);
            } else {
                win.style.left = (50 + index * 30) + 'px';
                win.style.top = (50 + index * 30) + 'px';
            }
        }, index * 100);
    });
    toggleStartMenu();
}

// Close start menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('startMenu');
    const startBtn = document.querySelector('.start-btn');
    if (menu.classList.contains('active') &&
        !menu.contains(e.target) &&
        !startBtn.contains(e.target)) {
        menu.classList.remove('active');
    }
});

// Resume functions
function downloadResume() {
    const link = document.createElement('a');
    link.href = 'public/DeJesus_Resume.pdf';
    link.download = 'DeJesus_Resume.pdf';
    link.click();
}

function viewFullscreen() {
    const iframe = document.getElementById('resumePreview');
    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
    }
}

function scrollTo2000sSection(id) {
    const scrollContainer = document.querySelector('.website-2000s');
    const targetElement = document.getElementById(id);
    if (scrollContainer && targetElement) {
        const targetPosition = targetElement.offsetTop - scrollContainer.offsetTop;
        scrollContainer.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    } else {
        console.warn(`Could not scroll: Target element #${id} or .website-2000s container not found.`);
    }
}

// ============================================
// Windows Media Player Functions
// ============================================

let wmpAudio = null;
let wmpIsPlaying = false;
let wmpCurrentTrackIndex = -1;
let wmpTracks = [];

// Initialize WMP when page loads
document.addEventListener('DOMContentLoaded', function () {
    wmpAudio = document.getElementById('wmpAudio');
    if (wmpAudio) {
        wmpAudio.volume = 0.5;

        // Get all playlist items
        const playlistItems = document.querySelectorAll('.wmp-playlist-item');
        playlistItems.forEach((item, index) => {
            wmpTracks.push({
                src: item.dataset.src,
                name: item.querySelector('.wmp-track-name').textContent,
                duration: item.querySelector('.wmp-track-duration').textContent
            });
        });

        // Audio event listeners
        wmpAudio.addEventListener('timeupdate', updateTimeDisplay);
        wmpAudio.addEventListener('ended', nextTrack);
        wmpAudio.addEventListener('loadedmetadata', updateTotalTime);
        wmpAudio.addEventListener('play', onPlay);
        wmpAudio.addEventListener('pause', onPause);
    }
});

function selectTrack(element) {
    const playlistItems = document.querySelectorAll('.wmp-playlist-item');
    playlistItems.forEach((item, index) => {
        item.classList.remove('active', 'playing');
        if (item === element) {
            wmpCurrentTrackIndex = index;
        }
    });

    element.classList.add('active');

    const src = element.dataset.src;
    const trackName = element.querySelector('.wmp-track-name').textContent;

    // Update now playing title
    document.getElementById('wmpNowPlayingTitle').textContent = trackName;

    // Load and play the track
    wmpAudio.src = src;
    wmpAudio.load();
    wmpAudio.play().then(() => {
        element.classList.add('playing');
    }).catch(err => console.log('Playback error:', err));
}

function togglePlay() {
    if (!wmpAudio.src && wmpTracks.length > 0) {
        // No track selected, play first track
        const firstTrack = document.querySelector('.wmp-playlist-item');
        if (firstTrack) {
            selectTrack(firstTrack);
        }
        return;
    }

    if (wmpIsPlaying) {
        wmpAudio.pause();
    } else {
        wmpAudio.play().catch(err => console.log('Playback error:', err));
    }
}

function onPlay() {
    wmpIsPlaying = true;
    document.getElementById('wmpPlayPauseIcon').textContent = '⏸';
    document.getElementById('wmpPlayIcon').classList.add('hidden');
    document.getElementById('wmpPlayingStatus').textContent = 'Playing';

    // Start visualization animation
    document.querySelector('.wmp-vis-bars').classList.add('wmp-bars-playing');

    // Update playlist item
    const playlistItems = document.querySelectorAll('.wmp-playlist-item');
    playlistItems.forEach((item, index) => {
        if (index === wmpCurrentTrackIndex) {
            item.classList.add('playing');
        }
    });
}

function onPause() {
    wmpIsPlaying = false;
    document.getElementById('wmpPlayPauseIcon').textContent = '▶';
    document.getElementById('wmpPlayIcon').classList.remove('hidden');
    document.getElementById('wmpPlayingStatus').textContent = 'Paused';

    // Stop visualization animation
    document.querySelector('.wmp-vis-bars').classList.remove('wmp-bars-playing');
}

function stopPlayback() {
    wmpAudio.pause();
    wmpAudio.currentTime = 0;
    document.getElementById('wmpPlayingStatus').textContent = 'Stopped';
    document.getElementById('wmpSeekBar').value = 0;
    document.getElementById('wmpCurrentTime').textContent = '0:00';
}

function prevTrack() {
    if (wmpTracks.length === 0) return;

    wmpCurrentTrackIndex--;
    if (wmpCurrentTrackIndex < 0) {
        wmpCurrentTrackIndex = wmpTracks.length - 1;
    }

    const playlistItems = document.querySelectorAll('.wmp-playlist-item');
    selectTrack(playlistItems[wmpCurrentTrackIndex]);
}

function nextTrack() {
    if (wmpTracks.length === 0) return;

    wmpCurrentTrackIndex++;
    if (wmpCurrentTrackIndex >= wmpTracks.length) {
        wmpCurrentTrackIndex = 0;
    }

    const playlistItems = document.querySelectorAll('.wmp-playlist-item');
    selectTrack(playlistItems[wmpCurrentTrackIndex]);
}

function updateTimeDisplay() {
    if (!wmpAudio.duration) return;

    const currentTime = formatTime(wmpAudio.currentTime);
    const progress = (wmpAudio.currentTime / wmpAudio.duration) * 100;

    document.getElementById('wmpCurrentTime').textContent = currentTime;
    document.getElementById('wmpSeekBar').value = progress;
}

function updateTotalTime() {
    if (wmpAudio.duration) {
        document.getElementById('wmpTotalTime').textContent = formatTime(wmpAudio.duration);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function seekTo(value) {
    if (!wmpAudio.duration) return;
    wmpAudio.currentTime = (value / 100) * wmpAudio.duration;
}

function setVolume(value) {
    wmpAudio.volume = value / 100;
    updateMuteIcon();
}

function toggleMute() {
    wmpAudio.muted = !wmpAudio.muted;
    updateMuteIcon();
}

function updateMuteIcon() {
    const muteBtn = document.querySelector('.wmp-mute-btn');
    if (wmpAudio.muted || wmpAudio.volume === 0) {
        muteBtn.textContent = '🔇';
    } else if (wmpAudio.volume < 0.5) {
        muteBtn.textContent = '🔉';
    } else {
        muteBtn.textContent = '🔊';
    }
}