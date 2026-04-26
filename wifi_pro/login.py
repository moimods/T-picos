from db import conectar

def validar_usuario(user, password):
    conn = conectar()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM usuarios WHERE username=%s AND password=%s",
        (user, password)
    )
    resultado = cur.fetchone()
    conn.close()
    return resultado