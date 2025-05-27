// To-Do List JavaScript for Productivity Hub

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo');
    const tasksContainer = document.getElementById('tasks-container');
    const emptyState = document.getElementById('empty-state');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const tasksCount = document.getElementById('tasks-count');
    const completedTasksCount = document.getElementById('completed-tasks-count');
    const taskFilters = document.querySelectorAll('.task-filter');
    const sortTasksSelect = document.getElementById('sort-tasks');
    const listInput = document.getElementById('list-input');
    const addListBtn = document.getElementById('add-list');
    const listsContainer = document.getElementById('lists-container');
    const taskTip = document.getElementById('task-tip');
    const newTaskTip = document.getElementById('new-task-tip');
    
    // Task management variables
    let tasks = [];
    let currentFilter = 'all';
    let currentSort = 'dateAdded';
    let currentList = 'all';
    let lists = [
        { id: 'all', name: 'All Tasks', icon: 'inbox', color: 'blue' },
        { id: 'important', name: 'Important', icon: 'star', color: 'yellow' },
        { id: 'personal', name: 'Personal', icon: 'home', color: 'green' },
        { id: 'work', name: 'Work', icon: 'briefcase', color: 'purple' }
    ];
    
    // Task tips
    const tips = [
        "Use the 'Eat That Frog' technique: Start your day by tackling your most challenging task first to build momentum.",
        "Try the 2-minute rule: If a task takes less than 2 minutes, do it immediately rather than adding it to your list.",
        "Break large tasks into smaller, actionable items to make them less overwhelming.",
        "Set specific deadlines for tasks to create urgency and avoid procrastination.",
        "Review your task list at the end of each day and prioritize tasks for tomorrow.",
        "Use the Eisenhower Matrix: Categorize tasks as urgent/important, important/not urgent, urgent/not important, or neither.",
        "Schedule focused work blocks in your calendar to protect time for high-priority tasks.",
        "Limit your daily to-do list to 3-5 important tasks to prevent overwhelm.",
        "Consider task batching: Group similar tasks together to complete them more efficiently.",
        "Regularly purge your task list of items that are no longer relevant or valuable."
    ];
    
    // Initialize tasks from localStorage
    initializeTasks();
    
    // Initialize lists from localStorage
    initializeLists();
    
    // Display a random tip
    displayRandomTip();
    
    // Event listeners
    addTodoBtn.addEventListener('click', addTask);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Filter tasks
    taskFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            currentFilter = this.dataset.filter;
            
            // Update active filter button
            taskFilters.forEach(f => f.classList.remove('active', 'bg-green-100', 'dark:bg-green-900', 'text-green-800', 'dark:text-green-200'));
            taskFilters.forEach(f => f.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200'));
            
            this.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-200');
            this.classList.add('active', 'bg-green-100', 'dark:bg-green-900', 'text-green-800', 'dark:text-green-200');
            
            renderTasks();
        });
    });
    
    // Sort tasks
    sortTasksSelect.addEventListener('change', function() {
        currentSort = this.value;
        renderTasks();
    });
    
    // Add new list
    addListBtn.addEventListener('click', addNewList);
    listInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewList();
        }
    });
    
    // New task tip
    newTaskTip.addEventListener('click', displayRandomTip);
    
    // Add task function
    function addTask() {
        const text = todoInput.value.trim();
        if (text === '') return;
        
        // Create new task object
        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            dateAdded: new Date().toISOString(),
            priority: 'medium', // Default priority
            list: currentList === 'all' ? 'personal' : currentList // Default list
        };
        
        // Add to tasks array
        tasks.push(newTask);
        
        // Save to localStorage
        saveTasks();
        
        // Clear input
        todoInput.value = '';
        todoInput.focus();
        
        // Render tasks
        renderTasks();
        
        // Show toast
        showToast('Task added!');
        
        // Track with user authentication if available
        trackTaskActivity('added');
    }
    
    // Render tasks function
    function renderTasks() {
        // Apply filter
        let filteredTasks = tasks;
        
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Apply list filter (if not "all")
        if (currentList !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.list === currentList);
        }
        
        // Apply sort
        filteredTasks = sortTasks(filteredTasks, currentSort);
        
        // Clear container
        tasksContainer.innerHTML = '';
        
        // Show empty state if no tasks
        if (filteredTasks.length === 0) {
            if (emptyState) {
                tasksContainer.appendChild(emptyState.cloneNode(true));
            } else {
                tasksContainer.innerHTML = `
                    <div class="text-center py-10">
                        <img src="https://cdn-icons-png.flaticon.com/512/5726/5726532.png" class="w-24 h-24 mx-auto mb-4 opacity-20" alt="Empty tasks">
                        <h3 class="text-xl font-medium text-gray-500 dark:text-gray-400">No tasks yet</h3>
                        <p class="text-gray-400 dark:text-gray-500 mt-1">Add your first task above to get started</p>
                    </div>
                `;
            }
        } else {
            // Render each task
            filteredTasks.forEach(task => {
                const taskElement = createTaskElement(task);
                tasksContainer.appendChild(taskElement);
            });
        }
        
        // Update task count
        updateTaskCount();
    }
    
    // Create task element
    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition transform hover:scale-[1.01] duration-200';
        taskElement.dataset.id = task.id;
        
        // Get priority color
        const priorityColor = getPriorityColor(task.priority);
        
        taskElement.innerHTML = `
            <div class="flex items-center">
                <input type="checkbox" class="mr-3 h-5 w-5 text-green-500 rounded border-gray-300 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800" ${task.completed ? 'checked' : ''} required>
                <span class="${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}">${task.text}</span>
            </div>
            <div class="flex items-center space-x-2">
                <span class="text-xs py-0.5 px-2 ${priorityColor} rounded-full">${task.priority}</span>
                <button class="task-menu-btn text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" disabled aria-busy="true">Loading...</button>
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const checkbox = taskElement.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            toggleTaskCompletion(task.id);
        });
        
        const menuButton = taskElement.querySelector('.task-menu-btn');
        menuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            showTaskMenu(task, menuButton);
        });
        
        return taskElement;
    }
    
    // Toggle task completion
    function toggleTaskCompletion(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
            
            // Show toast
            const task = tasks[taskIndex];
            if (task.completed) {
                showToast('Task completed!', 'success');
                trackTaskActivity('completed');
            } else {
                showToast('Task marked incomplete', 'info');
            }
        }
    }
    
    // Show task menu
    function showTaskMenu(task, buttonElement) {
        // Remove any existing menus
        const existingMenu = document.querySelector('.task-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Create menu
        const menu = document.createElement('div');
        menu.className = 'task-menu absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 animate-fadeIn';
        
        // Position menu relative to button
        const buttonRect = buttonElement.getBoundingClientRect();
        menu.style.top = `${buttonRect.bottom + window.scrollY}px`;
        menu.style.right = `${window.innerWidth - buttonRect.right}px`;
        
        // Menu items
        menu.innerHTML = `
            <button class="edit-task block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="fas fa-edit mr-2"></i> Edit
            </button>
            <div class="priority-submenu">
                <button class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <i class="fas fa-flag mr-2"></i> Set Priority <i class="fas fa-chevron-right ml-2 float-right mt-1"></i>
                </button>
                <div class="hidden absolute left-full top-0 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 -mt-10">
                    <button data-priority="high" class="priority-option block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i class="fas fa-circle text-red-500 mr-2"></i> High
                    </button>
                    <button data-priority="medium" class="priority-option block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i class="fas fa-circle text-yellow-500 mr-2"></i> Medium
                    </button>
                    <button data-priority="low" class="priority-option block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i class="fas fa-circle text-blue-500 mr-2"></i> Low
                    </button>
                </div>
            </div>
            <div class="list-submenu">
                <button class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <i class="fas fa-list mr-2"></i> Move to List <i class="fas fa-chevron-right ml-2 float-right mt-1"></i>
                </button>
                <div class="hidden absolute left-full top-0 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 -mt-28">
                    ${lists.filter(list => list.id !== 'all').map(list => `
                        <button data-list="${list.id}" class="list-option block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="fas fa-${list.icon} text-${list.color}-500 mr-2"></i> ${list.name}
                        </button>
                    `).join('')}
                </div>
            </div>
            <button class="delete-task block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                <i class="fas fa-trash mr-2"></i> Delete
            </button>
        `;
        
        // Add event listeners
        // Edit task
        menu.querySelector('.edit-task').addEventListener('click', function() {
            editTask(task);
            menu.remove();
        });
        
        // Priority submenu
        const prioritySubmenu = menu.querySelector('.priority-submenu');
        prioritySubmenu.addEventListener('mouseenter', function() {
            this.querySelector('div').classList.remove('hidden');
        });
        prioritySubmenu.addEventListener('mouseleave', function() {
            this.querySelector('div').classList.add('hidden');
        });
        
        // Priority options
        prioritySubmenu.querySelectorAll('.priority-option').forEach(option => {
            option.addEventListener('click', function() {
                const priority = this.dataset.priority;
                setTaskPriority(task.id, priority);
                menu.remove();
            });
        });
        
        // List submenu
        const listSubmenu = menu.querySelector('.list-submenu');
        listSubmenu.addEventListener('mouseenter', function() {
            this.querySelector('div').classList.remove('hidden');
        });
        listSubmenu.addEventListener('mouseleave', function() {
            this.querySelector('div').classList.add('hidden');
        });
        
        // List options
        listSubmenu.querySelectorAll('.list-option').forEach(option => {
            option.addEventListener('click', function() {
                const list = this.dataset.list;
                moveTaskToList(task.id, list);
                menu.remove();
            });
        });
        
        // Delete task
        menu.querySelector('.delete-task').addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(task.id);
                menu.remove();
            }
        });
        
        // Add to document
        document.body.appendChild(menu);
        
        // Close menu when clicking outside
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== buttonElement) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }
    
    // Edit task
    function editTask(task) {
        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            const taskIndex = tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
                tasks[taskIndex].text = newText.trim();
                saveTasks();
                renderTasks();
                showToast('Task updated!', 'info');
            }
        }
    }
    
    // Set task priority
    function setTaskPriority(taskId, priority) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].priority = priority;
            saveTasks();
            renderTasks();
            showToast(`Priority set to ${priority}`, 'info');
        }
    }
    
    // Move task to list
    function moveTaskToList(taskId, listId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].list = listId;
            saveTasks();
            renderTasks();
            
            // Get list name
            const list = lists.find(l => l.id === listId);
            showToast(`Moved to ${list.name}`, 'info');
        }
    }
    
    // Delete task
    function deleteTask(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            saveTasks();
            renderTasks();
            showToast('Task deleted', 'error');
            
            // Track task deletion
            trackTaskActivity('deleted');
        }
    }
    
    // Clear completed tasks
    function clearCompletedTasks() {
        const completedCount = tasks.filter(task => task.completed).length;
        if (completedCount === 0) {
            showToast('No completed tasks to clear', 'info');
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
            showToast('Completed tasks cleared', 'success');
        }
    }
    
    // Update task count
    function updateTaskCount() {
        // Update main tasks count
        if (tasksCount) {
            const count = tasks.length;
            tasksCount.textContent = `${count} task${count !== 1 ? 's' : ''}`;
        }
        
        // Update completed tasks count
        if (completedTasksCount) {
            const count = tasks.filter(task => task.completed).length;
            completedTasksCount.textContent = `${count} Completed today`;
        }
        
        // Update list counts
        updateListCounts();
    }
    
    // Sort tasks
    function sortTasks(taskList, sortBy) {
        switch (sortBy) {
            case 'alphabetical':
                return [...taskList].sort((a, b) => a.text.localeCompare(b.text));
            case 'priority':
                return [...taskList].sort((a, b) => {
                    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                });
            case 'dateAdded':
            default:
                return [...taskList].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        }
    }
    
    // Get priority color
    function getPriorityColor(priority) {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'low':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    }
    
    // Add new list
    function addNewList() {
        const listName = listInput.value.trim();
        if (listName === '') return;
        
        // Create list ID (lowercase, no spaces)
        const listId = listName.toLowerCase().replace(/\s+/g, '-');
        
        // Check if list already exists
        if (lists.some(list => list.id === listId)) {
            showToast('A list with this name already exists', 'error');
            return;
        }
        
        // Add new list
        const newList = {
            id: listId,
            name: listName,
            icon: 'list', // Default icon
            color: 'gray' // Default color
        };
        
        lists.push(newList);
        saveLists();
        renderLists();
        
        // Clear input
        listInput.value = '';
        listInput.focus();
        
        // Show toast
        showToast('List added!');
    }
    
    // Render lists
    function renderLists() {
        if (!listsContainer) return;
        
        // Clear container
        listsContainer.innerHTML = '';
        
        // Render each list
        lists.forEach(list => {
            const listElement = document.createElement('button');
            listElement.className = `w-full text-left px-3 py-2 rounded-lg ${list.id === currentList ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} flex items-center justify-between transform hover:translate-x-1 duration-200`;
            listElement.dataset.list = list.id;
            
            // Count tasks in this list
            const taskCount = list.id === 'all' 
                ? tasks.length 
                : tasks.filter(task => task.list === list.id).length;
            
            listElement.innerHTML = `
                <span>
                    <i class="fas fa-${list.icon} mr-2 text-${list.color}-500"></i>
                    ${list.name}
                </span>
                <span class="bg-${list.id === currentList ? 'blue' : 'gray'}-100 dark:bg-${list.id === currentList ? 'blue' : 'gray'}-800 text-${list.id === currentList ? 'blue' : 'gray'}-800 dark:text-${list.id === currentList ? 'blue' : 'gray'}-200 rounded-full px-2 py-0.5 text-xs">
                    ${taskCount}
                </span>
            `;
            
            // Add event listener
            listElement.addEventListener('click', function() {
                currentList = this.dataset.list;
                
                // Update active list
                document.querySelectorAll('#lists-container button').forEach(btn => {
                    btn.classList.remove('bg-blue-50', 'dark:bg-blue-900/30', 'text-blue-800', 'dark:text-blue-200', 'font-medium');
                    btn.classList.add('hover:bg-gray-100', 'dark:hover:bg-gray-700');
                    
                    // Update count pill
                    const countPill = btn.querySelector('span:last-child');
                    if (countPill) {
                        countPill.className = 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full px-2 py-0.5 text-xs';
                    }
                });
                
                this.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-700');
                this.classList.add('bg-blue-50', 'dark:bg-blue-900/30', 'text-blue-800', 'dark:text-blue-200', 'font-medium');
                
                // Update count pill
                const countPill = this.querySelector('span:last-child');
                if (countPill) {
                    countPill.className = 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full px-2 py-0.5 text-xs';
                }
                
                // Render tasks for this list
                renderTasks();
            });
            
            listsContainer.appendChild(listElement);
        });
    }
    
    // Update list counts
    function updateListCounts() {
        if (!listsContainer) return;
        
        lists.forEach(list => {
            const listElement = listsContainer.querySelector(`button[data-list="${list.id}"]`);
            if (!listElement) return;
            
            // Count tasks in this list
            const taskCount = list.id === 'all' 
                ? tasks.length 
                : tasks.filter(task => task.list === list.id).length;
            
            // Update count
            const countElement = listElement.querySelector('span:last-child');
            if (countElement) {
                countElement.textContent = taskCount;
            }
        });
    }
    
    // Initialize tasks from localStorage
    function initializeTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        } else {
            // Default tasks
            tasks = [
                {
                    id: '1',
                    text: 'Complete project proposal',
                    completed: false,
                    dateAdded: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                    priority: 'high',
                    list: 'work'
                },
                {
                    id: '2',
                    text: 'Set up weekly meeting',
                    completed: false,
                    dateAdded: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
                    priority: 'medium',
                    list: 'work'
                },
                {
                    id: '3',
                    text: 'Review client feedback',
                    completed: true,
                    dateAdded: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
                    priority: 'low',
                    list: 'work'
                },
                {
                    id: '4',
                    text: 'Book flight tickets',
                    completed: false,
                    dateAdded: new Date().toISOString(),
                    priority: 'medium',
                    list: 'personal'
                }
            ];
            
            // Save default tasks
            saveTasks();
        }
        
        // Render tasks
        renderTasks();
    }
    
    // Initialize lists from localStorage
    function initializeLists() {
        const savedLists = localStorage.getItem('lists');
        if (savedLists) {
            lists = JSON.parse(savedLists);
        }
        
        // Render lists
        renderLists();
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Save lists to localStorage
    function saveLists() {
        localStorage.setItem('lists', JSON.stringify(lists));
    }
    
    // Display a random tip
    function displayRandomTip() {
        if (!taskTip) return;
        
        const randomIndex = Math.floor(Math.random() * tips.length);
        taskTip.innerHTML = `<p>${tips[randomIndex]}</p>`;
    }
    
    // Track task activity with user authentication
    function trackTaskActivity(action) {
        // If user authentication is available, track activity
        if (window.userAuth && window.userAuth.getCurrentUser()) {
            const userData = window.userAuth.getCurrentUser();
            
            // If tracking completion, increment the counter
            if (action === 'completed' && window.sheetsAPI) {
                window.sheetsAPI.incrementMetric(userData.name, 'Tasks Completed');
                window.sheetsAPI.saveCompletedTask(userData.name, 'Task completed');
            }
        }
    }
});