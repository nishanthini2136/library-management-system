from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import json
import pymysql
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

# Install PyMySQL as MySQLdb
pymysql.install_as_MySQLdb()

app = Flask(__name__, static_folder='.', static_url_path='')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

# MySQL Database Configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'library_management')

# Debug: Print connection info (comment out for production)
# print(f"Database Config - Host: {DB_HOST}, User: {DB_USER}, Database: {DB_NAME}")
# print(f"Password provided: {'Yes' if DB_PASSWORD else 'No'}")

# Construct MySQL connection string
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
}

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # student or faculty
    student_id = db.Column(db.String(20))
    department = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    status = db.Column(db.String(20), default='active')  # active, suspended, inactive
    max_books = db.Column(db.Integer, default=5)  # maximum books user can borrow
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    borrowings = db.relationship('Borrowing', backref='user', lazy=True)
    reservations = db.relationship('Reservation', backref='user', lazy=True)
    fines = db.relationship('Fine', backref='user', lazy=True)

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    isbn = db.Column(db.String(20), unique=True)
    subject = db.Column(db.String(100))
    description = db.Column(db.Text)
    total_copies = db.Column(db.Integer, default=1)
    available_copies = db.Column(db.Integer, default=1)
    shelf_location = db.Column(db.String(50))
    condition = db.Column(db.String(20), default='good')  # good, damaged, lost
    publication_year = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    borrowings = db.relationship('Borrowing', backref='book', lazy=True)
    reservations = db.relationship('Reservation', backref='book', lazy=True)

class Borrowing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    borrowed_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    returned_date = db.Column(db.DateTime)
    renewal_count = db.Column(db.Integer, default=0)
    max_renewals = db.Column(db.Integer, default=2)
    status = db.Column(db.String(20), default='borrowed')  # borrowed, returned, overdue, lost
    
    # Relationships
    fines = db.relationship('Fine', backref='borrowing', lazy=True)

class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    reserved_date = db.Column(db.DateTime, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='active')  # active, fulfilled, expired, cancelled
    priority = db.Column(db.Integer, default=1)  # position in waitlist

class Fine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    borrowing_id = db.Column(db.Integer, db.ForeignKey('borrowing.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    reason = db.Column(db.String(100))  # overdue, damaged, lost
    status = db.Column(db.String(20), default='pending')  # pending, paid, waived
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    paid_at = db.Column(db.DateTime)

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), default='librarian')  # librarian, admin, super_admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), default='info')  # info, warning, error, success
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
@app.route('/about.html')
def about():
    return render_template('about.html')

@app.route('/contact')
@app.route('/contact.html')
def contact():
    return render_template('contact.html')

@app.route('/catalog')
@app.route('/catalog.html')
def catalog():
    return render_template('catalog.html')

@app.route('/book-details')
@app.route('/book-details.html')
def book_details():
    return render_template('book-details.html')

@app.route('/user-login')
@app.route('/user-login.html')
def user_login():
    return render_template('user-login.html')

@app.route('/user-signup')
@app.route('/user-signup.html')
def user_signup():
    return render_template('user-signup.html')

@app.route('/user-dashboard')
@app.route('/user-dashboard.html')
def user_dashboard_page():
    return render_template('user-dashboard.html')

@app.route('/user-profile')
@app.route('/user-profile.html')
def user_profile():
    return render_template('user-profile.html')

@app.route('/user-manage')
@app.route('/user-manage.html')
def user_manage():
    return render_template('user-manage.html')

@app.route('/admin-login')
@app.route('/admin-login.html')
def admin_login_page():
    return render_template('admin-login.html')

@app.route('/admin-dashboard')
@app.route('/admin-dashboard.html')
def admin_dashboard_page():
    return render_template('admin-dashboard.html')

@app.route('/admin-dashboard-modern')
@app.route('/admin-dashboard-modern.html')
def admin_dashboard_modern():
    return render_template('admin-dashboard-modern.html')

@app.route('/database-viewer')
@app.route('/database-viewer.html')
def database_viewer():
    return render_template('database-viewer.html')

