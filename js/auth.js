// Authentication JavaScript for Library Management System

document.addEventListener('DOMContentLoaded', function() {
    // Password toggle functionality
    window.togglePassword = function() {
        const passwordInput = event.target.parentElement.querySelector('input[type="password"]');
        const icon = event.target.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };

    // Password strength checker
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strengthFill = document.getElementById('strengthFill');
            const strengthText = document.getElementById('strengthText');
            
            if (strengthFill && strengthText) {
                const strength = checkPasswordStrength(password);
                updatePasswordStrength(strength, strengthFill, strengthText);
            }
        });
    }

    // Password strength calculation
    function checkPasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score <= 2) return 'weak';
        if (score <= 4) return 'medium';
        return 'strong';
    }

    // Update password strength display
    function updatePasswordStrength(strength, strengthFill, strengthText) {
        strengthFill.className = `strength-fill ${strength}`;
        
        switch(strength) {
            case 'weak':
                strengthText.textContent = 'Weak password';
                strengthText.style.color = '#dc3545';
                break;
            case 'medium':
                strengthText.textContent = 'Medium strength password';
                strengthText.style.color = '#ffc107';
                break;
            case 'strong':
                strengthText.textContent = 'Strong password';
                strengthText.style.color = '#28a745';
                break;
        }
    }

    // Form validation
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const adminLoginForm = document.getElementById('adminLoginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Handle user login
    function handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember');
        const userType = formData.get('userType') || 'user';
        const libraryId = formData.get('libraryId');

        // Basic validation
        if (!email || !password) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (userType === 'user' && !libraryId) {
            showNotification('Please enter your Library Card ID', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Simulate login process
        showNotification('Logging in...', 'info');
        
        setTimeout(() => {
            // For demo purposes, simulate successful login
            if (userType === 'admin' || (email === 'admin@library.edu' && password === 'admin123')) {
                sessionStorage.setItem('role', 'admin');
                showNotification('Admin login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 800);
                return;
            }

            if (email && password) {
                sessionStorage.setItem('role', 'user');
                if (libraryId) {
                    localStorage.setItem('libraryCardId', libraryId);
                }
                showNotification('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
            } else {
                showNotification('Invalid email or password', 'error');
            }
        }, 600);
    }

    // Handle user signup
    function handleSignup(e) {
        e.preventDefault();
        
        const formData = new FormData(signupForm);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const userType = formData.get('userType');
        const phone = formData.get('phone');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const libraryId = formData.get('libraryId');
        const terms = formData.get('terms');

        // Validation
        if (!firstName || !lastName || !email || !userType || !phone || !password || !confirmPassword) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (userType === 'user' && !libraryId) {
            showNotification('Please enter your Library Card ID', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        if (password.length < 8) {
            showNotification('Password must be at least 8 characters long', 'error');
            return;
        }

        if (!terms) {
            showNotification('Please accept the terms and conditions', 'error');
            return;
        }

        // Persist library card for user accounts
        if (userType === 'user' && libraryId) {
            localStorage.setItem('libraryCardId', libraryId);
        }

        // Simulate signup process
        showNotification('Creating your account...', 'info');
        
        setTimeout(() => {
            showNotification('Account created successfully! Please log in.', 'success');
            setTimeout(() => {
                window.location.href = 'user-login.html';
            }, 2000);
        }, 1500);
    }

    // Handle admin login
    function handleAdminLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(adminLoginForm);
        const username = formData.get('username');
        const password = formData.get('password');
        const adminCode = formData.get('adminCode');

        // Validation
        if (!username || !password || !adminCode) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (adminCode !== 'ADMIN2024') {
            showNotification('Invalid admin code', 'error');
            return;
        }

        // Simulate admin login
        showNotification('Verifying admin credentials...', 'info');
        
        setTimeout(() => {
            showNotification('Admin login successful! Redirecting to dashboard...', 'success');
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1500);
        }, 1000);
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show/hide conditional fields based on user type
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    const libraryIdField = document.getElementById('libraryIdField');
    if (userTypeRadios.length > 0 && libraryIdField) {
        const updateVisibility = () => {
            const selected = document.querySelector('input[name="userType"]:checked');
            if (selected && selected.value === 'user') {
                libraryIdField.style.display = 'block';
            } else {
                libraryIdField.style.display = 'none';
            }
        };
        userTypeRadios.forEach(r => r.addEventListener('change', updateVisibility));
        updateVisibility();
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Get notification icon based on type
    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    // Get notification color based on type
    function getNotificationColor(type) {
        switch(type) {
            case 'success': return '#28a745';
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            default: return '#17a2b8';
        }
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: 1rem;
            opacity: 0.8;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
    `;
    document.head.appendChild(style);

    // Social login handlers
    const googleButtons = document.querySelectorAll('.btn-google');
    const microsoftButtons = document.querySelectorAll('.btn-microsoft');

    googleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Google authentication coming soon!', 'info');
        });
    });

    microsoftButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Microsoft authentication coming soon!', 'info');
        });
    });

    // Form input focus effects
    const formInputs = document.querySelectorAll('.input-group input, .input-group select');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Console message
    console.log('🔐 Authentication system loaded successfully!');

    // Role-based nav visibility (hide admin links for user)
    (function applyRoleNav() {
        const role = sessionStorage.getItem('role');
        const adminLinks = document.querySelectorAll('a[href*="admin"]');
        if (role === 'user') {
            adminLinks.forEach(a => a.style.display = 'none');
        }
    })();
});
