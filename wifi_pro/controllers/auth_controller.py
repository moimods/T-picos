from models.user_model import UserModel
from utils.validators import validate_login_input, validate_register_input


class AuthController:
    @staticmethod
    def login(username: str, password: str) -> tuple[bool, str, dict | None]:
        ok, msg = validate_login_input(username, password)
        if not ok:
            return False, msg, None
        return UserModel.authenticate(username, password)

    @staticmethod
    def register(username: str, password: str, confirm_password: str) -> tuple[bool, str, dict | None]:
        ok, msg = validate_register_input(username, password, confirm_password)
        if not ok:
            return False, msg, None
        return UserModel.register(username, password)
