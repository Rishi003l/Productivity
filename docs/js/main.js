// Main JavaScript for Productivity Hub

document.addEventListener('DOMContentLoaded', () => {
    initializeSidebar();
    initializeToastNotifications();
    // Login button is now handled by user-auth.js
    checkActivePage();
    
    // Initialize app features based on current page
    const currentPage = getCurrentPage();
    switch (currentPage) {
        case 'index':
            initializeDashboard();
            break;
        case 'pomodoro-timer':
            // Pomodoro scripts loaded separately
            break;
        case 'todo-list':
            // Todo scripts loaded separately
            break;
        case 'ai-assistant':
            // AI Assistant scripts loaded separately
            break;
        default:
            // Other pages
            break;
    }
});

// Initialize sidebar functionality
function initializeSidebar() {
    const sidebarToggle = document.getElementById('collapse-sidebar');
    const sidebar = document.getElementById('sidebar');
    
    if (!sidebarToggle || !sidebar) return;
    
    // Check if sidebar was collapsed in previous session
    const sidebarState = localStorage.getItem('sidebarCollapsed');
    if (sidebarState === 'true') {
        sidebar.classList.add('sidebar-collapsed');
        updateSidebarToggleIcon(true);
    }
    
    sidebarToggle.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.toggle('sidebar-collapsed');
        updateSidebarToggleIcon(isCollapsed);
        
        // Save sidebar state to localStorage
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    });
    
    // Add hover effect to show sidebar briefly when collapsed
    sidebar.addEventListener('mouseenter', () => {
        if (sidebar.classList.contains('sidebar-collapsed')) {
            sidebar.classList.add('sidebar-hover');
        }
    });
    
    sidebar.addEventListener('mouseleave', () => {
        sidebar.classList.remove('sidebar-hover');
    });
}

// Update the sidebar toggle icon based on sidebar state
function updateSidebarToggleIcon(isCollapsed) {
    const sidebarToggle = document.getElementById('collapse-sidebar');
    if (!sidebarToggle) return;
    
    const icon = sidebarToggle.querySelector('i');
    if (!icon) return;
    
    if (isCollapsed) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
        
        // Create or show hamburger menu button at top left
        let hamburgerButton = document.getElementById('expand-sidebar');
        if (!hamburgerButton) {
            hamburgerButton = document.createElement('button');
            hamburgerButton.id = 'expand-sidebar';
            hamburgerButton.className = 'fixed p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300';
            hamburgerButton.style.top = '20px';
            hamburgerButton.style.left = '20px';
            hamburgerButton.innerHTML = '<i class="fas fa-bars text-gray-700 dark:text-gray-300"></i>';
            hamburgerButton.addEventListener('click', () => {
                // Toggle sidebar expansion
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.remove('sidebar-collapsed');
                    localStorage.setItem('sidebarCollapsed', 'false');
                    updateSidebarToggleIcon(false);
                    hamburgerButton.style.display = 'none';
                }
            });
            document.body.appendChild(hamburgerButton);
        } else {
            hamburgerButton.style.display = 'block';
        }
    } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
        
        // Hide hamburger menu
        const hamburgerButton = document.getElementById('expand-sidebar');
        if (hamburgerButton) {
            hamburgerButton.style.display = 'none';
        }
    }
}

// Get current page based on URL
function getCurrentPage() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().split('.')[0];
    return pageName || 'index';
}

// Check and set active page in sidebar
function checkActivePage() {
    const currentPage = getCurrentPage();
    
    // Find all sidebar links
    const sidebarLinks = document.querySelectorAll('#sidebar a');
    
    // Remove active class from all links
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        const linkPage = href.split('/').pop().split('.')[0];
        
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'index') || 
            (currentPage === 'index' && linkPage === 'index')) {
            // Add active class to current page link
            link.classList.add('bg-primary-50', 'text-primary-700', 'dark:bg-gray-700', 'dark:text-primary-300');
            link.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-700');
        } else {
            // Remove active class from other links
            link.classList.remove('bg-primary-50', 'text-primary-700', 'dark:bg-gray-700', 'dark:text-primary-300');
            link.classList.add('hover:bg-gray-100', 'dark:hover:bg-gray-700');
        }
    });
}

