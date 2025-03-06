from flask import Flask, render_template, request, redirect, url_for, make_response, jsonify
import pathlib
import os
import datetime
import sqlite3

app = Flask(__name__)

py_path = pathlib.Path(__file__).parent.resolve()
db_path = os.path.join(py_path, "database.db")

@app.route('/', methods=["GET", "POST"])
def index():
    return render_template('index.html')

@app.route('/index', methods=["GET", "POST"])
def home():
    return render_template('index.html')

@app.route('/nav', methods=["GET", "POST"])
def nav():
    return render_template('nav.html')

@app.route('/footer', methods=["GET", "POST"])
def footer():
    return render_template('footer.html')

@app.route('/admin', methods=["GET", "POST"])
def admin():
    return render_template('admin.html')


@app.route("/stands")
def get_stands():
    con = sqlite3.connect(os.path.join(py_path, "database.db"))
    cur = con.cursor()

    # Simplified SQL query to select all data
    sql = "SELECT * FROM stands ORDER BY stand;"
    cur.execute(sql)

    dbfilter = [
        {
            "stand":row[0],
            "code":row[1]
        }
        for row in cur.fetchall()
    ]

    con.close()
    return jsonify(dbfilter)

@app.route("/teams")
def get_teams():
    con = sqlite3.connect(os.path.join(py_path, "database.db"))
    cur = con.cursor()

    # Simplified SQL query to select all data
    sql = "SELECT * FROM teams ORDER BY team;"
    cur.execute(sql)

    dbfilter = [
        {
            "team":row[0]
        }
        for row in cur.fetchall()
    ]

    con.close()
    return jsonify(dbfilter)


@app.route("/data")
def get_data():
    con = sqlite3.connect(os.path.join(py_path, "database.db"))
    cur = con.cursor()

    # Simplified SQL query to select all data
    sql = "SELECT * FROM data ORDER BY date;"
    cur.execute(sql)

    dbfilter = [
        {

        }
        for row in cur.fetchall()
    ]

    con.close()
    return jsonify(dbfilter)

if __name__ == "__main__":
    app.run(debug=True, threaded=True, host='0.0.0.0', port=5000)