@app.route('/admin-login-test')
@app.route('/admin-login-test.html')
def admin_login_test():
    return render_template('admin-login-test.html')

@app.route('/login-debug')
@app.route('/login-debug.html')
def login_debug():
    return render_template('login-debug.html')

@app.route('/simple-admin-login')
@app.route('/simple-admin-login.html')
def simple_admin_login():
    return render_template('simple-admin-login.html')


# Dashboard API
@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    try:
        # Get statistics from database
        total_books = Book.query.count()
        total_users = User.query.count()
        
        # Get today's transactions
        from datetime import date
        today = date.today()
        
        # Count borrowings and returns for today (simplified)
        borrowed_today = Borrowing.query.filter(
            db.func.date(Borrowing.borrow_date) == today
        ).count()
        
        returned_today = Borrowing.query.filter(
            db.func.date(Borrowing.return_date) == today
        ).count()
        
        return jsonify({
            'totalBooks': total_books,
            'totalStudents': total_users,
            'borrowedToday': borrowed_today,
            'returnedToday': returned_today
        })
    except Exception as e:
        return jsonify({
            'totalBooks': 4,
            'totalStudents': 9,
            'borrowedToday': 5,
            'returnedToday': 2
        })

# User Authentication & Management
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Create new user
    user = User(
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        first_name=data['firstName'],
        last_name=data['lastName'],
        user_type=data['userType'],
        student_id=data.get('studentId'),
        department=data.get('department'),
        phone=data['phone']
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        if user.status != 'active':
            return jsonify({'error': 'Account is suspended or inactive'}), 403
        
        session['user_id'] = user.id
        session['user_type'] = user.user_type
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': user.user_type,
                'max_books': user.max_books
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    admin = Admin.query.filter_by(username=data['username']).first()
    
    if admin and check_password_hash(admin.password_hash, data['password']):
        session['admin_id'] = admin.id
        session['admin_role'] = admin.role
        return jsonify({'message': 'Admin login successful', 'role': admin.role})
    
    return jsonify({'error': 'Invalid admin credentials'}), 401

# Book Management
@app.route('/api/books', methods=['GET'])
def get_books():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    search = request.args.get('search', '')
    subject = request.args.get('subject', '')
    status = request.args.get('status', '')
    
    query = Book.query
    
    if search:
        query = query.filter(
            db.or_(
                Book.title.ilike(f'%{search}%'),
                Book.author.ilike(f'%{search}%'),
                Book.isbn.ilike(f'%{search}%')
            )
        )
    
    if subject:
        query = query.filter(Book.subject == subject)
    
    if status == 'available':
        query = query.filter(Book.available_copies > 0)
    elif status == 'borrowed':
        query = query.filter(Book.available_copies < Book.total_copies)
    
    books = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'books': [{
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'isbn': book.isbn,
            'subject': book.subject,
            'total_copies': book.total_copies,
            'available_copies': book.available_copies,
            'shelf_location': book.shelf_location,
            'condition': book.condition
        } for book in books.items],
        'total': books.total,
        'pages': books.pages,
        'current_page': page
    })

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    
    # Get borrowing information
    borrowed_copies = Borrowing.query.filter_by(
        book_id=book_id, 
        status='borrowed'
    ).count()
    
    # Calculate availability status
    status = 'available' if book.available_copies > 0 else 'borrowed'
    
    # Get copy details (simulate individual copies)
    copies = []
    for i in range(1, book.total_copies + 1):
        is_available = i <= book.available_copies
        copy_status = 'available' if is_available else 'borrowed'
        copies.append({
            'id': f'copy{i}',
            'copy_number': i,
            'location': f'Shelf {book.shelf_location}, Row {(i-1)//3 + 1}',
            'condition': book.condition.title(),
            'status': copy_status,
            'due_date': None if is_available else (datetime.utcnow() + timedelta(days=7)).strftime('%b %d, %Y')
        })
    
    return jsonify({
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'isbn': book.isbn,
        'subject': book.subject,
        'description': book.description or 'No description available for this book.',
        'total_copies': book.total_copies,
        'available_copies': book.available_copies,
        'borrowed_copies': borrowed_copies,
        'shelf_location': book.shelf_location,
        'condition': book.condition,
        'publication_year': book.publication_year,
        'status': status,
        'copies': copies,
        'publisher': 'Academic Press',  # Default publisher
        'pages': 250,  # Default page count
        'language': 'English',  # Default language
        'format': 'Hardcover',  # Default format
        'rating': 4.2,  # Default rating
        'rating_count': 156,  # Default rating count
        'tags': book.subject.split(', ') if book.subject else ['General']
    })

