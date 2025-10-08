// Modern Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Initialize sidebar functionality
    initSidebar();
    
    // Initialize chart
    initChart();
    
    // Initialize page navigation
    initPageNavigation();
    
    // Initialize table functionality
    initTableFunctionality();
    
    // Load dashboard data
    loadDashboardData();
}

// Sidebar Functionality
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const menuToggle = document.getElementById('menuToggle');
    const navItems = document.querySelectorAll('.nav-item');

    // Toggle sidebar collapse
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }

    // Handle nav item clicks
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const arrow = item.querySelector('.arrow');
        
        if (arrow) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                item.classList.toggle('expanded');
            });
        }
    });

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// Chart Initialization
function initChart() {
    const ctx = document.getElementById('transactionChart');
    if (!ctx) return;

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Borrow',
                data: [0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0],
                backgroundColor: '#95a5a6',
                borderColor: '#95a5a6',
                borderWidth: 1
            },
            {
                label: 'Return',
                data: [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
                backgroundColor: '#2ecc71',
                borderColor: '#2ecc71',
                borderWidth: 1
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 6,
                ticks: {
                    stepSize: 1,
                    color: '#666'
                },
                grid: {
                    color: '#e9ecef'
                }
            },
            x: {
                ticks: {
                    color: '#666'
                },
                grid: {
                    display: false
                }
            }
        },
        elements: {
            bar: {
                borderRadius: 4
            }
        }
    };

    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });

    // Year selector functionality
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        yearSelect.addEventListener('change', function() {
            // Update chart data based on selected year
            console.log('Year changed to:', this.value);
            // You can implement year-specific data loading here
        });
    }
}

// Page Navigation
function initPageNavigation() {
    const navLinks = document.querySelectorAll('[data-page]');
    const dashboardContent = document.querySelector('.dashboard-content');
    const borrowPage = document.getElementById('borrowPage');
    const pageTitle = document.querySelector('.page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });

    function navigateToPage(page) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Hide all page contents
        if (dashboardContent) dashboardContent.style.display = 'none';
        if (borrowPage) borrowPage.style.display = 'none';

        switch(page) {
            case 'dashboard':
                if (dashboardContent) dashboardContent.style.display = 'block';
                pageTitle.textContent = 'Dashboard';
                document.querySelector('.nav-item').classList.add('active');
                break;
            case 'borrow':
                if (borrowPage) borrowPage.style.display = 'block';
                pageTitle.textContent = 'Borrow Books';
                // Find and activate the transaction nav item
                const transactionNav = document.querySelector('[data-page="transaction"]').closest('.nav-item');
                transactionNav.classList.add('active', 'expanded');
                break;
            case 'return':
                // Implement return page
                pageTitle.textContent = 'Return Books';
                break;
            case 'books':
                // Implement books page
                pageTitle.textContent = 'Books Management';
                break;
            case 'students':
                // Implement students page
                pageTitle.textContent = 'Students Management';
                break;
        }
    }
}

// Table Functionality
function initTableFunctionality() {
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('.data-table tbody tr');
            
            tableRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Entries per page functionality
    const entriesSelect = document.querySelector('.entries-select');
    if (entriesSelect) {
        entriesSelect.addEventListener('change', function() {
            const entriesPerPage = parseInt(this.value);
            // Implement pagination logic here
            console.log('Entries per page:', entriesPerPage);
        });
    }

    // Sort functionality
    const sortHeaders = document.querySelectorAll('.data-table th');
    sortHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const table = this.closest('table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const columnIndex = Array.from(this.parentNode.children).indexOf(this);
            
            // Toggle sort direction
            const isAscending = !this.classList.contains('sort-desc');
            
            // Remove sort classes from all headers
            sortHeaders.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            
            // Add sort class to current header
            this.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
            
            // Sort rows
            rows.sort((a, b) => {
                const aText = a.children[columnIndex].textContent.trim();
                const bText = b.children[columnIndex].textContent.trim();
                
                if (isAscending) {
                    return aText.localeCompare(bText);
                } else {
                    return bText.localeCompare(aText);
                }
            });
            
            // Reorder rows in table
            rows.forEach(row => tbody.appendChild(row));
        });
    });
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Simulate API call to get dashboard statistics
        const stats = await fetchDashboardStats();
        updateStatistics(stats);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Use default values if API fails
        updateStatistics({
            totalBooks: 4,
            totalStudents: 9,
            returnedToday: 2,
            borrowedToday: 5
        });
    }
}

async function fetchDashboardStats() {
    try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Failed to fetch stats');
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return default values if API fails
        return {
            totalBooks: 4,
            totalStudents: 9,
            returnedToday: 2,
            borrowedToday: 5
        };
    }
}

function updateStatistics(stats) {
    const statElements = {
        totalBooks: document.querySelector('.stat-card.blue .stat-number'),
        totalStudents: document.querySelector('.stat-card.green .stat-number'),
        returnedToday: document.querySelector('.stat-card.orange .stat-number'),
        borrowedToday: document.querySelector('.stat-card.red .stat-number')
    };

    // Animate numbers
    Object.keys(statElements).forEach(key => {
        const element = statElements[key];
        if (element) {
            animateNumber(element, 0, stats[key], 1000);
        }
    });
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// More Info Button Functionality
document.addEventListener('click', function(e) {
    if (e.target.closest('.more-info')) {
        const card = e.target.closest('.stat-card');
        const cardType = card.classList.contains('blue') ? 'books' :
                        card.classList.contains('green') ? 'students' :
                        card.classList.contains('orange') ? 'returns' : 'borrows';
        
        // Navigate to relevant page
        switch(cardType) {
            case 'books':
                navigateToPage('books');
                break;
            case 'students':
                navigateToPage('students');
                break;
            case 'returns':
                navigateToPage('return');
                break;
            case 'borrows':
                navigateToPage('borrow');
                break;
        }
    }
});

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    `;
    
    if (type === 'success') {
        notification.style.background = '#2ecc71';
    } else if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else {
        notification.style.background = '#3498db';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Handle window resize
window.addEventListener('resize', function() {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('open');
    }
});

// Initialize tooltips and other UI enhancements
function initUIEnhancements() {
    // Add loading states
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 2000);
            }
        });
    });
}

// Call UI enhancements
initUIEnhancements();
