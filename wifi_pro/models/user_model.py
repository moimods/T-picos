from datetime import datetime
from typing import Optional

import bcrypt

from models.storage import USERS_FILE, next_id, read_json, write_json


class UserModel:
    @staticmethod
    def _load() -> dict:
        return read_json(USERS_FILE, {"users": []})

    @staticmethod
    def _save(payload: dict) -> None:
        write_json(USERS_FILE, payload)

    @staticmethod
    def find_by_username(username: str) -> Optional[dict]:
        data = UserModel._load()
        for user in data["users"]:
            if user["username"].lower() == username.lower().strip():
                return user
        return None

    @staticmethod
    def register(username: str, password: str) -> tuple[bool, str, Optional[dict]]:
        data = UserModel._load()

        if UserModel.find_by_username(username):
            return False, "El usuario ya existe.", None

        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        new_user = {
            "id": next_id(data["users"]),
            "username": username.strip(),
            "password_hash": password_hash,
            "created_at": datetime.now().isoformat(timespec="seconds"),
        }

        data["users"].append(new_user)
        UserModel._save(data)
        return True, "Usuario registrado correctamente.", new_user

    @staticmethod
    def authenticate(username: str, password: str) -> tuple[bool, str, Optional[dict]]:
        user = UserModel.find_by_username(username)
        if not user:
            return False, "Usuario o contraseña inválidos.", None

        if not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            return False, "Usuario o contraseña inválidos.", None

        return True, "Inicio de sesión exitoso.", user