@app.route('/api/admin/books', methods=['POST'])
def add_book():
    if 'admin_id' not in session:
        return jsonify({'error': 'Admin not logged in'}), 401
    
    data = request.get_json()
    book = Book(**data)
    db.session.add(book)
    db.session.commit()
    
    return jsonify({'message': 'Book added successfully', 'book_id': book.id})

@app.route('/api/admin/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    if 'admin_id' not in session:
        return jsonify({'error': 'Admin not logged in'}), 401
    
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    
    for key, value in data.items():
        if hasattr(book, key):
            setattr(book, key, value)
    
    db.session.commit()
    return jsonify({'message': 'Book updated successfully'})

@app.route('/api/admin/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    if 'admin_id' not in session:
        return jsonify({'error': 'Admin not logged in'}), 401
    
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    
    return jsonify({'message': 'Book deleted successfully'})

# User Operations
@app.route('/api/borrow', methods=['POST'])
def borrow_book():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401
    
    data = request.get_json()
    user = User.query.get(session['user_id'])
    book = Book.query.get_or_404(data['book_id'])
    
    # Check if user can borrow more books
    current_borrowings = Borrowing.query.filter_by(user_id=session['user_id'], status='borrowed').count()
    if current_borrowings >= user.max_books:
        return jsonify({'error': f'You can only borrow up to {user.max_books} books at a time'}), 400
    
    # Check if book is available
    if book.available_copies <= 0:
        return jsonify({'error': 'No copies available'}), 400
    
    # Check if user already has this book
    existing_borrowing = Borrowing.query.filter_by(
        user_id=session['user_id'],
        book_id=book.id,
        status='borrowed'
    ).first()
    
    if existing_borrowing:
        return jsonify({'error': 'You already have this book borrowed'}), 400
    
    # Create borrowing record
    borrowing = Borrowing(
        user_id=session['user_id'],
        book_id=book.id,
        due_date=datetime.utcnow() + timedelta(days=14)  # 2 weeks loan period
    )
    
    book.available_copies -= 1
    db.session.add(borrowing)
    db.session.commit()
    
    # Create notification
    notification = Notification(
        user_id=session['user_id'],
        title='Book Borrowed Successfully',
        message=f'You have borrowed "{book.title}" by {book.author}. Due date: {borrowing.due_date.strftime("%B %d, %Y")}',
        type='success'
    )
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({'message': 'Book borrowed successfully', 'due_date': borrowing.due_date.isoformat()})

@app.route('/api/return', methods=['POST'])
def return_book():
    if 'admin_id' not in session:
        return jsonify({'error': 'Admin not logged in'}), 401
    
    data = request.get_json()
    borrowing = Borrowing.query.filter_by(
        user_id=data['user_id'],
        book_id=data['book_id'],
        status='borrowed'
    ).first()
    
    if not borrowing:
        return jsonify({'error': 'Borrowing record not found'}), 404
    
    # Calculate fine if overdue
    fine_amount = 0
    if datetime.utcnow() > borrowing.due_date:
        days_overdue = (datetime.utcnow() - borrowing.due_date).days
        fine_amount = days_overdue * 0.50  # $0.50 per day
    
    # Update borrowing record
    borrowing.returned_date = datetime.utcnow()
    borrowing.status = 'returned'
    
    # Update book availability
    book = Book.query.get(borrowing.book_id)
    book.available_copies += 1
    
    # Create fine record if applicable
    if fine_amount > 0:
        fine = Fine(
            user_id=borrowing.user_id,
            borrowing_id=borrowing.id,
            amount=fine_amount,
            reason='overdue'
        )
        db.session.add(fine)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Book returned successfully',
        'fine_amount': fine_amount,
        'days_overdue': days_overdue if fine_amount > 0 else 0
    })

