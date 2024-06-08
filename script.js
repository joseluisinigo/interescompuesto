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

// Función para obtener el porcentaje de rewards
async function obtenerRewardRate(coin) {
  try {
      if (coin === 'polkadot') {
          // Obtener el porcentaje de reward de Polkadot desde su página oficial
          const response = await fetch('https://staking.polkadot.network/?utm_source=polkadot.network#/overview');
          const text = await response.text();
          const match = text.match(/(\d+\.\d+)% after commission/);
          if (match) {
              return parseFloat(match[1]);
          } else {
              throw new Error('No se pudo obtener el porcentaje de reward de Polkadot');
          }
      } else {
          // Obtener el porcentaje de reward de otras monedas desde Bit2Me
          const response = await fetch('https://bit2me.com/suite/earn');
          const text = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const rewardElements = doc.querySelectorAll('.earn-card');
          for (const element of rewardElements) {
              const title = element.querySelector('.earn-card__title').innerText.toLowerCase();
              if (title.includes(coin)) {
                  const rewardText = element.querySelector('.earn-card__rate').innerText;
                  const rewardMatch = rewardText.match(/(\d+\.\d+)%/);
                  if (rewardMatch) {
                      return parseFloat(rewardMatch[1]);
                  }
              }
          }
          throw new Error('No se pudo obtener el porcentaje de reward de ' + coin);
      }
  } catch (error) {
      console.error(error);
      alert("Error al obtener el porcentaje de reward. Por favor, intente nuevamente más tarde.");
      return null;
  }
}

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
});

document.querySelectorAll('.crypto-icons img').forEach(icon => {
  icon.addEventListener('click', async function() {
      document.querySelectorAll('.crypto-icons img').forEach(i => i.classList.remove('selected'));
      this.classList.add('selected');
      const coin = this.dataset.coin;
      const priceSpan = document.getElementById(`price-${coin}`);
      const rewardSpan = document.getElementById(`reward-${coin}`);
      
      const price = await obtenerPrecioActual(coin);
      const rewards = {
          polkadot: 16.8,
          aave: 5.0,
          bitcoin: 2.0,
          ethereum: 3.84,
          binancecoin: 1.06,
          ton: 9.0,
          avax: 8.5  // Valor manual para AVAX
      };
      
      if (price) {
          priceSpan.textContent = `$${price.toFixed(2)}`;
      } else {
          priceSpan.textContent = 'N/A';
      }
      
      const reward = rewards[coin] || 'N/A';
      rewardSpan.textContent = `${reward}%`;
      document.getElementById('rewards').value = reward;
  });
});

function calcularInteresCompuestoDiario(monedasIniciales, tasaInteresAnual, dias) {
  let monedas = monedasIniciales;
  const tasaInteresDiaria = tasaInteresAnual / 365;
  for (let i = 0; i < dias; i++) {
      monedas += monedas * tasaInteresDiaria;
  }
  return monedas;
}

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

// Mostrar más monedas al hacer clic en "Otros"
document.getElementById('showMoreCoins').addEventListener('click', function() {
  document.querySelectorAll('.crypto-icon.more').forEach(icon => {
      icon.style.display = 'block';
  });
  this.style.display = 'none';
});
