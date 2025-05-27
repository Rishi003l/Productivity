// Pomodoro Timer JavaScript for Productivity Hub

document.addEventListener('DOMContentLoaded', function() {
    // Main timer elements
    const timerDisplay = document.getElementById('timer');
    const timerMode = document.getElementById('timer-mode');
    const timerProgress = document.getElementById('timer-progress');
    const startButton = document.getElementById('start-timer');
    const pauseButton = document.getElementById('pause-timer');
    const resetButton = document.getElementById('reset-timer');
    
    // Settings elements
    const focusDuration = document.getElementById('focus-duration');
    const shortBreak = document.getElementById('short-break');
    const longBreak = document.getElementById('long-break');
    const pomodoroCount = document.getElementById('pomodoro-count');
    const applySettings = document.getElementById('apply-settings');
    
    // Current task
    const currentTaskInput = document.getElementById('current-task');
    const updateTaskButton = document.getElementById('update-task');
    
    // Statistics elements
    const totalPomodoroCount = document.getElementById('total-pomodoro-count');
    const totalFocusTime = document.getElementById('total-focus-time');
    const dailyGoalProgress = document.getElementById('daily-goal-progress');
    const totalPomodoros = document.getElementById('total-pomodoros');
    
    // Session history
    const sessionHistory = document.getElementById('session-history');
    
    // Audio
    const timerSound = document.getElementById('timer-sound');
    
    // Pomodoro tips
    const pomodoroTip = document.getElementById('pomodoro-tip');
    const newTipButton = document.getElementById('new-tip');
    
    // Timer variables
    let timerInterval;
    let minutes = 25;
    let seconds = 0;
    let isRunning = false;
    let currentMode = 'focus'; // 'focus', 'shortBreak', 'longBreak'
    let completedPomodoros = 0;
    let totalSeconds = 0;
    let originalMinutes = 25;
    
    // Current task
    let currentTask = 'Not specified';
    
    // Tips array
    const tips = [
        "Focus on a single task during each Pomodoro. Avoid multitasking for maximum efficiency.",
        "Use the 'brain dump' technique before starting a Pomodoro. Write down any distracting thoughts to clear your mind.",
        "Start with easier tasks to build momentum and move to more challenging ones later.",
        "Keep a distraction log during Pomodoros to track and eliminate recurring interruptions.",
        "For complex tasks, use the 'divide and conquer' approach. Break them into smaller, manageable Pomodoro sessions.",
        "Set a daily Pomodoro goal to maintain consistent progress.",
        "Use a physical timer occasionally to reduce screen time and digital distractions.",
        "Adjust your Pomodoro length based on your focus needs. Some prefer 50/10 instead of 25/5.",
        "During breaks, avoid digital devices. Try stretching, walking, or deep breathing instead.",
        "Schedule your hardest tasks during your peak productivity hours."
    ];
    
    // Initialize timer display
    updateTimerDisplay();
    
    // Load settings and stats from localStorage
    loadSettings();
    loadStats();
    
    // Load Current Task from localStorage
    loadCurrentTask();
    
    // Initialize total pomodoros today
    updateTotalPomodoros();
    
    // Display a random tip
    displayRandomTip();
    
    // Settings increment/decrement buttons
    document.getElementById('decrease-focus').addEventListener('click', () => {
        if (parseInt(focusDuration.value) > 1) {
            focusDuration.value = parseInt(focusDuration.value) - 1;
        }
    });
    
    document.getElementById('increase-focus').addEventListener('click', () => {
        if (parseInt(focusDuration.value) < 60) {
            focusDuration.value = parseInt(focusDuration.value) + 1;
        }
    });
    
    document.getElementById('decrease-short').addEventListener('click', () => {
        if (parseInt(shortBreak.value) > 1) {
            shortBreak.value = parseInt(shortBreak.value) - 1;
        }
    });
    
    document.getElementById('increase-short').addEventListener('click', () => {
        if (parseInt(shortBreak.value) < 30) {
            shortBreak.value = parseInt(shortBreak.value) + 1;
        }
    });
    
    document.getElementById('decrease-long').addEventListener('click', () => {
        if (parseInt(longBreak.value) > 1) {
            longBreak.value = parseInt(longBreak.value) - 1;
        }
    });
    
    document.getElementById('increase-long').addEventListener('click', () => {
        if (parseInt(longBreak.value) < 60) {
            longBreak.value = parseInt(longBreak.value) + 1;
        }
    });
    
    document.getElementById('decrease-count').addEventListener('click', () => {
        if (parseInt(pomodoroCount.value) > 1) {
            pomodoroCount.value = parseInt(pomodoroCount.value) - 1;
        }
    });
    
    document.getElementById('increase-count').addEventListener('click', () => {
        if (parseInt(pomodoroCount.value) < 10) {
            pomodoroCount.value = parseInt(pomodoroCount.value) + 1;
        }
    });
    
    // Apply settings
    applySettings.addEventListener('click', () => {
        saveSettings();
        resetTimer();
        showToast('Settings applied successfully');
    });
    
    // Current task update
    updateTaskButton.addEventListener('click', () => {
        currentTask = currentTaskInput.value || 'Not specified';
        saveCurrentTask();
        showToast(`Task updated: ${currentTask}`);
    });
    
    // New tip button
    newTipButton.addEventListener('click', displayRandomTip);
    
    // Start timer
    startButton.addEventListener('click', startTimer);
    
    // Pause timer
    pauseButton.addEventListener('click', pauseTimer);
    
    // Reset timer
    resetButton.addEventListener('click', resetTimer);
    
    // Timer functions
    function updateTimerDisplay() {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress circle
        if (timerProgress) {
            const progress = calculateProgress();
            const circumference = 2 * Math.PI * 120; // r = 120
            const offset = circumference - (progress / 100) * circumference;
            timerProgress.style.strokeDasharray = circumference;
            timerProgress.style.strokeDashoffset = offset;
        }
    }
    
    function calculateProgress() {
        const totalSecondsInTimer = originalMinutes * 60;
        const secondsLeft = minutes * 60 + seconds;
        return ((totalSecondsInTimer - secondsLeft) / totalSecondsInTimer) * 100;
    }
    
    function startTimer() {
        if (isRunning) return;
        
        isRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;
        
        timerInterval = setInterval(() => {
            if (seconds > 0) {
                seconds--;
            } else if (minutes > 0) {
                minutes--;
                seconds = 59;
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                
                // Play sound
                if (timerSound) {
                    timerSound.play().catch(error => {
                        console.warn('Could not play timer sound:', error);
                    });
                }
                
                // Show notification
                if (currentMode === 'focus') {
                    completedPomodoros++;
                    saveStats();
                    addSessionToHistory();
                    showToast('Pomodoro completed! Take a break.');
                    
                    // Update progress tracker
                    updateProgressTracker('focus');
                    
                    // Check if it's time for a long break
                    if (completedPomodoros % parseInt(pomodoroCount.value) === 0) {
                        setMode('longBreak');
                    } else {
                        setMode('shortBreak');
                    }
                } else {
                    showToast('Break is over! Time to focus.');
                    setMode('focus');
                }
                
                // Update UI
                startButton.disabled = false;
                pauseButton.disabled = true;
                updateTotalPomodoros();
            }
            
            // Update timer display
            updateTimerDisplay();
            
            // Count total seconds if in focus mode
            if (currentMode === 'focus') {
                totalSeconds++;
            }
        }, 1000);
    }
    
    function pauseTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
    }
    
    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        setMode(currentMode); // Reset with current mode
        startButton.disabled = false;
        pauseButton.disabled = true;
        updateTimerDisplay();
    }
    
    function setMode(mode) {
        currentMode = mode;
        
        switch (mode) {
            case 'focus':
                minutes = parseInt(focusDuration.value);
                if (timerMode) timerMode.textContent = 'Focus Time';
                if (timerMode) timerMode.className = 'text-gray-500 dark:text-gray-400 mt-2';
                const firstCircle = document.querySelector('circle:first-of-type');
                const lastCircle = document.querySelector('circle:last-of-type');
                if (firstCircle) firstCircle.setAttribute('class', 'dark:stroke-gray-700');
                if (lastCircle) {
                    lastCircle.setAttribute('class', 'transition-all duration-1000 dark:stroke-primary-400');
                    lastCircle.setAttribute('stroke', '#0ea5e9');
                }
                break;
            case 'shortBreak':
                minutes = parseInt(shortBreak.value);
                if (timerMode) timerMode.textContent = 'Short Break';
                if (timerMode) timerMode.className = 'text-green-500 dark:text-green-400 mt-2';
                const firstCircleShort = document.querySelector('circle:first-of-type');
                const lastCircleShort = document.querySelector('circle:last-of-type');
                if (firstCircleShort) firstCircleShort.setAttribute('class', 'dark:stroke-gray-700');
                if (lastCircleShort) {
                    lastCircleShort.setAttribute('class', 'transition-all duration-1000 dark:stroke-green-400');
                    lastCircleShort.setAttribute('stroke', '#10b981');
                }
                break;
            case 'longBreak':
                minutes = parseInt(longBreak.value);
                if (timerMode) timerMode.textContent = 'Long Break';
                if (timerMode) timerMode.className = 'text-blue-500 dark:text-blue-400 mt-2';
                const firstCircleLong = document.querySelector('circle:first-of-type');
                const lastCircleLong = document.querySelector('circle:last-of-type');
                if (firstCircleLong) firstCircleLong.setAttribute('class', 'dark:stroke-gray-700');
                if (lastCircleLong) {
                    lastCircleLong.setAttribute('class', 'transition-all duration-1000 dark:stroke-blue-400');
                    lastCircleLong.setAttribute('stroke', '#3b82f6');
                }
                break;
        }
        
        originalMinutes = minutes;
        seconds = 0;
    }
    
    // Save settings to localStorage
    function saveSettings() {
        if (!focusDuration || !shortBreak || !longBreak || !pomodoroCount) return;
        
        const settings = {
            focusDuration: focusDuration.value,
            shortBreak: shortBreak.value,
            longBreak: longBreak.value,
            pomodoroCount: pomodoroCount.value
        };
        
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        
        // Apply settings immediately
        setMode(currentMode);
    }
    
    // Load settings from localStorage
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('pomodoroSettings'));
        
        if (settings && focusDuration && shortBreak && longBreak && pomodoroCount) {
            focusDuration.value = settings.focusDuration;
            shortBreak.value = settings.shortBreak;
            longBreak.value = settings.longBreak;
            pomodoroCount.value = settings.pomodoroCount;
            
            // Apply settings immediately
            setMode('focus');
        }
    }
    
    // Save current task to localStorage
    function saveCurrentTask() {
        localStorage.setItem('currentPomodoroTask', currentTask);
    }
    
    // Load current task from localStorage
    function loadCurrentTask() {
        const savedTask = localStorage.getItem('currentPomodoroTask');
        
        if (savedTask && currentTaskInput) {
            currentTask = savedTask;
            currentTaskInput.value = currentTask;
        }
    }
    
    // Save stats to localStorage
    function saveStats() {
        // Get today's date as a string
        const today = new Date().toLocaleDateString();
        
        // Get existing stats or initialize
        let stats = JSON.parse(localStorage.getItem('pomodoroStats')) || {};
        
        // Initialize today's stats if needed
        if (!stats[today]) {
            stats[today] = {
                completedPomodoros: 0,
                totalFocusMinutes: 0
            };
        }
        
        // Update today's stats
        stats[today].completedPomodoros = completedPomodoros;
        stats[today].totalFocusMinutes = Math.floor(totalSeconds / 60);
        
        // Save back to localStorage
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
        
        // Update stats display
        updateStatsDisplay(stats[today]);
        
        // If user authentication is available, save to cloud
        if (window.userAuth && window.userAuth.getCurrentUser()) {
            const userData = window.userAuth.getCurrentUser();
            if (window.sheetsAPI) {
                window.sheetsAPI.incrementMetric(userData.name, 'Pomodoro Sessions');
                window.sheetsAPI.incrementMetric(userData.name, 'Focus Minutes', parseInt(focusDuration.value || 25));
            }
        }
    }
    
    // Load stats from localStorage
    function loadStats() {
        const today = new Date().toLocaleDateString();
        const stats = JSON.parse(localStorage.getItem('pomodoroStats')) || {};
        
        if (stats[today]) {
            completedPomodoros = stats[today].completedPomodoros;
            totalSeconds = stats[today].totalFocusMinutes * 60;
            
            // Update stats display
            updateStatsDisplay(stats[today]);
        }
    }
    
    // Update stats display
    function updateStatsDisplay(todayStats) {
        if (totalPomodoroCount) {
            totalPomodoroCount.textContent = todayStats.completedPomodoros;
        }
        
        if (totalFocusTime) {
            totalFocusTime.textContent = `${todayStats.totalFocusMinutes} min`;
        }
        
        if (dailyGoalProgress) {
            // Assuming a daily goal of 8 pomodoros
            const dailyGoal = 8;
            const progress = Math.min(Math.round((todayStats.completedPomodoros / dailyGoal) * 100), 100);
            dailyGoalProgress.textContent = `${progress}%`;
        }
    }
    
    // Update the progress tracker
    function updateProgressTracker(activityType) {
        // Get current progress stats
        let progressStats = JSON.parse(localStorage.getItem('productivityStats')) || {
            focusSessions: {
                total: 0,
                thisWeek: [0, 0, 0, 0, 0, 0, 0], // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
                lastWeek: [0, 0, 0, 0, 0, 0, 0]
            },
            tasksCompleted: {
                total: 0,
                thisWeek: [0, 0, 0, 0, 0, 0, 0],
                lastWeek: [0, 0, 0, 0, 0, 0, 0]
            },
            focusMinutes: {
                total: 0,
                thisWeek: [0, 0, 0, 0, 0, 0, 0],
                lastWeek: [0, 0, 0, 0, 0, 0, 0]
            },
            recentActivity: []
        };
        
        // Get current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const today = new Date().getDay();
        // Convert to our format (0 = Monday, ..., 6 = Sunday)
        const dayIndex = today === 0 ? 6 : today - 1;
        
        if (activityType === 'focus') {
            // Increment focus sessions
            progressStats.focusSessions.total++;
            progressStats.focusSessions.thisWeek[dayIndex]++;
            
            // Add focus minutes
            const minutesAdded = parseInt(focusDuration.value || 25);
            progressStats.focusMinutes.total += minutesAdded;
            progressStats.focusMinutes.thisWeek[dayIndex] += minutesAdded;
            
            // Add to recent activity
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const dateString = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            
            progressStats.recentActivity.unshift({
                title: currentTask,
                category: 'Focus',
                type: 'focus',
                timestamp: `${dateString}, ${timeString}`,
                status: 'Completed'
            });
            
            // Limit recent activity to 10 items
            if (progressStats.recentActivity.length > 10) {
                progressStats.recentActivity.pop();
            }
        }
        
        // Save updated stats
        localStorage.setItem('productivityStats', JSON.stringify(progressStats));
    }
    
    // Add session to history
    function addSessionToHistory() {
        if (!sessionHistory) return;
        
        // Remove "no sessions" message if present
        const noSessions = sessionHistory.querySelector('.text-center');
        if (noSessions) {
            sessionHistory.innerHTML = '';
        }
        
        // Create session entry
        const sessionEntry = document.createElement('div');
        sessionEntry.className = 'flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 animate-fadeIn';
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        
        sessionEntry.innerHTML = `
            <div class="flex items-center">
                <div class="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 dark:text-primary-400 mr-2">
                    <i class="fas fa-check text-xs"></i>
                </div>
                <div>
                    <p class="text-sm font-medium">${currentTask}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${timeString}</p>
                </div>
            </div>
            <span class="text-xs py-0.5 px-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full">
                ${focusDuration ? focusDuration.value : '25'} min
            </span>
        `;
        
        // Add to session history
        sessionHistory.prepend(sessionEntry);
    }
    
    // Update the total pomodoros badge
    function updateTotalPomodoros() {
        if (totalPomodoros) {
            totalPomodoros.textContent = `${completedPomodoros} Pomodoros today`;
        }
    }
    
    // Display a random tip
    function displayRandomTip() {
        if (!pomodoroTip) return;
        
        const randomIndex = Math.floor(Math.random() * tips.length);
        pomodoroTip.innerHTML = `<p>${tips[randomIndex]}</p>`;
    }
    
    // Function to show toast notification
    function showToast(message, type = 'success') {
        // Check if a toast container exists, if not create one
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed bottom-4 right-4 z-50';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `mb-2 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-500 opacity-0 translate-y-8`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.remove('opacity-0', 'translate-y-8');
        }, 10);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-8');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 500);
        }, 3000);
    }
});