import os
import psycopg2
from psycopg2 import OperationalError

def conectar():
    try:
        return psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            database=os.getenv("DB_NAME", "wifi_seguridad"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "postgres")
        )
    except OperationalError as exc:
        raise RuntimeError(
            "No se pudo conectar a PostgreSQL. Revisa DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD."
        ) from exc