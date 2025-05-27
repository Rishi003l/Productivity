// Progress Tracker JavaScript for Productivity Hub

document.addEventListener('DOMContentLoaded', function() {
    // Get data from localStorage or initialize if not available
    initializeStats();
    
    // Update stats display
    updateStatsDisplay();
    
    // Set up chart data
    setupCharts();
    
    // Set up refresh button
    document.querySelector('button.text-primary-600').addEventListener('click', function() {
        // Refresh data from localStorage
        updateStatsDisplay();
        
        // Update charts
        setupCharts();
        
        // Show toast notification
        showToast('Statistics refreshed');
    });
    
    // Initialize statistics if not already present
    function initializeStats() {
        const stats = JSON.parse(localStorage.getItem('productivityStats')) || {};
        
        if (!stats.focusSessions) {
            // Default stats
            const defaultStats = {
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
            
            localStorage.setItem('productivityStats', JSON.stringify(defaultStats));
            
            return defaultStats;
        }
        
        return stats;
    }
    
    // Update the stats display with actual data
    function updateStatsDisplay() {
        const stats = JSON.parse(localStorage.getItem('productivityStats')) || initializeStats();
        
        // Helper function to calculate percentage change
        function calculatePercentChange(thisWeek, lastWeek) {
            const thisWeekTotal = thisWeek.reduce((acc, curr) => acc + curr, 0);
            const lastWeekTotal = lastWeek.reduce((acc, curr) => acc + curr, 0);
            
            if (lastWeekTotal === 0) return 0;
            return Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
        }
        
        // Update focus sessions
        const focusSessionsElement = document.querySelector('.text-3xl.font-bold.text-primary-600');
        if (focusSessionsElement) {
            focusSessionsElement.textContent = stats.focusSessions.total;
            
            // Update percentage change
            const focusSessionsPercentElement = focusSessionsElement.parentElement.querySelector('.text-sm.text-green-500');
            if (focusSessionsPercentElement) {
                const percentChange = calculatePercentChange(stats.focusSessions.thisWeek, stats.focusSessions.lastWeek);
                updatePercentageDisplay(focusSessionsPercentElement, percentChange);
            }
        }
        
        // Update tasks completed
        const tasksCompletedElement = document.querySelector('.text-3xl.font-bold.text-green-600');
        if (tasksCompletedElement) {
            tasksCompletedElement.textContent = stats.tasksCompleted.total;
            
            // Update percentage change
            const tasksPercentElement = tasksCompletedElement.parentElement.querySelector('.text-sm.text-green-500');
            if (tasksPercentElement) {
                const percentChange = calculatePercentChange(stats.tasksCompleted.thisWeek, stats.tasksCompleted.lastWeek);
                updatePercentageDisplay(tasksPercentElement, percentChange);
            }
        }
        
        // Update focus minutes
        const focusMinutesElement = document.querySelector('.text-3xl.font-bold.text-blue-600');
        if (focusMinutesElement) {
            focusMinutesElement.textContent = stats.focusMinutes.total;
            
            // Update percentage change
            const minutesPercentElement = focusMinutesElement.parentElement.querySelector('.text-sm.text-green-500');
            if (minutesPercentElement) {
                const percentChange = calculatePercentChange(stats.focusMinutes.thisWeek, stats.focusMinutes.lastWeek);
                updatePercentageDisplay(minutesPercentElement, percentChange);
            }
        }
    }
    
    // Helper function to update percentage display
    function updatePercentageDisplay(element, percentChange) {
        if (percentChange >= 0) {
            element.innerHTML = `<i class="fas fa-arrow-up mr-1"></i> ${percentChange}% vs. last week`;
            element.className = 'text-sm text-green-500 dark:text-green-400 flex items-center mt-1';
        } else {
            element.innerHTML = `<i class="fas fa-arrow-down mr-1"></i> ${Math.abs(percentChange)}% vs. last week`;
            element.className = 'text-sm text-red-500 dark:text-red-400 flex items-center mt-1';
        }
    }
    
    // Set up chart data
    function setupCharts() {
        const stats = JSON.parse(localStorage.getItem('productivityStats')) || initializeStats();
        
        // Weekly Progress Chart
        const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
        window.weeklyChart = new Chart(weeklyCtx, {
            type: 'bar',
            data: {
                labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                datasets: [{
                    label: 'Focus Minutes',
                    data: stats.focusMinutes.thisWeek,
                    backgroundColor: 'rgba(14, 165, 233, 0.7)',
                    borderColor: 'rgba(14, 165, 233, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });

        // Task Completion Chart
        const taskCtx = document.getElementById('taskCompletionChart').getContext('2d');
        window.taskChart = new Chart(taskCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Tasks Created',
                    data: calculateWeeklyTasksCreated(),
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    borderColor: 'rgba(168, 85, 247, 1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Tasks Completed',
                    data: calculateWeeklyTasksCompleted(),
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        // Helper function to get task data from localStorage
        function calculateWeeklyTasksCreated() {
            // This would ideally be calculated from actual data, but for now we'll use sample data
            // In a real implementation, you'd aggregate tasks created by week from the todo list data
            const todoData = JSON.parse(localStorage.getItem('todoList')) || [];
            return [todoData.length * 0.4, todoData.length * 0.6, todoData.length * 0.8, todoData.length];
        }
        
        function calculateWeeklyTasksCompleted() {
            // Similarly, this would use actual data in a real implementation
            const todoData = JSON.parse(localStorage.getItem('todoList')) || [];
            const completedTasks = todoData.filter(task => task.completed).length;
            return [completedTasks * 0.3, completedTasks * 0.5, completedTasks * 0.7, completedTasks];
        }
    }
    
    // Update activity table with real data when available
    function updateActivityTable() {
        const activityTableBody = document.querySelector('tbody.bg-white.dark:bg-gray-800');
        const stats = JSON.parse(localStorage.getItem('productivityStats')) || initializeStats();
        
        if (activityTableBody && stats.recentActivity && stats.recentActivity.length > 0) {
            // Clear current content
            activityTableBody.innerHTML = '';
            
            // Add activities
            stats.recentActivity.forEach(activity => {
                const row = document.createElement('tr');
                row.className = 'transform transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700';
                
                // Determine icon and color based on activity type
                let iconClass, bgClass, typeLabel, statusLabel;
                
                switch (activity.type) {
                    case 'task':
                        iconClass = 'fas fa-check';
                        bgClass = 'bg-green-100 dark:bg-green-900/30';
                        typeLabel = 'Task';
                        break;
                    case 'focus':
                        iconClass = 'fas fa-clock';
                        bgClass = 'bg-primary-100 dark:bg-primary-900/30';
                        typeLabel = 'Focus';
                        break;
                    case 'note':
                        iconClass = 'fas fa-sticky-note';
                        bgClass = 'bg-purple-100 dark:bg-purple-900/30';
                        typeLabel = 'Note';
                        break;
                    default:
                        iconClass = 'fas fa-star';
                        bgClass = 'bg-gray-100 dark:bg-gray-900/30';
                        typeLabel = 'Other';
                }
                
                statusLabel = activity.status || 'Completed';
                
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10 ${bgClass} rounded-full flex items-center justify-center">
                                <i class="${iconClass} text-green-500 dark:text-green-400"></i>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900 dark:text-gray-100">${activity.title}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">${activity.category || ''}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgClass} text-green-800 dark:text-green-200">
                            ${typeLabel}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${activity.timestamp}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                            ${statusLabel}
                        </span>
                    </td>
                `;
                
                activityTableBody.appendChild(row);
            });
        }
    }
    
    // Handle theme changes to update chart colors
    const updateChartsForTheme = () => {
        const isDark = document.documentElement.classList.contains('dark');
        
        // Update text color for both charts
        if (window.weeklyChart) {
            window.weeklyChart.options.plugins.legend.labels = { color: isDark ? '#e5e7eb' : '#1f2937' };
            window.weeklyChart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            window.weeklyChart.options.scales.y.ticks = { color: isDark ? '#9ca3af' : '#4b5563' };
            window.weeklyChart.options.scales.x.ticks = { color: isDark ? '#9ca3af' : '#4b5563' };
            window.weeklyChart.update();
        }
        
        if (window.taskChart) {
            window.taskChart.options.plugins.legend.labels = { color: isDark ? '#e5e7eb' : '#1f2937' };
            window.taskChart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            window.taskChart.options.scales.y.ticks = { color: isDark ? '#9ca3af' : '#4b5563' };
            window.taskChart.options.scales.x.ticks = { color: isDark ? '#9ca3af' : '#4b5563' };
            window.taskChart.update();
        }
    };

    // Initial theme setup
    updateChartsForTheme();
    
    // Listen for theme changes
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Allow time for theme to change before updating charts
            setTimeout(updateChartsForTheme, 100);
        });
    }
    
    // Function to show toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-500 opacity-0 translate-y-8`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.remove('opacity-0', 'translate-y-8');
        }, 10);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-8');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    }
});