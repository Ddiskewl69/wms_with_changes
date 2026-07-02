# Project List - Setup Guide

## Prerequisites
- XAMPP (for MySQL/phpMyAdmin)
- Python 3.8 or higher
- pip (Python package manager)

## Database Setup

### Step 1: Create Database and Table
1. Open phpMyAdmin (usually at http://localhost/phpmyadmin)
2. Click on the "SQL" tab
3. Copy and run the SQL from `database_setup.sql` file:
   ```sql
   CREATE DATABASE IF NOT EXISTS WMS_Nokia_Final;
   USE WMS_Nokia_Final;
   
   CREATE TABLE IF NOT EXISTS project_list (
       id INT AUTO_INCREMENT PRIMARY KEY,
       project_name VARCHAR(255) NOT NULL,
       company_name VARCHAR(255) NOT NULL,
       store VARCHAR(255),
       dc_out_slug VARCHAR(255),
       stn_slug VARCHAR(255),
       dc_in_slug VARCHAR(255),
       inward_slug VARCHAR(255),
       doa_slug VARCHAR(255),
       project_type VARCHAR(255) NOT NULL,
       project_invoice_type VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

### Step 2: Configure MySQL Password
If your MySQL root password is not empty, update the password in `app.py`:
```python
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Change this if you have a password
    'database': 'WMS_Nokia_Final'
}
```

## Backend Setup (Flask)

### Step 1: Install Python Dependencies
Open terminal/command prompt in the project directory and run:
```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install Flask==3.0.0
pip install flask-cors==4.0.0
pip install mysql-connector-python==8.2.0
```

### Step 2: Run Flask Server
```bash
python app.py
```

The Flask server will start on `http://localhost:5000`

## Frontend Setup

The HTML file is already configured at:
`frontend/templates/project-list.html`

The JavaScript file is at:
`frontend/scripts/project-list.js`

## Running the Application

1. Start XAMPP MySQL server
2. Run the Flask backend: `python app.py`
3. Open the HTML file in your browser or serve it through a web server
4. The project list page will load and fetch data from the Flask API

## Features

- **Add Project**: Click "Add Project" button to open the form
- **Edit Project**: Click "Edit" button on any row to modify
- **Delete Project**: Click "Delete" button to remove a project
- **Dynamic Fields**: 
  - Company Name: Radio buttons for "Nokia-Haryana" and "Other" (Other shows text input)
  - Project Type: Radio buttons for Telecom, Warehouse, Transport, Other
  - Invoice Type: Radio buttons for Indian, Western, Other
- **Data Table**: DataTables with sorting, searching, and pagination
- **Validation**: Form validation before submission

## API Endpoints

- `GET /api/projects` - Get all projects
- `GET /api/projects/<id>` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/<id>` - Update project
- `DELETE /api/projects/<id>` - Delete project

## Troubleshooting

### Database Connection Error
- Ensure XAMPP MySQL is running
- Check MySQL credentials in `app.py`
- Verify database name is correct

### CORS Error
- Ensure Flask-CORS is installed
- Check that the Flask server is running on port 5000

### DataTable Not Loading
- Check browser console for errors
- Ensure Flask API is accessible at `http://localhost:5000/api/projects`
