from datetime import datetime
from typing import Optional

from models.storage import HISTORY_FILE, NETWORKS_FILE, next_id, read_json, write_json


class NetworkModel:
    @staticmethod
    def _load_networks() -> dict:
        return read_json(NETWORKS_FILE, {"networks": []})

    @staticmethod
    def _save_networks(payload: dict) -> None:
        write_json(NETWORKS_FILE, payload)

    @staticmethod
    def _load_history() -> dict:
        return read_json(HISTORY_FILE, {"history": []})

    @staticmethod
    def _save_history(payload: dict) -> None:
        write_json(HISTORY_FILE, payload)

    @staticmethod
    def list_by_user(user_id: int) -> list[dict]:
        data = NetworkModel._load_networks()
        return [n for n in data["networks"] if n["user_id"] == user_id]

    @staticmethod
    def get(network_id: int, user_id: int) -> Optional[dict]:
        for network in NetworkModel.list_by_user(user_id):
            if int(network["id"]) == int(network_id):
                return network
        return None

    @staticmethod
    def create(user_id: int, name: str, network_type: str, encryption: str, password: str) -> dict:
        data = NetworkModel._load_networks()
        now = datetime.now().isoformat(timespec="seconds")

        record = {
            "id": next_id(data["networks"]),
            "user_id": user_id,
            "name": name.strip(),
            "network_type": network_type,
            "encryption": encryption,
            "password": password,
            "last_score": 0,
            "last_level": "SEGURO",
            "last_indicator": "🟢",
            "created_at": now,
            "updated_at": now,
        }

        data["networks"].append(record)
        NetworkModel._save_networks(data)
        return record

    @staticmethod
    def update(network_id: int, user_id: int, name: str, network_type: str, encryption: str, password: str) -> Optional[dict]:
        data = NetworkModel._load_networks()
        now = datetime.now().isoformat(timespec="seconds")

        for network in data["networks"]:
            if int(network["id"]) == int(network_id) and int(network["user_id"]) == int(user_id):
                network["name"] = name.strip()
                network["network_type"] = network_type
                network["encryption"] = encryption
                network["password"] = password
                network["updated_at"] = now
                NetworkModel._save_networks(data)
                return network

        return None

    @staticmethod
    def delete(network_id: int, user_id: int) -> bool:
        data = NetworkModel._load_networks()
        initial_size = len(data["networks"])

        data["networks"] = [
            n
            for n in data["networks"]
            if not (int(n["id"]) == int(network_id) and int(n["user_id"]) == int(user_id))
        ]

        if len(data["networks"]) == initial_size:
            return False

        NetworkModel._save_networks(data)
        NetworkModel.delete_history_for_network(network_id, user_id)
        return True

    @staticmethod
    def save_analysis(network_id: int, user_id: int, score: int, level: str, indicator: str) -> None:
        data = NetworkModel._load_networks()
        now = datetime.now().isoformat(timespec="seconds")

        for network in data["networks"]:
            if int(network["id"]) == int(network_id) and int(network["user_id"]) == int(user_id):
                network["last_score"] = score
                network["last_level"] = level
                network["last_indicator"] = indicator
                network["updated_at"] = now
                break

        NetworkModel._save_networks(data)

    @staticmethod
    def add_history(network_id: int, user_id: int, score: int, level: str, indicator: str) -> None:
        payload = NetworkModel._load_history()
        payload["history"].append(
            {
                "id": next_id(payload["history"]),
                "network_id": int(network_id),
                "user_id": int(user_id),
                "score": int(score),
                "level": level,
                "indicator": indicator,
                "created_at": datetime.now().isoformat(timespec="seconds"),
            }
        )
        NetworkModel._save_history(payload)

    @staticmethod
    def list_history(network_id: int, user_id: int, limit: int = 10) -> list[dict]:
        payload = NetworkModel._load_history()
        rows = [
            item
            for item in payload["history"]
            if int(item["network_id"]) == int(network_id) and int(item["user_id"]) == int(user_id)
        ]
        rows.sort(key=lambda item: item["id"], reverse=True)
        return rows[:limit]

    @staticmethod
    def delete_history_for_network(network_id: int, user_id: int) -> None:
        payload = NetworkModel._load_history()
        payload["history"] = [
            item
            for item in payload["history"]
            if not (int(item["network_id"]) == int(network_id) and int(item["user_id"]) == int(user_id))
        ]
        NetworkModel._save_history(payload)
