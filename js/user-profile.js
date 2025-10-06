
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the user profile page
    initializeUserProfile();
});

function initializeUserProfile() {
    setupEventListeners();
    setupAvatarUpload();
    setupUserProfile();
}

// Set up event listeners
function setupEventListeners() {
    // User profile dropdown
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', toggleUserMenu);
    }
}

// Set up avatar upload
function setupAvatarUpload() {
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }
}

// Handle avatar upload
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const profileAvatar = document.getElementById('profileAvatar');
                const headerAvatar = document.querySelector('.user-profile .avatar');
                
                if (profileAvatar) {
                    profileAvatar.src = e.target.result;
                }
                if (headerAvatar) {
                    headerAvatar.src = e.target.result;
                }
                
                // Save to localStorage (in a real app, this would upload to server)
                localStorage.setItem('userAvatar', e.target.result);
                
                showNotification('Profile picture updated successfully!', 'success');
            };
            reader.readAsDataURL(file);
        } else {
            showNotification('Please select a valid image file.', 'error');
        }
    }
}

// Set up user profile
function setupUserProfile() {
    // Load user data from localStorage or API
    const userData = getUserData();
    if (userData) {
        updateUserInterface(userData);
    }
    
    // Load saved avatar if exists
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        const profileAvatar = document.getElementById('profileAvatar');
        const headerAvatar = document.querySelector('.user-profile .avatar');
        
        if (profileAvatar) {
            profileAvatar.src = savedAvatar;
        }
        if (headerAvatar) {
            headerAvatar.src = savedAvatar;
        }
    }
}

// Toggle user menu
function toggleUserMenu() {
    const menu = document.querySelector('.user-menu');
    if (!menu) {
        createUserMenu();
    } else {
        menu.remove();
    }
}

// Create user menu
function createUserMenu() {
    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.innerHTML = `
        <div class="user-menu-content">
            <a href="user-dashboard.html" class="menu-item">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
            </a>
            <a href="user-profile.html" class="menu-item">
                <i class="fas fa-user"></i>
                <span>My Profile</span>
            </a>
            <a href="#" class="menu-item">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
            </a>
            <a href="#" class="menu-item">
                <i class="fas fa-question-circle"></i>
                <span>Help</span>
            </a>
            <div class="menu-divider"></div>
            <a href="index.html" class="menu-item">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </a>
        </div>
    `;

    // Position the menu
    const userProfile = document.querySelector('.user-profile');
    const rect = userProfile.getBoundingClientRect();
    menu.style.cssText = `
        position: absolute;
        top: ${rect.bottom + 10}px;
        right: 20px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 1000;
        min-width: 200px;
        animation: slideDown 0.3s ease;
    `;

    document.body.appendChild(menu);

    // Add menu styles
    if (!document.getElementById('user-menu-styles')) {
        const style = document.createElement('style');
        style.id = 'user-menu-styles';
        style.textContent = `
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .user-menu-content {
                padding: 0.5rem 0;
            }
            
            .menu-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1rem;
                color: #333;
                text-decoration: none;
                transition: background 0.3s ease;
            }
            
            .menu-item:hover {
                background: #f8f9fa;
            }
            
            .menu-item i {
                color: #667eea;
                width: 16px;
            }
            
            .menu-divider {
                height: 1px;
                background: #e1e5e9;
                margin: 0.5rem 0;
            }
        `;
        document.head.appendChild(style);
    }

    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!userProfile.contains(e.target) && !menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Get user data
function getUserData() {
    // In a real app, this would come from an API or localStorage
    return {
        name: 'John Doe',
        email: 'john.doe@university.edu',
        userType: 'Student',
        studentId: 'STU2024001',
        avatar: 'images/user-avatar.png'
    };
}

// Update user interface
function updateUserInterface(userData) {
    const userNameElements = document.querySelectorAll('.user-profile span');
    userNameElements.forEach(element => {
        element.textContent = userData.name;
    });
}

// Edit functions
window.editPersonalInfo = function() {
    showEditModal('Personal Information', createPersonalInfoForm(), handlePersonalInfoSave);
};

window.editAcademicInfo = function() {
    showEditModal('Academic Information', createAcademicInfoForm(), handleAcademicInfoSave);
};

window.editPreferences = function() {
    showEditModal('Library Preferences', createPreferencesForm(), handlePreferencesSave);
};

window.changePassword = function() {
    showEditModal('Change Password', createPasswordForm(), handlePasswordChange);
};

window.toggle2FA = function() {
    if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
        showNotification('Two-factor authentication disabled successfully!', 'success');
        // In a real app, this would make an API call
        update2FAStatus(false);
    }
};

window.manageSessions = function() {
    showSessionsModal();
};

