FROM python:3.12.3

WORKDIR /app

COPY ./requirements.txt .

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:app"]