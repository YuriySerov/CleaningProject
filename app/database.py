import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()  # Загружаем переменные из .env файла


def get_db_connection():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    return conn


# Функция для закрытия соединения
def close_db_connection(conn):
    if conn:
        conn.close()
