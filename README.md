# ScoreSync

[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/) [![Flask](https://img.shields.io/badge/flask-2.0+-green.svg)](https://flask.palletsprojects.com/) [![Docker](https://img.shields.io/badge/docker-enabled-blue.svg)](https://www.docker.com/) [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE) 	[![Status](https://img.shields.io/badge/status-active-brightgreen.svg)]()

Real-time scoreboard management system with Flask, SQLite, and Docker. Create custom teams, track scores, and manage multiple stands with a responsive web interface. Supports load-balanced multi-container deployment with persistent shared database.

## Features
* Real-time Score Tracking - Update scores instantly across all containers

* Custom Teams & Stands - Create teams, organizations, and score stands via web interface

* Multi-Container Deployment - Docker containers behind Nginx load balancer

* Shared Database - All containers connect to single persistent SQLite database

* Admin Dashboard - Secure admin panel with PIN-based authentication

* CSV Export - Download scoreboard data as CSV with timestamps

* Responsive Design - Works on desktop, tablet, and mobile

* Docker Optimized - Single command deployment with Docker Compose

## Quick Docker Setup
**Note:**
Please edit wsgi.py and set a new secret_key & Pin code

To generate a new secret: ```python -c "import secrets; print(secrets.token_hex(32))"``` and replace the existing secret

**3 servers behind nginx:**

```
git clone https://github.com/SpaceWaffle42/ScoreSync.git
cd ScoreSync
docker compose up -d --build --scale app=3
```

## Simple single Docker server:

```docker build https://github.com/SpaceWaffle42/ScoreSync.git -t scoresync```

```docker run -d -p 5000:5000 --name scoresync scoresync```

Single server works fine locally but don't use it for anything serious.
## Simple single Non-Docker server:

```cd app```

```python3 -m venv venv```

```source venv/bin/activate```   linux/mac

or: ```venv\Scripts\activate```  windows

```pip3 install -r requirements.txt```

```flask run --host=0.0.0.0 --port=5000```

## Docker Compose Commands

```docker compose up -d```                1 server

```docker compose up -d --scale app=3```  3 servers  

```docker compose logs -f```              watch logs

```docker compose down```                 stop

```sudo docker compose down -v```         stop & delete volume (Database)


## Production
https://flask.palletsprojects.com/en/2.3.x/tutorial/deploy/
