import os
import sys
import mysql.connector
from mysql.connector import Error

print('Python ok')

try:
    conn = mysql.connector.connect(host='localhost', user='root', password='', database='WMS_Nokia_Final')
    print('DB connected')
    cur = conn.cursor()
    cur.execute("SHOW TABLES LIKE 'cost_center_list'")
    print('cost_center_list exists:', bool(cur.fetchone()))
    cur.execute("SELECT COUNT(*) FROM cost_center_list")
    print('count:', cur.fetchone()[0])
    cur.close()
    conn.close()
except Error as e:
    print('DB error:', e)
    sys.exit(1)

sys.path.insert(0, os.getcwd())
import app
client = app.app.test_client()
resp = client.get('/api/cost-centers')
print('status:', resp.status_code)
print(resp.get_data(as_text=True))
