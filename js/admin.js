// Admin Dashboard JavaScript for Library Management System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the admin dashboard
    initializeAdminDashboard();

    function initializeAdminDashboard() {
        updateDashboardStats();
        setupEventListeners();
        setupNavigation();
        setupSearchFunctionality();
        setupTableActions();
    }

    // Update dashboard statistics
    async function updateDashboardStats() {
        try {
            const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
            const data = await res.json();
            if (data && data.stats) {
                const s = data.stats;
                const el = (id) => document.getElementById(id);
                if (el('totalBooks')) el('totalBooks').textContent = s.total_books;
                if (el('totalUsers')) el('totalUsers').textContent = s.total_users || 0;
                if (el('borrowedBooks')) el('borrowedBooks').textContent = s.borrowed_books || 0;
                if (el('overdueBooks')) el('overdueBooks').textContent = s.overdue_books || 0;

                // Inject extra stats dynamically
                const container = document.querySelector('.admin-stats');
                if (container) {
                    const extra = document.createElement('div');
                    extra.style.display = 'grid';
                    extra.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
                    extra.style.gap = '1rem';
                    extra.innerHTML = `
                        <div class="stat-card"><i class="fas fa-undo"></i><div class="stat-info"><h3>${s.returned_books || 0}</h3><p>Returned</p></div></div>
                        <div class="stat-card"><i class="fas fa-check-circle"></i><div class="stat-info"><h3>${s.paid_fine_users || 0}</h3><p>Users Paid Fines</p></div></div>
                        <div class="stat-card"><i class="fas fa-exclamation-circle"></i><div class="stat-info"><h3>${s.unpaid_fine_users || 0}</h3><p>Users Unpaid Fines</p></div></div>
                    `;
                    container.appendChild(extra);
                }

                // Subject breakdown list
                const managementSection = document.querySelector('.book-management');
                if (managementSection && Array.isArray(s.books_by_subject)) {
                    const wrap = document.createElement('div');
                    wrap.className = 'subject-breakdown';
                    wrap.innerHTML = `<div class="section-header"><h3><i class="fas fa-layer-group"></i> Books by Subject</h3></div>`;
                    const list = document.createElement('div');
                    list.style.display = 'grid'; list.style.gridTemplateColumns = 'repeat(auto-fit, minmax(160px, 1fr))'; list.style.gap = '0.75rem';
                    s.books_by_subject.forEach(item => {
                        const card = document.createElement('div');
                        card.className = 'stat-card';
                        card.innerHTML = `<i class="fas fa-tag"></i><div class="stat-info"><h3>${item.count}</h3><p>${item.subject}</p></div>`;
                        list.appendChild(card);
                    });
                    wrap.appendChild(list);
                    managementSection.parentNode.insertBefore(wrap, managementSection);
                }

                // Load books into Manage table
                await loadBooksTable();
            }
        } catch (e) {
            showNotification('Failed to load admin stats', 'error');
        }
    }

    // Animate number counting
    function animateNumber(selector, target, label) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element.textContent.includes(label) || element.closest('.stat-card').querySelector('h3').textContent === label) {
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    element.textContent = Math.floor(current).toLocaleString();
                }, 30);
            }
        });
    }

    // Set up event listeners
    function setupEventListeners() {
        // Quick action buttons
        const quickActionButtons = document.querySelectorAll('.quick-actions .btn');
        quickActionButtons.forEach(button => {
            button.addEventListener('click', handleQuickAction);
        });

        // Admin profile dropdown
        const adminProfile = document.querySelector('.admin-profile');
        if (adminProfile) {
            adminProfile.addEventListener('click', toggleAdminMenu);
        }

        // Search functionality
        const searchInputs = document.querySelectorAll('.search-box input');
        searchInputs.forEach(input => {
            input.addEventListener('input', handleSearch);
        });

        // Filter controls
        const filterSelects = document.querySelectorAll('.filter-controls select');
        filterSelects.forEach(select => {
            select.addEventListener('change', handleFilters);
        });
    }

    // Handle quick actions
    function handleQuickAction(e) {
        const action = e.target.textContent.trim();
        
        switch(action) {
            case 'Add New Book':
                showAddBookModal();
                break;
            case 'Register User':
                showAddUserModal();
                break;
            case 'Issue Book':
                showIssueBookModal();
                break;
            case 'Return Book':
                showReturnBookModal();
                break;
            case 'Generate Report':
                generateReport();
                break;
            case 'System Settings':
                showSettingsModal();
                break;
            default:
                showNotification(`Action "${action}" coming soon!`, 'info');
        }
    }

    // Toggle admin menu
    function toggleAdminMenu() {
        const menu = document.querySelector('.admin-menu');
        if (!menu) {
            createAdminMenu();
        } else {
            menu.remove();
        }
    }

    // Create admin menu
    function createAdminMenu() {
        const menu = document.createElement('div');
        menu.className = 'admin-menu';
        menu.innerHTML = `
            <div class="admin-menu-content">
                <a href="#" class="menu-item">
                    <i class="fas fa-user"></i>
                    <span>Profile</span>
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
        const adminProfile = document.querySelector('.admin-profile');
        const rect = adminProfile.getBoundingClientRect();
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
        if (!document.getElementById('admin-menu-styles')) {
            const style = document.createElement('style');
            style.id = 'admin-menu-styles';
            style.textContent = `
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .admin-menu-content {
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
                    background: #f5f7fa;
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
            if (!adminProfile.contains(e.target) && !menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }

    // Set up navigation
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section');

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                // Show corresponding section
                const targetId = this.getAttribute('href').substring(1);
                sections.forEach(section => {
                    if (section.id === targetId) {
                        section.style.display = 'block';
                        section.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        section.style.display = 'none';
                    }
                });
            });
        });

        // Show dashboard by default
        document.getElementById('dashboard').style.display = 'block';
    }

    // Set up search functionality
    function setupSearchFunctionality() {
        const bookSearch = document.getElementById('bookSearch');
        if (bookSearch) {
            bookSearch.addEventListener('input', async function() {
                await loadBooksTable(this.value.trim());
            });
        }
    }

    // Filter table rows
    function filterTable(table, searchTerm) {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Set up table actions
    function setupTableActions() {
        // User table actions (placeholder)
        const userActions = document.querySelectorAll('#users .btn-icon');
        userActions.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.getAttribute('title');
                const row = this.closest('tr');
                const userId = row.cells[0].textContent;
                
                if (action === 'View Profile') {
                    showUserProfile(userId);
                } else if (action === 'Edit') {
                    showEditUserModal(userId);
                } else if (action === 'Suspend') {
                    showSuspendConfirmation(userId);
                }
            });
        });

        // Transaction table actions
        const transactionActions = document.querySelectorAll('#transactions .btn-icon');
        transactionActions.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.getAttribute('title');
                const row = this.closest('tr');
                const transactionId = row.cells[0].textContent;
                
                if (action === 'Renew') {
                    renewBook(transactionId);
                } else if (action === 'Return') {
                    returnBook(transactionId);
                } else if (action === 'Send Reminder') {
                    sendReminder(transactionId);
                }
            });
        });
    }

    // Modal functions
    function showAddBookModal() {
        showModal('Add New Book', `
            <form id="addBookForm">
                <div class="form-group">
                    <label>Book Title</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>Author</label>
                    <input type="text" name="author" required>
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <input type="text" name="subject" placeholder="e.g., Fiction" required>
                </div>
                <div class="form-group">
                    <label>ISBN</label>
                    <input type="text" name="isbn">
                </div>
                <div class="form-group">
                    <label>Total Copies</label>
                    <input type="number" name="total_copies" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label>Shelf Location</label>
                    <input type="text" name="shelf_location" placeholder="e.g., F-FIT">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" name="description" placeholder="Short description">
                </div>
            </form>
        `, async () => {
            const form = document.getElementById('addBookForm');
            const data = Object.fromEntries(new FormData(form).entries());
            data.available_copies = parseInt(data.total_copies || '1', 10);
            try {
                const res = await fetch('/api/admin/books', { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(data)});
                if (!res.ok) throw new Error('Add failed');
                showNotification('Book added successfully!', 'success');
                await loadBooksTable();
            } catch (e) {
                showNotification('Failed to add book', 'error');
            }
        });
    }

    function showAddUserModal() {
        showModal('Add New User', `
            <form id="addUserForm">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>User Type</label>
                    <select name="type" required>
                        <option value="">Select type</option>
                        <option value="Student">Student</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Staff">Staff</option>
                    </select>
                </div>
            </form>
        `, () => {
            showNotification('User added successfully!', 'success');
        });
    }

    function showModal(title, content, onConfirm) {
        const modal = document.createElement('div');
        modal.className = 'admin-modal';
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
                        <button class="btn btn-outline" onclick="closeAdminModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="confirmAdminAction()">Confirm</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Store callback
        window.confirmAdminAction = function() {
            if (onConfirm) onConfirm();
            closeAdminModal();
        };

        // Add modal styles
        if (!document.getElementById('admin-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'admin-modal-styles';
            style.textContent = `
                .admin-modal {
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
                .form-group select {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid #e1e5e9;
                    border-radius: 8px;
                    font-size: 1rem;
                }
                
                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #667eea;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Close admin modal
    window.closeAdminModal = function() {
        const modal = document.querySelector('.admin-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    };

    // Other modal functions
    function showIssueBookModal() {
        showNotification('Issue Book functionality coming soon!', 'info');
    }

    function showReturnBookModal() {
        showNotification('Return Book functionality coming soon!', 'info');
    }

    function generateReport() {
        showNotification('Report generation started! Check your downloads.', 'success');
    }

    function showSettingsModal() {
        showNotification('Settings panel coming soon!', 'info');
    }

    // Action functions
    function renewBook(transactionId) {
        showNotification(`Book renewed for transaction ${transactionId}`, 'success');
    }

    function returnBook(transactionId) {
        showNotification(`Book returned for transaction ${transactionId}`, 'success');
    }

    function sendReminder(transactionId) {
        showNotification(`Reminder sent for transaction ${transactionId}`, 'success');
    }

    function showEditBookModal(book) {
        showModal('Edit Book', `
            <form id="editBookForm">
                <div class="form-group">
                    <label>Book Title</label>
                    <input type="text" name="title" value="${book.title}" required>
                </div>
                <div class="form-group">
                    <label>Author</label>
                    <input type="text" name="author" value="${book.author}" required>
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <input type="text" name="subject" value="${book.subject || ''}" required>
                </div>
                <div class="form-group">
                    <label>Total Copies</label>
                    <input type="number" name="total_copies" min="1" value="${book.total_copies || 1}" required>
                </div>
                <div class="form-group">
                    <label>Available Copies</label>
                    <input type="number" name="available_copies" min="0" value="${book.available_copies || 0}" required>
                </div>
                <div class="form-group">
                    <label>Shelf Location</label>
                    <input type="text" name="shelf_location" value="${book.shelf_location || ''}">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" name="description" value="${book.description || ''}">
                </div>
            </form>
        `, async () => {
            const form = document.getElementById('editBookForm');
            const payload = Object.fromEntries(new FormData(form).entries());
            try {
                const res = await fetch(`/api/admin/books/${book.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(payload)});
                if (!res.ok) throw new Error('Update failed');
                showNotification('Book updated successfully!', 'success');
                await loadBooksTable();
            } catch (e) {
                showNotification('Failed to update book', 'error');
            }
        });
    }

    async function showDeleteConfirmation(id, type) {
        if (type !== 'book') return;
        if (confirm('Are you sure you want to delete this book?')) {
            try {
                const res = await fetch(`/api/admin/books/${id}`, { method: 'DELETE', credentials: 'include' });
                if (!res.ok) throw new Error('Delete failed');
                showNotification('Book deleted successfully!', 'success');
                await loadBooksTable();
            } catch (e) {
                showNotification('Failed to delete book', 'error');
            }
        }
    }

    function showUserProfile(userId) {
        showNotification(`Viewing profile for user ${userId}`, 'info');
    }

    function showEditUserModal(userId) {
        showNotification(`Edit user ${userId} - coming soon!`, 'info');
    }

    function showSuspendConfirmation(userId) {
        if (confirm(`Are you sure you want to suspend user ${userId}?`)) {
            showNotification(`User ${userId} suspended successfully!`, 'success');
        }
    }

    // Notification system
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

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
    }

    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    function getNotificationColor(type) {
        switch(type) {
            case 'success': return '#667eea';
            case 'error': return '#f5576c';
            case 'warning': return '#f093fb';
            default: return '#4facfe';
        }
    }

    // Add notification animations
    if (!document.getElementById('admin-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-notification-styles';
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

    // Load books into table
    async function loadBooksTable(searchTerm = '') {
        const tableBody = document.getElementById('booksTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const url = `/api/books?per_page=100&page=1&search=${encodeURIComponent(searchTerm)}`;
        try {
            const res = await fetch(url, { credentials: 'include' });
            const data = await res.json();
            (data.books || []).forEach(b => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${b.id}</td>
                    <td>${b.title}</td>
                    <td>${b.author}</td>
                    <td>${b.isbn || ''}</td>
                    <td>${b.subject || ''}</td>
                    <td>${b.total_copies || 0}</td>
                    <td>${b.available_copies || 0}</td>
                    <td>
                        <button class="btn btn-outline btn-sm edit-book">Edit</button>
                        <button class="btn btn-secondary btn-sm delete-book">Delete</button>
                    </td>
                `;
                tr.querySelector('.edit-book').addEventListener('click', () => showEditBookModal(b));
                tr.querySelector('.delete-book').addEventListener('click', () => showDeleteConfirmation(b.id, 'book'));
                tableBody.appendChild(tr);
            });
        } catch (e) {
            showNotification('Failed to load books', 'error');
        }
    }

    // Console message
    console.log('👨‍💼 Admin dashboard loaded and wired to backend.');
});
