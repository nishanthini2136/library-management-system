// Book Details JavaScript for Library Management System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the book details page
    initializeBookDetails();
    // Load book data from catalog
    loadBookDataFromCatalog();
});

function initializeBookDetails() {
    setupEventListeners();
    setupTabs();
    setupUserProfile();
}

// Load book data from URL parameters or session storage
function loadBookDataFromCatalog() {
    // First check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (bookId) {
        // Load book details from API
        loadBookFromAPI(bookId);
    } else {
        // Fallback to session storage
        const bookData = sessionStorage.getItem('selectedBook');
        if (bookData) {
            try {
                const book = JSON.parse(bookData);
                updateBookDetails(book);
                sessionStorage.removeItem('selectedBook');
            } catch (error) {
                console.error('Error parsing book data:', error);
                showError('Failed to load book details');
            }
        } else {
            // No book data available, redirect to catalog
            window.location.href = 'catalog.html';
        }
    }
}

// Load book details from API
async function loadBookFromAPI(bookId) {
    try {
        showLoading(true);
        const response = await fetch(`/api/books/${bookId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const book = await response.json();
        updateBookDetails(book);
        showLoading(false);
    } catch (error) {
        console.error('Error loading book details:', error);
        showError('Failed to load book details. Please try again.');
        showLoading(false);
    }
}

// Show/hide loading state
function showLoading(show) {
    const elements = [
        'book-title', 'book-author', 'book-isbn', 'book-publisher',
        'book-publication-date', 'book-pages', 'book-language', 
        'book-format', 'book-subject', 'breadcrumb-title'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = show ? 'Loading...' : element.textContent;
        }
    });
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f5576c;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        ${message}
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Update book details with data from API
function updateBookDetails(book) {
    // Update page title
    document.title = `Book Details - ${book.title} - Library Management System`;
    
    // Update breadcrumb
    updateElement('breadcrumb-title', book.title);
    
    // Update basic book information
    updateElement('book-title', book.title);
    updateElement('book-author', book.author);
    updateElement('book-isbn', book.isbn);
    updateElement('book-publisher', book.publisher);
    updateElement('book-publication-date', book.publication_year);
    updateElement('book-pages', book.pages);
    updateElement('book-language', book.language);
    updateElement('book-format', book.format);
    updateElement('book-subject', book.subject);
    
    // Update description
    const descriptionContainer = document.getElementById('book-description-content');
    if (descriptionContainer) {
        descriptionContainer.innerHTML = `<p>${book.description}</p>`;
    }
    
    // Update book cover
    const bookCover = document.getElementById('bookCover');
    if (bookCover) {
        bookCover.alt = book.title;
        bookCover.src = getBookCoverUrl(book);
    }
    
    // Update availability status
    updateBookStatus(book);
    
    // Update quick info
    updateElement('book-shelf', `Shelf: ${book.shelf_location}`);
    updateElement('book-copies', `${book.available_copies} copies available`);
    
    // Update rating
    updateRating(book.rating, book.rating_count);
    
    // Update tags
    updateTags(book.tags);
    
    // Update availability tab
    updateAvailabilityTab(book);
    
    // Update modals with book information
    updateModalBookInfo(book);
}

// Helper function to update element text content
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value || 'N/A';
    }
}

// Update book status badge
function updateBookStatus(book) {
    const statusBadge = document.getElementById('book-status-badge');
    const statusText = document.getElementById('book-status-text');
    
    if (statusBadge && statusText) {
        statusBadge.className = `book-status-badge ${book.status}`;
        statusText.textContent = book.status === 'available' ? 'Available' : 'All Copies Borrowed';
        
        const icon = statusBadge.querySelector('i');
        if (icon) {
            icon.className = book.status === 'available' ? 'fas fa-check-circle' : 'fas fa-times-circle';
        }
    }
}

// Update rating display
function updateRating(rating, ratingCount) {
    updateElement('rating-text', `${rating} out of 5 (${ratingCount} ratings)`);
    updateElement('overall-rating', rating.toFixed(1));
    updateElement('rating-count', `${ratingCount} ratings`);
    
    // Update star display
    const starsContainer = document.querySelector('.book-rating .stars');
    if (starsContainer) {
        updateStars(starsContainer, rating);
    }
    
    const overallStars = document.querySelector('.overall-rating .rating-stars');
    if (overallStars) {
        updateStars(overallStars, rating);
    }
}

// Update star display based on rating
function updateStars(container, rating) {
    const stars = container.querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < Math.floor(rating)) {
            star.className = 'fas fa-star';
        } else if (index < rating) {
            star.className = 'fas fa-star-half-alt';
        } else {
            star.className = 'far fa-star';
        }
    });
}

// Update tags
function updateTags(tags) {
    const tagsContainer = document.getElementById('book-tags');
    if (tagsContainer && tags) {
        tagsContainer.innerHTML = tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
    }
}

// Update availability tab
function updateAvailabilityTab(book) {
    updateElement('available-copies', book.available_copies);
    updateElement('borrowed-copies', book.borrowed_copies);
    updateElement('total-copies', book.total_copies);
    
    // Update copies list
    const copiesContainer = document.getElementById('copies-container');
    if (copiesContainer && book.copies) {
        copiesContainer.innerHTML = book.copies.map(copy => `
            <div class="copy-item ${copy.status}">
                <div class="copy-info">
                    <div class="copy-id">Copy #${copy.copy_number}</div>
                    <div class="copy-location">${copy.location}</div>
                    <div class="copy-condition">${copy.condition}</div>
                </div>
                <div class="copy-status">
                    <span class="status-badge ${copy.status}">${copy.status === 'available' ? 'Available' : 'Borrowed'}</span>
                    ${copy.status === 'available' 
                        ? `<button class="btn btn-primary btn-sm" onclick="borrowCopy('${copy.id}')">Borrow</button>`
                        : `<div class="return-date">Due: ${copy.due_date}</div>`
                    }
                </div>
            </div>
        `).join('');
    }
}

// Update modal book information
function updateModalBookInfo(book) {
    // This will be called when modals are created to show the correct book info
    window.currentBookData = book;
}

// Get book cover URL based on book data
function getBookCoverUrl(book) {
    if (!book) return 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=80&h=120&fit=crop';
    
    // Map subjects to appropriate Unsplash images
    const subjectMap = {
        'fiction': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=80&h=120&fit=crop',
        'non-fiction': 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=80&h=120&fit=crop',
        'science': 'https://images.unsplash.com/photo-1559757175-08fda9db5b83?w=80&h=120&fit=crop',
        'technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=80&h=120&fit=crop',
        'history': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=80&h=120&fit=crop',
        'philosophy': 'https://images.unsplash.com/photo-1514890547-4d3fc2968982?w=80&h=120&fit=crop'
    };
    
    return subjectMap[book.subject.toLowerCase()] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=80&h=120&fit=crop';
}

// Set up event listeners
function setupEventListeners() {
    // User profile dropdown
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', toggleUserMenu);
    }
}

// Set up tabs functionality
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
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
        const headerAvatar = document.querySelector('.user-profile .avatar');
        if (headerAvatar) {
            headerAvatar.src = savedAvatar;
        }
    }
}

// Toggle user menu
function toggleUserMenu(event) {
    // Prevent event from bubbling up to document
    event.stopPropagation();
    
    const menu = document.querySelector('.user-menu');
    if (!menu) {
        createUserMenu();
        
        // Add click event listener to document to close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', closeUserMenu);
        }, 100);
    } else {
        menu.remove();
        document.removeEventListener('click', closeUserMenu);
    }
}

// Close user menu when clicking outside
function closeUserMenu(event) {
    const menu = document.querySelector('.user-menu');
    const userProfile = document.querySelector('.user-profile');
    
    if (menu && !menu.contains(event.target) && !userProfile.contains(event.target)) {
        menu.remove();
        document.removeEventListener('click', closeUserMenu);
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

    // Position the menu - Fixed positioning relative to the header
    const userProfile = document.querySelector('.user-profile');
    const headerContainer = document.querySelector('.header .container');
    
    if (userProfile && headerContainer) {
        const rect = userProfile.getBoundingClientRect();
        
        menu.style.cssText = `
            position: absolute;
            top: ${rect.height + 5}px;
            right: 0;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 1000;
            min-width: 200px;
            animation: slideDown 0.3s ease;
        `;
        
        // Append to the header container instead of body for proper positioning
        headerContainer.appendChild(menu);
    } else {
        console.error('Could not find user profile or header container elements');
        // Fallback to body append if header container not found
        document.body.appendChild(menu);
    }

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

// Book action functions
window.borrowBook = function() {
    showBorrowModal();
};

window.reserveBook = function() {
    showReservationModal();
};

window.addToWishlist = function() {
    showNotification('Book added to wishlist successfully!', 'success');
    // In a real app, this would make an API call
};

window.borrowCopy = function(copyId) {
    showNotification(`Copy ${copyId} borrowed successfully! Please return within 30 days.`, 'success');
    // In a real app, this would make an API call to borrow the specific copy
    updateCopyStatus(copyId, 'borrowed');
};

window.writeReview = function() {
    showReviewModal();
};

// Show borrow modal
function showBorrowModal() {
    const modal = document.createElement('div');
    modal.className = 'borrow-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-book"></i> Borrow Book</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="book-summary">
                        <img src="${getBookCoverUrl(window.currentBookData)}" alt="${window.currentBookData ? window.currentBookData.title : 'Book Cover'}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2702/2702134.png'">
                        <div>
                            <h4>${window.currentBookData ? window.currentBookData.title : 'Book Title'}</h4>
                            <p>${window.currentBookData ? window.currentBookData.author : 'Author'}</p>
                            <div class="book-rating-small">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="far fa-star"></i>
                                <span>4.2</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="borrow-details">
                        <div class="detail-item">
                            <label>Loan Period</label>
                            <span>30 days</span>
                        </div>
                        <div class="detail-item">
                            <label>Due Date</label>
                            <span>${getDueDate(30)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Fine per Day</label>
                            <span>$0.25</span>
                        </div>
                        <div class="detail-item">
                            <label>Max Renewals</label>
                            <span>2 times</span>
                        </div>
                    </div>
                    
                    <div class="borrow-notice">
                        <i class="fas fa-info-circle"></i>
                        <p>Please ensure you return the book on time to avoid fines. You can renew the book up to 2 times if no one else has reserved it.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="confirmBorrow()">
                        <i class="fas fa-check"></i>
                        Confirm Borrow
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Add modal styles
    if (!document.getElementById('borrow-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'borrow-modal-styles';
        style.textContent = `
            .borrow-modal {
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
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .modal-header h3 i {
                color: #667eea;
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
            
            .book-summary {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
                padding: 1rem;
                background: #f5f7fa;
                border-radius: 10px;
            }
            
            .book-summary img {
                width: 80px;
                height: 120px;
                object-fit: cover;
                border-radius: 8px;
            }
            
            .book-summary h4 {
                margin: 0 0 0.5rem 0;
                color: #333;
            }
            
            .book-summary p {
                margin: 0 0 0.5rem 0;
                color: #666;
                font-style: italic;
            }
            
            .book-rating-small {
                color: #ffc107;
                font-size: 0.9rem;
            }
            
            .book-rating-small span {
                color: #666;
                margin-left: 0.5rem;
                font-weight: 600;
            }
            
            .borrow-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 0.75rem;
                background: #f5f7fa;
                border-radius: 8px;
            }
            
            .detail-item label {
                color: #666;
                font-weight: 600;
            }
            
            .detail-item span {
                color: #333;
                font-weight: 500;
            }
            
            .borrow-notice {
                display: flex;
                gap: 1rem;
                padding: 1rem;
                background: #f0f4ff;
                border-radius: 10px;
                border-left: 4px solid #667eea;
            }
            
            .borrow-notice i {
                color: #667eea;
                font-size: 1.2rem;
                margin-top: 0.2rem;
            }
            
            .borrow-notice p {
                margin: 0;
                color: #666;
                line-height: 1.5;
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);
    }
};

// Show reservation modal
function showReservationModal() {
    const modal = document.createElement('div');
    modal.className = 'reservation-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-bookmark"></i> Reserve Book</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="book-summary">
                        <img src="${getBookCoverUrl(window.currentBookData)}" alt="${window.currentBookData ? window.currentBookData.title : 'Book Cover'}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2702/2702134.png'">
                        <div>
                            <h4>${window.currentBookData ? window.currentBookData.title : 'Book Title'}</h4>
                            <p>${window.currentBookData ? window.currentBookData.author : 'Author'}</p>
                            <div class="book-rating-small">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="far fa-star"></i>
                                <span>4.2</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="reservation-details">
                        <div class="detail-item">
                            <label>Current Status</label>
                            <span class="status-available">Available</span>
                        </div>
                        <div class="detail-item">
                            <label>Available Copies</label>
                            <span>3 copies</span>
                        </div>
                        <div class="detail-item">
                            <label>Reservation Period</label>
                            <span>7 days</span>
                        </div>
                        <div class="detail-item">
                            <label>Notification</label>
                            <span>Email & SMS</span>
                        </div>
                    </div>
                    
                    <div class="reservation-notice">
                        <i class="fas fa-info-circle"></i>
                        <p>Since this book is currently available, you can borrow it immediately instead of reserving it. Would you like to borrow it now?</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="borrowInstead()">
                        <i class="fas fa-book"></i>
                        Borrow Instead
                    </button>
                    <button class="btn btn-outline" onclick="confirmReservation()">
                        <i class="fas fa-bookmark"></i>
                        Reserve Anyway
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Add modal styles
    if (!document.getElementById('reservation-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'reservation-modal-styles';
        style.textContent = `
            .reservation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            
            .status-available {
                color: #28a745;
                font-weight: 600;
            }
            
            .reservation-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .reservation-notice {
                display: flex;
                gap: 1rem;
                padding: 1rem;
                background: #fef7e0;
                border-radius: 10px;
                border-left: 4px solid #f093fb;
            }
            
            .reservation-notice i {
                color: #764ba2;
                font-size: 1.2rem;
                margin-top: 0.2rem;
            }
            
            .reservation-notice p {
                margin: 0;
                color: #764ba2;
                line-height: 1.5;
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);
    }
};

// Show review modal
function showReviewModal() {
    const modal = document.createElement('div');
    modal.className = 'review-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-star"></i> Write a Review</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="reviewForm">
                        <div class="form-group">
                            <label>Rating</label>
                            <div class="rating-input">
                                <input type="radio" name="rating" value="5" id="star5">
                                <label for="star5" class="star-label"><i class="far fa-star"></i></label>
                                <input type="radio" name="rating" value="4" id="star4">
                                <label for="star4" class="star-label"><i class="far fa-star"></i></label>
                                <input type="radio" name="rating" value="3" id="star3">
                                <label for="star3" class="star-label"><i class="far fa-star"></i></label>
                                <input type="radio" name="rating" value="2" id="star2">
                                <label for="star2" class="star-label"><i class="far fa-star"></i></label>
                                <input type="radio" name="rating" value="1" id="star1">
                                <label for="star1" class="star-label"><i class="far fa-star"></i></label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Review Title</label>
                            <input type="text" name="title" placeholder="Summarize your review in a few words" required>
                        </div>
                        <div class="form-group">
                            <label>Review</label>
                            <textarea name="review" rows="5" placeholder="Share your thoughts about this book..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Tags (optional)</label>
                            <input type="text" name="tags" placeholder="e.g., engaging, thought-provoking, classic">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="submitReview()">
                        <i class="fas fa-paper-plane"></i>
                        Submit Review
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Add modal styles
    if (!document.getElementById('review-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'review-modal-styles';
        style.textContent = `
            .review-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            
            .rating-input {
                display: flex;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }
            
            .star-label {
                cursor: pointer;
                font-size: 2rem;
                color: #ddd;
                transition: color 0.3s ease;
            }
            
            .star-label:hover,
            .star-label:hover ~ .star-label {
                color: #ffc107;
            }
            
            input[type="radio"]:checked ~ .star-label {
                color: #ffc107;
            }
            
            input[type="radio"] {
                display: none;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #333;
            }
            
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #667eea;
            }
        `;
        document.head.appendChild(style);
    }

    // Set up star rating functionality
    setupStarRating();
};

// Set up star rating
function setupStarRating() {
    const starLabels = document.querySelectorAll('.star-label');
    const ratingInputs = document.querySelectorAll('input[name="rating"]');

    starLabels.forEach((label, index) => {
        label.addEventListener('click', () => {
            const rating = 5 - index;
            ratingInputs.forEach(input => {
                if (parseInt(input.value) === rating) {
                    input.checked = true;
                }
            });
        });
    });
};

// Action functions
window.confirmBorrow = function() {
    showNotification('Book borrowed successfully! Please return by ' + getDueDate(30), 'success');
    closeModal();
    // In a real app, this would make an API call
};

window.borrowInstead = function() {
    closeModal();
    showBorrowModal();
};

window.confirmReservation = function() {
    showNotification('Book reserved successfully! You will be notified when it becomes available.', 'success');
    closeModal();
    // In a real app, this would make an API call
};

window.submitReview = function() {
    const form = document.getElementById('reviewForm');
    const formData = new FormData(form);
    
    if (formData.get('rating') && formData.get('title') && formData.get('review')) {
        showNotification('Review submitted successfully! Thank you for your feedback.', 'success');
        closeModal();
        // In a real app, this would make an API call
    } else {
        showNotification('Please fill in all required fields.', 'error');
    }
};

// Close modal
window.closeModal = function() {
    const modal = document.querySelector('.borrow-modal, .reservation-modal, .review-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
};

// Update copy status
function updateCopyStatus(copyId, status) {
    const copyItem = document.querySelector(`[onclick="borrowCopy('${copyId}')"]`).closest('.copy-item');
    if (copyItem) {
        const statusBadge = copyItem.querySelector('.status-badge');
        const actionButton = copyItem.querySelector('button');
        
        if (status === 'borrowed') {
            statusBadge.textContent = 'Borrowed';
            statusBadge.className = 'status-badge borrowed';
            actionButton.remove();
            
            const returnDate = document.createElement('div');
            returnDate.className = 'return-date';
            returnDate.textContent = 'Due: ' + getDueDate(30);
            copyItem.querySelector('.copy-status').appendChild(returnDate);
        }
    }
};

// Get due date
function getDueDate(days) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
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
};

// Get notification icon
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
};

// Get notification color
function getNotificationColor(type) {
    switch(type) {
        case 'success': return '#667eea';
        case 'error': return '#f5576c';
        case 'warning': return '#f093fb';
        default: return '#4facfe';
    }
};

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
console.log('📚 Book details page loaded successfully!');
console.log('🔍 Book information and actions ready');
