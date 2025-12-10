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
    if (id === 'resume') {
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