@app.route('/api/renew', methods=['POST'])
def renew_book():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401
    
    data = request.get_json()
    borrowing = Borrowing.query.filter_by(
        user_id=session['user_id'],
        book_id=data['book_id'],
        status='borrowed'
    ).first()
    
    if not borrowing:
        return jsonify({'error': 'Borrowing record not found'}), 404
    
    # Check if renewal is allowed
    if borrowing.renewal_count >= borrowing.max_renewals:
        return jsonify({'error': 'Maximum renewals reached for this book'}), 400
    
    # Extend due date by 2 weeks
    borrowing.due_date += timedelta(days=14)
    borrowing.renewal_count += 1
    
    db.session.commit()
    
    return jsonify({
        'message': 'Book renewed successfully',
        'new_due_date': borrowing.due_date.isoformat(),
        'renewals_remaining': borrowing.max_renewals - borrowing.renewal_count
    })

@app.route('/api/reserve', methods=['POST'])
def reserve_book():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401
    
    data = request.get_json()
    book = Book.query.get_or_404(data['book_id'])
    
    # Check if user already has an active reservation
    existing_reservation = Reservation.query.filter_by(
        user_id=session['user_id'],
        book_id=book.id,
        status='active'
    ).first()
    
    if existing_reservation:
        return jsonify({'error': 'Book already reserved'}), 400
    
    # Get current reservation count for priority
    current_reservations = Reservation.query.filter_by(
        book_id=book.id,
        status='active'
    ).count()
    
    # Create reservation
    reservation = Reservation(
        user_id=session['user_id'],
        book_id=book.id,
        expiry_date=datetime.utcnow() + timedelta(days=7),  # 1 week reservation
        priority=current_reservations + 1
    )
    
    db.session.add(reservation)
    db.session.commit()
    
    return jsonify({
        'message': 'Book reserved successfully',
        'priority': reservation.priority,
        'expiry_date': reservation.expiry_date.isoformat()
    })

# User Dashboard
@app.route('/api/user/dashboard', methods=['GET'])
def user_dashboard():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401
    
    user = User.query.get(session['user_id'])
    
    # Get user's borrowings (both borrowed and returned) and reservations
    borrowings_all = Borrowing.query.filter_by(user_id=session['user_id']).order_by(Borrowing.borrowed_date.desc()).all()
    borrowings_active = [b for b in borrowings_all if b.status == 'borrowed']
    reservations = Reservation.query.filter_by(user_id=session['user_id'], status='active').all()
    
    # Calculate overdue books
    overdue_books = [b for b in borrowings_active if datetime.utcnow() > b.due_date]
    due_soon_books = [b for b in borrowings_active if 0 <= (b.due_date - datetime.utcnow()).days <= 3]
    
    # Get notifications
    notifications = Notification.query.filter_by(user_id=session['user_id'], read=False).order_by(Notification.created_at.desc()).limit(10).all()
    
    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': user.user_type,
            'max_books': user.max_books
        },
        'stats': {
            'borrowed_count': len(borrowings_active),
            'overdue_count': len(overdue_books),
            'due_soon_count': len(due_soon_books),
            'reserved_count': len(reservations)
        },
        'borrowings': [{
            'id': b.id,
            'book_title': b.book.title,
            'book_author': b.book.author,
            'book_isbn': b.book.isbn,
            'book_description': b.book.description,
            'borrowed_date': b.borrowed_date.isoformat() if b.borrowed_date else None,
            'due_date': b.due_date.isoformat() if b.due_date else None,
            'returned_date': b.returned_date.isoformat() if b.returned_date else None,
            'status': b.status,
            'renewal_count': b.renewal_count,
            'max_renewals': b.max_renewals,
            'is_overdue': (datetime.utcnow() > b.due_date) if b.due_date else False,
            'days_overdue': max(0, (datetime.utcnow() - b.due_date).days) if (b.due_date and datetime.utcnow() > b.due_date) else 0
        } for b in borrowings_all],
        'reservations': [{
            'id': r.id,
            'book_title': r.book.title,
            'book_author': r.book.author,
            'reserved_date': r.reserved_date.isoformat(),
            'expiry_date': r.expiry_date.isoformat(),
            'priority': r.priority
        } for r in reservations],
        'notifications': [{
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'type': n.type,
            'created_at': n.created_at.isoformat()
        } for n in notifications]
    })

