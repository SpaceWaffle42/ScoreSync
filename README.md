# ScoreSync
 ScoreSync is a Flask application that allows a user to manage a scoreboard, with the ability to create custom teams within the front-end application.

If you want a quick local deployment via Docker then use: 
```docker build https://github.com/SpaceWaffle42/ScoreSync.git -t scoresync```

then to launch use: 
``` docker run -d -p 5000:5000 --name scoresync scoresync ```

this method is NOT recommended as it is not very secure, but allows you to deploy locally without any issues.
 
## Installation
Change directory to the app folder.
```
cd app
```
Creates Virtual Environment folder.
```
python3 -m venv venv
```
Activates the Virtual Environment.
For Mac and Linux
```
source venv/bin/activate
```
For Windows
```
venv\bin\activate
```
Or
```
.\venv\Scripts\activate
```
Installing Requirements.
```
pip3 install -r requirements.txt
```

## Deploy to production
https://flask.palletsprojects.com/en/2.3.x/tutorial/deploy/
