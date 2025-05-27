// User Authentication System for Productivity Hub
// Simple user selection with data synchronization to Google Sheets

// User Info for the 4 predefined users
let USERS = {
    'Lingeshwar': { 
        name: 'Lingeshwar',
        avatar: 'L'
    },
    'Vani': {
        name: 'Vani',
        avatar: 'V'
    },
    'Ruchika': {
        name: 'Ruchika',
        avatar: 'R'
    },
    'Rishi': {
        name: 'Rishi',
        avatar: 'R'
    }
};

// Google Sheets configuration
const SPREADSHEET_ID = '1fYcWHxZCOwgHpCpc4uta7piHMDHDsnkU8SePYIr2Wao';
const SHEET_NAME = 'UserData';

// Current user state
let currentUser = null;

// Initialize authentication system
function initAuth() {
    // Check if user is already logged in from session storage
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser(currentUser);
    }
    
    // Load any custom added users from localStorage
    loadCustomUsers();
    
    // Add event listeners for login/logout
    setupAuthListeners();
    
    // Set up Google Sheets API if user is logged in
    if (currentUser) {
        initGoogleSheetsAPI();
    }
}

// Load custom added users from localStorage
function loadCustomUsers() {
    const customUsers = localStorage.getItem('customUsers');
    if (customUsers) {
        const parsedUsers = JSON.parse(customUsers);
        USERS = {...USERS, ...parsedUsers};
    }
}

// Save custom users to localStorage
function saveCustomUsers() {
    // Filter out the predefined users to only save custom ones
    const predefinedUsernames = ['Lingeshwar', 'Vani', 'Ruchika', 'Rishi'];
    const customUsers = {};
    
    Object.keys(USERS).forEach(username => {
        if (!predefinedUsernames.includes(username)) {
            customUsers[username] = USERS[username];
        }
    });
    
    localStorage.setItem('customUsers', JSON.stringify(customUsers));
}

// Setup UI event listeners related to authentication
function setupAuthListeners() {
    const loginBtn = document.getElementById('login-btn');
    const logoutLink = document.getElementById('logout-link');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            if (!currentUser) {
                showUserSelectionModal();
            } else {
                userDropdown.classList.toggle('hidden');
            }
        });
    }
    
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (userDropdown && !e.target.closest('#user-menu')) {
            userDropdown.classList.add('hidden');
        }
    });
}

// Show user selection modal
function showUserSelectionModal() {
    // Check if modal already exists
    let modal = document.getElementById('user-selection-modal');
    
    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.id = 'user-selection-modal';
        modal.className = 'fixed inset-0 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 p-6 w-96 max-w-full animate-fadeIn">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Choose Your Profile</h2>
                    <button id="close-modal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition transform hover:rotate-90 duration-200" disabled aria-busy="true">Loading...</button>
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-3 max-h-80 overflow-y-auto" id="user-selection">
                    ${Object.values(USERS).map(user => `
                        <button class="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center hover:bg-primary-50 dark:hover:bg-gray-600 transition transform hover:scale-[1.02] duration-200 user-select-btn" data-user="${user.name}">
                            <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xl">
                                ${user.avatar}
                            </div>
                            <div class="ml-4 text-left flex-grow">
                                <p class="font-semibold text-lg">${user.name}</p>
                            </div>
                        </button>
                    `).join('')}
                </div>
                
                <div class="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button id="add-new-user-btn" class="w-full p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-900/50 transition transform hover:scale-[1.02] duration-200">
                        <i class="fas fa-plus-circle mr-2"></i> Add New User
                    </button>
                </div>
                
                <div class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Each user's data is stored separately in the connected spreadsheet
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('close-modal').addEventListener('click', function() {
            modal.remove();
        });
        
        // User selection buttons
        const userSelectButtons = modal.querySelectorAll('.user-select-btn');
        userSelectButtons.forEach(button => {
            button.addEventListener('click', function() {
                const userName = this.getAttribute('data-user');
                selectUser(userName);
                modal.remove();
            });
        });
        
        // Add new user button
        document.getElementById('add-new-user-btn').addEventListener('click', function() {
            showAddUserForm(modal);
        });
    }
}

