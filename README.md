# Library Management System

A comprehensive web-based library management system built with Flask and MySQL, featuring separate interfaces for users and administrators.

## Features

### User Features
- **User Registration & Login**: Students and faculty can create accounts and log in
- **Book Catalog**: Browse and search available books
- **Book Borrowing**: Borrow available books with automatic due date calculation
- **Book Renewal**: Renew borrowed books (up to maximum renewals)
- **Book Reservation**: Reserve books that are currently unavailable
- **User Dashboard**: View borrowed books, reservations, and notifications
- **Fine Management**: View outstanding fines and payment status

### Admin Features
- **Admin Login**: Separate login for librarians and administrators
- **Book Management**: Add, edit, and delete books from the catalog
- **User Management**: View and manage user accounts
- **Borrowing Management**: Process book returns and manage overdue items
- **Fine Management**: Waive or mark fines as paid
- **Reports & Analytics**: Generate circulation reports and view system statistics
- **Dashboard**: Comprehensive overview of library operations

## Technology Stack

- **Backend**: Flask (Python web framework)
- **Database**: MySQL with SQLAlchemy ORM
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: Session-based with password hashing
- **Dependencies**: See `requirements.txt`

## Prerequisites

1. **Python 3.7+**
2. **MySQL Server** (5.7+ or 8.0+)
3. **pip** (Python package installer)

## Quick Start

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

### Prerequisites
- Python 3.7+ ([Download here](https://www.python.org/downloads/))
- MySQL Server ([Download here](https://dev.mysql.com/downloads/mysql/))

### Quick Installation
1. **Install dependencies**: `python -m pip install -r requirements.txt`
2. **Configure database**: Edit `.env` file with your MySQL credentials
3. **Initialize database**: `python init_db.py`
4. **Start application**: `python app.py`
5. **Open browser**: Go to `http://localhost:5000`

## Detailed Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Library-Management-System-main
```

### 2. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 3. MySQL Setup
Make sure MySQL server is running and create a database user if needed:

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database (optional, script will create it)
CREATE DATABASE library_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user (optional)
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON library_management.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Configure Environment Variables
Copy the example environment file and update with your MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env` file:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=library_management

# Application Configuration
SECRET_KEY=your-secret-key-change-in-production
FLASK_ENV=development
FLASK_DEBUG=True
```

### 5. Initialize Database
Run the database initialization script:

```bash
python init_db.py
```

This will:
- Create the MySQL database if it doesn't exist
- Create all required tables
- Insert sample data including books and user accounts

### 6. Run the Application
```bash
python app.py
```

The application will be available at: `http://localhost:5000`

## Default Login Credentials

After running the initialization script, you can use these default accounts:

### Admin Accounts
- **Super Admin**: `admin` / `admin123`
- **Librarian**: `librarian` / `lib123`

### User Accounts
- **Student**: `student@university.edu` / `student123`
- **Faculty**: `faculty@university.edu` / `faculty123`

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/admin/login` - Admin login
- `GET /api/logout` - Logout

### Books
- `GET /api/books` - Get books with pagination and search
- `GET /api/books/<id>` - Get book details
- `POST /api/admin/books` - Add new book (admin only)
- `PUT /api/admin/books/<id>` - Update book (admin only)
- `DELETE /api/admin/books/<id>` - Delete book (admin only)

### User Operations
- `POST /api/borrow` - Borrow a book
- `POST /api/return` - Return a book (admin only)
- `POST /api/renew` - Renew a book
- `POST /api/reserve` - Reserve a book
- `GET /api/user/dashboard` - User dashboard data

### Admin Operations
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/fines` - Get pending fines
- `POST /api/admin/fines/<id>/waive` - Waive a fine
- `POST /api/admin/fines/<id>/pay` - Mark fine as paid
- `GET /api/admin/reports/circulation` - Circulation reports

## Database Schema

The system uses the following main tables:
- **users** - User accounts (students, faculty)
- **admins** - Administrator accounts
- **books** - Book catalog
- **borrowings** - Book borrowing records
- **reservations** - Book reservations
- **fines** - Fine records
- **notifications** - User notifications

## File Structure

```
Library-Management-System-main/
├── app.py                 # Main Flask application
├── init_db.py            # Database initialization script
├── requirements.txt      # Python dependencies
├── .env                  # Environment configuration
├── .env.example         # Environment template
├── README.md            # This file
├── templates/           # HTML templates (if using Flask templates)
├── static/             # Static files (CSS, JS, images)
├── *.html              # Frontend HTML files
├── js/                 # JavaScript files
├── styles/             # CSS files
└── images/             # Image assets
```

## Configuration

### Environment Variables
- `DB_HOST` - MySQL host (default: localhost)
- `DB_PORT` - MySQL port (default: 3306)
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name (default: library_management)
- `SECRET_KEY` - Flask secret key for sessions
- `FLASK_ENV` - Flask environment (development/production)
- `FLASK_DEBUG` - Enable/disable debug mode

### Application Settings
- **Loan Period**: 14 days default
- **Maximum Renewals**: 2 per book
- **Fine Rate**: $0.50 per day for overdue books
- **Reservation Period**: 7 days
- **Default Book Limit**: 5 books for students, 10 for faculty

## Troubleshooting

### Common Issues

1. **MySQL Connection Error**
   - Verify MySQL server is running
   - Check credentials in `.env` file
   - Ensure database exists

2. **Import Errors**
   - Install all dependencies: `pip install -r requirements.txt`
   - Check Python version compatibility

3. **Permission Errors**
   - Ensure MySQL user has proper privileges
   - Check file permissions

### Database Reset
To reset the database completely:
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS library_management; CREATE DATABASE library_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Re-run initialization
python init_db.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Ensure all prerequisites are met
4. Create an issue in the repository
