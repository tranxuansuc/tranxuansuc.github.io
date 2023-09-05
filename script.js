const rubToUsdRate = 0.01039;
const usdToVndRate = 24107.5;
const pieChartCanvas = document.getElementById('asset-pie-chart');
let usdAmountValue = parseFloat(document.getElementById('usd-amount').textContent.replace('$', ''));
let rubAmountValue = parseFloat(document.getElementById('rub-amount').textContent.split(' ')[1]);
let totalCryptoValue = 0;
let pieChart;

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

    rows.sort((a, b) => {
        const aValue = parseFloat(a.cells[3].textContent.replace('$', ''));
        const bValue = parseFloat(b.cells[3].textContent.replace('$', ''));
        return (selectedOption === 'valueHighToLow') ? bValue - aValue : aValue - bValue;
    });

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
    usdAmountValue = parseFloat(document.getElementById('usd-amount').textContent.replace('$', ''));
    
    const rubAmountCell = document.getElementById('rub-amount');
    rubAmountValue = parseFloat(rubAmountCell.textContent.split(' ')[1]);
    const rubToUsdValue = (rubAmountValue * rubToUsdRate);
    assetAllocation = {
        'USD': usdAmountValue,
        'RUB': rubToUsdValue,
        'BTC': parseFloat(document.getElementById('bitcoin').cells[3].textContent.replace('$', '')),
        'BNB': parseFloat(document.getElementById('binancecoin').cells[3].textContent.replace('$', '')),
        'TRX': parseFloat(document.getElementById('tron').cells[3].textContent.replace('$', '')),
        'BCH': parseFloat(document.getElementById('bitcoin-cash').cells[3].textContent.replace('$', '')),
        'MATIC': parseFloat(document.getElementById('matic-network').cells[3].textContent.replace('$', '')),
        'USDT': parseFloat(document.getElementById('tether').cells[3].textContent.replace('$', '')),
        'SHIB': parseFloat(document.getElementById('shiba-inu').cells[3].textContent.replace('$', '')),
        'CELO': parseFloat(document.getElementById('celo').cells[3].textContent.replace('$', '')),
        'USDC': parseFloat(document.getElementById('usd-coin').cells[3].textContent.replace('$', '')),
        'AVAX': parseFloat(document.getElementById('avalanche-2').cells[3].textContent.replace('$', '')),
    };

    createAssetPieChart(assetAllocation);
   const assetPercentages = calculateAssetPercentages(assetAllocation);
   const sortedAssetPercentages = sortAssetPercentagesDescending(assetPercentages);
   updatePercentageTable(sortedAssetPercentages);
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
    totalCryptoValue = 0;

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
    const assetPercentages = calculateAssetPercentages(assetAllocation);
    updatePercentageTable(sortAssetPercentagesDescending(assetPercentages));
});

document.addEventListener("DOMContentLoaded", function () {
    const infoElement = document.querySelector(".info");
    const popupElement = document.querySelector(".popup");

    infoElement.addEventListener("click", function (event) {
        event.stopPropagation();
        const rect = infoElement.getBoundingClientRect();
        popupElement.style.top = rect.bottom + "px";

        if (popupElement.style.display === "block") {
            popupElement.style.display = "none";
        } else {
            popupElement.style.display = "block";
        }
    });

    document.addEventListener("click", function (event) {
        if (!popupElement.contains(event.target) && !infoElement.contains(event.target)) {
            popupElement.style.display = "none";
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            popupElement.style.display = "none";
        }
    });
});

function createAssetPieChart(assets) {
    const assetLabels = Object.keys(assets);
    const assetData = Object.values(assets);

    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(pieChartCanvas, {
        type: 'pie',
        data: {
            labels: assetLabels,
            datasets: [{
                data: assetData,
                backgroundColor: [
                    'green',
                    'pink',
                    '#F7931A',
                    '#F0B90B',
                    '#FF0013',
                    '#8DC351',
                    '#8E33D3',
                    '#009393',
                    '#AE4133',
                    '#FCFE53',
					'#2775CA',
					'#E84142',
                ],
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });
}
function calculateAssetPercentages(assetAllocation) {
   const totalValue = Object.values(assetAllocation).reduce((accumulator, currentValue) => accumulator + currentValue);
   const percentages = {};

   for (const [key, value] of Object.entries(assetAllocation)) {
       percentages[key] = ((value / totalValue) * 100).toFixed(2);
   }

   return percentages;
}
function updatePercentageTable(assetPercentages) {
   const percentageTable = document.getElementById('percentage-table');

   let percentageHTML = '<h4>% GIÁ TRỊ TÀI SẢN TRÊN TỔNG TÀI SẢN</h4>';
   percentageHTML += '<ul>';

   for (const [key, value] of Object.entries(assetPercentages)) {
       percentageHTML += `<li><b>${key}</b>: ${value}%</li>`;
   }

   percentageHTML += '</ul>';

   percentageTable.innerHTML = percentageHTML;
}
function sortAssetPercentagesDescending(assetPercentages) {
   const sortedPercentages = {};
   const sortedKeys = Object.keys(assetPercentages).sort((a, b) => assetPercentages[b] - assetPercentages[a]);

   for (const key of sortedKeys) {
       sortedPercentages[key] = assetPercentages[key];
   }

   return sortedPercentages;
}