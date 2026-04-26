import tkinter as tk
from tkinter import ttk, messagebox

class AppUI:

    def __init__(self, root, controlador):
        self.root = root
        self.controlador = controlador

        self.root.title("🛡️ Sistema WiFi Seguro PRO")
        self.root.geometry("800x600")
        self.root.configure(bg="#1e1e2f")

        self.crear_estilos()
        self.crear_componentes()

    # =========================
    # 🎨 ESTILOS
    # =========================
    def crear_estilos(self):
        style = ttk.Style()
        style.theme_use("clam")

        style.configure("Treeview",
                        background="#2b2b3c",
                        foreground="white",
                        fieldbackground="#2b2b3c",
                        rowheight=25)

        style.configure("TButton",
                        padding=6,
                        font=("Arial", 10))

    # =========================
    # 🧩 COMPONENTES
    # =========================
    def crear_componentes(self):

        frame = tk.Frame(self.root, bg="#1e1e2f")
        frame.pack(pady=10)

        # Nombre
        tk.Label(frame, text="Nombre WiFi", fg="white", bg="#1e1e2f").grid(row=0, column=0)
        self.entry_nombre = tk.Entry(frame)
        self.entry_nombre.grid(row=0, column=1)

        # Tipo
        tk.Label(frame, text="Tipo", fg="white", bg="#1e1e2f").grid(row=1, column=0)
        self.combo_tipo = ttk.Combobox(frame, values=["Pública", "Privada"])
        self.combo_tipo.grid(row=1, column=1)

        # Cifrado
        self.var_cifrado = tk.BooleanVar()
        tk.Checkbutton(frame, text="Cifrado", variable=self.var_cifrado,
                       bg="#1e1e2f", fg="white").grid(row=2, columnspan=2)

        # Resultado
        self.resultado = tk.StringVar()
        self.lbl_resultado = tk.Label(self.root, textvariable=self.resultado,
                                     font=("Arial", 14), bg="#1e1e2f")
        self.lbl_resultado.pack()

        # ProgressBar
        self.progress = ttk.Progressbar(self.root, mode="indeterminate", length=250)
        self.progress.pack(pady=10)

        # Botones
        btn_frame = tk.Frame(self.root, bg="#1e1e2f")
        btn_frame.pack(pady=10)

        ttk.Button(btn_frame, text="Agregar", command=self.controlador.agregar).grid(row=0, column=0, padx=5)
        ttk.Button(btn_frame, text="Actualizar", command=self.controlador.actualizar).grid(row=0, column=1, padx=5)
        ttk.Button(btn_frame, text="Eliminar", command=self.controlador.eliminar).grid(row=0, column=2, padx=5)
        ttk.Button(btn_frame, text="Analizar", command=self.controlador.analizar).grid(row=0, column=3, padx=5)

        # Tabla
        self.tabla = ttk.Treeview(self.root,
                                 columns=("ID", "Nombre", "Tipo", "Cifrado", "Riesgo"),
                                 show="headings")

        for col in self.tabla["columns"]:
            self.tabla.heading(col, text=col)
            self.tabla.column(col, anchor="center")

        self.tabla.pack(fill="both", expand=True, pady=10)

        # Evento selección
        self.tabla.bind("<<TreeviewSelect>>", self.on_select)

    # =========================
    # 🔄 EVENTOS
    # =========================
    def on_select(self, event):
        item = self.tabla.focus()
        if item:
            datos = self.tabla.item(item)["values"]

            self.entry_nombre.delete(0, tk.END)
            self.entry_nombre.insert(0, datos[1])

            self.combo_tipo.set(datos[2])
            self.var_cifrado.set(datos[3])

    # =========================
    # 📊 FUNCIONES UI
    # =========================

    def obtener_datos(self):
        return (
            self.entry_nombre.get(),
            self.combo_tipo.get(),
            self.var_cifrado.get()
        )

    def obtener_id_seleccionado(self):
        item = self.tabla.focus()
        if item:
            return self.tabla.item(item)["values"][0]
        return None

    def limpiar_campos(self):
        self.entry_nombre.delete(0, tk.END)
        self.combo_tipo.set("")
        self.var_cifrado.set(False)

    def actualizar_tabla(self, datos):
        for row in self.tabla.get_children():
            self.tabla.delete(row)

        for fila in datos:
            self.tabla.insert("", "end", values=fila)

    def mostrar_resultado(self, texto, color="white"):
        self.resultado.set(texto)
        self.lbl_resultado.config(fg=color)

    def iniciar_carga(self):
        self.progress.start()

    def detener_carga(self):
        self.progress.stop()

    def alerta(self, mensaje):
        messagebox.showwarning("Alerta", mensaje)