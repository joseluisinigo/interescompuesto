import subprocess
import sys
import requests

# Comprobar si pandas está instalado e instalarlo si no lo está
try:
    import pandas as pd
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas"])
    import pandas as pd

# Descripción del programa
print("""
Este programa calcula el interés compuesto diario y el interés simple para una cantidad de monedas especificada
por el usuario durante un número determinado de años. Además, se obtiene el precio actual de la moneda y se calcula
el valor actual de las monedas si se vendieran al precio actual. También se puede introducir un precio hipotético
de venta para calcular el valor total en ese caso.
""")

# Mostrar mensaje de ayuda
def mostrar_ayuda():
    print("""
Uso del programa:
1. Introduce el número de monedas iniciales.
2. Introduce el número de años (default 10 años).
3. Introduce el porcentaje de rewards (default 16.8%).
4. Introduce la moneda (default Polkadot).
5. Introduce el precio hipotético de venta.

El programa calculará y mostrará el interés compuesto diario, el interés simple, el precio actual y el valor actual
de las monedas, así como el valor total si se vendiesen al precio hipotético introducido.
""")

mostrar_ayuda()

def calcular_interes_compuesto_diario(monedas_iniciales, tasa_interes_anual, dias):
    monedas = monedas_iniciales
    tasa_interes_diaria = tasa_interes_anual / 365
    for _ in range(dias):
        interes_diario = monedas * tasa_interes_diaria
        monedas += interes_diario
    return monedas

def obtener_precio_actual(moneda):
    url = f"https://api.coingecko.com/api/v3/simple/price?ids={moneda}&vs_currencies=usd"
    response = requests.get(url)
    data = response.json()
    return data[moneda]['usd']

# Pedir al usuario el número de monedas iniciales
monedas_iniciales = float(input("Introduce el número de monedas iniciales: "))

# Pedir al usuario el número de años, con un valor predeterminado de 10 años
input_años = input("Introduce el número de años (default 10 años): ")
años = int(input_años) if input_años else 10

# Pedir al usuario el porcentaje de rewards, con un valor predeterminado de 16.8%
input_rewards = input("Introduce el porcentaje de rewards (default 16.8%): ")
rewards = float(input_rewards) if input_rewards else 16.8

# Pedir al usuario la moneda, con un valor predeterminado de Polkadot
moneda = input("Introduce la moneda (default Polkadot): ").lower()
moneda = moneda if moneda else "polkadot"

# Pedir al usuario el precio hipotético de venta
precio_hipotetico = float(input("Introduce el precio hipotético de venta de la moneda: "))

# Obtener el precio actual de la moneda
precio_actual = obtener_precio_actual(moneda)

monedas_compuesto_diario = [monedas_iniciales]
monedas_simple = [monedas_iniciales]

for año in range(1, años + 1):
    monedas_compuesto_diario.append(calcular_interes_compuesto_diario(monedas_iniciales, rewards / 100, 365 * año))
    monedas_simple.append(monedas_iniciales + (monedas_iniciales * (rewards / 100) * año))

# Calcular el valor actual en USD si se vendiese al precio actual
valor_actual_compuesto = [m * precio_actual for m in monedas_compuesto_diario]
valor_actual_simple = [m * precio_actual for m in monedas_simple]

# Calcular el valor en USD si se vendiese al precio hipotético
valor_hipotetico_compuesto = [m * precio_hipotetico for m in monedas_compuesto_diario]
valor_hipotetico_simple = [m * precio_hipotetico for m in monedas_simple]

data = {
    "Año": ["Actual"] + list(range(1, años + 1)),
    "Compuesto Diario": monedas_compuesto_diario,
    "Simple": monedas_simple,
    "Precio Actual (USD)": [precio_actual] * (años + 1),
    "Val. Act. Comp. (USD)": valor_actual_compuesto,
    "Val. Act. Simple (USD)": valor_actual_simple,
    "Precio Hip. (USD)": [precio_hipotetico] * (años + 1),
    "Val. Hip. Comp. (USD)": valor_hipotetico_compuesto,
    "Val. Hip. Simple (USD)": valor_hipotetico_simple
}

df = pd.DataFrame(data)

# Formatear valores numéricos con formato de precio español
pd.options.display.float_format = '{:,.2f}'.format

# Aplicar formato de precio español a las columnas específicas
df["Compuesto Diario"] = df["Compuesto Diario"].map('{:,.2f}'.format)
df["Simple"] = df["Simple"].map('{:,.2f}'.format)
df["Val. Act. Comp. (USD)"] = df["Val. Act. Comp. (USD)"].map('{:,.2f}'.format)
df["Val. Act. Simple (USD)"] = df["Val. Act. Simple (USD)"].map('{:,.2f}'.format)
df["Val. Hip. Comp. (USD)"] = df["Val. Hip. Comp. (USD)"].map('{:,.2f}'.format)
df["Val. Hip. Simple (USD)"] = df["Val. Hip. Simple (USD)"].map('{:,.2f}'.format)
df["Precio Actual (USD)"] = df["Precio Actual (USD)"].map('{:,.2f}'.format)
df["Precio Hip. (USD)"] = df["Precio Hip. (USD)"].map('{:,.2f}'.format)

print(df)
