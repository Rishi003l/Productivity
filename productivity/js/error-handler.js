// Error handling and notifications for Productivity Hub

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    showToast(`An error occurred: ${event.error.message || 'Unknown error'}`, 'error');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showToast(`Promise error: ${event.reason.message || 'Unknown error'}`, 'error');
});

// Toast notification function
function showToast(message, type = 'success', duration = 3000) {
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
    toast.className = `mb-2 ${type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-amber-500' : 'bg-red-500'} text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-500 opacity-0 translate-y-8`;
    
    // Add icon based on type
    let icon = '';
    if (type === 'success') {
        icon = '<i class="fas fa-check-circle mr-2"></i>';
    } else if (type === 'warning') {
        icon = '<i class="fas fa-exclamation-triangle mr-2"></i>';
    } else {
        icon = '<i class="fas fa-times-circle mr-2"></i>';
    }
    
    toast.innerHTML = `<div class="flex items-center">${icon}<span>${message}</span></div>`;
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-8');
    }, 10);
    
    // Hide toast after duration
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-8');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 500);
    }, duration);
    
    // Add click to dismiss
    toast.addEventListener('click', () => {
        toast.classList.add('opacity-0', 'translate-y-8');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 500);
    });
    
    return toast;
}

// Data validation function
function validateData(data, schema) {
    const errors = [];
    
    for (const [key, rules] of Object.entries(schema)) {
        const value = data[key];
        
        // Check required fields
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${key} is required`);
            continue;
        }
        
        // Skip further validation if field is not required and value is empty
        if (!rules.required && (value === undefined || value === null || value === '')) {
            continue;
        }
        
        // Type validation
        if (rules.type && typeof value !== rules.type) {
            errors.push(`${key} must be a ${rules.type}`);
        }
        
        // Range validation for numbers
        if (rules.type === 'number' && (rules.min !== undefined || rules.max !== undefined)) {
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${key} must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${key} must be at most ${rules.max}`);
            }
        }
        
        // Length validation for strings
        if (rules.type === 'string' && (rules.minLength !== undefined || rules.maxLength !== undefined)) {
            if (rules.minLength !== undefined && value.length < rules.minLength) {
                errors.push(`${key} must be at least ${rules.minLength} characters`);
            }
            if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                errors.push(`${key} must be at most ${rules.maxLength} characters`);
            }
        }
        
        // Regex pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${key} format is invalid`);
        }
        
        // Custom validation
        if (rules.validate && typeof rules.validate === 'function') {
            const customError = rules.validate(value);
            if (customError) {
                errors.push(customError);
            }
        }
    }
    
    return errors;
}

// Try-catch wrapper for async functions
function tryCatch(fn) {
    return async function(...args) {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`Error in function ${fn.name}:`, error);
            showToast(`Error: ${error.message || 'Unknown error'}`, 'error');
            throw error;
        }
    };
}

// Expose functions globally
window.showToast = showToast;
window.validateData = validateData;
window.tryCatch = tryCatch;