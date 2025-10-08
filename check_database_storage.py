#!/usr/bin/env python3
"""
Check if database is storing user and admin details properly
"""

from app import app, db, User, Admin
from werkzeug.security import generate_password_hash
import requests
import json

def check_database_connection():
    """Check if database connection is working"""
    with app.app_context():
        try:
            # Try to query the database
            user_count = User.query.count()
            admin_count = Admin.query.count()
            print(f"✅ Database connection working")
            print(f"   Current users: {user_count}")
            print(f"   Current admins: {admin_count}")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False

def check_tables_exist():
    """Check if database tables exist"""
    with app.app_context():
        try:
            # Check if tables exist by trying to create them
            db.create_all()
            print("✅ Database tables created/verified")
            
            # List all tables
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"   Available tables: {tables}")
            return True
        except Exception as e:
            print(f"❌ Table creation failed: {e}")
            return False

def test_user_creation():
    """Test creating a user directly in database"""
    with app.app_context():
        try:
            # Delete test user if exists
            existing_user = User.query.filter_by(email='dbtest@example.com').first()
            if existing_user:
                db.session.delete(existing_user)
                db.session.commit()
            
            # Create new test user
            test_user = User(
                email='dbtest@example.com',
                password_hash=generate_password_hash('testpass'),
                first_name='Database',
                last_name='Test',
                user_type='student',
                phone='9876543210'
            )
            
            db.session.add(test_user)
            db.session.commit()
            
            # Verify user was saved
            saved_user = User.query.filter_by(email='dbtest@example.com').first()
            if saved_user:
                print("✅ User creation test: SUCCESS")
                print(f"   User ID: {saved_user.id}")
                print(f"   Name: {saved_user.first_name} {saved_user.last_name}")
                print(f"   Email: {saved_user.email}")
                return True
            else:
                print("❌ User creation test: FAILED - User not found after creation")
                return False
                
        except Exception as e:
            print(f"❌ User creation test: ERROR - {e}")
            return False

def test_admin_creation():
    """Test creating an admin directly in database"""
    with app.app_context():
        try:
            # Delete test admin if exists
            existing_admin = Admin.query.filter_by(username='dbtest').first()
            if existing_admin:
                db.session.delete(existing_admin)
                db.session.commit()
            
            # Create new test admin
            test_admin = Admin(
                username='dbtest',
                password_hash=generate_password_hash('testpass'),
                email='dbtest@admin.com',
                role='admin'
            )
            
            db.session.add(test_admin)
            db.session.commit()
            
            # Verify admin was saved
            saved_admin = Admin.query.filter_by(username='dbtest').first()
            if saved_admin:
                print("✅ Admin creation test: SUCCESS")
                print(f"   Admin ID: {saved_admin.id}")
                print(f"   Username: {saved_admin.username}")
                print(f"   Email: {saved_admin.email}")
                return True
            else:
                print("❌ Admin creation test: FAILED - Admin not found after creation")
                return False
                
        except Exception as e:
            print(f"❌ Admin creation test: ERROR - {e}")
            return False

def test_api_registration():
    """Test user registration through API"""
    print("\n🌐 Testing API Registration...")
    
    # Test user registration
    user_data = {
        "firstName": "API",
        "lastName": "TestUser",
        "email": "apitest@example.com",
        "phone": "1234567890",
        "userType": "student",
        "password": "apitest123"
    }
    
    try:
        # Remove existing user first
        with app.app_context():
            existing = User.query.filter_by(email=user_data["email"]).first()
            if existing:
                db.session.delete(existing)
                db.session.commit()
        
        response = requests.post(
            "http://127.0.0.1:5000/api/register",
            headers={"Content-Type": "application/json"},
            data=json.dumps(user_data),
            timeout=10
        )
        
        print(f"Registration API Status: {response.status_code}")
        
        if response.status_code == 201:
            # Check if user was actually saved to database
            with app.app_context():
                saved_user = User.query.filter_by(email=user_data["email"]).first()
                if saved_user:
                    print("✅ API Registration: SUCCESS - User saved to database")
                    print(f"   Name: {saved_user.first_name} {saved_user.last_name}")
                    print(f"   Email: {saved_user.email}")
                    return True
                else:
                    print("❌ API Registration: FAILED - User not found in database")
                    return False
        else:
            data = response.json()
            print(f"❌ API Registration: FAILED - {data}")
            return False
            
    except Exception as e:
        print(f"❌ API Registration: ERROR - {e}")
        return False

def show_all_data():
    """Show all current data in database"""
    with app.app_context():
        print("\n📊 Current Database Contents:")
        print("=" * 50)
        
        # Show users
        users = User.query.all()
        print(f"\n👥 USERS ({len(users)} total):")
        for i, user in enumerate(users, 1):
            print(f"{i}. {user.first_name} {user.last_name} ({user.email})")
        
        # Show admins
        admins = Admin.query.all()
        print(f"\n👨‍💼 ADMINS ({len(admins)} total):")
        for i, admin in enumerate(admins, 1):
            print(f"{i}. {admin.username} ({admin.email})")

if __name__ == "__main__":
    print("🔍 DATABASE STORAGE CHECK")
    print("=" * 50)
    
    # Test database connection
    db_connected = check_database_connection()
    
    if db_connected:
        # Test table creation
        tables_ok = check_tables_exist()
        
        if tables_ok:
            # Test direct user creation
            user_test = test_user_creation()
            
            # Test direct admin creation
            admin_test = test_admin_creation()
            
            # Test API registration
            api_test = test_api_registration()
            
            # Show current data
            show_all_data()
            
            print("\n" + "=" * 50)
            print("📋 TEST RESULTS:")
            print(f"   Database Connection: {'✅' if db_connected else '❌'}")
            print(f"   Tables Creation: {'✅' if tables_ok else '❌'}")
            print(f"   Direct User Creation: {'✅' if user_test else '❌'}")
            print(f"   Direct Admin Creation: {'✅' if admin_test else '❌'}")
            print(f"   API Registration: {'✅' if api_test else '❌'}")
            
            if all([db_connected, tables_ok, user_test, admin_test, api_test]):
                print("\n🎉 All database storage tests PASSED!")
                print("   Database is working correctly for storing user and admin details.")
            else:
                print("\n⚠️ Some database storage tests FAILED!")
                print("   There may be issues with data persistence.")
        else:
            print("\n❌ Database tables not working!")
    else:
        print("\n❌ Database connection failed!")
