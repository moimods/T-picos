import tkinter as tk
from tkinter import ttk
from typing import Callable


class LoginView(ttk.Frame):
    def __init__(
        self,
        master: tk.Misc,
        on_login: Callable[[str, str], None],
        on_register: Callable[[str, str, str], None],
    ) -> None:
        super().__init__(master, style="App.TFrame", padding=24)
        self.on_login = on_login
        self.on_register = on_register

        self._build_styles()
        self._build_ui()

    def _build_styles(self) -> None:
        style = ttk.Style()
        style.configure("Card.TFrame", background="#FFFFFF", relief="flat")
        style.configure("Title.TLabel", font=("Segoe UI", 18, "bold"), background="#FFFFFF", foreground="#1F2937")
        style.configure("Muted.TLabel", font=("Segoe UI", 10), background="#FFFFFF", foreground="#6B7280")
        style.configure("Status.TLabel", font=("Segoe UI", 10, "bold"), background="#FFFFFF", foreground="#1D4ED8")
        style.configure("Primary.TButton", font=("Segoe UI", 10, "bold"))

    def _build_ui(self) -> None:
        wrapper = ttk.Frame(self, style="App.TFrame")
        wrapper.pack(expand=True)

        card = ttk.Frame(wrapper, style="Card.TFrame", padding=24)
        card.pack()

        ttk.Label(card, text="WiFi Pro - Security Analyzer", style="Title.TLabel").grid(row=0, column=0, columnspan=2, sticky="w")
        ttk.Label(card, text="Inicia sesión o crea una cuenta local", style="Muted.TLabel").grid(
            row=1, column=0, columnspan=2, sticky="w", pady=(0, 16)
        )

        ttk.Label(card, text="Usuario", style="Muted.TLabel").grid(row=2, column=0, sticky="w")
        self.entry_user = ttk.Entry(card, width=30)
        self.entry_user.grid(row=3, column=0, columnspan=2, sticky="ew", pady=(0, 10))

        ttk.Label(card, text="Contraseña", style="Muted.TLabel").grid(row=4, column=0, sticky="w")
        self.entry_password = ttk.Entry(card, width=30, show="*")
        self.entry_password.grid(row=5, column=0, columnspan=2, sticky="ew", pady=(0, 10))

        ttk.Label(card, text="Confirmar contraseña (solo registro)", style="Muted.TLabel").grid(row=6, column=0, sticky="w")
        self.entry_confirm = ttk.Entry(card, width=30, show="*")
        self.entry_confirm.grid(row=7, column=0, columnspan=2, sticky="ew", pady=(0, 12))

        self.status_var = tk.StringVar(value="")
        self.status_label = ttk.Label(card, textvariable=self.status_var, style="Status.TLabel")
        self.status_label.grid(row=8, column=0, columnspan=2, sticky="w", pady=(0, 10))

        ttk.Button(card, text="Entrar", style="Primary.TButton", command=self._handle_login).grid(row=9, column=0, sticky="ew", padx=(0, 6))
        ttk.Button(card, text="Registrarme", command=self._handle_register).grid(row=9, column=1, sticky="ew")

        card.columnconfigure(0, weight=1)
        card.columnconfigure(1, weight=1)

    def _handle_login(self) -> None:
        self.on_login(self.entry_user.get(), self.entry_password.get())

    def _handle_register(self) -> None:
        self.on_register(self.entry_user.get(), self.entry_password.get(), self.entry_confirm.get())

    def set_status(self, message: str, is_error: bool = False) -> None:
        self.status_var.set(message)
        self.status_label.configure(foreground="#B91C1C" if is_error else "#1D4ED8")

    def clear_passwords(self) -> None:
        self.entry_password.delete(0, tk.END)
        self.entry_confirm.delete(0, tk.END)
