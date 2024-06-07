import subprocess
import sys

# Comprobar si pandas está instalado e instalarlo si no lo está
try:
    import pandas as pd
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas"])
    import pandas as pd

def calcular_interes_compuesto_diario(monedas_iniciales, tasa_interes_anual, dias):
    monedas = monedas_iniciales
    tasa_interes_diaria = tasa_interes_anual / 365
    for _ in range(dias):
        interes_diario = monedas * tasa_interes_diaria
        monedas += interes_diario
    return monedas

# Pedir al usuario el número de monedas iniciales
monedas_iniciales = float(input("Introduce el número de monedas iniciales: "))

años = list(range(1, 11))
monedas_compuesto_diario = []
monedas_simple = []

for año in años:
    monedas_compuesto_diario.append(calcular_interes_compuesto_diario(monedas_iniciales, 0.16, 365 * año))
    monedas_simple.append(monedas_iniciales + (monedas_iniciales * 0.16 * año))

data = {
    "Año": años,
    "Interés Compuesto Diario": monedas_compuesto_diario,
    "Interés Simple": monedas_simple,
}

df = pd.DataFrame(data)
df["Interés Compuesto Diario"] = df["Interés Compuesto Diario"].round(2)
df["Interés Simple"] = df["Interés Simple"].round(2)

print(df)
