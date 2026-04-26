from models.network_model import NetworkModel
from security.risk_engine import analyze_network
from utils.validators import validate_network_input


class DashboardController:
    def __init__(self, user_id: int):
        self.user_id = int(user_id)

    def list_networks(self) -> list[dict]:
        rows = NetworkModel.list_by_user(self.user_id)
        rows.sort(key=lambda item: item["id"])
        return rows

    def add_network(self, name: str, network_type: str, encryption: str, password: str) -> tuple[bool, str, dict | None]:
        ok, msg = validate_network_input(name, network_type, encryption)
        if not ok:
            return False, msg, None

        network = NetworkModel.create(self.user_id, name, network_type, encryption, password)
        result = analyze_network(network_type, encryption, password)
        NetworkModel.save_analysis(network["id"], self.user_id, result.score, result.level, result.indicator)
        return True, "Red agregada correctamente.", {**network, "last_score": result.score, "last_level": result.level, "last_indicator": result.indicator}

    def update_network(self, network_id: int, name: str, network_type: str, encryption: str, password: str) -> tuple[bool, str, dict | None]:
        ok, msg = validate_network_input(name, network_type, encryption)
        if not ok:
            return False, msg, None

        updated = NetworkModel.update(network_id, self.user_id, name, network_type, encryption, password)
        if not updated:
            return False, "No se pudo actualizar la red seleccionada.", None

        result = analyze_network(network_type, encryption, password)
        NetworkModel.save_analysis(network_id, self.user_id, result.score, result.level, result.indicator)
        return True, "Red actualizada correctamente.", {**updated, "last_score": result.score, "last_level": result.level, "last_indicator": result.indicator}

    def delete_network(self, network_id: int) -> tuple[bool, str]:
        deleted = NetworkModel.delete(network_id, self.user_id)
        if not deleted:
            return False, "No se pudo eliminar la red seleccionada."
        return True, "Red eliminada correctamente."

    def analyze_one(self, network_id: int) -> tuple[bool, str, dict | None]:
        network = NetworkModel.get(network_id, self.user_id)
        if not network:
            return False, "Selecciona una red válida para analizar.", None

        result = analyze_network(network["network_type"], network["encryption"], network.get("password", ""))
        NetworkModel.save_analysis(network_id, self.user_id, result.score, result.level, result.indicator)
        NetworkModel.add_history(network_id, self.user_id, result.score, result.level, result.indicator)

        return True, "Análisis completado correctamente.", {
            "network_id": network_id,
            "name": network["name"],
            "score": result.score,
            "level": result.level,
            "color": result.color,
            "indicator": result.indicator,
        }

    def analyze_all(self) -> tuple[bool, str, list[dict]]:
        networks = self.list_networks()
        if not networks:
            return False, "No hay redes para analizar.", []

        results = []
        for network in networks:
            result = analyze_network(network["network_type"], network["encryption"], network.get("password", ""))
            NetworkModel.save_analysis(network["id"], self.user_id, result.score, result.level, result.indicator)
            NetworkModel.add_history(network["id"], self.user_id, result.score, result.level, result.indicator)
            results.append(
                {
                    "network_id": network["id"],
                    "name": network["name"],
                    "score": result.score,
                    "level": result.level,
                    "color": result.color,
                    "indicator": result.indicator,
                }
            )

        return True, "Análisis general completado.", results

    def get_history(self, network_id: int, limit: int = 10) -> list[dict]:
        return NetworkModel.list_history(network_id, self.user_id, limit=limit)

    def build_summary(self) -> dict:
        rows = self.list_networks()
        summary = {"SEGURO": 0, "RIESGO MEDIO": 0, "ALTO RIESGO": 0}

        for row in rows:
            level = row.get("last_level", "SEGURO")
            if level not in summary:
                continue
            summary[level] += 1

        return {
            "total": len(rows),
            "secure": summary["SEGURO"],
            "medium": summary["RIESGO MEDIO"],
            "high": summary["ALTO RIESGO"],
        }
