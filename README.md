# ScoreSync

ScoreSync is a Flask app for managing scoreboards. Create custom teams right from the web interface.

## Quick Docker Setup

**3 servers behind nginx:**

```git clone https://github.com/SpaceWaffle42/ScoreSync.git```

```cd ScoreSync```

```docker compose up -d --build --scale app=3```

## Simple single server:

```docker build https://github.com/SpaceWaffle42/ScoreSync.git -t scoresync```

```docker run -d -p 5000:5000 --name scoresync scoresync```

Single server works fine locally but don't use it for anything serious.


```cd app```

```python3 -m venv venv```

```source venv/bin/activate```  # linux/mac
or: ```venv\Scripts\activate```  # windows

```pip3 install -r requirements.txt```

```flask run --host=0.0.0.0 --port=5000```

## Docker Compose Commands

```docker compose up -d```           # 1 server

```docker compose up -d --scale app=3```  # 3 servers  

```docker compose logs -f```         # watch logs

```docker compose down```            # stop


## Production
https://flask.palletsprojects.com/en/2.3.x/tutorial/deploy/