// Initialize toast notification functionality
function initializeToastNotifications() {
    // Create global showToast function
    window.showToast = function(message, type = 'success') {
        // Remove any existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        // Create icon based on type
        let icon;
        switch (type) {
            case 'error':
                icon = '<i class="fas fa-exclamation-circle mr-2"></i>';
                toast.style.backgroundColor = '#EF4444';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle mr-2"></i>';
                toast.style.backgroundColor = '#F59E0B';
                break;
            case 'info':
                icon = '<i class="fas fa-info-circle mr-2"></i>';
                toast.style.backgroundColor = '#3B82F6';
                break;
            default: // success
                icon = '<i class="fas fa-check-circle mr-2"></i>';
                toast.style.backgroundColor = '#10B981';
                break;
        }
        
        toast.innerHTML = `
            <div class="flex items-center">
                ${icon}
                ${message}
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide the toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    };
}

// Initialize dashboard page specific functionality
function initializeDashboard() {
    initializeDashboardPomodoro();
    initializeDashboardTodo();
    initializeDashboardQuotes();
}

// Initialize mini pomodoro on dashboard
function initializeDashboardPomodoro() {
    const timerDisplay = document.getElementById('timer');
    const startButton = document.getElementById('start-timer');
    const pauseButton = document.getElementById('pause-timer');
    const resetButton = document.getElementById('reset-timer');
    
    if (!timerDisplay || !startButton || !pauseButton || !resetButton) return;
    
    let timerInterval;
    let minutes = 25;
    let seconds = 0;
    let isRunning = false;
    
    function updateTimerDisplay() {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function startTimer() {
        if (isRunning) return;
        
        isRunning = true;
        startButton.classList.add('hidden');
        pauseButton.classList.remove('hidden');
        
        timerInterval = setInterval(() => {
            if (seconds > 0) {
                seconds--;
            } else if (minutes > 0) {
                minutes--;
                seconds = 59;
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                
                startButton.classList.remove('hidden');
                pauseButton.classList.add('hidden');
                
                // Play sound or show notification
                showToast('Pomodoro session complete!');
            }
            
            updateTimerDisplay();
        }, 1000);
    }
    
    function pauseTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        
        startButton.classList.remove('hidden');
        pauseButton.classList.add('hidden');
    }
    
    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        minutes = 25;
        seconds = 0;
        
        updateTimerDisplay();
        
        startButton.classList.remove('hidden');
        pauseButton.classList.add('hidden');
    }
    
    // Initially hide pause button
    pauseButton.classList.add('hidden');
    
    // Add event listeners
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
}

// Initialize mini todo list on dashboard
function initializeDashboardTodo() {
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');
    
    if (!todoInput || !addTodoBtn || !todoList) return;
    
    // Load todos from localStorage
    let todos = JSON.parse(localStorage.getItem('dashboardTodos') || '[]');
    
    function renderTodos() {
        todoList.innerHTML = '';
        
        if (todos.length === 0) {
            todoList.innerHTML = `
                <li class="text-center py-4 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-tasks mb-2 opacity-30 text-xl"></i>
                    <p>No tasks yet. Add one to get started!</p>
                </li>
            `;
            return;
        }
        
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg';
            
            li.innerHTML = `
                <div class="flex items-center">
                    <input type="checkbox" class="mr-2 h-4 w-4 text-green-500" ${todo.completed ? 'checked' : ''} data-index="${index}" required>
                    <span class="${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}">${todo.text}</span>
                </div>
                <button class="text-red-500 hover:text-red-700" data-index="${index}" disabled aria-busy="true">Loading...</button>
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            todoList.appendChild(li);
        });
        
        // Add event listeners to new elements
        document.querySelectorAll('#todo-list input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const index = this.dataset.index;
                todos[index].completed = this.checked;
                saveTodos();
                renderTodos();
            });
        });
        
        document.querySelectorAll('#todo-list button').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.dataset.index;
                todos.splice(index, 1);
                saveTodos();
                renderTodos();
            });
        });
    }
    
    function saveTodos() {
        localStorage.setItem('dashboardTodos', JSON.stringify(todos));
    }
    
    function addTodo() {
        const text = todoInput.value.trim();
        if (text) {
            todos.push({ text, completed: false });
            todoInput.value = '';
            saveTodos();
            renderTodos();
        }
    }
    
    // Initialize
    renderTodos();
    
    // Event listeners
    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
}

// Initialize daily quotes on dashboard
function initializeDashboardQuotes() {
    const quotes = [
        {
            text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
            author: "Stephen Covey"
        },
        {
            text: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
            author: "Paul J. Meyer"
        },
        {
            text: "It's not always that we need to do more but rather that we need to focus on less.",
            author: "Nathan W. Morris"
        },
        {
            text: "The way to get started is to quit talking and begin doing.",
            author: "Walt Disney"
        },
        {
            text: "Don't judge each day by the harvest you reap but by the seeds that you plant.",
            author: "Robert Louis Stevenson"
        },
        {
            text: "It is not the mountain we conquer, but ourselves.",
            author: "Edmund Hillary"
        },
        {
            text: "Either you run the day, or the day runs you.",
            author: "Jim Rohn"
        },
        {
            text: "The only way to do great work is to love what you do.",
            author: "Steve Jobs"
        }
    ];
    
    const quoteBlockquote = document.querySelector('blockquote');
    const quoteAuthor = document.querySelector('blockquote + p');
    
    if (!quoteBlockquote || !quoteAuthor) return;
    
    // Get a saved or new quote
    const today = new Date().toDateString();
    let savedQuote = localStorage.getItem('dailyQuote');
    let savedDate = localStorage.getItem('dailyQuoteDate');
    
    if (savedQuote && savedDate === today) {
        // Use the saved quote for today
        const quote = JSON.parse(savedQuote);
        quoteBlockquote.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `— ${quote.author}`;
    } else {
        // Get a new random quote
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        
        quoteBlockquote.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `— ${quote.author}`;
        
        // Save the quote for today
        localStorage.setItem('dailyQuote', JSON.stringify(quote));
        localStorage.setItem('dailyQuoteDate', today);
    }
}