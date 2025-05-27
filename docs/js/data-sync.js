// Cross-Module Data Synchronization for Productivity Hub

class DataSync {
    constructor() {
        this.listeners = {};
        this.data = {};
        
        // Load initial data from localStorage
        this.loadAllData();
        
        // Add storage event listener to sync across tabs
        window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
    
    // Initialize all data sources
    loadAllData() {
        // Load task data
        this.data.todoList = JSON.parse(localStorage.getItem('todoList')) || [];
        
        // Load pomodoro data
        this.data.pomodoroStats = JSON.parse(localStorage.getItem('pomodoroStats')) || {};
        this.data.pomodoroSettings = JSON.parse(localStorage.getItem('pomodoroSettings')) || {
            focusDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            pomodoroCount: 4
        };
        this.data.currentPomodoroTask = localStorage.getItem('currentPomodoroTask') || 'Not specified';
        
        // Load notes data
        this.data.notes = JSON.parse(localStorage.getItem('notes')) || [];
        
        // Load progress tracker data
        this.data.productivityStats = JSON.parse(localStorage.getItem('productivityStats')) || {
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
        
        // Load motivation board data
        this.data.achievementData = JSON.parse(localStorage.getItem('achievementData')) || {
            currentStreak: 0,
            longestStreak: 0,
            goalsCompleted: 0,
            totalGoals: 10,
            milestoneProgress: 0,
            recentAchievements: []
        };
        this.data.visionBoardImages = JSON.parse(localStorage.getItem('visionBoardImages')) || [];
    }
    
    // Handle storage changes (for cross-tab synchronization)
    handleStorageChange(event) {
        if (!event.key || !event.newValue) return;
        
        // Update local data
        switch (event.key) {
            case 'todoList':
                this.data.todoList = JSON.parse(event.newValue);
                break;
            case 'pomodoroStats':
                this.data.pomodoroStats = JSON.parse(event.newValue);
                break;
            case 'pomodoroSettings':
                this.data.pomodoroSettings = JSON.parse(event.newValue);
                break;
            case 'currentPomodoroTask':
                this.data.currentPomodoroTask = event.newValue;
                break;
            case 'notes':
                this.data.notes = JSON.parse(event.newValue);
                break;
            case 'productivityStats':
                this.data.productivityStats = JSON.parse(event.newValue);
                break;
            case 'achievementData':
                this.data.achievementData = JSON.parse(event.newValue);
                break;
            case 'visionBoardImages':
                this.data.visionBoardImages = JSON.parse(event.newValue);
                break;
        }
        
        // Notify listeners
        this.notifyListeners(event.key);
    }
    
    // Get data
    getData(key) {
        return this.data[key];
    }
    
    // Update data
    updateData(key, newData, notifyChange = true) {
        // Update data in memory
        this.data[key] = newData;
        
        // Save to localStorage
        if (typeof newData === 'object') {
            localStorage.setItem(key, JSON.stringify(newData));
        } else {
            localStorage.setItem(key, newData);
        }
        
        // Notify listeners
        if (notifyChange) {
            this.notifyListeners(key);
        }
    }
    
    // Update task completion
    completeTask(taskId, completed) {
        const todoList = this.getData('todoList');
        const taskIndex = todoList.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) return false;
        
        // Update task
        todoList[taskIndex].completed = completed;
        
        // Save updated list
        this.updateData('todoList', todoList);
        
        // If task is completed, update productivity stats
        if (completed) {
            this.updateTaskCompletion();
            this.addRecentActivity({
                title: todoList[taskIndex].text,
                category: todoList[taskIndex].category || 'General',
                type: 'task',
                timestamp: new Date().toLocaleString(),
                status: 'Completed'
            });
        }
        
        return true;
    }
    
    // Update task completion in productivity stats
    updateTaskCompletion() {
        const stats = this.getData('productivityStats');
        
        // Increment total tasks completed
        stats.tasksCompleted.total++;
        
        // Get current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const today = new Date().getDay();
        // Convert to our format (0 = Monday, ..., 6 = Sunday)
        const dayIndex = today === 0 ? 6 : today - 1;
        
        // Increment tasks completed for today
        stats.tasksCompleted.thisWeek[dayIndex]++;
        
        // Update achievement data
        const achievements = this.getData('achievementData');
        achievements.goalsCompleted++;
        
        // Check if milestone should be updated
        if (achievements.goalsCompleted >= achievements.totalGoals) {
            achievements.goalsCompleted = achievements.totalGoals;
            achievements.milestoneProgress = 100;
        } else {
            achievements.milestoneProgress = Math.round((achievements.goalsCompleted / achievements.totalGoals) * 100);
        }
        
        // Save updated stats
        this.updateData('productivityStats', stats);
        this.updateData('achievementData', achievements);
    }
    
    // Update focus session completion
    completeFocusSession(minutes) {
        const stats = this.getData('productivityStats');
        
        // Increment total focus sessions
        stats.focusSessions.total++;
        
        // Get current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const today = new Date().getDay();
        // Convert to our format (0 = Monday, ..., 6 = Sunday)
        const dayIndex = today === 0 ? 6 : today - 1;
        
        // Increment focus sessions for today
        stats.focusSessions.thisWeek[dayIndex]++;
        
        // Add focus minutes
        stats.focusMinutes.total += minutes;
        stats.focusMinutes.thisWeek[dayIndex] += minutes;
        
        // Update achievement data - increment streak
        const achievements = this.getData('achievementData');
        achievements.currentStreak++;
        
        // Update longest streak if needed
        if (achievements.currentStreak > achievements.longestStreak) {
            achievements.longestStreak = achievements.currentStreak;
        }
        
        // Add to recent achievements if it's a milestone
        if (achievements.currentStreak % 5 === 0) {
            this.addAchievement({
                title: `Completed ${achievements.currentStreak} days streak`,
                type: 'milestone',
                date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
            });
        }
        
        // Save updated stats
        this.updateData('productivityStats', stats);
        this.updateData('achievementData', achievements);
    }
    
    // Add recent activity
    addRecentActivity(activity) {
        const stats = this.getData('productivityStats');
        
        // Add to beginning of array
        stats.recentActivity.unshift(activity);
        
        // Limit to 10 recent activities
        if (stats.recentActivity.length > 10) {
            stats.recentActivity.pop();
        }
        
        // Save updated stats
        this.updateData('productivityStats', stats);
    }
    
    // Add achievement
    addAchievement(achievement) {
        const achievements = this.getData('achievementData');
        
        // Add to beginning of array
        achievements.recentAchievements.unshift(achievement);
        
        // Limit to 10 recent achievements
        if (achievements.recentAchievements.length > 10) {
            achievements.recentAchievements.pop();
        }
        
        // Save updated achievements
        this.updateData('achievementData', achievements);
    }
    
    // Subscribe to data changes
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        
        this.listeners[key].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
        };
    }
    
    // Notify listeners of data changes
    notifyListeners(key) {
        if (!this.listeners[key]) return;
        
        for (const callback of this.listeners[key]) {
            callback(this.data[key]);
        }
    }
    
    // Export all data (for backup)
    exportAllData() {
        return {
            todoList: this.data.todoList,
            pomodoroStats: this.data.pomodoroStats,
            pomodoroSettings: this.data.pomodoroSettings,
            currentPomodoroTask: this.data.currentPomodoroTask,
            notes: this.data.notes,
            productivityStats: this.data.productivityStats,
            achievementData: this.data.achievementData,
            visionBoardImages: this.data.visionBoardImages
        };
    }
    
    // Import all data (from backup)
    importAllData(data) {
        // Validate data structure
        const requiredKeys = ['todoList', 'pomodoroStats', 'pomodoroSettings', 'currentPomodoroTask',
                             'notes', 'productivityStats', 'achievementData', 'visionBoardImages'];
        
        for (const key of requiredKeys) {
            if (!(key in data)) {
                throw new Error(`Invalid data structure: missing ${key}`);
            }
        }
        
        // Import each data key
        for (const key of requiredKeys) {
            this.updateData(key, data[key], false);
        }
        
        // Notify all listeners
        for (const key of requiredKeys) {
            this.notifyListeners(key);
        }
        
        return true;
    }
}

// Initialize data sync service
document.addEventListener('DOMContentLoaded', () => {
    // Create global data sync instance
    window.dataSync = new DataSync();
    console.log('Data synchronization service initialized');
});