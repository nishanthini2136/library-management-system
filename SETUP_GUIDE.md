# Complete Setup Guide for Library Management System

This guide will walk you through setting up the Library Management System with MySQL database connectivity.

## Prerequisites Installation

### 1. Install Python (if not already installed)

**Windows:**
1. Go to [python.org](https://www.python.org/downloads/)
2. Download Python 3.8 or later
3. During installation, **check "Add Python to PATH"**
4. Verify installation: Open Command Prompt and run `python --version`

**Alternative for Windows:**
- Use Microsoft Store: Search for "Python" and install Python 3.11

### 2. Install MySQL

**Windows:**
1. Download MySQL Community Server from [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. Run the installer and follow the setup wizard
3. Remember the root password you set during installation
4. Optionally install MySQL Workbench for database management

**Alternative:**
- Use XAMPP which includes MySQL: [apachefriends.org](https://www.apachefriends.org/)

## Project Setup

### Step 1: Verify Python Installation
Open Command Prompt or PowerShell and run:
```cmd
python --version
```
or
```cmd
py --version
```

If Python is not found, please install it first (see Prerequisites above).

### Step 2: Install Project Dependencies
Navigate to the project directory and run:
```cmd
python -m pip install -r requirements.txt
```

If you get permission errors, try:
```cmd
python -m pip install --user -r requirements.txt
```

### Step 3: Configure MySQL Database

#### Option A: Use existing MySQL installation
1. Start MySQL service
2. Create a database (optional - script will create it):
```sql
mysql -u root -p
CREATE DATABASE library_management;
```

#### Option B: Use XAMPP
1. Start XAMPP Control Panel
2. Start Apache and MySQL services
3. Open phpMyAdmin (http://localhost/phpmyadmin)
4. Create database named `library_management`

### Step 4: Configure Environment Variables
1. Copy `.env.example` to `.env`:
```cmd
copy .env.example .env
```

2. Edit `.env` file with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=library_management
```

### Step 5: Initialize Database
Run the database initialization script:
```cmd
python init_db.py
```

This will:
- Create the database if it doesn't exist
- Create all required tables
- Insert sample data

### Step 6: Start the Application
```cmd
python app.py
```

Open your browser and go to: `http://localhost:5000`

## Default Login Credentials

After successful setup, use these credentials to test the system:

### Admin Access
- **URL**: `http://localhost:5000/admin-login.html`
- **Username**: `admin` **Password**: `admin123`
- **Username**: `librarian` **Password**: `lib123`

### User Access
- **URL**: `http://localhost:5000/user-login.html`
- **Email**: `student@university.edu` **Password**: `student123`
- **Email**: `faculty@university.edu` **Password**: `faculty123`

## Troubleshooting

### Common Issues and Solutions

#### 1. Python not found
**Error**: `'python' is not recognized as an internal or external command`

**Solution**: 
- Reinstall Python and check "Add Python to PATH"
- Or use full path: `C:\Python39\python.exe` (adjust path as needed)
- Or use `py` command instead of `python`

#### 2. pip not found
**Error**: `'pip' is not recognized as an internal or external command`

**Solution**: Use `python -m pip` instead of just `pip`

#### 3. MySQL connection failed
**Error**: `Can't connect to MySQL server`

**Solutions**:
- Verify MySQL service is running
- Check credentials in `.env` file
- For XAMPP: Start MySQL from XAMPP Control Panel
- Check if port 3306 is available

#### 4. Access denied for user
**Error**: `Access denied for user 'root'@'localhost'`

**Solutions**:
- Verify password in `.env` file
- Reset MySQL root password if forgotten
- Create a new MySQL user with proper privileges

#### 5. Database creation failed
**Error**: `Can't create database`

**Solutions**:
- Ensure MySQL user has CREATE privileges
- Manually create database using MySQL Workbench or phpMyAdmin
- Check MySQL server logs for detailed error

#### 6. Module not found errors
**Error**: `ModuleNotFoundError: No module named 'flask'`

**Solutions**:
- Run `python -m pip install -r requirements.txt`
- Check if you're using the correct Python environment
- Try installing packages individually

### Manual Database Setup (Alternative)

If automatic setup fails, you can manually set up the database:

1. **Create Database**:
```sql
CREATE DATABASE library_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Create User** (optional):
```sql
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON library_management.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Update .env file** with the new credentials

4. **Run initialization**:
```cmd
python init_db.py
```

### Testing the Setup

1. **Start the application**: `python app.py`
2. **Open browser**: Go to `http://localhost:5000`
3. **Test user registration**: Try creating a new user account
4. **Test admin login**: Use admin credentials to access admin panel
5. **Test book operations**: Try borrowing and returning books

### Performance Tips

1. **For development**: Keep `FLASK_DEBUG=True` in `.env`
2. **For production**: Set `FLASK_DEBUG=False` and use a strong `SECRET_KEY`
3. **Database optimization**: Consider adding indexes for large datasets
4. **Security**: Change default passwords before deploying

## Getting Help

If you encounter issues not covered here:

1. Check the main `README.md` for additional information
2. Review error messages carefully
3. Ensure all prerequisites are properly installed
4. Try the manual setup steps
5. Check MySQL and Python documentation for specific errors

## Next Steps

After successful setup:
1. Explore the user interface
2. Test all features (borrowing, returning, reservations)
3. Customize the system for your specific needs
4. Add more books and users as needed
5. Configure backup procedures for the database
