// Modern Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    // Initialize password toggles
    initPasswordToggles();
    
    // Initialize password strength checker
    initPasswordStrength();
    
    // Initialize form validation
    initFormValidation();
    
    // Initialize form submissions
    initFormSubmissions();
    
    // Initialize animations
    initAnimations();
}

// Password Toggle Functionality
function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.password-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Global toggle function for backward compatibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.password-toggle');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Password Strength Checker
function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!passwordInput || !strengthFill || !strengthText) return;
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        // Remove existing classes
        strengthFill.classList.remove('weak', 'medium', 'strong');
        
        if (password.length === 0) {
            strengthFill.style.width = '0%';
            strengthText.textContent = 'Password strength';
            strengthText.style.color = '#666';
            return;
        }
        
        if (strength.score < 3) {
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Weak password';
            strengthText.style.color = '#ff6b6b';
        } else if (strength.score < 5) {
            strengthFill.classList.add('medium');
            strengthText.textContent = 'Medium strength';
            strengthText.style.color = '#ffa726';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Strong password';
            strengthText.style.color = '#66bb6a';
        }
    });
}

function calculatePasswordStrength(password) {
    let score = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
        longLength: password.length >= 12
    };
    
    Object.values(checks).forEach(check => {
        if (check) score++;
    });
    
    return { score, checks };
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('.auth-form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
        
        // Password confirmation validation
        const confirmPassword = form.querySelector('#confirmPassword');
        const password = form.querySelector('#password');
        
        if (confirmPassword && password) {
            confirmPassword.addEventListener('input', function() {
                validatePasswordMatch(password, confirmPassword);
            });
        }
    });
}

function validateField(field) {
    const fieldContainer = field.closest('.input-wrapper') || field.closest('.form-group');
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error
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
        const strength = calculatePasswordStrength(field.value);
        if (strength.score < 3) {
            isValid = false;
            errorMessage = 'Password is too weak. Use at least 8 characters with mixed case, numbers, and symbols';
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function validatePasswordMatch(password, confirmPassword) {
    const isValid = password.value === confirmPassword.value;
    
    if (confirmPassword.value && !isValid) {
        showFieldError(confirmPassword, 'Passwords do not match');
    } else {
        clearFieldError(confirmPassword);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    const fieldContainer = field.closest('.input-wrapper') || field.closest('.form-group');
    const inputField = field.closest('.input-field');
    
    // Add error class to input
    if (inputField) {
        inputField.style.borderColor = '#ff6b6b';
        inputField.style.boxShadow = '0 0 0 4px rgba(255, 107, 107, 0.1)';
    }
    
    // Create error message element
    let errorElement = fieldContainer.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.cssText = `
            color: #ff6b6b;
            font-size: 0.8rem;
            margin-top: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        `;
        fieldContainer.appendChild(errorElement);
    }
    
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
}

function clearFieldError(field) {
    const fieldContainer = field.closest('.input-wrapper') || field.closest('.form-group');
    const inputField = field.closest('.input-field');
    const errorElement = fieldContainer.querySelector('.error-message');
    
    // Remove error styling from input
    if (inputField) {
        inputField.style.borderColor = '';
        inputField.style.boxShadow = '';
    }
    
    // Remove error message
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
    const submitButton = form.querySelector('.btn-submit');
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
        
        const response = await fetch(loginEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
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
            showErrorMessage(data.error || 'Login failed. Please try again.');
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
    const submitButton = form.querySelector('.btn-submit');
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
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)';
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else {
        notification.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
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

// Animations
function initAnimations() {
    // Animate form elements on load
    const animateElements = document.querySelectorAll('.auth-card, .welcome-section');
    
    animateElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Add hover effects to form inputs
    const inputs = document.querySelectorAll('.input-field input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
}

// Removed social login handlers as they are no longer needed

// Utility function for info notifications
function showInfoMessage(message) {
    showNotification(message, 'info');
}

// Add info notification style
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
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)';
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
        notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    } else if (type === 'info') {
        notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
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
