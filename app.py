from flask import Flask, render_template, request, redirect, url_for, make_response, jsonify
import pathlib
import os
import datetime

app = Flask(__name__)

py_path = pathlib.Path(__file__).parent.resolve()
db_path = os.path.join(py_path, "database.db")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index')
def home():
    return render_template('index.html')

@app.route('/nav')
def nav():
    return render_template('nav.html')

@app.route('/footer')
def footer():
    return render_template('footer.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/scoreboard')
def scoreboard():
    return render_template('scoreboard.html')


if __name__ == "__main__":
    app.run(debug=True, threaded=True, host='0.0.0.0', port=5000)