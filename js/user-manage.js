document.addEventListener('DOMContentLoaded', () => {
    bindManageHandlers();
    loadBooks();
});

function bindManageHandlers() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => loadBooks(searchInput.value.trim()));
        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadBooks(searchInput.value.trim()); });
    }

    const addBtn = document.getElementById('addBookBtn');
    const updateBtn = document.getElementById('updateBookBtn');
    const clearBtn = document.getElementById('clearFormBtn');
    if (addBtn) addBtn.addEventListener('click', addBook);
    if (updateBtn) updateBtn.addEventListener('click', updateBook);
    if (clearBtn) clearBtn.addEventListener('click', clearForm);
}

async function loadBooks(query = '') {
    try {
        const url = new URL('/api/books', window.location.origin);
        if (query) url.searchParams.set('q', query);
        const res = await fetch(url);
        const data = await res.json();
        renderBooks(data.books || data);
    } catch (e) {
        renderBooks([]);
    }
}

function renderBooks(books) {
    const tbody = document.getElementById('booksTbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    books.forEach(book => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${book.cover_image || `https://covers.openlibrary.org/b/isbn/${book.isbn || ''}-S.jpg`}" onerror="this.src='images/book-icon.svg'" alt="cover" style="width:40px;height:60px;object-fit:cover;border-radius:4px"></td>
            <td>${book.title || ''}</td>
            <td>${book.author || ''}</td>
            <td>${book.subject || book.category || ''}</td>
            <td>${book.isbn || ''}</td>
            <td>${book.available_copies != null ? book.available_copies : ''}</td>
            <td>
                <button class="btn btn-secondary" data-action="edit">Edit</button>
                <button class="btn btn-outline" data-action="delete">Delete</button>
            </td>
        `;
        tr.querySelector('[data-action="edit"]').addEventListener('click', () => startEdit(book));
        tr.querySelector('[data-action="delete"]').addEventListener('click', () => deleteBook(book));
        tbody.appendChild(tr);
    });
}

function startEdit(book) {
    setValue('editBookId', book.id);
    setValue('title', book.title);
    setValue('author', book.author);
    setValue('category', book.subject || book.category || '');
    setValue('isbn', book.isbn);
    setValue('cover_image', book.cover_image || '');
    setValue('available_copies', book.available_copies ?? 0);
    const updateBtn = document.getElementById('updateBookBtn');
    if (updateBtn) updateBtn.disabled = false;
}

async function addBook() {
    const payload = readForm();
    try {
        const res = await fetch('/api/admin/books', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed');
        clearForm();
        loadBooks();
    } catch (e) {}
}

async function updateBook() {
    const id = getValue('editBookId');
    if (!id) return;
    const payload = readForm();
    try {
        const res = await fetch(`/api/admin/books/${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed');
        clearForm();
        loadBooks();
    } catch (e) {}
}

async function deleteBook(book) {
    if (!book || !book.id) return;
    if (!confirm(`Delete "${book.title}"?`)) return;
    try {
        const res = await fetch(`/api/admin/books/${book.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
        loadBooks();
    } catch (e) {}
}

function readForm() {
    return {
        title: getValue('title'),
        author: getValue('author'),
        subject: getValue('category'),
        isbn: getValue('isbn'),
        cover_image: getValue('cover_image'),
        available_copies: parseInt(getValue('available_copies') || '0', 10)
    };
}

function clearForm() {
    ['editBookId','title','author','category','isbn','cover_image','available_copies'].forEach(id => setValue(id, ''));
    setValue('available_copies', '1');
    const updateBtn = document.getElementById('updateBookBtn');
    if (updateBtn) updateBtn.disabled = true;
}

function getValue(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function setValue(id, val) { const el = document.getElementById(id); if (el) el.value = val; }


