import sqlite3
import pathlib
import os
import random
import datetime

db_path = os.environ.get('DB_PATH', os.path.join(pathlib.Path(__file__).parent.resolve(), "database.db"))
class Database:
    
    @staticmethod #####
    def initial():
        con = sqlite3.connect(db_path)
        cur = con.cursor()

        sql = "SELECT name FROM sqlite_master WHERE type='table' AND name= (?)"
        listOfTables = cur.execute(sql, ("data",)).fetchall()

        if listOfTables == []:
            print("Table not found! Creating tables...")

            cur.execute(
                """
                CREATE TABLE teams (
                    team_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    team_name TEXT NOT NULL UNIQUE,
                    organisation TEXT NOT NULL
                );
            """
            )

            cur.execute(
                """
                CREATE TABLE stands (
                    stand_name TEXT PRIMARY KEY
                );
            """
            )

            cur.execute(
                """
                CREATE TABLE data (
                    data_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    team_id INTEGER NOT NULL,
                    stand_name TEXT,
                    points INTEGER NOT NULL,
                    date TEXT NOT NULL,
                    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
                    FOREIGN KEY (stand_name) REFERENCES stands(stand_name) ON DELETE SET NULL
                );
            """
            )

            cur.execute(
                """CREATE TABLE IF NOT EXISTS scoreboard_status (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    is_open INTEGER DEFAULT 1 -- 1 = open, 0 = closed
                );
            """
            )
            cur.execute("SELECT COUNT(*) FROM scoreboard_status")
            if cur.fetchone()[0] == 0:
                cur.execute("INSERT INTO scoreboard_status (is_open) VALUES (1)")


        con.commit()
        con.close()

    @staticmethod #####
    def defualt_stands():
        default_stand = "Admin"
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        sql = "INSERT OR IGNORE INTO stands (stand_name) VALUES (?)"
        cur.execute(sql, (default_stand,))
        con.commit()
        con.close()

Database.initial()
Database.defualt_stands()

if __name__ == "__main__":
    teams = []
    for i in range(50):
        team = f"Team {i+1}"
        org = f"Organisation {random.randint(1, 10)}"
        teams.append((team, org))

    con = sqlite3.connect(db_path)
    cur = con.cursor()

    try:
        for team_name, org in teams:
            cur.execute(
                "INSERT OR IGNORE INTO teams (team_name, organisation) VALUES (?, ?)",
                (team_name, org),
            )

        con.commit()

        cur.execute("SELECT team_id, team_name FROM teams")
        team_map = {name: tid for tid, name in cur.fetchall()}

        cur.execute("SELECT stand_name FROM stands")
        stand_map = {name: name for (name,) in cur.fetchall()}

        for _ in range(100):
            team_name, _ = random.choice(teams)
            stand_name = random.choice(
                list(stand_map.keys())
            )  # Just use existing stands like "Admin"
            points = random.randint(0, 100)

            random_days = random.randint(0, 365)
            random_hours = random.randint(0, 23)
            random_minutes = random.randint(0, 59)

            random_datetime = datetime.datetime.now() - datetime.timedelta(
                days=random_days
            )
            random_datetime = random_datetime.replace(
                hour=random_hours, minute=random_minutes
            )

            formatted_datetime = random_datetime.strftime("%Y-%m-%d %H:%M")

            team_id = team_map[team_name]
            stand_name = stand_map[stand_name]

            cur.execute(
                "INSERT INTO data (team_id, stand_id, points, date) VALUES (?, ?, ?, ?)",
                (team_id, stand_name, points, formatted_datetime),
            )

        con.commit()

    except Exception as e:
        print(f"Database Error: {e}")
        con.rollback()
    finally:
        con.close()
