#!/usr/bin/env python3
"""
Database initialization script for Library Management System
This script creates the MySQL database and tables, and populates with sample data.
"""

import pymysql
import os
from dotenv import load_dotenv
from app import app, db, Admin, Book, User
from werkzeug.security import generate_password_hash

# Load environment variables
load_dotenv()

def create_database():
    """Create the MySQL database if it doesn't exist"""
    # Force reload environment variables
    load_dotenv(override=True)
    
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', '3306'))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'library_management')
    
    print(f"Connecting to MySQL with user: {DB_USER}, host: {DB_HOST}:{DB_PORT}")
    print(f"Password provided: {'Yes' if DB_PASSWORD else 'No'}")
    
    try:
        # Connect to MySQL server (without specifying database)
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            # Create database if it doesn't exist
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"Database '{DB_NAME}' created or already exists.")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"Error creating database: {e}")
        return False

def init_tables_and_data():
    """Initialize database tables and sample data"""
    try:
        with app.app_context():
            # Create all tables
            db.create_all()
            print("Database tables created successfully.")
            
            # Create sample admin user if it doesn't exist
            if not Admin.query.filter_by(username='admin').first():
                admin = Admin(
                    username='admin',
                    password_hash=generate_password_hash('admin123'),
                    email='admin@library.edu',
                    role='super_admin'
                )
                db.session.add(admin)
                print("Sample admin user created: admin/admin123")
            
            # Create sample librarian user
            if not Admin.query.filter_by(username='librarian').first():
                librarian = Admin(
                    username='librarian',
                    password_hash=generate_password_hash('lib123'),
                    email='librarian@library.edu',
                    role='librarian'
                )
                db.session.add(librarian)
                print("Sample librarian user created: librarian/lib123")
            
            # Create sample regular users if they don't exist
            if not User.query.filter_by(email='student@university.edu').first():
                student = User(
                    email='student@university.edu',
                    password_hash=generate_password_hash('student123'),
                    first_name='John',
                    last_name='Doe',
                    user_type='student',
                    student_id='STU001',
                    department='Computer Science',
                    phone='555-0123'
                )
                db.session.add(student)
                print("Sample student user created: student@university.edu/student123")
            
            if not User.query.filter_by(email='faculty@university.edu').first():
                faculty = User(
                    email='faculty@university.edu',
                    password_hash=generate_password_hash('faculty123'),
                    first_name='Jane',
                    last_name='Smith',
                    user_type='faculty',
                    department='Mathematics',
                    phone='555-0124',
                    max_books=10  # Faculty can borrow more books
                )
                db.session.add(faculty)
                print("Sample faculty user created: faculty@university.edu/faculty123")
            
            # Create sample books if they don't exist
            if Book.query.count() == 0:
                sample_books = [
                    Book(
                        title='The Great Gatsby',
                        author='F. Scott Fitzgerald',
                        isbn='978-0743273565',
                        subject='Fiction, American Literature, Classic',
                        description='The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former lover, Daisy Buchanan.',
                        total_copies=3,
                        available_copies=2,
                        shelf_location='F-FIT',
                        publication_year=1925
                    ),
                    Book(
                        title='To Kill a Mockingbird',
                        author='Harper Lee',
                        isbn='978-0446310789',
                        subject='Fiction, Classic Literature',
                        description='A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.',
                        total_copies=2,
                        available_copies=1,
                        shelf_location='F-LEE',
                        publication_year=1960
                    ),
                    Book(
                        title='1984',
                        author='George Orwell',
                        isbn='978-0451524935',
                        subject='Fiction, Dystopian, Political',
                        description='A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.',
                        total_copies=4,
                        available_copies=3,
                        shelf_location='F-ORW',
                        publication_year=1949
                    ),
                    Book(
                        title='The Art of Computer Programming',
                        author='Donald E. Knuth',
                        isbn='978-0201896831',
                        subject='Technology, Computer Science, Programming',
                        description='A comprehensive monograph written by computer scientist Donald Knuth that covers many kinds of programming algorithms.',
                        total_copies=2,
                        available_copies=1,
                        shelf_location='T-KNU',
                        publication_year=1968
                    ),
                    Book(
                        title='A Brief History of Time',
                        author='Stephen Hawking',
                        isbn='978-0553380163',
                        subject='Science, Physics, Cosmology',
                        description='A popular-science book on cosmology by British physicist Stephen Hawking.',
                        total_copies=3,
                        available_copies=2,
                        shelf_location='S-HAW',
                        publication_year=1988
                    ),
                    Book(
                        title='The Republic',
                        author='Plato',
                        isbn='978-0872201361',
                        subject='Philosophy, Political Science',
                        description='A Socratic dialogue concerning justice and the ideal state, written by Plato around 375 BC.',
                        total_copies=2,
                        available_copies=2,
                        shelf_location='P-PLA',
                        publication_year=-380
                    ),
                    Book(
                        title='Introduction to Algorithms',
                        author='Thomas H. Cormen',
                        isbn='978-0262033848',
                        subject='Technology, Computer Science, Algorithms',
                        description='A comprehensive textbook covering many kinds of algorithms and data structures.',
                        total_copies=5,
                        available_copies=4,
                        shelf_location='T-COR',
                        publication_year=2009
                    ),
                    Book(
                        title='Clean Code',
                        author='Robert C. Martin',
                        isbn='978-0132350884',
                        subject='Technology, Software Engineering',
                        description='A handbook of agile software craftsmanship.',
                        total_copies=3,
                        available_copies=3,
                        shelf_location='T-MAR',
                        publication_year=2008
                    )
                ]
                
                for book in sample_books:
                    db.session.add(book)
                
                print("Sample books created.")
            
            # Commit all changes
            db.session.commit()
            print("Database initialization completed successfully!")
            
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.session.rollback()
        return False
    
    return True

def main():
    """Main function to initialize the database"""
    print("Starting Library Management System Database Initialization...")
    print("=" * 60)
    
    # Step 1: Create database
    print("Step 1: Creating MySQL database...")
    if not create_database():
        print("Failed to create database. Please check your MySQL connection.")
        return
    
    # Step 2: Initialize tables and data
    print("\nStep 2: Creating tables and sample data...")
    if not init_tables_and_data():
        print("Failed to initialize tables and data.")
        return
    
    print("\n" + "=" * 60)
    print("Database initialization completed successfully!")
    print("\nDefault login credentials:")
    print("Admin: admin / admin123")
    print("Librarian: librarian / lib123")
    print("Student: student@university.edu / student123")
    print("Faculty: faculty@university.edu / faculty123")
    print("\nYou can now start the application with: python app.py")

if __name__ == '__main__':
    main()
