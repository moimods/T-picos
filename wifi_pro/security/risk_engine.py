from dataclasses import dataclass


@dataclass
class RiskResult:
    score: int
    level: str
    color: str
    indicator: str


def calculate_score(network_type: str, encryption: str, password: str) -> int:
    score = 0

    if network_type == "Pública":
        score += 40

    if encryption == "Ninguno":
        score += 50
    elif encryption == "WEP":
        score += 40
    elif encryption == "WPA":
        score += 25
    elif encryption == "WPA2":
        score += 10
    elif encryption == "WPA3":
        score += 0

    if password and len(password) < 8:
        score += 20

    return min(score, 100)


def classify_score(score: int) -> tuple[str, str, str]:
    if 0 <= score <= 30:
        return "SEGURO", "#1E8E3E", "🟢"
    if 31 <= score <= 70:
        return "RIESGO MEDIO", "#F57C00", "🟠"
    return "ALTO RIESGO", "#C62828", "🔴"


def analyze_network(network_type: str, encryption: str, password: str) -> RiskResult:
    score = calculate_score(network_type, encryption, password)
    level, color, indicator = classify_score(score)
    return RiskResult(score=score, level=level, color=color, indicator=indicator)
