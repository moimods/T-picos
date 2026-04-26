import tkinter as tk
from tkinter import ttk
from typing import Callable

from utils.validators import ENCRYPTION_TYPES, NETWORK_TYPES


class DashboardView(ttk.Frame):
    def __init__(
        self,
        master: tk.Misc,
        username: str,
        on_add: Callable[[], None],
        on_update: Callable[[], None],
        on_delete: Callable[[], None],
        on_analyze_selected: Callable[[], None],
        on_analyze_all: Callable[[], None],
        on_clear: Callable[[], None],
        on_logout: Callable[[], None],
        on_row_selected: Callable[[int], None],
    ) -> None:
        super().__init__(master, style="App.TFrame", padding=16)
        self.on_add = on_add
        self.on_update = on_update
        self.on_delete = on_delete
        self.on_analyze_selected = on_analyze_selected
        self.on_analyze_all = on_analyze_all
        self.on_clear = on_clear
        self.on_logout = on_logout
        self.on_row_selected = on_row_selected
        self.network_index: dict[int, dict] = {}

        self._build_styles()
        self._build_ui(username)

    def _build_styles(self) -> None:
        style = ttk.Style()
        style.configure("App.TFrame", background="#F3F4F6")
        style.configure("Card.TFrame", background="#FFFFFF")
        style.configure("Header.TLabel", background="#F3F4F6", font=("Segoe UI", 18, "bold"), foreground="#111827")
        style.configure("Subtitle.TLabel", background="#F3F4F6", font=("Segoe UI", 10), foreground="#4B5563")
        style.configure("CardTitle.TLabel", background="#FFFFFF", font=("Segoe UI", 11, "bold"), foreground="#1F2937")
        style.configure("CardText.TLabel", background="#FFFFFF", font=("Segoe UI", 10), foreground="#374151")
        style.configure("Status.TLabel", background="#F3F4F6", font=("Segoe UI", 10, "bold"), foreground="#1D4ED8")
        style.configure("Primary.TButton", font=("Segoe UI", 10, "bold"))

        style.configure("Treeview", rowheight=28, font=("Segoe UI", 10))
        style.configure("Treeview.Heading", font=("Segoe UI", 10, "bold"))

    def _build_ui(self, username: str) -> None:
        header = ttk.Frame(self, style="App.TFrame")
        header.pack(fill="x", pady=(0, 10))

        ttk.Label(header, text="WiFi Pro - Security Analyzer", style="Header.TLabel").pack(side="left")
        ttk.Button(header, text="Cerrar sesión", command=self.on_logout).pack(side="right")
        ttk.Label(header, text=f"Usuario: {username}", style="Subtitle.TLabel").pack(side="right", padx=(0, 12))

        body = ttk.Frame(self, style="App.TFrame")
        body.pack(fill="both", expand=True)

        left = ttk.Frame(body, style="App.TFrame")
        left.pack(side="left", fill="both", expand=True)

        right = ttk.Frame(body, style="App.TFrame")
        right.pack(side="left", fill="y", padx=(12, 0))

        form_card = ttk.Frame(left, style="Card.TFrame", padding=14)
        form_card.pack(fill="x", pady=(0, 10))

        ttk.Label(form_card, text="Formulario de red", style="CardTitle.TLabel").grid(row=0, column=0, columnspan=4, sticky="w", pady=(0, 10))

        ttk.Label(form_card, text="Nombre", style="CardText.TLabel").grid(row=1, column=0, sticky="w")
        self.entry_name = ttk.Entry(form_card, width=28)
        self.entry_name.grid(row=2, column=0, sticky="ew", padx=(0, 10), pady=(0, 8))

        ttk.Label(form_card, text="Tipo", style="CardText.TLabel").grid(row=1, column=1, sticky="w")
        self.combo_type = ttk.Combobox(form_card, values=NETWORK_TYPES, state="readonly", width=14)
        self.combo_type.grid(row=2, column=1, sticky="ew", padx=(0, 10), pady=(0, 8))
        self.combo_type.set(NETWORK_TYPES[0])

        ttk.Label(form_card, text="Cifrado", style="CardText.TLabel").grid(row=1, column=2, sticky="w")
        self.combo_encryption = ttk.Combobox(form_card, values=ENCRYPTION_TYPES, state="readonly", width=14)
        self.combo_encryption.grid(row=2, column=2, sticky="ew", padx=(0, 10), pady=(0, 8))
        self.combo_encryption.set("WPA2")

        ttk.Label(form_card, text="Contraseña (opcional)", style="CardText.TLabel").grid(row=1, column=3, sticky="w")
        self.entry_password = ttk.Entry(form_card, width=16, show="*")
        self.entry_password.grid(row=2, column=3, sticky="ew", pady=(0, 8))

        buttons = ttk.Frame(form_card, style="Card.TFrame")
        buttons.grid(row=3, column=0, columnspan=4, sticky="ew")

        ttk.Button(buttons, text="Agregar", style="Primary.TButton", command=self.on_add).pack(side="left", padx=(0, 6))
        ttk.Button(buttons, text="Editar", command=self.on_update).pack(side="left", padx=(0, 6))
        ttk.Button(buttons, text="Eliminar", command=self.on_delete).pack(side="left", padx=(0, 6))
        ttk.Button(buttons, text="Limpiar", command=self.on_clear).pack(side="left", padx=(0, 6))
        ttk.Button(buttons, text="Analizar seleccion", command=self.on_analyze_selected).pack(side="left", padx=(0, 6))
        ttk.Button(buttons, text="Analizar todo", command=self.on_analyze_all).pack(side="left")

        for col in range(4):
            form_card.columnconfigure(col, weight=1)

        table_card = ttk.Frame(left, style="Card.TFrame", padding=14)
        table_card.pack(fill="both", expand=True)

        ttk.Label(table_card, text="Redes registradas", style="CardTitle.TLabel").pack(anchor="w", pady=(0, 8))

        columns = ("id", "name", "type", "encryption", "score", "level", "indicator")
        self.tree = ttk.Treeview(table_card, columns=columns, show="headings", height=12)
        headings = {
            "id": "ID",
            "name": "Nombre",
            "type": "Tipo",
            "encryption": "Cifrado",
            "score": "Puntaje",
            "level": "Nivel",
            "indicator": "Indicador",
        }

        for col in columns:
            self.tree.heading(col, text=headings[col])
            self.tree.column(col, width=100, anchor="center")

        self.tree.column("name", width=170, anchor="w")
        self.tree.column("level", width=120)

        self.tree.pack(fill="both", expand=True)
        self.tree.bind("<<TreeviewSelect>>", self._handle_select)

        self.status_var = tk.StringVar(value="Listo para analizar tus redes.")
        ttk.Label(left, textvariable=self.status_var, style="Status.TLabel").pack(anchor="w", pady=(8, 0))

        self.progress = ttk.Progressbar(left, mode="indeterminate", length=220)
        self.progress.pack(anchor="w", pady=(6, 0))

        result_card = ttk.Frame(right, style="Card.TFrame", padding=14)
        result_card.pack(fill="x", pady=(0, 10))

        ttk.Label(result_card, text="Resultado del analisis", style="CardTitle.TLabel").pack(anchor="w")
        self.result_indicator = ttk.Label(result_card, text="🟢", style="CardTitle.TLabel")
        self.result_indicator.pack(anchor="w", pady=(8, 0))
        self.result_level = ttk.Label(result_card, text="SEGURO", style="CardTitle.TLabel")
        self.result_level.pack(anchor="w")
        self.result_score = ttk.Label(result_card, text="Puntaje: 0/100", style="CardText.TLabel")
        self.result_score.pack(anchor="w", pady=(2, 0))

        summary_card = ttk.Frame(right, style="Card.TFrame", padding=14)
        summary_card.pack(fill="x", pady=(0, 10))

        ttk.Label(summary_card, text="Resumen dashboard", style="CardTitle.TLabel").pack(anchor="w")
        self.summary_total = ttk.Label(summary_card, text="Total: 0", style="CardText.TLabel")
        self.summary_total.pack(anchor="w", pady=(8, 0))
        self.summary_secure = ttk.Label(summary_card, text="🟢 Seguras: 0", style="CardText.TLabel")
        self.summary_secure.pack(anchor="w")
        self.summary_medium = ttk.Label(summary_card, text="🟠 Riesgo medio: 0", style="CardText.TLabel")
        self.summary_medium.pack(anchor="w")
        self.summary_high = ttk.Label(summary_card, text="🔴 Alto riesgo: 0", style="CardText.TLabel")
        self.summary_high.pack(anchor="w")

        history_card = ttk.Frame(right, style="Card.TFrame", padding=14)
        history_card.pack(fill="both", expand=True)

        ttk.Label(history_card, text="Historial de la red", style="CardTitle.TLabel").pack(anchor="w")
        self.history_list = tk.Listbox(history_card, height=16, borderwidth=0, highlightthickness=0)
        self.history_list.pack(fill="both", expand=True, pady=(8, 0))

    def _handle_select(self, _event: tk.Event) -> None:
        network_id = self.get_selected_id()
        if network_id is None:
            return

        network = self.network_index.get(network_id)
        if not network:
            return

        self.entry_name.delete(0, tk.END)
        self.entry_name.insert(0, network.get("name", ""))
        self.combo_type.set(network.get("network_type", NETWORK_TYPES[0]))
        self.combo_encryption.set(network.get("encryption", ENCRYPTION_TYPES[0]))
        self.entry_password.delete(0, tk.END)
        self.entry_password.insert(0, network.get("password", ""))
        self.on_row_selected(network_id)

    def get_form_data(self) -> tuple[str, str, str, str]:
        return (
            self.entry_name.get(),
            self.combo_type.get(),
            self.combo_encryption.get(),
            self.entry_password.get(),
        )

    def clear_form(self) -> None:
        self.entry_name.delete(0, tk.END)
        self.combo_type.set(NETWORK_TYPES[0])
        self.combo_encryption.set("WPA2")
        self.entry_password.delete(0, tk.END)

    def get_selected_id(self) -> int | None:
        selected = self.tree.focus()
        if not selected:
            return None
        values = self.tree.item(selected).get("values", [])
        if not values:
            return None
        return int(values[0])

    def render_networks(self, rows: list[dict]) -> None:
        self.network_index = {}
        for row_id in self.tree.get_children():
            self.tree.delete(row_id)

        for item in rows:
            self.network_index[int(item["id"])] = item
            self.tree.insert(
                "",
                "end",
                values=(
                    item["id"],
                    item["name"],
                    item["network_type"],
                    item["encryption"],
                    item.get("last_score", 0),
                    item.get("last_level", "SEGURO"),
                    item.get("last_indicator", "🟢"),
                ),
            )

    def render_history(self, entries: list[dict]) -> None:
        self.history_list.delete(0, tk.END)
        if not entries:
            self.history_list.insert(tk.END, "Sin historial para esta red.")
            return

        for item in entries:
            self.history_list.insert(
                tk.END,
                f"{item['created_at']} | {item['indicator']} {item['level']} | {item['score']}/100",
            )

    def render_summary(self, summary: dict) -> None:
        self.summary_total.configure(text=f"Total: {summary['total']}")
        self.summary_secure.configure(text=f"🟢 Seguras: {summary['secure']}")
        self.summary_medium.configure(text=f"🟠 Riesgo medio: {summary['medium']}")
        self.summary_high.configure(text=f"🔴 Alto riesgo: {summary['high']}")

    def show_result(self, indicator: str, level: str, score: int, color: str) -> None:
        self.result_indicator.configure(text=indicator)
        self.result_level.configure(text=level, foreground=color)
        self.result_score.configure(text=f"Puntaje: {score}/100")

    def show_status(self, text: str, is_error: bool = False) -> None:
        self.status_var.set(text)
        style = ttk.Style()
        style.configure("Status.TLabel", foreground="#B91C1C" if is_error else "#1D4ED8")

    def run_with_progress(self, callback: Callable[[], None], duration_ms: int = 1200) -> None:
        self.progress.start(10)

        def _finish() -> None:
            self.progress.stop()
            callback()

        self.after(duration_ms, _finish)