// Show form to add a new user
function showAddUserForm(existingModal) {
    // Remove existing modal if it exists
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create new modal for adding a user
    const modal = document.createElement('div');
    modal.id = 'add-user-modal';
    modal.className = 'fixed inset-0 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 p-6 w-96 max-w-full animate-fadeIn">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Add New User</h2>
                <button id="close-modal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition transform hover:rotate-90 duration-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <form id="add-user-form" class="space-y-4">
                <div>
                    <label for="user-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input type="text" id="user-name" name="user-name" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required required>
                </div>
                
                <div>
                    <label for="user-avatar" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar Initial</label>
                    <input type="text" id="user-avatar" name="user-avatar" maxlength="1" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required required>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter a single letter for your avatar</p>
                </div>
                
                <div class="mt-6 flex space-x-3">
                    <button type="button" id="back-to-selection" class="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Back
                    </button>
                    <button type="submit" class="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition">
                        Create User
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-modal').addEventListener('click', function() {
        modal.remove();
    });
    
    document.getElementById('back-to-selection').addEventListener('click', function() {
        modal.remove();
        showUserSelectionModal();
    });
    
    // Form submission
    document.getElementById('add-user-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userName = document.getElementById('user-name').value.trim();
        const userAvatar = document.getElementById('user-avatar').value.trim().toUpperCase();
        
        // Validate
        if (!userName || !userAvatar) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Check if user already exists
        if (USERS[userName]) {
            showToast('A user with this name already exists', 'error');
            return;
        }
        
        // Add new user
        USERS[userName] = {
            name: userName,
            avatar: userAvatar
        };
        
        // Save to localStorage
        saveCustomUsers();
        
        // Close modal and select new user
        modal.remove();
        selectUser(userName);
        
        showToast(`User "${userName}" created successfully!`, 'success');
    });
}

// Select a user (login)
function selectUser(userName) {
    // Get user data
    const user = USERS[userName];
    if (!user) return;
    
    // Set current user 
    currentUser = user;
    
    // Save to session storage
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    updateUIForLoggedInUser(currentUser);
    
    // Initialize Google Sheets API to fetch user data
    initGoogleSheetsAPI();
    
    // Create toast notification
    showToast(`Welcome, ${currentUser.name}!`, 'success');
}

// Log out current user
function logoutUser() {
    // Clear current user
    currentUser = null;
    
    // Clear session storage
    sessionStorage.removeItem('currentUser');
    
    // Update UI
    const userNameElement = document.getElementById('user-name');
    const userAvatarElement = document.getElementById('user-avatar');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userNameElement) {
        userNameElement.textContent = 'Login';
    }
    
    if (userAvatarElement) {
        userAvatarElement.innerHTML = '<i class="fas fa-user text-gray-400 dark:text-gray-500"></i>';
        userAvatarElement.classList.remove('bg-primary-100', 'dark:bg-primary-900/30');
    }
    
    if (userDropdown) {
        userDropdown.classList.add('hidden');
    }
    
    // Show toast notification
    showToast('Logged out successfully', 'info');
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    const userNameElement = document.getElementById('user-name');
    const userAvatarElement = document.getElementById('user-avatar');
    
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
    
    if (userAvatarElement) {
        userAvatarElement.innerHTML = `<span class="text-primary-600 dark:text-primary-400 font-bold">${user.avatar}</span>`;
        userAvatarElement.classList.add('bg-primary-100');
        userAvatarElement.classList.add('dark:bg-primary-900/30');
    }
}

