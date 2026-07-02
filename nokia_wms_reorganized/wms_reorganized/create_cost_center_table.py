import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='', database='WMS_Nokia_Final')
cur = conn.cursor()
cur.execute("""
CREATE TABLE IF NOT EXISTS cost_center_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NULL,
    store_name VARCHAR(255),
    customer_id INT NULL,
    customer_name VARCHAR(255),
    cost_center_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    details TEXT,
    print_detail_1 VARCHAR(255),
    print_detail_2 VARCHAR(255),
    print_detail_3 VARCHAR(255),
    print_detail_4 VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
""")
conn.commit()
cur.execute("SHOW TABLES LIKE 'cost_center_list'")
print(cur.fetchone())
cur.close()
conn.close()
