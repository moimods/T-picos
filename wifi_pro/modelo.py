from db import conectar

def insertar(nombre, tipo, cifrado, riesgo, usuario_id):
    conn = conectar()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO redes_wifi (nombre, tipo, cifrado, riesgo, usuario_id) VALUES (%s, %s, %s, %s, %s)",
        (nombre, tipo, cifrado, riesgo, usuario_id)
    )
    conn.commit()
    conn.close()

def obtener(usuario_id):
    conn = conectar()
    cur = conn.cursor()
    cur.execute("SELECT * FROM redes_wifi WHERE usuario_id=%s", (usuario_id,))
    datos = cur.fetchall()
    conn.close()
    return datos

def eliminar(id):
    conn = conectar()
    cur = conn.cursor()
    cur.execute("DELETE FROM redes_wifi WHERE id=%s", (id,))
    conn.commit()
    conn.close()

def actualizar(id, nombre, tipo, cifrado, riesgo):
    conn = conectar()
    cur = conn.cursor()
    cur.execute(
        "UPDATE redes_wifi SET nombre=%s, tipo=%s, cifrado=%s, riesgo=%s WHERE id=%s",
        (nombre, tipo, cifrado, riesgo, id)
    )
    conn.commit()
    conn.close()