from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    redirect,
    url_for,
    send_file,
    session,
    flash,
)
import pandas as pd
import pathlib
import os
import datetime
import sqlite3
import database

app = Flask(__name__)
app.secret_key = "dk6fb2u1cf1162881d7924ef726b0a34k70474c5a2bc91d00149d5c8nfbda4e2" #CHANGE THIS

py_path = pathlib.Path(__file__).parent.resolve()
db_path = os.path.join(py_path, "database.db")


@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")


@app.route("/index", methods=["GET", "POST"])
def home():
    return render_template("index.html")


@app.route("/nav", methods=["GET", "POST"])
def nav():
    return render_template("nav.html")


@app.route("/footer", methods=["GET", "POST"])
def footer():
    return render_template("footer.html")


@app.route("/admin", methods=["GET", "POST"])
def admin():
    if not session.get("admin_logged_in"):
        return redirect(url_for("admin_login"))

    con = sqlite3.connect(db_path)
    cur = con.cursor()

    cur.execute("SELECT team_name, organisation FROM teams ORDER BY team_id")
    teams = cur.fetchall()

    cur.execute(
        "SELECT DISTINCT stand_name FROM stands WHERE stand_name IS NOT NULL ORDER BY stand_name"
    )
    stands = cur.fetchall()

    cur.execute("SELECT is_open FROM scoreboard_status ORDER BY id DESC LIMIT 1")
    scoreboard_open = cur.fetchone()
    scoreboard_open = bool(scoreboard_open[0]) if scoreboard_open else True

    con.close()
    return render_template(
        "admin.html", teams=teams, stands=stands, scoreboard_open=scoreboard_open
    )


@app.route("/process_team", methods=["POST"])
def process_team():
    if request.method == "POST":
        team = request.form["team-name"]
        organisation = request.form["org-name"]

        con = sqlite3.connect(db_path)
        cur = con.cursor()
        try:
            cur.execute(
                "INSERT INTO teams (team_name, organisation) VALUES (?, ?)",
                (team, organisation),
            )
            con.commit()
        except Exception as e:
            print("Error inserting team:", e)
            con.rollback()
        finally:
            con.close()

    return redirect(url_for("admin"))


@app.route("/remove_team", methods=["POST"])
def remove_team():
    con = None
    if request.method == "POST":
        try:
            team = request.form["team_remove"]
            con = sqlite3.connect(db_path)
            cur = con.cursor()

            sql = "DELETE FROM data WHERE team_id = ?"
            cur.execute(sql, (team,))

            sql = "DELETE FROM teams WHERE team_name = ?"
            cur.execute(sql, (team,))

            con.commit()
        except Exception as e:
            print("Error during deletion:", e)
            if con:
                con.rollback()
        finally:
            if con:
                con.close()

    return redirect(url_for("admin"))


@app.route("/remove_stand", methods=["POST"])
def remove_stand():
    con = None
    if request.method == "POST":
        try:
            stand = request.form["remove_stand"]
            if stand == "Admin":
                print("Cannot delete the Admin stand.")
                return redirect(url_for("admin"))

            else:
                con = sqlite3.connect(db_path)
                cur = con.cursor()

                sql = "DELETE FROM data WHERE stand_name = ?"
                cur.execute(sql, (stand,))

                sql = "DELETE FROM stands WHERE stand_name = ?"
                cur.execute(sql, (stand,))

                con.commit()
        except Exception as e:
            print("Error during deletion:", e)
            if con:
                con.rollback()
        finally:
            if con:
                con.close()

        return redirect(url_for("admin"))


@app.route("/team_add_points", methods=["POST"])
def team_add_points():
    if request.method == "POST":
        try:
            team = request.form["add_p_team"]
            points = request.form["points"]
            stand = request.form["stand_select"]
            date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

            con = sqlite3.connect(db_path)
            cur = con.cursor()
        except Exception as e:
            print("Error:", e)
        try:
            sql = "INSERT INTO data (team_id, points, stand_name, date) VALUES (?, ?, ?, ?)"
            cur.execute(sql, (team, points, stand, date))
            con.commit()
        except Exception as e:
            print("Error adding points:", e)
            con.rollback()
        finally:
            con.close()

        return redirect(url_for("admin"))


@app.route("/stands", methods=["GET"])
def get_stands():
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    cur.execute("SELECT stand_name FROM stands ORDER BY stand_name")
    stands = [{"stand": row[0]} for row in cur.fetchall()]

    con.close()
    return jsonify(stands)


