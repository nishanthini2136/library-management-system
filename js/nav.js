// Role-aware Navbar Injection

document.addEventListener('DOMContentLoaded', function() {
	const navContainer = document.getElementById('navbar');
	if (!navContainer) return;

	const role = sessionStorage.getItem('role');

	function createLink(href, text, isActive) {
		const a = document.createElement('a');
		a.href = href;
		a.className = 'nav-link' + (isActive ? ' active' : '');
		a.textContent = text;
		return a;
	}

	// Clear any existing children
	while (navContainer.firstChild) navContainer.removeChild(navContainer.firstChild);

	const currentPage = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

	if (role === 'admin') {
		// Admin navbar: Home | Manage
		navContainer.appendChild(createLink('index.html', 'Home', currentPage === 'index.html'));
		navContainer.appendChild(createLink('admin-dashboard.html', 'Manage', currentPage === 'admin-dashboard.html'));
	} else {
		// User/public navbar
		navContainer.appendChild(createLink('index.html', 'Home', currentPage === 'index.html'));
		navContainer.appendChild(createLink('catalog.html', 'Catalog', currentPage === 'catalog.html'));
		if (role === 'user') {
			navContainer.appendChild(createLink('user-dashboard.html', 'Dashboard', currentPage === 'user-dashboard.html'));
			//navContainer.appendChild(createLink('user-manage.html', 'Manage', currentPage === 'user-manage.html'));
			const logout = createLink('#', 'Logout', false);
			logout.addEventListener('click', function(e) {
				e.preventDefault();
				sessionStorage.clear();
				location.href = 'index.html';
			});
			navContainer.appendChild(logout);
		} else {
			// public (not logged in)
			navContainer.appendChild(createLink('user-login.html', 'Login', currentPage === 'user-login.html'));
		}
		navContainer.appendChild(createLink('about.html', 'About', currentPage === 'about.html'));
		navContainer.appendChild(createLink('contact.html', 'Contact', currentPage === 'contact.html'));
	}
});