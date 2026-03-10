from flask import Flask, request, jsonify
import sqlite3
import json
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, 'database.db')
HTML_FILE = os.path.join(BASE_DIR, 'index.html')

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # ✨ 核心改动：增加了 event_id，并且把 (event_id, username) 组合作为唯一主键
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            event_id TEXT NOT NULL,
            username TEXT NOT NULL,
            pin TEXT NOT NULL,
            available_slots TEXT NOT NULL,
            PRIMARY KEY (event_id, username)
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def home():
    with open(HTML_FILE, 'r', encoding='utf-8') as file:
        return file.read()

@app.route('/api/save_time', methods=['POST'])
def save_time():
    data = request.json
    event_id = data.get('event_id') # ✨ 接收房间号
    username = data.get('username')
    pin = data.get('pin')
    available_slots = json.dumps(data.get('available_slots', [])) 

    if not event_id or not username or not pin:
        return jsonify({"error": "Missing event ID, username, or PIN"}), 400

    init_db() 
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # ✨ 查询时加上 event_id
    cursor.execute("SELECT pin FROM users WHERE event_id = ? AND username = ?", (event_id, username))
    row = cursor.fetchone()

    if row:
        stored_pin = row[0]
        if stored_pin != pin:
            conn.close()
            return jsonify({"error": "Incorrect PIN for this user!"}), 403
        
        cursor.execute("UPDATE users SET available_slots = ? WHERE event_id = ? AND username = ?", (available_slots, event_id, username))
        message = "Availability updated successfully!"
    else:
        cursor.execute("INSERT INTO users (event_id, username, pin, available_slots) VALUES (?, ?, ?, ?)", (event_id, username, pin, available_slots))
        message = "New user created and availability saved!"

    conn.commit()
    conn.close()
    return jsonify({"message": message}), 200

@app.route('/api/get_all_data', methods=['GET'])
def get_all_data():
    event_id = request.args.get('event_id') # ✨ 从请求网址中获取房间号
    if not event_id:
        return jsonify([]), 400

    init_db()
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # ✨ 只提取当前房间的数据
    cursor.execute("SELECT username, available_slots FROM users WHERE event_id = ?", (event_id,))
    rows = cursor.fetchall()
    conn.close()

    users_data = []
    for row in rows:
        users_data.append({
            "username": row[0],
            "available_slots": json.loads(row[1]) 
        })
    
    return jsonify(users_data), 200

if __name__ == '__main__':
    print("Server starting! Open http://127.0.0.1:5000 in your browser.")
    app.run(debug=True, port=5000)