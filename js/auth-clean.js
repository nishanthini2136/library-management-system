// Clean Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    // Initialize select enhancements
    initSelectEnhancements();
    
    // Initialize form validation
    initFormValidation();
    
    // Initialize form submissions
    initFormSubmissions();
    
    // Initialize UI enhancements
    initUIEnhancements();
}

// Simple Select Enhancement
function initSelectEnhancements() {
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
        // Add focus/blur effects
        select.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        select.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
        
        // Add change event logging for debugging
        select.addEventListener('change', function() {
            console.log('Account type changed to:', this.value);
            
            // Update email field for admin login
            if (this.name === 'userType') {
                updateEmailFieldForUserType(this.value);
            }
        });
    });
}

// Update email field based on user type
function updateEmailFieldForUserType(userType) {
    const emailInput = document.getElementById('email');
    const emailLabel = document.getElementById('emailLabel');
    
    if (emailInput && emailLabel) {
        if (userType === 'admin') {
            emailLabel.textContent = 'Username';
            emailInput.placeholder = 'admin';
            emailInput.type = 'text';
        } else {
            emailLabel.textContent = 'Email';
            emailInput.placeholder = 'abc@gmail.com';
            emailInput.type = 'text'; // Keep as text to avoid validation issues
        }
    }
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('.login-form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
                if (this.value) {
                    validateField(this);
                }
            });
        });
        
        // Password confirmation validation
        const confirmPassword = form.querySelector('#confirmPassword');
        const password = form.querySelector('#password');
        
        if (confirmPassword && password) {
            confirmPassword.addEventListener('input', function() {
                validatePasswordMatch(password, confirmPassword);
            });
            
            password.addEventListener('input', function() {
                if (confirmPassword.value) {
                    validatePasswordMatch(password, confirmPassword);
                }
            });
        }
    });
}

function validateField(field) {
    const fieldGroup = field.closest('.form-group');
    let isValid = true;
    let errorMessage = '';
    
    // Clear existing validation
    clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && field.value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(field.value.replace(/[\s\-\(\)]/g, ''))) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Password validation
    if (field.id === 'password' && field.value) {
        if (field.value.length < 6) {
            isValid = false;
            errorMessage = 'Password must be at least 6 characters long';
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        showFieldSuccess(field);
    }
    
    return isValid;
}

function validatePasswordMatch(password, confirmPassword) {
    const isValid = password.value === confirmPassword.value;
    
    if (confirmPassword.value && !isValid) {
        showFieldError(confirmPassword, 'Passwords do not match');
    } else if (confirmPassword.value && isValid) {
        showFieldSuccess(confirmPassword);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    const fieldGroup = field.closest('.form-group');
    
    // Add error class
    fieldGroup.classList.add('error');
    fieldGroup.classList.remove('success');
    
    // Create or update error message
    let errorElement = fieldGroup.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        fieldGroup.appendChild(errorElement);
    }
    
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
}

function showFieldSuccess(field) {
    const fieldGroup = field.closest('.form-group');
    
    // Add success class
    fieldGroup.classList.add('success');
    fieldGroup.classList.remove('error');
    
    // Remove error message
    const errorElement = fieldGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function clearFieldError(field) {
    const fieldGroup = field.closest('.form-group');
    
    // Remove validation classes
    fieldGroup.classList.remove('error', 'success');
    
    // Remove error message
    const errorElement = fieldGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// Form Submissions
function initFormSubmissions() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.login-btn');
    const formData = new FormData(form);
    
    // Validate form
    if (!validateForm(form)) {
        return;
    }
    
    // Show loading state
    setButtonLoading(submitButton, true);
    
    try {
        // Determine login endpoint based on user type
        const userType = formData.get('userType');
        const loginEndpoint = userType === 'admin' ? '/api/admin/login' : '/api/login';
        
        console.log('Login attempt:', { userType, loginEndpoint });
        
        // Prepare login data based on user type
        const loginData = userType === 'admin' 
            ? {
                username: formData.get('email'), // Admin uses username instead of email
                password: formData.get('password')
            }
            : {
                email: formData.get('email'),
                password: formData.get('password')
            };
        
        console.log('Login data:', { ...loginData, password: '***' });
        
        const response = await fetch(loginEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        console.log('Login response:', { status: response.status, data });
        
        if (response.ok) {
            showSuccessMessage('Login successful! Redirecting...');
            
            // Redirect based on user type
            setTimeout(() => {
                if (formData.get('userType') === 'admin') {
                    window.location.href = '/admin-dashboard-modern.html';
                } else {
                    window.location.href = '/user-dashboard.html';
                }
            }, 1500);
        } else {
            console.error('Login failed:', data);
            showErrorMessage(data.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showErrorMessage('Network error. Please check your connection and try again.');
    } finally {
        setButtonLoading(submitButton, false);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.login-btn');
    const formData = new FormData(form);
    
    // Validate form
    if (!validateForm(form)) {
        return;
    }
    
    // Check password match
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showErrorMessage('Passwords do not match');
        return;
    }
    
    // Show loading state
    setButtonLoading(submitButton, true);
    
    try {
        // Map user types to the expected format
        const userTypeMapping = {
            'student': 'student',
            'faculty': 'faculty',
            'staff': 'student', // Staff treated as student type in backend
            'admin': 'admin'
        };
        
        const userType = formData.get('userType');
        const mappedUserType = userTypeMapping[userType] || 'student';
        
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                userType: mappedUserType,
                department: formData.get('department'),
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccessMessage('Account created successfully! Please log in.');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = '/user-login.html';
            }, 2000);
        } else {
            showErrorMessage(data.error || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showErrorMessage('Network error. Please check your connection and try again.');
    } finally {
        setButtonLoading(submitButton, false);
    }
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Check terms checkbox for signup
    const termsCheckbox = form.querySelector('input[name="terms"]');
    if (termsCheckbox && !termsCheckbox.checked) {
        showErrorMessage('Please accept the Terms of Service and Privacy Policy');
        isValid = false;
    }
    
    return isValid;
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Notification System
function showSuccessMessage(message) {
    showNotification(message, 'success');
}

function showErrorMessage(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    `;
    
    if (type === 'success') {
        notification.style.background = '#28a745';
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else {
        notification.style.background = '#dc3545';
        notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// UI Enhancements
function initUIEnhancements() {
    // Add focus effects to form elements
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-1px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
    
    // Simple keyboard enhancements
    document.addEventListener('keydown', function(e) {
        // Enter key on focused select opens dropdown
        if (e.key === 'Enter' && e.target.tagName === 'SELECT') {
            e.target.click();
        }
    });
}

// Auto-fill demo data (for development)
function fillDemoData() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && passwordInput) {
        emailInput.value = 'admin@library.com';
        passwordInput.value = 'admin123';
        
        // Trigger validation
        emailInput.dispatchEvent(new Event('input'));
        passwordInput.dispatchEvent(new Event('input'));
    }
}

// Expose demo function globally for testing
window.fillDemoData = fillDemoData;
