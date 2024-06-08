// Función para obtener el precio actual de la criptomoneda
async function obtenerPrecioActual(coin) {
  try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`);
      const data = await response.json();
      return data[coin].usd;
  } catch (error) {
      console.error('Error al obtener el precio actual:', error);
      return null;
  }
}

// Función para obtener el reward de Polkadot
async function obtenerRewardPolkadot() {
  try {
      const response = await fetch('https://staking.polkadot.network/?utm_source=polkadot.network#/overview');
      const text = await response.text();
      const match = text.match(/(\d+\.\d+)% after commission/);
      if (match) {
          return parseFloat(match[1]);
      } else {
          throw new Error('No se pudo obtener el porcentaje de reward de Polkadot');
      }
  } catch (error) {
      console.error('Error al obtener el reward de Polkadot:', error);
      document.getElementById('error-message').style.display = 'block';
      return 16.0;  // Valor por defecto en caso de error
  }
}

// Función para calcular el interés compuesto diario
function calcularInteresCompuestoDiario(monedasIniciales, tasaInteresAnual, dias) {
  let monedas = monedasIniciales;
  const tasaInteresDiaria = tasaInteresAnual / 365;
  for (let i = 0; i < dias; i++) {
      monedas += monedas * tasaInteresDiaria;
  }
  return monedas;
}

// Función para mostrar resultados en la tabla
function mostrarResultados(resultsTable, years, monedasCompuestoDiario, monedasSimple, precioActual, valorActualCompuesto, valorActualSimple, hypotheticalPrice, valorHipoteticoCompuesto, valorHipoteticoSimple) {
  resultsTable.innerHTML = '';

  for (let i = 0; i <= years; i++) {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${i === 0 ? 'Actual' : i}</td>
          <td>${monedasCompuestoDiario[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${monedasSimple[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${precioActual.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${valorActualCompuesto[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${valorActualSimple[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${hypotheticalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${valorHipoteticoCompuesto[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${valorHipoteticoSimple[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      `;
      row.addEventListener('click', function() {
          this.classList.toggle('expanded');
          const expandedRow = this.nextElementSibling;
          if (expandedRow && expandedRow.classList.contains('expanded-row')) {
              expandedRow.classList.toggle('d-none');
          } else {
              const newRow = document.createElement('tr');
              newRow.classList.add('expanded-row');
              newRow.innerHTML = `
                  <td colspan="9">
                      <div>
                          <p><strong>Año:</strong> ${i === 0 ? 'Actual' : i}</p>
                          <p><strong>Compuesto Diario:</strong> ${monedasCompuestoDiario[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                      <p><strong>Compuesto Diario:</strong> ${monedasCompuestoDiario[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Simple:</strong> ${monedasSimple[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Precio Actual (USD):</strong> ${precioActual.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Val. Act. Comp. (USD):</strong> ${valorActualCompuesto[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Val. Act. Simple (USD):</strong> ${valorActualSimple[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Precio Hip. (USD):</strong> ${hypotheticalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Val. Hip. Comp. (USD):</strong> ${valorHipoteticoCompuesto[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Val. Hip. Simple (USD):</strong> ${valorHipoteticoSimple[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </td>
                `;
                this.parentNode.insertBefore(newRow, this.nextSibling);
            }
        });
        resultsTable.appendChild(row);
    }
}

// Manejador del evento submit del formulario
document.getElementById('calcForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const initialCoins = parseFloat(document.getElementById('initialCoins').value);
    const years = parseFloat(document.getElementById('years').value) || 10;
    const rewards = parseFloat(document.getElementById('rewards').value.replace(',', '.'));
    const coin = document.querySelector('.crypto-icons img.selected').dataset.coin;
    const hypotheticalPrice = parseFloat(document.getElementById('hypotheticalPrice').value);

    if (isNaN(initialCoins) || isNaN(years) || isNaN(rewards) || isNaN(hypotheticalPrice)) {
        alert("Por favor, ingrese valores válidos en todos los campos.");
        return;
    }

    const precioActual = await obtenerPrecioActual(coin);
    if (precioActual === null) return;

    let monedasCompuestoDiario = [initialCoins];
    let monedasSimple = [initialCoins];
    let valorActualCompuesto = [initialCoins * precioActual];
    let valorActualSimple = [initialCoins * precioActual];
    let valorHipoteticoCompuesto = [initialCoins * hypotheticalPrice];
    let valorHipoteticoSimple = [initialCoins * hypotheticalPrice];

    for (let año = 1; año <= years; año++) {
        const compuestoDiario = calcularInteresCompuestoDiario(initialCoins, rewards / 100, 365 * año);
        const simple = initialCoins + (initialCoins * (rewards / 100) * año);

        monedasCompuestoDiario.push(compuestoDiario);
        monedasSimple.push(simple);

        valorActualCompuesto.push(compuestoDiario * precioActual);
        valorActualSimple.push(simple * precioActual);

        valorHipoteticoCompuesto.push(compuestoDiario * hypotheticalPrice);
        valorHipoteticoSimple.push(simple * hypotheticalPrice);
    }

    const resultsTable = document.getElementById('resultsTable');
    mostrarResultados(resultsTable, years, monedasCompuestoDiario, monedasSimple, precioActual, valorActualCompuesto, valorActualSimple, hypotheticalPrice, valorHipoteticoCompuesto, valorHipoteticoSimple);
});

// Evento click para seleccionar criptomoneda y actualizar rewards y precio hipotético
document.querySelectorAll('.crypto-icons img').forEach(icon => {
    icon.addEventListener('click', async function() {
        document.querySelectorAll('.crypto-icons img').forEach(i => i.classList.remove('selected'));
        this.classList.add('selected');
        const coin = this.dataset.coin;

        let reward, hypotheticalPrice;
        if (coin === 'polkadot') {
            reward = await obtenerRewardPolkadot();
            hypotheticalPrice = 100;
        } else if (coin === 'ethereum') {
            reward = 3.84;
            hypotheticalPrice = 10000;
        } else if (coin === 'bitcoin') {
            reward = 2.0;
            hypotheticalPrice = 1000000;
        }

        document.getElementById('rewards').value = reward;
        document.getElementById('hypotheticalPrice').value = hypotheticalPrice;
    });
});

document.getElementById('toggleDarkMode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('darkModeIcon');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

document.getElementById('years').addEventListener('input', function() {
    document.getElementById('yearValue').textContent = this.value;
});

// Inicialización de la página
document.addEventListener('DOMContentLoaded', async function() {
    const polkadotReward = await obtenerRewardPolkadot();
    if (polkadotReward) {
        document.querySelector('[data-coin="polkadot"]').dataset.rewards = polkadotReward;
        document.querySelector('[data-coin="polkadot"]').click();
    } else {
        document.querySelector('[data-coin="polkadot"]').dataset.rewards = 16.0; // Valor por defecto
        document.querySelector('[data-coin="polkadot"]').click();
    }
});