// Load user data from Google Sheets
function loadUserData(userName) {
    if (!gapi.client || !gapi.client.sheets) {
        console.error('Google Sheets API not loaded yet');
        // Initialize the API and try again
        initGoogleSheetsAPI().then(() => {
            setTimeout(() => loadUserData(userName), 1000);
        });
        return;
    }
    
    // Check if this user already has data in the sheet
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:C`
    }).then(response => {
        const data = response.result.values || [];
        let userFound = false;
        
        // Look for user's data block
        for (let i = 0; i < data.length; i++) {
            if (data[i][0] === userName) {
                userFound = true;
                break;
            }
        }
        
        if (!userFound) {
            // User not found, create data block
            createUserDataInSheet(userName);
        }
        
        // Load page-specific data
        loadPageData(userName);
    }).catch(error => {
        console.error('Error accessing spreadsheet:', error);
        showToast('Could not access your data. Please try again later.', 'error');
    });
}

// Create a new user data block in the spreadsheet
function createUserDataInSheet(userName) {
    if (!gapi.client || !gapi.client.sheets) {
        console.error('Google Sheets API not loaded yet');
        return Promise.reject('Sheets API not loaded');
    }
    
    // Get the last row to append data
    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:A`
    }).then(response => {
        const values = response.result.values || [];
        const lastRow = values.length + 1;
        
        // Create initial user data structure
        const userData = [
            [userName, '===USER DATA BLOCK===', new Date().toISOString()], // Header
            ['', 'Pomodoro Sessions', '0'],
            ['', 'Tasks Completed', '0'],
            ['', 'Focus Minutes', '0'],
            ['', 'Created Date', new Date().toLocaleDateString()]
        ];
        
        // Append data to sheet
        return gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A${lastRow}:C${lastRow + userData.length - 1}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: userData }
        });
    }).then(() => {
        console.log(`Created data block for user: ${userName}`);
        return true;
    }).catch(error => {
        console.error('Error creating user data:', error);
        showToast('Failed to create your data profile. Please try again.', 'error');
        return Promise.reject(error);
    });
}

// Load data specific to the current page
function loadPageData(userName) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'index.html':
        case '': 
            loadDashboardData(userName);
            break;
        case 'progress-tracker.html':
            loadProgressData(userName);
            break;
        case 'learning-hub.html':
            loadLearningData(userName);
            break;
        case 'motivation-board.html':
            loadMotivationData(userName);
            break;
        // Add more pages as needed
    }
}

// Load dashboard data
function loadDashboardData(userName) {
    fetchUserData(userName).then(userData => {
        if (!userData || !userData.length) return;
        
        // Update dashboard UI with user data
        userData.forEach(row => {
            if (!row || row.length < 3) return;
            
            const metric = row[1];
            const value = row[2];
            
            switch(metric) {
                case 'Pomodoro Sessions':
                    document.querySelectorAll('.pomodoro-count, #timer-count').forEach(el => {
                        if (el) el.textContent = value;
                    });
                    break;
                case 'Tasks Completed':
                    document.querySelectorAll('.tasks-count, #tasks-count').forEach(el => {
                        if (el) el.textContent = value;
                    });
                    break;
                case 'Focus Minutes':
                    document.querySelectorAll('.focus-minutes, #focus-minutes').forEach(el => {
                        if (el) el.textContent = value;
                    });
                    break;
            }
        });
    });
}

// Load progress tracker data
function loadProgressData(userName) {
    fetchUserData(userName).then(userData => {
        if (!userData || !userData.length) return;
        
        // Update progress tracker UI with user data
        // This will depend on the structure of your progress tracker page
    });
}

// Load learning hub data
function loadLearningData(userName) {
    fetchUserData(userName).then(userData => {
        if (!userData || !userData.length) return;
        
        // Update learning hub UI with user data
    });
}

// Load motivation board data
function loadMotivationData(userName) {
    fetchUserData(userName).then(userData => {
        if (!userData || !userData.length) return;
        
        // Update motivation board UI with user data
    });
}