@app.route("/teams", methods=["GET"])
def get_teams():
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    cur.execute("SELECT * FROM teams ORDER BY team_name")
    dbfilter = [{"team": row[1], "organisation": row[2]} for row in cur.fetchall()]

    con.close()
    return jsonify(dbfilter)


@app.route("/data", methods=["GET"])
def get_data():
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    sql = """
    SELECT 
        d.data_id,
        d.team_id AS team,
        t.organisation AS organisation,
        d.stand_name AS stand,
        d.points,
        d.date
    FROM data d
    JOIN teams t ON d.team_id = t.team_name
    ORDER BY d.date DESC;
    """

    rows = cur.execute(sql).fetchall()
    con.close()

    return jsonify([dict(row) for row in rows])


@app.route("/process_stand", methods=["POST"])
def process_stand():
    if request.method == "POST":
        stand = request.form["add_stand"]
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        try:
            cur.execute("INSERT INTO stands (stand_name) VALUES (?)", (stand,))
            con.commit()
        except Exception as e:
            print("Error inserting stand:", e)
            con.rollback()
        finally:
            con.close()

    return redirect(url_for("admin"))


@app.route("/proccess_filter", methods=["POST"])
def process_filter():
    # This function will be used to filter based on Teams, with a primary team (primary-team) and a secondary (secondary-team) and top teams selected (top-teams) (defult 10)
    if request.method == "POST":
        primary_team = request.form["primary-team"]
        secondary_team = request.form["secondary-team"]
        top_teams = request.form["top-teams"]

        con = sqlite3.connect(db_path)
        cur = con.cursor()

        try:
            sql = """
            SELECT 
                d.data_id,
                d.team_id AS team,
                t.organisation AS organisation,
                d.stand_name AS stand,
                d.points,
                d.date
            FROM data d
            JOIN teams t ON d.team_id = t.team_name
            WHERE d.team_id IN (?, ?)
            ORDER BY d.date DESC
            LIMIT ?;
            """
            cur.execute(sql, (primary_team, secondary_team, top_teams))
            rows = cur.fetchall()
            con.commit()
        except Exception as e:
            print("Error during filtering:", e)
            con.rollback()
        finally:
            con.close()


@app.route("/download_data", methods=["GET", "POST"])
# Download data from the database and send it as a CSV file to the user, using the timestamp YYYYMMDD-hour:Minuite_Scoreboard using pandas and flask.
def download_data():
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    sql = """
    SELECT 
        d.data_id,
        d.team_id AS team,
        t.organisation AS organisation,
        d.stand_name AS stand,
        d.points,
        d.date
    FROM data d
    JOIN teams t ON d.team_id = t.team_name
    ORDER BY d.date DESC;
    """

    rows = cur.execute(sql).fetchall()
    con.close()

    df = pd.DataFrame(
        rows, columns=["data_id", "team", "organisation", "stand", "points", "date"]
    )
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M")
    filename = f"Scoreboard-{timestamp}.csv"

    csv_path = os.path.join(py_path, filename)
    df.to_csv(csv_path, index=False)

    return send_file(csv_path, as_attachment=True)


@app.route("/admin_login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        passcode = request.form.get("passcode", "")

        if passcode == "123456":
            session["admin_logged_in"] = True
            return redirect(url_for("admin"))
        else:
            flash("Incorrect credentials. Try again.")
            return redirect(url_for("admin_login"))

    return render_template("admin_login.html")


@app.route("/logout")
def logout():
    session.pop("admin_logged_in", None)
    return redirect(url_for("index"))


@app.route("/scoreboard_state")
def scoreboard_state():
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    cur.execute("SELECT is_open FROM scoreboard_status ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    con.close()

    return jsonify({"scoreboard_open": bool(row[0]) if row else True})


@app.route("/toggle_scoreboard", methods=["POST"])
def toggle_scoreboard():
    if request.is_json:
        data = request.get_json()
        is_open = 1 if data.get("is_open") else 0
    else:
        is_open = 1 if request.form.get("is_open") == "1" else 0

    con = sqlite3.connect(db_path)
    cur = con.cursor()

    cur.execute("DELETE FROM scoreboard_status")
    cur.execute("INSERT INTO scoreboard_status (is_open) VALUES (?)", (is_open,))
    con.commit()
    con.close()

    return jsonify({"status": "success", "scoreboard_open": is_open})


if __name__ == "__main__":
    app.run(debug=True, threaded=True, host="0.0.0.0", port=5000)
