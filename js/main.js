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
    if (id === 'resume' || id === 'chrome' || id === 'Music' || id === 'Yonex' || id === 'flstudio') {
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

let wmpAudio = document.getElementById('wmpAudio');
let wmpCurrentTrack = null;
let wmpIsPlaying = false;

function selectTrack(element) {
    // Remove active/playing states from all items
    document.querySelectorAll('.wmp-playlist-item').forEach(item => {
        item.classList.remove('active', 'playing');
    });
    
    // Set current track as active
    element.classList.add('active');
    wmpCurrentTrack = element;
    
    // Load the track
    const src = element.getAttribute('data-src');
    const trackName = element.querySelector('.wmp-track-name').textContent;
    
    wmpAudio.src = src;
    document.getElementById('wmpNowPlayingTitle').textContent = trackName;
    
    // Auto-play when selecting a track
    togglePlay();
}

function togglePlay() {
    if (!wmpCurrentTrack) {
        // Select first track if none selected
        const firstTrack = document.querySelector('.wmp-playlist-item');
        if (firstTrack) selectTrack(firstTrack);
        return;
    }
    
    if (wmpIsPlaying) {
        wmpAudio.pause();
        wmpIsPlaying = false;
        updatePlayState();
    } else {
        wmpAudio.play();
        wmpIsPlaying = true;
        updatePlayState();
    }
}

function stopPlayback() {
    wmpAudio.pause();
    wmpAudio.currentTime = 0;
    wmpIsPlaying = false;
    updatePlayState();
}

function prevTrack() {
    const items = document.querySelectorAll('.wmp-playlist-item');
    let currentIndex = Array.from(items).indexOf(wmpCurrentTrack);
    if (currentIndex > 0) {
        selectTrack(items[currentIndex - 1]);
    }
}

function nextTrack() {
    const items = document.querySelectorAll('.wmp-playlist-item');
    let currentIndex = Array.from(items).indexOf(wmpCurrentTrack);
    if (currentIndex < items.length - 1) {
        selectTrack(items[currentIndex + 1]);
    }
}

function updatePlayState() {
    const playIcon = document.getElementById('wmpPlayPauseIcon');
    const visBars = document.querySelector('.wmp-vis-bars');
    const playIconBig = document.getElementById('wmpPlayIcon');
    const statusEl = document.getElementById('wmpPlayingStatus');
    
    if (wmpIsPlaying) {
        playIcon.textContent = '';
        visBars.classList.add('wmp-bars-playing');
        playIconBig.classList.add('hidden');
        statusEl.textContent = 'Playing';
        if (wmpCurrentTrack) wmpCurrentTrack.classList.add('playing');
    } else {
        playIcon.textContent = '';
        visBars.classList.remove('wmp-bars-playing');
        playIconBig.classList.remove('hidden');
        statusEl.textContent = 'Stopped';
        if (wmpCurrentTrack) wmpCurrentTrack.classList.remove('playing');
    }
}

function seekTo(value) {
    if (wmpAudio.duration) {
        wmpAudio.currentTime = (value / 100) * wmpAudio.duration;
    }
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
        muteBtn.textContent = '';
    } else if (wmpAudio.volume < 0.5) {
        muteBtn.textContent = '';
    } else {
        muteBtn.textContent = '';
    }
}

// Update seek bar and time display
setInterval(() => {
    if (wmpAudio && wmpAudio.duration) {
        const progress = (wmpAudio.currentTime / wmpAudio.duration) * 100;
        document.getElementById('wmpSeekBar').value = progress;
        
        const minutes = Math.floor(wmpAudio.currentTime / 60);
        const seconds = Math.floor(wmpAudio.currentTime % 60).toString().padStart(2, '0');
        document.getElementById('wmpCurrentTime').textContent = minutes + ':' + seconds;
    }
}, 500);

// ============================================
// Yonex Video Viewer Functions
// ============================================

let yonexVideos = [
    { src: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Sample Video 1' },
    { src: 'https://www.w3schools.com/html/movie.mp4', title: 'Sample Video 2' },
    { src: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Sample Video 3' }
];
let yonexCurrentIndex = 0;

function yonexLoadVideo() {
    const video = document.getElementById('yonexVideo');
    const counter = document.getElementById('yonexCounter');
    if (video && counter && yonexVideos.length > 0) {
        video.src = yonexVideos[yonexCurrentIndex].src;
        counter.textContent = 'Video ' + (yonexCurrentIndex + 1) + ' of ' + yonexVideos.length;
    }
}

function yonexNextVideo() {
    if (yonexVideos.length === 0) return;
    yonexCurrentIndex = (yonexCurrentIndex + 1) % yonexVideos.length;
    yonexLoadVideo();
}

function yonexPrevVideo() {
    if (yonexVideos.length === 0) return;
    yonexCurrentIndex = (yonexCurrentIndex - 1 + yonexVideos.length) % yonexVideos.length;
    yonexLoadVideo();
}

// ============================================
// FL Studio Video Viewer Functions
// ============================================

let flstudioVideos = [
    { src: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'FL Studio Video 1' },
    { src: 'https://www.w3schools.com/html/movie.mp4', title: 'FL Studio Video 2' },
    { src: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'FL Studio Video 3' }
];
let flstudioCurrentIndex = 0;

function flstudioLoadVideo() {
    const video = document.getElementById('flstudioVideo');
    const counter = document.getElementById('flstudioCounter');
    if (video && counter && flstudioVideos.length > 0) {
        video.src = flstudioVideos[flstudioCurrentIndex].src;
        counter.textContent = 'Video ' + (flstudioCurrentIndex + 1) + ' of ' + flstudioVideos.length;
    }
}

function flstudioNextVideo() {
    if (flstudioVideos.length === 0) return;
    flstudioCurrentIndex = (flstudioCurrentIndex + 1) % flstudioVideos.length;
    flstudioLoadVideo();
}

function flstudioPrevVideo() {
    if (flstudioVideos.length === 0) return;
    flstudioCurrentIndex = (flstudioCurrentIndex - 1 + flstudioVideos.length) % flstudioVideos.length;
    flstudioLoadVideo();
}

// Initialize videos on page load
document.addEventListener('DOMContentLoaded', function() {
    yonexLoadVideo();
    flstudioLoadVideo();
});