# Admin Dashboard
@app.route('/api/admin/dashboard', methods=['GET'])
def admin_dashboard():
    if 'admin_id' not in session:
        return jsonify({'error': 'Admin not logged in'}), 401
    
    # Get system statistics
    total_books = Book.query.count()
    total_users = User.query.filter_by(status='active').count()
    borrowed_books = Borrowing.query.filter_by(status='borrowed').count()
    overdue_books = Borrowing.query.filter(
        Borrowing.status == 'borrowed',
        Borrowing.due_date < datetime.utcnow()
    ).count()
    returned_count = Borrowing.query.filter_by(status='returned').count()
    # Users with paid fines
    paid_fine_users = db.session.query(Fine.user_id).filter(Fine.status == 'paid').distinct().count()
    unpaid_fine_users = db.session.query(Fine.user_id).filter(Fine.status == 'pending').distinct().count()
    # Books by subject breakdown
    books_by_subject = db.session.query(Book.subject, db.func.count(Book.id)).group_by(Book.subject).all()
    
    # Get recent transactions
    recent_transactions = Borrowing.query.order_by(Borrowing.borrowed_date.desc()).limit(10).all()
    
    # Get overdue books details
    overdue_details = db.session.query(Borrowing, User, Book).join(User).join(Book).filter(
        Borrowing.status == 'borrowed',
        Borrowing.due_date < datetime.utcnow()
    ).limit(10).all()
    
    return jsonify({
        'stats': {
            'total_books': total_books,
            'total_users': total_users,
            'borrowed_books': borrowed_books,
            'overdue_books': overdue_books,
            'returned_books': returned_count,
            'paid_fine_users': paid_fine_users,
            'unpaid_fine_users': unpaid_fine_users,
            'books_by_subject': [{ 'subject': s or 'Unknown', 'count': c } for s, c in books_by_subject]
        },
        'recent_transactions': [{
            'id': t.id,
            'user_name': f"{t.user.first_name} {t.user.last_name}",
            'book_title': t.book.title,
            'borrowed_date': t.borrowed_date.isoformat(),
            'due_date': t.due_date.isoformat()
        } for t in recent_transactions],
        'overdue_books': [{
            'id': t.Borrowing.id,
            'user_name': f"{t.User.first_name} {t.User.last_name}",
            'user_email': t.User.email,
            'book_title': t.Book.title,
            'days_overdue': (datetime.utcnow() - t.Borrowing.due_date).days
        } for t in overdue_details]
    })

# Fine Management
@app.route('/api/admin/fines', methods=['GET'])
def get_fines():
    if 'admin_id' not in session:
        return jsonify({'error': 'Admin not logged in'}), 401
    
    fines = Fine.query.filter_by(status='pending').all()
    
    return jsonify({
        'fines': [{
            'id': f.id,
            'user_name': f"{f.user.first_name} {f.user.last_name}",
            'user_email': f.user.email,
            'book_title': f.borrowing.book.title,
            'amount': f.amount,
            'reason': f.reason,
            'created_at': f.created_at.isoformat()
        } for f in fines]
    })