window.viewDetailedAnalytics = function() {
    showNotification('Detailed analytics page coming soon!', 'info');
};

// Create form functions
function createPersonalInfoForm() {
    return `
        <form id="personalInfoForm">
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" value="John Doe" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" value="john.doe@university.edu" required>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value="+1 (555) 123-4567" required>
            </div>
            <div class="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" value="2000-03-15" required>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea name="address" rows="3" required>123 University Ave, College Town, ST 12345</textarea>
            </div>
        </form>
    `;
}

function createAcademicInfoForm() {
    return `
        <form id="academicInfoForm">
            <div class="form-group">
                <label>Program</label>
                <select name="program" required>
                    <option value="Bachelor of Computer Science" selected>Bachelor of Computer Science</option>
                    <option value="Bachelor of Engineering">Bachelor of Engineering</option>
                    <option value="Bachelor of Arts">Bachelor of Arts</option>
                    <option value="Bachelor of Science">Bachelor of Science</option>
                </select>
            </div>
            <div class="form-group">
                <label>Year Level</label>
                <select name="yearLevel" required>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year" selected>4th Year</option>
                </select>
            </div>
            <div class="form-group">
                <label>Department</label>
                <input type="text" name="department" value="Computer Science" required>
            </div>
        </form>
    `;
}

function createPreferencesForm() {
    return `
        <form id="preferencesForm">
            <div class="form-group">
                <label>Preferred Language</label>
                <select name="language" required>
                    <option value="English" selected>English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notification Preferences</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" name="notifications" value="email" checked> Email</label>
                    <label><input type="checkbox" name="notifications" value="sms" checked> SMS</label>
                    <label><input type="checkbox" name="notifications" value="push"> Push Notifications</label>
                </div>
            </div>
            <div class="form-group">
                <label>Reading Interests</label>
                <textarea name="interests" rows="3" placeholder="Enter your reading interests separated by commas">Technology, Science Fiction, Philosophy</textarea>
            </div>
            <div class="form-group">
                <label>Auto-renewal</label>
                <select name="autoRenewal" required>
                    <option value="enabled" selected>Enabled</option>
                    <option value="disabled">Disabled</option>
                </select>
            </div>
        </form>
    `;
}

function createPasswordForm() {
    return `
        <form id="passwordForm">
            <div class="form-group">
                <label>Current Password</label>
                <input type="password" name="currentPassword" required>
            </div>
            <div class="form-group">
                <label>New Password</label>
                <input type="password" name="newPassword" required>
                <div class="password-strength">
                    <div class="strength-bar">
                        <div class="strength-fill" id="strengthFill"></div>
                    </div>
                    <span class="strength-text" id="strengthText">Enter password</span>
                </div>
            </div>
            <div class="form-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirmPassword" required>
            </div>
        </form>
    `;
}

// Handle form saves
function handlePersonalInfoSave() {
    const form = document.getElementById('personalInfoForm');
    const formData = new FormData(form);
    
    // In a real app, this would make an API call
    showNotification('Personal information updated successfully!', 'success');
    
    // Update the UI
    updatePersonalInfo(formData);
};

function handleAcademicInfoSave() {
    const form = document.getElementById('academicInfoForm');
    const formData = new FormData(form);
    
    showNotification('Academic information updated successfully!', 'success');
    updateAcademicInfo(formData);
};

function handlePreferencesSave() {
    const form = document.getElementById('preferencesForm');
    const formData = new FormData(form);
    
    showNotification('Preferences updated successfully!', 'success');
    updatePreferences(formData);
};

function handlePasswordChange() {
    const form = document.getElementById('passwordForm');
    const formData = new FormData(form);
    
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match!', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long!', 'error');
        return;
    }
    
    showNotification('Password changed successfully!', 'success');
    closeModal();
};

// Update UI functions
function updatePersonalInfo(formData) {
    const nameElements = document.querySelectorAll('.profile-info h1, .user-profile span');
    const emailElements = document.querySelectorAll('.info-group p');
    
    nameElements.forEach(element => {
        if (element.textContent.includes('John Doe')) {
            element.textContent = formData.get('fullName');
        }
    });
    
    // Update other fields in the UI
    showNotification('Profile updated successfully!', 'success');
};

function updateAcademicInfo(formData) {
    // Update academic information in the UI
    showNotification('Academic information updated successfully!', 'success');
};

function updatePreferences(formData) {
    // Update preferences in the UI
    showNotification('Preferences updated successfully!', 'success');
};