// Fetch all data for a specific user
function fetchUserData(userName) {
    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:C`
    }).then(response => {
        const data = response.result.values || [];
        const userData = [];
        let inUserBlock = false;
        
        // Extract user's data block
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            
            // Start of user block
            if (row[0] === userName) {
                inUserBlock = true;
                userData.push(row);
                continue;
            }
            
            // Inside user block
            if (inUserBlock) {
                // End of user block if we find another user or empty row
                if (row[0] && Object.keys(USERS).includes(row[0])) {
                    break;
                }
                
                // Add data row
                userData.push(row);
            }
        }
        
        return userData;
    }).catch(error => {
        console.error('Error fetching user data:', error);
        return [];
    });
}

// Save or update a metric for the current user
function saveUserMetric(metricName, value) {
    if (!currentUser) {
        console.error('No user logged in');
        return Promise.reject('No user logged in');
    }
    
    return fetchUserData(currentUser.name).then(userData => {
        if (!userData.length) {
            return createUserDataInSheet(currentUser.name).then(() => {
                return saveUserMetric(metricName, value);
            });
        }
        
        // Find the metric row
        let metricRowIndex = -1;
        for (let i = 0; i < userData.length; i++) {
            if (userData[i][1] === metricName) {
                metricRowIndex = i;
                break;
            }
        }
        
        // Find the actual row in the sheet
        return gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:A`
        }).then(response => {
            const allData = response.result.values || [];
            
            // Find the start row of the user's data
            let userRowStart = -1;
            for (let i = 0; i < allData.length; i++) {
                if (allData[i][0] === currentUser.name) {
                    userRowStart = i + 1; // 1-based index for API
                    break;
                }
            }
            
            if (userRowStart === -1) {
                return Promise.reject('User data not found');
            }
            
            if (metricRowIndex === -1) {
                // Metric not found, add new row
                // Find the end of user's data
                let userRowEnd = userRowStart;
                for (let i = userRowStart; i < allData.length; i++) {
                    if (allData[i] && allData[i][0] && Object.keys(USERS).includes(allData[i][0])) {
                        break;
                    }
                    userRowEnd = i + 1;
                }
                
                // Add new row
                return gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${SHEET_NAME}!A${userRowEnd + 1}:C${userRowEnd + 1}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [['', metricName, value]]
                    }
                });
            } else {
                // Update existing metric
                const actualRow = userRowStart + metricRowIndex;
                return gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${SHEET_NAME}!C${actualRow}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [[value]]
                    }
                });
            }
        });
    }).then(() => {
        console.log(`Saved ${metricName}: ${value}`);
        return true;
    }).catch(error => {
        console.error('Error saving data:', error);
        return false;
    });
}

// Increment a numeric metric (e.g., Pomodoro Sessions)
function incrementUserMetric(metricName, amount = 1) {
    if (!currentUser) {
        console.error('No user logged in');
        return Promise.reject('No user logged in');
    }
    
    return fetchUserData(currentUser.name).then(userData => {
        // Find the metric
        let currentValue = "0";
        for (let i = 0; i < userData.length; i++) {
            if (userData[i][1] === metricName) {
                currentValue = userData[i][2] || "0";
                break;
            }
        }
        
        // Increment and save
        const newValue = (parseInt(currentValue) || 0) + amount;
        return saveUserMetric(metricName, newValue.toString());
    });
}

// Function to show toast notifications
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    
    // Set appropriate classes based on type
    const colorClasses = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'info': 'bg-blue-500',
        'warning': 'bg-yellow-500'
    };
    
    const iconClasses = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle',
        'warning': 'fa-exclamation-triangle'
    };
    
    toast.className = `toast ${colorClasses[type] || colorClasses.info}`;
    toast.innerHTML = `
        <i class="fas ${iconClasses[type] || iconClasses.info} mr-2"></i>
        <span>${message}</span>
    `;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Show the toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Helper function to initialize Google Sheets API
function initGoogleSheetsAPI() {
    if (typeof gapi === 'undefined') {
        console.error('Google API not loaded');
        return Promise.reject('Google API not loaded');
    }
    
    return new Promise((resolve, reject) => {
        gapi.load('client', () => {
            gapi.client.init({
                apiKey: 'process.env.USER-AUTH_JS_API_KEY',
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            }).then(() => {
                console.log('Google Sheets API initialized');
                
                // Load user data if logged in
                if (currentUser) {
                    loadUserData(currentUser.name);
                }
                
                resolve();
            }).catch(error => {
                console.error('Error initializing Google Sheets API', error);
                reject(error);
            });
        });
    });
}

// Make functions available globally
window.userAuth = {
    selectUser,
    logoutUser,
    saveUserMetric,
    incrementUserMetric,
    getCurrentUser: () => currentUser
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure other scripts have loaded
    setTimeout(initAuth, 500);
});