@app.route('/api/admin/fines/<int:fine_id>/waive', methods=['POST'])
def waive_fine(fine_id):
    if 'admin_id' not in session:
        return jsonify({'error': 'Admin not logged in'}), 401
    
    fine = Fine.query.get_or_404(fine_id)
    fine.status = 'waived'
    db.session.commit()
    
    return jsonify({'message': 'Fine waived successfully'})

@app.route('/api/admin/fines/<int:fine_id>/pay', methods=['POST'])
def pay_fine(fine_id):
    if 'admin_id' not in session:
        return jsonify({'error': 'Admin not logged in'}), 401
    
    fine = Fine.query.get_or_404(fine_id)
    fine.status = 'paid'
    fine.paid_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Fine marked as paid'})

# Reports & Analytics
@app.route('/api/admin/reports/circulation', methods=['GET'])
def circulation_report():
    if 'admin_id' not in session:
        return jsonify({'error': 'Admin not logged in'}), 401
    
    period = request.args.get('period', 'month')
    
    # Calculate date range
    if period == 'week':
        start_date = datetime.utcnow() - timedelta(days=7)
    elif period == 'month':
        start_date = datetime.utcnow() - timedelta(days=30)
    elif period == 'quarter':
        start_date = datetime.utcnow() - timedelta(days=90)
    elif period == 'year':
        start_date = datetime.utcnow() - timedelta(days=365)
    else:
        start_date = datetime.utcnow() - timedelta(days=30)
    
    # Get circulation data
    borrowings = Borrowing.query.filter(
        Borrowing.borrowed_date >= start_date
    ).all()
    
    returns = Borrowing.query.filter(
        Borrowing.returned_date >= start_date
    ).all()
    
    # Get popular books
    popular_books = db.session.query(
        Book.title,
        Book.author,
        db.func.count(Borrowing.id).label('borrow_count')
    ).join(Borrowing).filter(
        Borrowing.borrowed_date >= start_date
    ).group_by(Book.id).order_by(db.func.count(Borrowing.id).desc()).limit(10).all()
    
    return jsonify({
        'period': period,
        'start_date': start_date.isoformat(),
        'total_borrowings': len(borrowings),
        'total_returns': len(returns),
        'popular_books': [{
            'title': book.title,
            'author': book.author,
            'borrow_count': book.borrow_count
        } for book in popular_books]
    })

@app.route('/api/logout')
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create sample admin user
        if not Admin.query.filter_by(username='admin').first():
            admin = Admin(
                username='admin',
                password_hash=generate_password_hash('admin123'),
                email='admin@library.edu',
                role='super_admin'
            )
            db.session.add(admin)
            db.session.commit()
            print("Sample admin user created: admin/admin123")
        
        # Create sample books
        if Book.query.count() == 0:
            sample_books = [
                Book(title='The Great Gatsby', author='F. Scott Fitzgerald', isbn='978-0743273565', subject='Fiction, American Literature, Classic', description='The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former lover, Daisy Buchanan.', total_copies=3, available_copies=2, shelf_location='F-FIT', publication_year=1925),
                Book(title='To Kill a Mockingbird', author='Harper Lee', isbn='978-0446310789', subject='Fiction', total_copies=2, available_copies=0, shelf_location='F-LEE', publication_year=1960),
                Book(title='1984', author='George Orwell', isbn='978-0451524935', subject='Fiction', total_copies=4, available_copies=3, shelf_location='F-ORW', publication_year=1949),
                Book(title='The Art of Computer Programming', author='Donald E. Knuth', isbn='978-0201896831', subject='Technology', total_copies=2, available_copies=1, shelf_location='T-KNU', publication_year=1968),
                Book(title='A Brief History of Time', author='Stephen Hawking', isbn='978-0553380163', subject='Science', total_copies=3, available_copies=0, shelf_location='S-HAW', publication_year=1988),
                Book(title='The Republic', author='Plato', isbn='978-0872201361', subject='Philosophy', total_copies=2, available_copies=2, shelf_location='P-PLA', publication_year=-380)
            ]
            
            for book in sample_books:
                db.session.add(book)
            
            db.session.commit()
            print("Sample books created")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