function update2FAStatus(enabled) {
    const toggleBtn = document.querySelector('.security-item:nth-child(2) button');
    const statusText = document.querySelector('.security-item:nth-child(2) p');
    
    if (enabled) {
        toggleBtn.textContent = 'Disable';
        statusText.textContent = 'Enabled';
    } else {
        toggleBtn.textContent = 'Enable';
        statusText.textContent = 'Disabled';
    }
};

// Show edit modal
function showEditModal(title, content, onSave) {
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="saveChanges()">Save Changes</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Store callback
    window.saveChanges = function() {
        if (onSave) onSave();
    };

    // Add modal styles
    if (!document.getElementById('edit-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'edit-modal-styles';
        style.textContent = `
            .edit-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            
            .modal-overlay {
                background: rgba(0,0,0,0.5);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: 15px;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid #e1e5e9;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #333;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
            }
            
            .modal-body {
                padding: 1.5rem;
            }
            
            .modal-footer {
                padding: 1.5rem;
                border-top: 1px solid #e1e5e9;
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
            }
            
            .form-group {
                margin-bottom: 1rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #333;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            
            .checkbox-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .checkbox-group label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: normal;
                cursor: pointer;
            }
            
            .password-strength {
                margin-top: 0.5rem;
            }
            
            .strength-bar {
                width: 100%;
                height: 4px;
                background: #e1e5e9;
                border-radius: 2px;
                overflow: hidden;
                margin-bottom: 0.5rem;
            }
            
            .strength-fill {
                height: 100%;
                width: 0%;
                transition: all 0.3s ease;
            }
            
            .strength-fill.weak { width: 33%; background: #dc3545; }
            .strength-fill.medium { width: 66%; background: #ffc107; }
            .strength-fill.strong { width: 100%; background: #28a745; }
            
            .strength-text {
                font-size: 0.8rem;
                color: #666;
            }
        `;
        document.head.appendChild(style);
    }

    // Set up password strength checker
    const newPasswordInput = modal.querySelector('input[name="newPassword"]');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
}

// Close modal
window.closeModal = function() {
    const modal = document.querySelector('.edit-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
};

// Check password strength
function checkPasswordStrength(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthFill || !strengthText) return;
    
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    let strength = 'weak';
    if (score <= 2) strength = 'weak';
    else if (score <= 4) strength = 'medium';
    else strength = 'strong';
    
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

// Show sessions modal
function showSessionsModal() {
    const modal = document.createElement('div');
    modal.className = 'sessions-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Active Sessions</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="session-list">
                        <div class="session-item">
                            <div class="session-info">
                                <i class="fas fa-desktop"></i>
                                <div>
                                    <h4>Windows Desktop</h4>
                                    <p>Chrome on Windows 10</p>
                                    <span class="session-time">Active now</span>
                                </div>
                            </div>
                            <button class="btn btn-outline btn-sm" onclick="terminateSession('desktop')">Terminate</button>
                        </div>
                        <div class="session-item">
                            <div class="session-info">
                                <i class="fas fa-mobile-alt"></i>
                                <div>
                                    <h4>iPhone 12</h4>
                                    <p>Safari on iOS 15</p>
                                    <span class="session-time">2 hours ago</span>
                                </div>
                            </div>
                            <button class="btn btn-outline btn-sm" onclick="terminateSession('mobile')">Terminate</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal()">Close</button>
                    <button class="btn btn-danger" onclick="terminateAllSessions()">Terminate All Sessions</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Add sessions modal styles
    if (!document.getElementById('sessions-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'sessions-modal-styles';
        style.textContent = `
            .sessions-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            
            .session-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .session-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 10px;
            }
            
            .session-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .session-info i {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #667eea;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }
            
            .session-info h4 {
                margin: 0 0 0.25rem 0;
                color: #333;
                font-size: 1rem;
            }
            
            .session-info p {
                margin: 0 0 0.25rem 0;
                color: #666;
                font-size: 0.9rem;
            }
            
            .session-time {
                font-size: 0.8rem;
                color: #999;
            }
        `;
        document.head.appendChild(style);
    }
}

// Session management functions
window.terminateSession = function(sessionType) {
    if (confirm('Are you sure you want to terminate this session?')) {
        showNotification(`Session terminated successfully!`, 'success');
        // In a real app, this would make an API call
    }
};

window.terminateAllSessions = function() {
    if (confirm('Are you sure you want to terminate all sessions? You will be logged out from all devices.')) {
        showNotification('All sessions terminated successfully!', 'success');
        closeModal();
        // In a real app, this would redirect to login
    }
};

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

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

// Get notification icon
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Get notification color
function getNotificationColor(type) {
    switch(type) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        default: return '#17a2b8';
    }
}

// Add notification animations
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
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
}

// Console message
console.log('👤 User profile page loaded successfully!');
console.log('🔧 Profile management features ready');
