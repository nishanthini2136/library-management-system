#!/usr/bin/env python3
"""
Setup script for Library Management System
This script helps with the initial setup and installation.
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        if e.stdout:
            print(f"Output: {e.stdout}")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("✗ Python 3.7 or higher is required")
        return False
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def check_mysql():
    """Check if MySQL is available"""
    try:
        result = subprocess.run("mysql --version", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ MySQL is available")
            return True
        else:
            print("⚠ MySQL not found in PATH")
            return False
    except:
        print("⚠ MySQL not found in PATH")
        return False

def install_dependencies():
    """Install Python dependencies"""
    return run_command(f"{sys.executable} -m pip install -r requirements.txt", "Installing Python dependencies")

def setup_environment():
    """Setup environment file"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists() and env_example.exists():
        try:
            env_file.write_text(env_example.read_text())
            print("✓ Created .env file from template")
            print("⚠ Please edit .env file with your MySQL credentials")
            return True
        except Exception as e:
            print(f"✗ Failed to create .env file: {e}")
            return False
    elif env_file.exists():
        print("✓ .env file already exists")
        return True
    else:
        print("✗ No .env.example file found")
        return False

def initialize_database():
    """Initialize the database"""
    return run_command(f"{sys.executable} init_db.py", "Initializing database")

def main():
    """Main setup function"""
    print("Library Management System Setup")
    print("=" * 50)
    
    # Check prerequisites
    print("\nChecking prerequisites...")
    if not check_python_version():
        return False
    
    mysql_available = check_mysql()
    if not mysql_available:
        print("⚠ MySQL not detected. Please ensure MySQL is installed and running.")
        print("  You may need to add MySQL to your system PATH.")
    
    # Install dependencies
    print("\nInstalling dependencies...")
    if not install_dependencies():
        print("✗ Failed to install dependencies")
        return False
    
    # Setup environment
    print("\nSetting up environment...")
    if not setup_environment():
        print("✗ Failed to setup environment")
        return False
    
    # Ask user if they want to initialize database
    print("\nDatabase initialization:")
    print("Before initializing the database, please ensure:")
    print("1. MySQL server is running")
    print("2. You have updated .env file with correct MySQL credentials")
    print("3. The MySQL user has permission to create databases")
    
    response = input("\nDo you want to initialize the database now? (y/N): ").strip().lower()
    
    if response in ['y', 'yes']:
        if initialize_database():
            print("\n" + "=" * 50)
            print("✓ Setup completed successfully!")
            print("\nDefault login credentials:")
            print("Admin: admin / admin123")
            print("Librarian: librarian / lib123")
            print("Student: student@university.edu / student123")
            print("Faculty: faculty@university.edu / faculty123")
            print("\nTo start the application, run: python app.py")
        else:
            print("\n✗ Database initialization failed")
            print("Please check your MySQL configuration and try running:")
            print("python init_db.py")
    else:
        print("\n⚠ Database not initialized")
        print("To initialize later, run: python init_db.py")
        print("To start the application, run: python app.py")
    
    return True

if __name__ == '__main__':
    success = main()
    if not success:
        sys.exit(1)
