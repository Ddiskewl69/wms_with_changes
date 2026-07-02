from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'WMS_Nokia_Final'
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# GET all projects
@app.route('/api/projects', methods=['GET'])
def get_projects():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM project_list ORDER BY id DESC")
        projects = cursor.fetchall()
        return jsonify(projects)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# GET single project
@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM project_list WHERE id = %s", (project_id,))
        project = cursor.fetchone()
        if project:
            return jsonify(project)
        else:
            return jsonify({'error': 'Project not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# POST create new project
@app.route('/api/projects', methods=['POST'])
def create_project():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.json
        query = """
        INSERT INTO project_list 
        (project_name, company_name, store, dc_out_slug, stn_slug, dc_in_slug, inward_slug, doa_slug, project_type, project_invoice_type)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data.get('project_name'),
            data.get('company_name'),
            data.get('store'),
            data.get('dc_out_slug'),
            data.get('stn_slug'),
            data.get('dc_in_slug'),
            data.get('inward_slug'),
            data.get('doa_slug'),
            data.get('project_type'),
            data.get('project_invoice_type')
        )
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Project created successfully', 'id': cursor.lastrowid}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# PUT update project
@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.json
        query = """
        UPDATE project_list 
        SET project_name = %s, company_name = %s, store = %s, dc_out_slug = %s, stn_slug = %s, 
            dc_in_slug = %s, inward_slug = %s, doa_slug = %s, project_type = %s, project_invoice_type = %s
        WHERE id = %s
        """
        values = (
            data.get('project_name'),
            data.get('company_name'),
            data.get('store'),
            data.get('dc_out_slug'),
            data.get('stn_slug'),
            data.get('dc_in_slug'),
            data.get('inward_slug'),
            data.get('doa_slug'),
            data.get('project_type'),
            data.get('project_invoice_type'),
            project_id
        )
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Project updated successfully'})
        else:
            return jsonify({'error': 'Project not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# DELETE project
@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM project_list WHERE id = %s", (project_id,))
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Project deleted successfully'})
        else:
            return jsonify({'error': 'Project not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ==========================
# CATEGORY ROUTES
# ==========================

# GET all categories
@app.route('/api/categories', methods=['GET'])
def get_categories():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM category ORDER BY category_name")
        categories = cursor.fetchall()
        return jsonify(categories)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ==========================
# GOODS MASTER ROUTES
# ==========================

# GET all goods
@app.route('/api/goods', methods=['GET'])
def get_goods():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT gm.*, c.category_name 
            FROM goods_master gm 
            LEFT JOIN category c ON gm.category_id = c.id 
            ORDER BY gm.id DESC
        """)
        goods = cursor.fetchall()
        return jsonify(goods)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# GET single goods
@app.route('/api/goods/<int:goods_id>', methods=['GET'])
def get_goods_by_id(goods_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT gm.*, c.category_name 
            FROM goods_master gm 
            LEFT JOIN category c ON gm.category_id = c.id 
            WHERE gm.id = %s
        """, (goods_id,))
        goods = cursor.fetchone()
        if goods:
            return jsonify(goods)
        else:
            return jsonify({'error': 'Goods not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# POST create new goods
@app.route('/api/goods', methods=['POST'])
def create_goods():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.json
        query = """
        INSERT INTO goods_master 
        (category_id, description, part_code, weight, volume, length, breadth, height, hsn_code, uom, uom_other, gst_percent, gst_other, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data.get('category_id'),
            data.get('description'),
            data.get('part_code'),
            data.get('weight'),
            data.get('volume'),
            data.get('length'),
            data.get('breadth'),
            data.get('height'),
            data.get('hsn_code'),
            data.get('uom'),
            data.get('uom_other'),
            data.get('gst_percent'),
            data.get('gst_other'),
            data.get('status', 'Active')
        )
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Goods created successfully', 'id': cursor.lastrowid}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# PUT update goods
@app.route('/api/goods/<int:goods_id>', methods=['PUT'])
def update_goods(goods_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.json
        query = """
        UPDATE goods_master 
        SET category_id = %s, description = %s, part_code = %s, weight = %s, volume = %s, 
            length = %s, breadth = %s, height = %s, hsn_code = %s, uom = %s, uom_other = %s, 
            gst_percent = %s, gst_other = %s, status = %s
        WHERE id = %s
        """
        values = (
            data.get('category_id'),
            data.get('description'),
            data.get('part_code'),
            data.get('weight'),
            data.get('volume'),
            data.get('length'),
            data.get('breadth'),
            data.get('height'),
            data.get('hsn_code'),
            data.get('uom'),
            data.get('uom_other'),
            data.get('gst_percent'),
            data.get('gst_other'),
            data.get('status'),
            goods_id
        )
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Goods updated successfully'})
        else:
            return jsonify({'error': 'Goods not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# DELETE goods
@app.route('/api/goods/<int:goods_id>', methods=['DELETE'])
def delete_goods(goods_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM goods_master WHERE id = %s", (goods_id,))
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Goods deleted successfully'})
        else:
            return jsonify({'error': 'Goods not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ==========================
# COST CENTER ROUTES
# ==========================

@app.route('/api/stores/dropdown', methods=['GET'])
def get_store_dropdown():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, store_name FROM store_ledger ORDER BY store_name")
        stores = cursor.fetchall()
        return jsonify(stores)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ==========================
# SITE LIST ROUTES
# ==========================

def ensure_site_list_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS site_list (
            id INT AUTO_INCREMENT PRIMARY KEY,
            site_name VARCHAR(255) NOT NULL,
            state VARCHAR(255),
            district VARCHAR(255),
            city_town VARCHAR(255),
            pincode VARCHAR(20),
            contact_person VARCHAR(255),
            contact_no VARCHAR(50),
            location VARCHAR(255),
            address TEXT,
            address_2 TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    """)

@app.route('/api/sites', methods=['GET'])
def get_sites():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        ensure_site_list_table(cursor)
        conn.commit()
        cursor.execute("""
            SELECT id, site_name, state, district, city_town, pincode,
                   contact_person, contact_no, location, address, address_2
            FROM site_list
            ORDER BY id DESC
        """)
        sites = cursor.fetchall()
        return jsonify(sites)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/sites', methods=['POST'])
def create_site():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        data = request.json
        cursor = conn.cursor()
        ensure_site_list_table(cursor)
        query = """
        INSERT INTO site_list
        (site_name, state, district, city_town, pincode, contact_person, contact_no, location, address, address_2)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data.get('site_name'),
            data.get('state'),
            data.get('district'),
            data.get('city_town'),
            data.get('pincode'),
            data.get('contact_person'),
            data.get('contact_no'),
            data.get('location'),
            data.get('address'),
            data.get('address_2')
        )
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Site created successfully', 'id': cursor.lastrowid}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/cost-centers', methods=['GET'])
def get_cost_centers():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT ccl.*, sl.store_name, cl.account_name AS customer_name
            FROM cost_center_list ccl
            LEFT JOIN store_ledger sl ON ccl.store_id = sl.id
            LEFT JOIN customer_ledger cl ON ccl.customer_id = cl.id
            ORDER BY ccl.id ASC
        """)
        cost_centers = cursor.fetchall()
        return jsonify(cost_centers)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/cost-centers/<int:cost_center_id>', methods=['GET'])
def get_cost_center(cost_center_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT ccl.*, sl.store_name, cl.account_name AS customer_name
            FROM cost_center_list ccl
            LEFT JOIN store_ledger sl ON ccl.store_id = sl.id
            LEFT JOIN customer_ledger cl ON ccl.customer_id = cl.id
            WHERE ccl.id = %s
        """, (cost_center_id,))
        cost_center = cursor.fetchone()
        if cost_center:
            return jsonify(cost_center)
        else:
            return jsonify({'error': 'Cost center not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/cost-centers', methods=['POST'])
def create_cost_center():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        data = request.json
        query = """
        INSERT INTO cost_center_list
        (store_id, store_name, customer_id, customer_name, cost_center_name, contact_person, details, print_detail_1, print_detail_2, print_detail_3, print_detail_4)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data.get('store_id') or None,
            data.get('store_name'),
            data.get('customer_id') or None,
            data.get('customer_name'),
            data.get('cost_center_name'),
            data.get('contact_person'),
            data.get('details'),
            data.get('print_detail_1'),
            data.get('print_detail_2'),
            data.get('print_detail_3'),
            data.get('print_detail_4')
        )
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Cost center created successfully', 'id': cursor.lastrowid}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/cost-centers/<int:cost_center_id>', methods=['PUT'])
def update_cost_center(cost_center_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        data = request.json
        query = """
        UPDATE cost_center_list
        SET store_id = %s, store_name = %s, customer_id = %s, customer_name = %s,
            cost_center_name = %s, contact_person = %s, details = %s,
            print_detail_1 = %s, print_detail_2 = %s, print_detail_3 = %s, print_detail_4 = %s
        WHERE id = %s
        """
        values = (
            data.get('store_id') or None,
            data.get('store_name'),
            data.get('customer_id') or None,
            data.get('customer_name'),
            data.get('cost_center_name'),
            data.get('contact_person'),
            data.get('details'),
            data.get('print_detail_1'),
            data.get('print_detail_2'),
            data.get('print_detail_3'),
            data.get('print_detail_4'),
            cost_center_id
        )
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Cost center updated successfully'})
        else:
            return jsonify({'error': 'Cost center not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/cost-centers/<int:cost_center_id>', methods=['DELETE'])
def delete_cost_center(cost_center_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cost_center_list WHERE id = %s", (cost_center_id,))
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Cost center deleted successfully'})
        else:
            return jsonify({'error': 'Cost center not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ==========================
# CUSTOMER LEDGER ROUTES
# ==========================

def generate_abbr(name):
    import re
    # Clean the string, keep alphanumeric and spaces
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', name)
    words = [w for w in cleaned.split() if w]
    if not words:
        return "CUS"
    if len(words) >= 3:
        return "".join(w[0] for w in words[:3]).upper()
    elif len(words) == 2:
        w1, w2 = words[0], words[1]
        abbr = w1[0] + w2[0] + (w2[1] if len(w2) > 1 else 'X')
        return abbr[:3].upper()
    else:
        w = words[0]
        return w[:3].upper() if len(w) >= 3 else (w + "XX")[:3].upper()

# GET all states
@app.route('/api/states', methods=['GET'])
def get_states():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM states_list ORDER BY state_name")
        states = cursor.fetchall()
        return jsonify(states)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# GET all accounts
@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM customer_accounts ORDER BY account_name")
        accounts = cursor.fetchall()
        return jsonify(accounts)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# GET all customers
@app.route('/api/customers', methods=['GET'])
def get_customers():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM customer_ledger ORDER BY id DESC")
        customers = cursor.fetchall()
        return jsonify(customers)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# GET single customer
@app.route('/api/customers/<int:cust_id>', methods=['GET'])
def get_customer(cust_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM customer_ledger WHERE id = %s", (cust_id,))
        customer = cursor.fetchone()
        if customer:
            return jsonify(customer)
        else:
            return jsonify({'error': 'Customer not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# POST create new customer
@app.route('/api/customers', methods=['POST'])
def create_customer():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.json
        account_name = data.get('account_name')
        is_other_account = data.get('is_other_account', False)
        state_name = data.get('state')
        is_other_state = data.get('is_other_state', False)
        
        cursor = conn.cursor()
        
        # If dynamic 'Other' account was selected, save it in the database
        if is_other_account and account_name:
            cursor.execute("INSERT IGNORE INTO customer_accounts (account_name) VALUES (%s)", (account_name,))
            conn.commit()
            
        # If dynamic 'Other' state was selected, save it in the database
        if is_other_state and state_name:
            cursor.execute("INSERT IGNORE INTO states_list (state_name) VALUES (%s)", (state_name,))
            conn.commit()
            
        # Generate custom customer_id: CUS/<ABBR>/<MMYY>/<SEQ>
        import datetime
        now = datetime.datetime.now()
        mmyy = now.strftime("%m%y")
        abbr = generate_abbr(account_name)
        
        # Query existing IDs for current month/year to find max sequence
        cursor.execute("SELECT customer_id FROM customer_ledger WHERE customer_id LIKE %s", (f"CUS/%/{mmyy}/%",))
        existing_ids = [row[0] for row in cursor.fetchall()]
        
        max_seq = 0
        for eid in existing_ids:
            parts = eid.split('/')
            if len(parts) == 4 and parts[2] == mmyy:
                try:
                    seq = int(parts[3])
                    if seq > max_seq:
                        max_seq = seq
                except ValueError:
                    pass
        
        next_seq = max_seq + 1
        customer_id = f"CUS/{abbr}/{mmyy}/{next_seq:02d}"
        
        query = """
        INSERT INTO customer_ledger 
        (customer_id, account_name, ledger_type, billing_name, vendor_code, state, work_type, gst_number, pan_number, mobile_number, account_details, correspondence_address, address)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            customer_id,
            account_name,
            data.get('ledger_type'),
            data.get('billing_name'),
            data.get('vendor_code'),
            state_name,
            data.get('work_type'),
            data.get('gst_number'),
            data.get('pan_number'),
            data.get('mobile_number'),
            data.get('account_details'),
            data.get('correspondence_address'),
            data.get('address')
        )
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Customer created successfully', 'id': cursor.lastrowid, 'customer_id': customer_id}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# PUT update customer
@app.route('/api/customers/<int:cust_id>', methods=['PUT'])
def update_customer(cust_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.json
        account_name = data.get('account_name')
        is_other_account = data.get('is_other_account', False)
        state_name = data.get('state')
        is_other_state = data.get('is_other_state', False)
        
        cursor = conn.cursor()
        
        # Save dynamic 'Other' choices if necessary
        if is_other_account and account_name:
            cursor.execute("INSERT IGNORE INTO customer_accounts (account_name) VALUES (%s)", (account_name,))
            conn.commit()
            
        if is_other_state and state_name:
            cursor.execute("INSERT IGNORE INTO states_list (state_name) VALUES (%s)", (state_name,))
            conn.commit()
            
        query = """
        UPDATE customer_ledger 
        SET account_name = %s, ledger_type = %s, billing_name = %s, vendor_code = %s, 
            state = %s, work_type = %s, gst_number = %s, pan_number = %s, mobile_number = %s, 
            account_details = %s, correspondence_address = %s, address = %s
        WHERE id = %s
        """
        values = (
            account_name,
            data.get('ledger_type'),
            data.get('billing_name'),
            data.get('vendor_code'),
            state_name,
            data.get('work_type'),
            data.get('gst_number'),
            data.get('pan_number'),
            data.get('mobile_number'),
            data.get('account_details'),
            data.get('correspondence_address'),
            data.get('address'),
            cust_id
        )
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Customer updated successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# DELETE customer
@app.route('/api/customers/<int:cust_id>', methods=['DELETE'])
def delete_customer(cust_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM customer_ledger WHERE id = %s", (cust_id,))
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Customer deleted successfully'})
        else:
            return jsonify({'error': 'Customer not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ==========================
# VENDOR LEDGER ROUTES
# ==========================

@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM vendor_ledger ORDER BY id DESC")
        vendors = cursor.fetchall()
        return jsonify(vendors)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/vendors/<int:vendor_id>', methods=['GET'])
def get_vendor(vendor_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM vendor_ledger WHERE id = %s", (vendor_id,))
        vendor = cursor.fetchone()
        if vendor:
            return jsonify(vendor)
        else:
            return jsonify({'error': 'Vendor not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/vendors', methods=['POST'])
def create_vendor():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        data = request.json
        query = """
        INSERT INTO vendor_ledger (vendor_name, mobile_number, address)
        VALUES (%s, %s, %s)
        """
        values = (data.get('vendor_name'), data.get('mobile_number'), data.get('address'))
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Vendor created successfully', 'id': cursor.lastrowid}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/vendors/<int:vendor_id>', methods=['PUT'])
def update_vendor(vendor_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        data = request.json
        query = """
        UPDATE vendor_ledger 
        SET vendor_name = %s, mobile_number = %s, address = %s
        WHERE id = %s
        """
        values = (data.get('vendor_name'), data.get('mobile_number'), data.get('address'), vendor_id)
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Vendor updated successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/vendors/<int:vendor_id>', methods=['DELETE'])
def delete_vendor(vendor_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM vendor_ledger WHERE id = %s", (vendor_id,))
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Vendor deleted successfully'})
        else:
            return jsonify({'error': 'Vendor not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================
# SUPPLIER LEDGER ROUTES
# ==========================

@app.route('/api/suppliers', methods=['GET'])
def get_suppliers():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM supplier_ledger ORDER BY id DESC")
        suppliers = cursor.fetchall()
        return jsonify(suppliers)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/suppliers/<int:supplier_id>', methods=['GET'])
def get_supplier(supplier_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM supplier_ledger WHERE id = %s", (supplier_id,))
        supplier = cursor.fetchone()
        if supplier:
            return jsonify(supplier)
        else:
            return jsonify({'error': 'Supplier not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/suppliers', methods=['POST'])
def create_supplier():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        data = request.json
        query = """
        INSERT INTO supplier_ledger (supplier_name, mobile_number, address)
        VALUES (%s, %s, %s)
        """
        values = (data.get('supplier_name'), data.get('mobile_number'), data.get('address'))
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Supplier created successfully', 'id': cursor.lastrowid}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/suppliers/<int:supplier_id>', methods=['PUT'])
def update_supplier(supplier_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        data = request.json
        query = """
        UPDATE supplier_ledger 
        SET supplier_name = %s, mobile_number = %s, address = %s
        WHERE id = %s
        """
        values = (data.get('supplier_name'), data.get('mobile_number'), data.get('address'), supplier_id)
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Supplier updated successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/suppliers/<int:supplier_id>', methods=['DELETE'])
def delete_supplier(supplier_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM supplier_ledger WHERE id = %s", (supplier_id,))
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Supplier deleted successfully'})
        else:
            return jsonify({'error': 'Supplier not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================
# OTHERS/STO LEDGER ROUTES
# ==========================

@app.route('/api/others-sto', methods=['GET'])
def get_others_sto():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM other_sto_ledger ORDER BY id DESC")
        others = cursor.fetchall()
        return jsonify(others)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/others-sto/<int:sto_id>', methods=['GET'])
def get_other_sto(sto_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM other_sto_ledger WHERE id = %s", (sto_id,))
        sto = cursor.fetchone()
        if sto:
            return jsonify(sto)
        else:
            return jsonify({'error': 'STO record not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/others-sto', methods=['POST'])
def create_other_sto():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        data = request.json
        query = """
        INSERT INTO other_sto_ledger (name, mobile_number, address)
        VALUES (%s, %s, %s)
        """
        values = (data.get('name'), data.get('mobile_number'), data.get('address'))
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'STO record created successfully', 'id': cursor.lastrowid}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/others-sto/<int:sto_id>', methods=['PUT'])
def update_other_sto(sto_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        data = request.json
        query = """
        UPDATE other_sto_ledger 
        SET name = %s, mobile_number = %s, address = %s
        WHERE id = %s
        """
        values = (data.get('name'), data.get('mobile_number'), data.get('address'), sto_id)
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'STO record updated successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/others-sto/<int:sto_id>', methods=['DELETE'])
def delete_other_sto(sto_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM other_sto_ledger WHERE id = %s", (sto_id,))
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'STO record deleted successfully'})
        else:
            return jsonify({'error': 'STO record not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================
# STORE LEDGER ROUTES
# ==========================

@app.route('/api/stores', methods=['GET'])
def get_stores():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM store_ledger ORDER BY id DESC")
        stores = cursor.fetchall()
        return jsonify(stores)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/stores/<int:store_id>', methods=['GET'])
def get_store(store_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM store_ledger WHERE id = %s", (store_id,))
        store = cursor.fetchone()
        if store:
            return jsonify(store)
        else:
            return jsonify({'error': 'Store not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/stores', methods=['POST'])
def create_store():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        data = request.json
        query = """
        INSERT INTO store_ledger (store_name, mobile_number, address)
        VALUES (%s, %s, %s)
        """
        values = (data.get('store_name'), data.get('mobile_number'), data.get('address'))
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Store created successfully', 'id': cursor.lastrowid}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/stores/<int:store_id>', methods=['PUT'])
def update_store(store_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        data = request.json
        query = """
        UPDATE store_ledger 
        SET store_name = %s, mobile_number = %s, address = %s
        WHERE id = %s
        """
        values = (data.get('store_name'), data.get('mobile_number'), data.get('address'), store_id)
        cursor = conn.cursor()
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Store updated successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/stores/<int:store_id>', methods=['DELETE'])
def delete_store(store_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM store_ledger WHERE id = %s", (store_id,))
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Store deleted successfully'})
        else:
            return jsonify({'error': 'Store not found'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
