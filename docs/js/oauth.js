// Google OAuth Integration for Productivity Hub

// OAuth Configuration
const GOOGLE_CLIENT_ID = "671675605527-8eoq5m2nvp3bkiabicejjolo9fl9lau5.apps.googleusercontent.com";
let userProfile = null;

// Function to handle credential response from Google One Tap
function handleCredentialResponse(response) {
    // Decode the JWT token to get user info
    const responsePayload = parseJwt(response.credential);
    
    console.log("ID: " + responsePayload.sub);
    console.log("Name: " + responsePayload.name);
    console.log("Email: " + responsePayload.email);
    console.log("Profile Picture: " + responsePayload.picture);
    
    // Store user information
    userProfile = {
        id: responsePayload.sub,
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture
    };
    
    // Update UI to reflect logged in state
    updateUIForLoggedInUser(userProfile);
    
    // Store in local storage for persistence
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Show success toast
    showToast('Successfully logged in!');
    
    // Initialize Sheets API if needed
    if (typeof initializeSheetsAPI === 'function') {
        initializeSheetsAPI();
    }
}

// Parse JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}

// Update UI for logged in user
function updateUIForLoggedInUser(profile) {
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const loginBtn = document.getElementById('login-btn');
    
    // Update avatar
    userAvatar.innerHTML = '';
    const img = document.createElement('img');
    img.src = profile.picture;
    img.alt = profile.name;
    img.className = 'w-8 h-8 rounded-full';
    userAvatar.appendChild(img);
    
    // Update name
    userName.textContent = profile.name.split(' ')[0]; // First name only
    
    // Setup dropdown toggle
    loginBtn.addEventListener('click', toggleUserDropdown);
    
    // Setup logout handler
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }
}

// Toggle user dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('hidden');
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    // Clear user data
    userProfile = null;
    localStorage.removeItem('userProfile');
    
    // Reset UI
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    userAvatar.innerHTML = '<i class="fas fa-user text-gray-400 dark:text-gray-500"></i>';
    userName.textContent = 'Login';
    
    // Hide dropdown
    document.getElementById('user-dropdown').classList.add('hidden');
    
    // Show toast
    showToast('Logged out successfully');
    
    // Reload to reset Google One Tap
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Check for existing login on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in (from localStorage)
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
        userProfile = JSON.parse(storedProfile);
        updateUIForLoggedInUser(userProfile);
    }
    
    // Initialize Google Sign-In button
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
    });
    
    // Render the button 
    google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { 
            theme: "outline", 
            size: "large",
            type: "standard",
            shape: "rectangular",
            text: "signin_with",
            logo_alignment: "left"
        }
    );
    
    // Display One Tap if user is not logged in
    if (!userProfile) {
        google.accounts.id.prompt();
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('user-dropdown');
        const loginBtn = document.getElementById('login-btn');
        
        if (dropdown && !dropdown.classList.contains('hidden')) {
            if (!dropdown.contains(e.target) && !loginBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        }
    });
});