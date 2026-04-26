def evaluar(tipo, cifrado):
    if tipo == "Pública" and not cifrado:
        return "ALTO RIESGO"
    elif tipo == "Pública" and cifrado:
        return "MEDIO RIESGO"
    else:
        return "SEGURO"

def color_riesgo(riesgo):
    if riesgo == "ALTO RIESGO":
        return "red"
    elif riesgo == "MEDIO RIESGO":
        return "orange"
    else:
        return "green"