// User Dashboard JavaScript for Library Management System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the user dashboard
    initializeUserDashboard();
});

function initializeUserDashboard() {
    setupEventListeners();
    setupNotifications();
    setupUserProfile();
    loadUserDashboardData();
}

// Set up event listeners
function setupEventListeners() {
    // Notification close buttons
    const notificationCloses = document.querySelectorAll('.notification-close');
    notificationCloses.forEach(button => {
        button.addEventListener('click', function() {
            const notification = this.closest('.notification-item');
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
    });

    // User profile dropdown
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', toggleUserMenu);
    }

    // Book action buttons
    setupBookActions();
}

// Set up book actions
function setupBookActions() {
    // Renew book functionality
    window.renewBook = function(bookId) {
        showNotification('Book renewed successfully! New due date: Feb 15, 2024', 'success');
        // In a real app, this would make an API call to renew the book
        updateBookDueDate(bookId);
    };

    // View book details
    window.viewBookDetails = function(bookId) {
        showBookDetailsModal(bookId);
    };

    // Borrow reserved book
    window.borrowReserved = function(bookId) {
        showNotification('Book borrowed successfully! Please return within 30 days.', 'success');
        // In a real app, this would move the book from reservations to borrowings
        moveBookToBorrowings(bookId);
    };

    // Cancel reservation
    window.cancelReservation = function(bookId) {
        if (confirm('Are you sure you want to cancel this reservation?')) {
            showNotification('Reservation cancelled successfully!', 'success');
            // In a real app, this would remove the book from reservations
            removeReservation(bookId);
        }
    };
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

// Set up notifications
function setupNotifications() {
    // Auto-remove notifications after 10 seconds
    const notifications = document.querySelectorAll('.notification-item');
    notifications.forEach(notification => {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
    });
}

// Update due dates
function updateDueDates() {
    const dueDateElements = document.querySelectorAll('.due-date');
    dueDateElements.forEach(element => {
        const dueDate = new Date(element.textContent.replace('Due: ', ''));
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) {
            element.style.color = '#dc3545';
            element.textContent = 'OVERDUE!';
        } else if (diffDays <= 3) {
            element.style.color = '#ffc107';
        }
        
        // Update days left
        const daysLeftElement = element.parentNode.querySelector('.days-left');
        if (daysLeftElement) {
            if (diffDays <= 0) {
                daysLeftElement.textContent = 'Overdue!';
                daysLeftElement.style.color = '#dc3545';
            } else {
                daysLeftElement.textContent = `${diffDays} days left`;
            }
        }
    });
}

// Set up user profile
function setupUserProfile() {
    // Load user data placeholder
    const nameSpan = document.querySelector('#userName');
    if (nameSpan) nameSpan.textContent = 'User';
}

// Get user data
function getUserData() { return null; }

// Update user interface
function updateUserInterfaceFromApi(data) {
    const name = `${data.user.first_name} ${data.user.last_name}`;
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = name;
    const borrowedCount = document.getElementById('borrowedCount');
    const dueSoonCount = document.getElementById('dueSoonCount');
    const overdueCount = document.getElementById('overdueCount');
    const reservedCount = document.getElementById('reservedCount');
    if (borrowedCount) borrowedCount.textContent = data.stats.borrowed_count;
    if (dueSoonCount) dueSoonCount.textContent = data.stats.due_soon_count;
    if (overdueCount) overdueCount.textContent = data.stats.overdue_count;
    if (reservedCount) reservedCount.textContent = data.stats.reserved_count;

    // Overview stats (if provided by backend)
    const borrowedBooksCount = document.getElementById('borrowedBooksCount');
    const finesPaidUsers = document.getElementById('finesPaidUsers');
    const finesUnpaidUsers = document.getElementById('finesUnpaidUsers');
    const returnedBooksCount = document.getElementById('returnedBooksCount');
    if (borrowedBooksCount && data.overview) borrowedBooksCount.textContent = data.overview.borrowed_books_count ?? 0;
    if (finesPaidUsers && data.overview) finesPaidUsers.textContent = data.overview.fines_paid_users_count ?? 0;
    if (finesUnpaidUsers && data.overview) finesUnpaidUsers.textContent = data.overview.fines_unpaid_users_count ?? 0;
    if (returnedBooksCount && data.overview) returnedBooksCount.textContent = data.overview.returned_books_count ?? 0;

    // Books by category
    const byCat = document.getElementById('booksByCategory');
    if (byCat && data.overview && data.overview.books_by_subject) {
        byCat.innerHTML = Object.entries(data.overview.books_by_subject)
            .map(([k,v]) => `<div>${k}: <strong>${v}</strong></div>`) 
            .join('');
    }
}

async function loadUserDashboardData() {
    try {
        const res = await fetch('/api/user/dashboard', { credentials: 'include' });
        const data = await res.json();
        if (data.error) return;
        updateUserInterfaceFromApi(data);
        renderBorrowedBooks(data.borrowings);

        // Fines lists
        if (data.fines && Array.isArray(data.fines)) {
            const paidBody = document.getElementById('paidFinesBody');
            const unpaidBody = document.getElementById('unpaidFinesBody');
            if (paidBody) paidBody.innerHTML = '';
            if (unpaidBody) unpaidBody.innerHTML = '';
            data.fines.forEach(f => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${f.user_name || f.user_id}</td>
                    <td>${f.paid ? 'Paid' : 'Unpaid'}</td>
                    <td>${(f.amount || 0).toFixed ? (f.amount || 0).toFixed(2) : f.amount || 0}</td>
                    <td>${f.updated_at || ''}</td>
                `;
                (f.paid ? paidBody : unpaidBody).appendChild(tr);
            });
        }
    } catch (e) {
        // ignore
    }
}

function renderBorrowedBooks(borrowings) {
    const grid = document.getElementById('borrowedBooksGrid');
    if (!grid) return;
    grid.innerHTML = '';
    borrowings.forEach(b => {
        const card = document.createElement('div');
        card.className = 'book-card';
        const returned = !!b.returned_date;
        const statusText = returned ? 'Returned' : 'In Progress';
        card.innerHTML = `
            <div class="book-cover">
                <img src="https://covers.openlibrary.org/b/isbn/${b.book_isbn || ''}-M.jpg" alt="${b.book_title}" onerror="this.src='images/book-icon.svg'">
            </div>
            <div class="book-info">
                <h4>${b.book_title}</h4>
                <p class="author">${b.book_author}</p>
                <p class="desc">${b.book_description || ''}</p>
                <p class="status">${statusText}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Show book details modal
function showBookDetailsModal(bookId) {
    const book = getBookData(bookId);
    if (!book) return;

    const modal = document.createElement('div');
    modal.className = 'book-details-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${book.title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="book-info-grid">
                        <div class="book-cover-large">
                            <img src="${book.coverImage}" alt="${book.title}" onerror="this.src='images/book-icon.png'">
                        </div>
                        <div class="book-details-large">
                            <p><strong>Author:</strong> ${book.author}</p>
                            <p><strong>Subject:</strong> ${book.subject}</p>
                            <p><strong>ISBN:</strong> ${book.isbn}</p>
                            <p><strong>Status:</strong> <span class="status ${book.status}">${book.status.charAt(0).toUpperCase() + book.status.slice(1)}</span></p>
                            <p><strong>Location:</strong> ${book.location}</p>
                            <p><strong>Due Date:</strong> ${book.dueDate}</p>
                            <p><strong>Description:</strong> ${book.description}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeBookModal()">Close</button>
                    ${book.status === 'borrowed' ? 
                        `<button class="btn btn-primary" onclick="renewBook('${book.id}'); closeBookModal();">Renew Book</button>` : 
                        `<button class="btn btn-primary" onclick="borrowBook('${book.id}'); closeBookModal();">Borrow Book</button>`
                    }
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Add modal styles
    if (!document.getElementById('book-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'book-modal-styles';
        style.textContent = `
            .book-details-modal {
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
                max-width: 700px;
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
            
            .modal-header h2 {
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
            
            .book-info-grid {
                display: grid;
                grid-template-columns: 200px 1fr;
                gap: 1.5rem;
            }
            
            .book-cover-large {
                background: #f8f9fa;
                height: 250px;
                border-radius: 10px;
                overflow: hidden;
            }
            
            .book-cover-large img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .book-details-large p {
                margin-bottom: 0.75rem;
                line-height: 1.6;
            }
            
            .modal-footer {
                padding: 1.5rem;
                border-top: 1px solid #e1e5e9;
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
            }
            
            @media (max-width: 768px) {
                .book-info-grid {
                    grid-template-columns: 1fr;
                }
                
                .book-cover-large {
                    height: 200px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Close book modal
window.closeBookModal = function() {
    const modal = document.querySelector('.book-details-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
};

// Get book data
function getBookData(bookId) {
    // In a real app, this would come from an API
    const books = {
        'BK001': {
            id: 'BK001',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            subject: 'Fiction',
            isbn: '978-0743273565',
            status: 'borrowed',
            location: 'F-FIT',
            dueDate: 'Jan 15, 2024',
            description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
            coverImage: 'images/book-cover-1.jpg'
        },
        'BK002': {
            id: 'BK002',
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            subject: 'Fiction',
            isbn: '978-0446310789',
            status: 'borrowed',
            location: 'F-LEE',
            dueDate: 'Jan 20, 2024',
            description: 'The story of young Scout Finch and her father Atticus in a racially divided Alabama town.',
            coverImage: 'images/book-cover-2.jpg'
        },
        'BK003': {
            id: 'BK003',
            title: '1984',
            author: 'George Orwell',
            subject: 'Fiction',
            isbn: '978-0451524935',
            status: 'borrowed',
            location: 'F-ORW',
            dueDate: 'Jan 25, 2024',
            description: 'A dystopian novel about totalitarianism and surveillance society.',
            coverImage: 'images/book-cover-3.jpg'
        }
    };
    
    return books[bookId];
}

// Update book due date
function updateBookDueDate(bookId) {
    const bookCard = document.querySelector(`[data-book-id="${bookId}"]`);
    if (bookCard) {
        const dueDateElement = bookCard.querySelector('.due-date');
        const daysLeftElement = bookCard.querySelector('.days-left');
        
        if (dueDateElement) {
            dueDateElement.textContent = 'Due: Feb 15, 2024';
            dueDateElement.style.color = '#28a745';
        }
        
        if (daysLeftElement) {
            daysLeftElement.textContent = '30 days left';
            daysLeftElement.style.color = '#28a745';
        }
    }
}

// Move book to borrowings
function moveBookToBorrowings(bookId) {
    const bookCard = document.querySelector(`[data-book-id="${bookId}"]`);
    if (bookCard) {
        // In a real app, this would update the database and refresh the UI
        bookCard.remove();
        showNotification('Book moved to borrowings successfully!', 'success');
    }
}

// Remove reservation
function removeReservation(bookId) {
    const bookCard = document.querySelector(`[data-book-id="${bookId}"]`);
    if (bookCard) {
        // In a real app, this would update the database and refresh the UI
        bookCard.remove();
    }
}

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
console.log('👤 User dashboard loaded successfully!');
console.log('📚 User account management ready');
