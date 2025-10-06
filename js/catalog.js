// Catalog JavaScript for Library Management System - Dynamic Version

document.addEventListener('DOMContentLoaded', () => {
    const categories = [
        { id: 'fiction', name: 'Fiction' },
        { id: 'non-fiction', name: 'Non-Fiction' },
        { id: 'science', name: 'Science' },
        { id: 'technology', name: 'Technology' },
        { id: 'history', name: 'History' },
        { id: 'philosophy', name: 'Philosophy' }
    ];

    // State
    let currentCategory = 'all';
    let currentSearch = '';
    let currentPage = 1;
    let allBooks = [];
    let filteredBooks = [];
    const perPage = 12;

    const params = new URLSearchParams(window.location.search);
    currentSearch = params.get('q')?.toLowerCase() || '';
    currentCategory = params.get('category') || 'all';

    const categoryBar = document.getElementById('categoryBar');
    const booksContainer = document.getElementById('booksContainer');
    const loadingMessage = document.getElementById('loadingMessage');
    const noBooksMessage = document.getElementById('noBooksMessage');
    const resultsCount = document.getElementById('resultsCount');

    // Initialize the catalog
    initializeCatalog();

    // Initialize catalog with API data
    async function initializeCatalog() {
        try {
            await loadBooksFromAPI();
            renderCategories();
            setupEventListeners();
            filterBooks();
        } catch (error) {
            console.error('Failed to initialize catalog:', error);
            showError('Failed to load books. Please try again later.');
        }
    }

    // Load books from API
    async function loadBooksFromAPI() {
        try {
            showLoading(true);
            const response = await fetch('/api/books');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            allBooks = data.books || [];
            filteredBooks = [...allBooks];
            
            renderBooks();
            showLoading(false);
        } catch (error) {
            console.error('Error loading books:', error);
            showError('Failed to load books from server.');
            showLoading(false);
        }
    }

    // Show/hide loading state
    function showLoading(show) {
        if (loadingMessage) {
            loadingMessage.style.display = show ? 'block' : 'none';
        }
    }

    // Show error message
    function showError(message) {
        showLoading(false);
        if (noBooksMessage) {
            noBooksMessage.style.display = 'block';
            noBooksMessage.querySelector('h3').textContent = 'Error Loading Books';
            noBooksMessage.querySelector('p').textContent = message;
        }
    }

    // Render books in the container
    function renderBooks() {
        if (!booksContainer) return;
        
        // Clear existing content except loading/error messages
        const existingBooks = booksContainer.querySelectorAll('.book-item');
        existingBooks.forEach(book => book.remove());
        
        if (filteredBooks.length === 0) {
            showNoBooksMessage();
            return;
        }
        
        hideMessages();
        
        filteredBooks.forEach(book => {
            const bookElement = createBookElement(book);
            booksContainer.appendChild(bookElement);
        });
        
        setupBookActions();
        updateResultsCount();
    }

    // Create book element
    function createBookElement(book) {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.dataset.bookId = book.id;
        
        const statusClass = book.available_copies > 0 ? 'available' : 'borrowed';
        const statusText = book.available_copies > 0 ? 'Available' : 'Borrowed';
        
        bookItem.innerHTML = `
            <div class="book-cover">
                <img src="${getBookCoverUrl(book)}" alt="${book.title}" class="book-cover-img" 
                     onerror="this.src='https://cdn-icons-png.flaticon.com/512/2702/2702134.png'">
                <div class="book-overlay">
                    <button class="btn btn-primary btn-sm">View Details</button>
                </div>
            </div>
            <div class="book-details">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <p class="subject">${book.subject}</p>
                <p class="isbn">ISBN: ${book.isbn}</p>
                <div class="book-meta">
                    <span class="status ${statusClass}">${statusText}</span>
                    <span class="location">Shelf: ${book.shelf_location}</span>
                </div>
                <div class="book-actions">
                    ${book.available_copies > 0 
                        ? `<button class="btn btn-primary btn-sm">Borrow</button>
                           <button class="btn btn-outline btn-sm">Reserve</button>`
                        : `<button class="btn btn-outline btn-sm">Reserve</button>
                           <button class="btn btn-outline btn-sm">Notify When Available</button>`
                    }
                </div>
            </div>
        `;
        
        return bookItem;
    }

    // Get book cover URL based on subject
    function getBookCoverUrl(book) {
        const subjectMap = {
            'fiction': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
            'science': 'https://images.unsplash.com/photo-1559757175-08fda9db5b83?w=300&h=400&fit=crop',
            'technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop',
            'history': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300&h=400&fit=crop',
            'philosophy': 'https://images.unsplash.com/photo-1514890547-4d3fc2968982?w=300&h=400&fit=crop'
        };
        
        const subject = book.subject.toLowerCase();
        return subjectMap[subject] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop';
    }

    // Show no books message
    function showNoBooksMessage() {
        if (noBooksMessage) {
            noBooksMessage.style.display = 'block';
            noBooksMessage.querySelector('h3').textContent = 'No books found';
            noBooksMessage.querySelector('p').textContent = 'Try adjusting your search criteria or browse different categories.';
        }
    }

    // Hide messages
    function hideMessages() {
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (noBooksMessage) noBooksMessage.style.display = 'none';
    }

    // Render categories
    function renderCategories() {
        if (!categoryBar) return;
        categoryBar.innerHTML = '';
        const allBtn = createCategoryButton('all', 'All');
        if (currentCategory === 'all') allBtn.classList.add('active');
        categoryBar.appendChild(allBtn);
        categories.forEach(cat => {
            const btn = createCategoryButton(cat.id, cat.name);
            if (currentCategory === cat.id) btn.classList.add('active');
            categoryBar.appendChild(btn);
        });
    }

    // Create category button
    function createCategoryButton(id, name) {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.dataset.category = id;
        btn.textContent = name;
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = id;
            currentPage = 1;
            filterBooks();
        });
        return btn;
    }

    // Filter books based on search and category
    function filterBooks() {
        filteredBooks = allBooks.filter(book => {
            let show = true;
            
            // Filter by category
            if (currentCategory !== 'all') {
                show = book.subject.toLowerCase().includes(currentCategory);
            }
            
            // Filter by search
            if (currentSearch && show) {
                const searchLower = currentSearch.toLowerCase();
                show = book.title.toLowerCase().includes(searchLower) || 
                       book.author.toLowerCase().includes(searchLower) || 
                       book.subject.toLowerCase().includes(searchLower) ||
                       book.isbn.toLowerCase().includes(searchLower);
            }
            
            return show;
        });
        
        renderBooks();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.querySelector('.search-btn');
        
        if (searchInput) {
            searchInput.value = currentSearch;
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.toLowerCase();
                currentPage = 1;
                filterBooks();
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                if (searchInput) {
                    currentSearch = searchInput.value.toLowerCase();
                    currentPage = 1;
                    filterBooks();
                }
            });
        }

        // Subject filter
        const subjectFilter = document.getElementById('subjectFilter');
        if (subjectFilter) {
            subjectFilter.addEventListener('change', () => {
                currentCategory = subjectFilter.value || 'all';
                currentPage = 1;
                filterBooks();
            });
        }

        // View toggle functionality
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                
                // Remove active class from all buttons
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Apply view class
                booksContainer.className = `books-container ${view}-view`;
            });
        });
    }

    // Setup book actions (called after rendering books)
    function setupBookActions() {
        // Setup View Details buttons
        const viewDetailsBtns = document.querySelectorAll('.book-overlay .btn-primary');
        viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const bookItem = btn.closest('.book-item');
                const bookId = bookItem.dataset.bookId;
                
                if (bookId) {
                    window.location.href = `book-details.html?id=${bookId}`;
                }
            });
        });

        // Setup Borrow buttons
        const borrowBtns = document.querySelectorAll('.book-actions .btn-primary');
        borrowBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const bookItem = btn.closest('.book-item');
                const title = bookItem.querySelector('h3').textContent;
                alert(`Borrow request submitted for "${title}". Please check your email for confirmation.`);
            });
        });

        // Setup Reserve buttons
        const reserveBtns = document.querySelectorAll('.book-actions .btn-outline');
        reserveBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const bookItem = btn.closest('.book-item');
                const title = bookItem.querySelector('h3').textContent;
                alert(`Reservation request submitted for "${title}". You will be notified when it's available.`);
            });
        });
    }

    // Update results count
    function updateResultsCount() {
        if (resultsCount) {
            const total = allBooks.length;
            const showing = filteredBooks.length;
            resultsCount.textContent = `Showing ${showing} of ${total} books`;
        }
    }
});
