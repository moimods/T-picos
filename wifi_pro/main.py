import tkinter as tk
from tkinter import ttk

from controllers.auth_controller import AuthController
from controllers.dashboard_controller import DashboardController
from models.storage import initialize_storage
from ui.dashboard_view import DashboardView
from ui.login_view import LoginView


class WifiProApp:
    def __init__(self) -> None:
        initialize_storage()

        self.root = tk.Tk()
        self.root.title("WiFi Pro - Security Analyzer")
        self.root.geometry("1200x760")
        self.root.minsize(1024, 680)
        self.root.configure(bg="#F3F4F6")

        self.current_view: ttk.Frame | None = None
        self.current_user: dict | None = None
        self.dashboard_controller: DashboardController | None = None
        self.dashboard_view: DashboardView | None = None

        self._setup_base_style()
        self.show_login_view()

    def _setup_base_style(self) -> None:
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("App.TFrame", background="#F3F4F6")

    def _swap_view(self, view: ttk.Frame) -> None:
        if self.current_view is not None:
            self.current_view.destroy()
        self.current_view = view
        self.current_view.pack(fill="both", expand=True)

    def show_login_view(self) -> None:
        view = LoginView(self.root, on_login=self.handle_login, on_register=self.handle_register)
        self._swap_view(view)

    def show_dashboard_view(self, user: dict) -> None:
        self.current_user = user
        self.dashboard_controller = DashboardController(user["id"])

        self.dashboard_view = DashboardView(
            self.root,
            username=user["username"],
            on_add=self.handle_add_network,
            on_update=self.handle_update_network,
            on_delete=self.handle_delete_network,
            on_analyze_selected=self.handle_analyze_selected,
            on_analyze_all=self.handle_analyze_all,
            on_clear=self.handle_clear_form,
            on_logout=self.handle_logout,
            on_row_selected=self.handle_row_selected,
        )
        self._swap_view(self.dashboard_view)
        self.refresh_dashboard()

    def handle_login(self, username: str, password: str) -> None:
        ok, message, user = AuthController.login(username, password)
        if not isinstance(self.current_view, LoginView):
            return

        if not ok or user is None:
            self.current_view.set_status(message, is_error=True)
            self.current_view.clear_passwords()
            return

        self.current_view.set_status(message, is_error=False)
        self.show_dashboard_view(user)

    def handle_register(self, username: str, password: str, confirm_password: str) -> None:
        ok, message, _ = AuthController.register(username, password, confirm_password)
        if not isinstance(self.current_view, LoginView):
            return

        self.current_view.set_status(message, is_error=not ok)
        if ok:
            self.current_view.clear_passwords()

    def _ensure_dashboard_ready(self) -> bool:
        return self.dashboard_controller is not None and self.dashboard_view is not None

    def refresh_dashboard(self) -> None:
        if not self._ensure_dashboard_ready():
            return

        rows = self.dashboard_controller.list_networks()
        self.dashboard_view.render_networks(rows)
        self.dashboard_view.render_summary(self.dashboard_controller.build_summary())

    def handle_add_network(self) -> None:
        if not self._ensure_dashboard_ready():
            return

        name, network_type, encryption, password = self.dashboard_view.get_form_data()
        ok, message, _ = self.dashboard_controller.add_network(name, network_type, encryption, password)
        self.dashboard_view.show_status(message, is_error=not ok)
        if ok:
            self.dashboard_view.clear_form()
            self.refresh_dashboard()

    def handle_update_network(self) -> None:
        if not self._ensure_dashboard_ready():
            return

        selected_id = self.dashboard_view.get_selected_id()
        if selected_id is None:
            self.dashboard_view.show_status("Selecciona una red para editar.", is_error=True)
            return

        name, network_type, encryption, password = self.dashboard_view.get_form_data()
        ok, message, _ = self.dashboard_controller.update_network(selected_id, name, network_type, encryption, password)
        self.dashboard_view.show_status(message, is_error=not ok)
        if ok:
            self.refresh_dashboard()
            self.handle_row_selected(selected_id)

    def handle_delete_network(self) -> None:
        if not self._ensure_dashboard_ready():
            return

        selected_id = self.dashboard_view.get_selected_id()
        if selected_id is None:
            self.dashboard_view.show_status("Selecciona una red para eliminar.", is_error=True)
            return

        ok, message = self.dashboard_controller.delete_network(selected_id)
        self.dashboard_view.show_status(message, is_error=not ok)
        if ok:
            self.dashboard_view.clear_form()
            self.dashboard_view.render_history([])
            self.refresh_dashboard()

    def handle_analyze_selected(self) -> None:
        if not self._ensure_dashboard_ready():
            return

        selected_id = self.dashboard_view.get_selected_id()
        if selected_id is None:
            self.dashboard_view.show_status("Selecciona una red para analizar.", is_error=True)
            return

        self.dashboard_view.show_status("Analizando red seleccionada...")

        def _finish() -> None:
            ok, message, result = self.dashboard_controller.analyze_one(selected_id)
            self.dashboard_view.show_status(message, is_error=not ok)
            if ok and result:
                self.dashboard_view.show_result(result["indicator"], result["level"], result["score"], result["color"])
                self.refresh_dashboard()
                self.handle_row_selected(selected_id)

        self.dashboard_view.run_with_progress(_finish)

    def handle_analyze_all(self) -> None:
        if not self._ensure_dashboard_ready():
            return

        self.dashboard_view.show_status("Ejecutando analisis general...")

        def _finish() -> None:
            ok, message, results = self.dashboard_controller.analyze_all()
            self.dashboard_view.show_status(message, is_error=not ok)
            if ok and results:
                highest = max(results, key=lambda item: item["score"])
                self.dashboard_view.show_result(
                    highest["indicator"],
                    highest["level"],
                    highest["score"],
                    highest["color"],
                )
                self.refresh_dashboard()

        self.dashboard_view.run_with_progress(_finish, duration_ms=1500)

    def handle_clear_form(self) -> None:
        if self.dashboard_view is None:
            return
        self.dashboard_view.clear_form()
        self.dashboard_view.show_status("Formulario limpio.")

    def handle_row_selected(self, network_id: int) -> None:
        if not self._ensure_dashboard_ready():
            return

        history = self.dashboard_controller.get_history(network_id)
        self.dashboard_view.render_history(history)

    def handle_logout(self) -> None:
        self.current_user = None
        self.dashboard_controller = None
        self.dashboard_view = None
        self.show_login_view()

    def run(self) -> None:
        self.root.mainloop()


if __name__ == "__main__":
    WifiProApp().run()