const timer = document.getElementById('timer');
const phase = document.getElementById('phase');
const startPauseBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const sound = document.getElementById('sound');

const timerPath = document.getElementById('timerPath');
const todaySessionsElement = document.getElementById('todaySessions');
const totalSessionsElement = document.getElementById('totalSessions');
const saveSettingsBtn = document.getElementById('saveSettings');
const toggleSettingsBtn = document.getElementById('toggleSettings');
const settingsDiv = document.getElementById('settings');
const resetDataBtn = document.getElementById('resetDataBtn');
const confirmationDiv = document.getElementById('confirmation');

toggleSettingsBtn.addEventListener('click', () => {
    settingsDiv.style.display = settingsDiv.style.display === 'none' ? 'block' : 'none';
});

let interval;
let timeLeft;
let isRunning = false;
let currentPhase;
let focusCount;
let todaySessions;
let totalSessions;
let lastSavedDate;
let phaseDurations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 20 * 60
};

function loadState() {
    const currentDate = new Date().toDateString();
    lastSavedDate = localStorage.getItem('lastSavedDate') || currentDate;

    if (lastSavedDate !== currentDate) {
        todaySessions = 0;
        localStorage.setItem('lastSavedDate', currentDate);
    } else {
        todaySessions = parseInt(localStorage.getItem('todaySessions')) || 0;
    }

    timeLeft = parseInt(localStorage.getItem('timeLeft')) || phaseDurations.focus;
    currentPhase = localStorage.getItem('currentPhase') || 'focus';
    focusCount = parseInt(localStorage.getItem('focusCount')) || 0;
    totalSessions = parseInt(localStorage.getItem('totalSessions')) || 0;

    const savedFocusTime = localStorage.getItem('focusTime');
    const savedShortBreakTime = localStorage.getItem('shortBreakTime');
    const savedLongBreakTime = localStorage.getItem('longBreakTime');

    if (savedFocusTime && !isNaN(savedFocusTime)) {
        phaseDurations.focus = parseInt(savedFocusTime) * 60;
        document.getElementById('focusTime').value = savedFocusTime;
    }
    if (savedShortBreakTime && !isNaN(savedShortBreakTime)) {
        phaseDurations.shortBreak = parseInt(savedShortBreakTime) * 60;
        document.getElementById('shortBreakTime').value = savedShortBreakTime;
    }
    if (savedLongBreakTime && !isNaN(savedLongBreakTime)) {
        phaseDurations.longBreak = parseInt(savedLongBreakTime) * 60;
        document.getElementById('longBreakTime').value = savedLongBreakTime;
    }

    updatePhaseDisplay();
    updateTimer();
    updateStats();
}

function saveState() {
    try {
        localStorage.setItem('timeLeft', timeLeft);
        localStorage.setItem('currentPhase', currentPhase);
        localStorage.setItem('focusCount', focusCount);
        localStorage.setItem('todaySessions', todaySessions);
        localStorage.setItem('totalSessions', totalSessions);
        localStorage.setItem('lastSavedDate', new Date().toDateString());
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const totalTime = phaseDurations[currentPhase];
    const progress = (totalTime - timeLeft) / totalTime;
    const dashOffset = 722.57 * (1 - progress);
    timerPath.style.strokeDashoffset = dashOffset;

    // Update start/pause button text
    startPauseBtn.textContent = isRunning ? 'Pause' : 'Start';
}

function updatePhaseDisplay() {
    phase.textContent = currentPhase === 'focus' ? 'Focus Time' :
        currentPhase === 'shortBreak' ? 'Short Break' : 'Long Break';
}

function updateStats() {
    todaySessionsElement.textContent = todaySessions;
    totalSessionsElement.textContent = totalSessions;
}

function playSound() {
    sound.currentTime = 0;
    sound.play().catch(error => {
        console.log('Error playing sound:', error);
    });
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        interval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimer();
                saveState();
            } else {
                clearInterval(interval);
                isRunning = false;
                switchPhase();
            }
        }, 1000);
        updateTimer(); // Update the UI immediately when starting
    }
}

function switchPhase() {
    if (currentPhase === 'focus') {
        focusCount = Math.max(0, focusCount + 1);
        todaySessions = Math.max(0, todaySessions + 1);
        totalSessions = Math.max(0, totalSessions + 1);
        updateStats();
        currentPhase = (focusCount % 4 === 0) ? 'longBreak' : 'shortBreak';
    } else {
        currentPhase = 'focus';
    }
    timeLeft = phaseDurations[currentPhase];
    updatePhaseDisplay();
    updateTimer();
    saveState();
    playSound();
    startTimer();
}

startPauseBtn.addEventListener('click', () => {
    if (isRunning) {
        // If the timer is running, pause it
        clearInterval(interval);
        isRunning = false;
    } else {
        // If the timer is not running, start it
        startTimer();
    }
    updateTimer(); // Update the UI immediately
});

resetBtn.addEventListener('click', () => {
    clearInterval(interval);
    isRunning = false;
    currentPhase = 'focus';
    focusCount = 0;
    timeLeft = phaseDurations.focus;
    updatePhaseDisplay();
    updateTimer();
    saveState();
});

saveSettingsBtn.addEventListener('click', () => {
    const focusTime = document.getElementById('focusTime').value;
    const shortBreakTime = document.getElementById('shortBreakTime').value;
    const longBreakTime = document.getElementById('longBreakTime').value;

    phaseDurations.focus = parseInt(focusTime) * 60;
    phaseDurations.shortBreak = parseInt(shortBreakTime) * 60;
    phaseDurations.longBreak = parseInt(longBreakTime) * 60;

    localStorage.setItem('focusTime', focusTime);
    localStorage.setItem('shortBreakTime', shortBreakTime);
    localStorage.setItem('longBreakTime', longBreakTime);

    if (!isRunning) {
        timeLeft = phaseDurations[currentPhase];
        updateTimer();
    }

    confirmationDiv.style.display = 'block';
    setTimeout(() => {
        confirmationDiv.style.display = 'none';
    }, 3000);

    saveState();
});

resetDataBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        clearInterval(interval);
        isRunning = false;
        
        localStorage.clear();
        
        phaseDurations = {
            focus: 25 * 60,
            shortBreak: 5 * 60,
            longBreak: 20 * 60
        };
        timeLeft = phaseDurations.focus;
        currentPhase = 'focus';
        focusCount = 0;
        todaySessions = 0;
        totalSessions = 0;

        updatePhaseDisplay();
        updateTimer();
        updateStats();

        document.getElementById('focusTime').value = 25;
        document.getElementById('shortBreakTime').value = 5;
        document.getElementById('longBreakTime').value = 20;

        saveState();

        alert('All data has been reset successfully.');
    }
});

window.addEventListener('beforeunload', saveState);

loadState();

document.body.addEventListener('click', function () {
    sound.play().then(() => sound.pause()).catch(() => { });
}, { once: true });
