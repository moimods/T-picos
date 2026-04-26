from typing import Tuple

NETWORK_TYPES = ["Pública", "Privada"]
ENCRYPTION_TYPES = ["Ninguno", "WEP", "WPA", "WPA2", "WPA3"]


def validate_login_input(username: str, password: str) -> Tuple[bool, str]:
    if not username.strip() or not password.strip():
        return False, "Usuario y contraseña son obligatorios."
    return True, ""


def validate_register_input(username: str, password: str, confirm_password: str) -> Tuple[bool, str]:
    if not username.strip() or not password.strip() or not confirm_password.strip():
        return False, "Completa todos los campos para registrarte."

    if len(username.strip()) < 3:
        return False, "El usuario debe tener al menos 3 caracteres."

    if password != confirm_password:
        return False, "Las contraseñas no coinciden."

    if len(password) < 6:
        return False, "La contraseña debe tener al menos 6 caracteres."

    return True, ""


def validate_network_input(name: str, network_type: str, encryption: str) -> Tuple[bool, str]:
    if not name.strip():
        return False, "El nombre de la red es obligatorio."

    if network_type not in NETWORK_TYPES:
        return False, "Selecciona un tipo de red válido."

    if encryption not in ENCRYPTION_TYPES:
        return False, "Selecciona un tipo de cifrado válido."

    return True, ""
