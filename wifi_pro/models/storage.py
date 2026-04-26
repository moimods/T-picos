import json
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

USERS_FILE = DATA_DIR / "usuarios.json"
NETWORKS_FILE = DATA_DIR / "redes.json"
HISTORY_FILE = DATA_DIR / "historial.json"


def _ensure_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _ensure_file(path: Path, default_content: dict[str, Any]) -> None:
    _ensure_dir()
    if not path.exists():
        path.write_text(json.dumps(default_content, indent=2, ensure_ascii=False), encoding="utf-8")


def initialize_storage() -> None:
    _ensure_file(USERS_FILE, {"users": []})
    _ensure_file(NETWORKS_FILE, {"networks": []})
    _ensure_file(HISTORY_FILE, {"history": []})


def read_json(path: Path, default_content: dict[str, Any]) -> dict[str, Any]:
    _ensure_file(path, default_content)
    raw_text = path.read_text(encoding="utf-8").strip()
    if not raw_text:
        return default_content

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        return default_content


def write_json(path: Path, payload: dict[str, Any]) -> None:
    _ensure_dir()
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def next_id(items: list[dict[str, Any]]) -> int:
    if not items:
        return 1
    return max(int(item.get("id", 0)) for item in items) + 1
