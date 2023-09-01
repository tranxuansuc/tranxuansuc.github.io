    const rubToUsdRate = 0.01039;
    const usdToVndRate = 24085;
	function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

    async function fetchCryptoData(ids) {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    function updateTable(cryptoData) {
        const tableRows = document.querySelectorAll('.asset-section .asset-table tbody tr');

        tableRows.forEach((row, index) => {
            const currentPriceCell = row.cells[2];
            const valueCell = row.cells[3];

            const id = row.getAttribute('id');
            const crypto = cryptoData[id];

            if (crypto) {
                const currentPrice = crypto.usd.toFixed(getDecimalPlaces(id));
                const value = (crypto.usd * parseFloat(row.cells[1].textContent)).toFixed(2);

                currentPriceCell.textContent = `$${currentPrice}`;
                valueCell.textContent = `$${value}`;
            }
        });

        calculateTotalAssets();
		sortOption.dispatchEvent(new Event('change'));
    }
const sortOption = document.getElementById('sort-option');
const assetTable = document.querySelector('.asset-section .asset-table tbody');

sortOption.addEventListener('change', () => {
    const selectedOption = sortOption.value;
    let rows = Array.from(assetTable.children);

    switch (selectedOption) {
        case 'valueHighToLow':
            rows.sort((a, b) => {
                const aValue = parseFloat(a.cells[3].textContent.replace('$', ''));
                const bValue = parseFloat(b.cells[3].textContent.replace('$', ''));
                return bValue - aValue;
            });
            break;
        case 'valueLowToHigh':
            rows.sort((a, b) => {
                const aValue = parseFloat(a.cells[3].textContent.replace('$', ''));
                const bValue = parseFloat(b.cells[3].textContent.replace('$', ''));
                return aValue - bValue;
            });
            break;
        default:
            rows.sort((a, b) => a.rowIndex - b.rowIndex);
            break;
    }

    rows.forEach(row => assetTable.appendChild(row));
});
    async function updateTablePrice() {
        const coinIds = [
            'bitcoin', 'binancecoin', 'tron', 'bitcoin-cash', 
            'matic-network', 'tether', 'shiba-inu', 'celo', 
            'usd-coin', 'avalanche-2'
        ];
        
        const cryptoData = await fetchCryptoData(coinIds.join(','));
        updateTable(cryptoData);
        updateRubToUsd();
    }

    function getDecimalPlaces(id) {
        switch (id) {
            case 'shiba-inu':
                return 8;
            case 'matic-network':
            case 'celo':
            case 'tron':
                return 6;
            default:
                return 2;
        }
    }

    async function updateRubToUsd() {
        const rubAmountCell = document.getElementById('rub-amount');
        const rubAmountValue = parseFloat(rubAmountCell.textContent.split(' ')[1]);
        const rubToUsdValue = (rubAmountValue * rubToUsdRate).toFixed(2);
        rubAmountCell.textContent = `₽ ${rubAmountValue} ≈ $${rubToUsdValue}`;
    }

function calculateTotalAssets() {
    const usdAmountCell = document.getElementById('usd-amount');
    const usdAmountValue = parseFloat(usdAmountCell.textContent.replace('$', ''));

    const rubAmountCell = document.getElementById('rub-amount');
    const rubAmountValue = parseFloat(rubAmountCell.textContent.split(' ')[1]);

    const assetValueCells = document.querySelectorAll('.asset-section .asset-table tbody tr td:nth-child(4)');
    let totalCryptoValue = 0;

    assetValueCells.forEach(cell => {
        totalCryptoValue += parseFloat(cell.textContent.replace('$', ''));
    });

    const totalValue = usdAmountValue + (rubAmountValue * rubToUsdRate) + totalCryptoValue;
    const totalValueVND = totalValue * usdToVndRate;

    const totalValueCell = document.getElementById('total-amount');
    totalValueCell.textContent = `$${totalValue.toFixed(4)}`;

    const totalValueVNDCell = document.getElementById('total-vnd');
    totalValueVNDCell.textContent = `≈ ${numberWithCommas(totalValueVND.toFixed(0))} VND`;
}

    updateTablePrice();

    document.getElementById('refresh-button').addEventListener('click', async () => {
        await updateTablePrice();
    });
  document.addEventListener("DOMContentLoaded", function() {
    const infoElement = document.querySelector(".info");
    const popupElement = document.querySelector(".popup");

    infoElement.addEventListener("click", function(event) {
      event.stopPropagation();
      const rect = infoElement.getBoundingClientRect();
      popupElement.style.top = rect.bottom + "px";

      if (popupElement.style.display === "block") {
        popupElement.style.display = "none";
      } else {
        popupElement.style.display = "block";
      }
    });

    document.addEventListener("click", function(event) {
      if (!popupElement.contains(event.target) && !infoElement.contains(event.target)) {
        popupElement.style.display = "none";
      }
    });

    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape") {
        popupElement.style.display = "none";
      }
    });
  });
