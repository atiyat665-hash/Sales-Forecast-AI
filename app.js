// Realistic Advertising Dataset (TV, Radio, Newspaper -> Sales)
const advertisingData = [
    [230.1, 37.8, 69.2, 22.1],
    [44.5, 39.3, 45.1, 10.4],
    [17.2, 45.9, 69.3, 9.3],
    [151.5, 41.3, 58.5, 18.5],
    [180.8, 10.8, 58.4, 12.9],
    [8.7, 48.9, 75.0, 7.2],
    [57.5, 32.8, 23.5, 11.8],
    [120.2, 19.6, 11.6, 13.2],
    [8.6, 2.1, 1.0, 4.8],
    [199.8, 2.6, 21.2, 10.6],
    [66.1, 5.8, 24.2, 8.6],
    [214.7, 24.0, 4.0, 17.4],
    [23.8, 35.1, 65.9, 9.2],
    [97.5, 7.6, 7.2, 9.7],
    [204.1, 32.9, 46.0, 19.0],
    [195.4, 47.7, 52.9, 22.4],
    [67.8, 36.6, 114.0, 12.5],
    [281.4, 39.6, 55.8, 24.4],
    [69.2, 20.5, 18.3, 11.3],
    [147.3, 23.9, 19.1, 14.6],
    [218.4, 27.7, 53.4, 18.0],
    [237.4, 5.1, 23.5, 12.5],
    [13.2, 15.9, 49.6, 5.6],
    [228.3, 16.9, 26.2, 15.5],
    [62.3, 12.6, 18.3, 9.7],
    [262.9, 3.5, 19.5, 12.0],
    [142.9, 29.3, 12.6, 15.0],
    [240.1, 16.7, 22.9, 15.9],
    [248.8, 27.1, 22.9, 18.9],
    [70.6, 16.0, 40.8, 10.5],
    [292.9, 28.3, 43.2, 21.4],
    [112.9, 17.4, 38.6, 11.9],
    [97.2, 1.5, 30.0, 9.6],
    [265.6, 20.0, 0.3, 17.4],
    [95.7, 1.4, 7.4, 9.5],
    [290.7, 4.1, 8.5, 12.8],
    [266.9, 43.8, 5.0, 25.4],
    [74.7, 49.4, 45.7, 14.7],
    [136.2, 19.2, 16.6, 12.9],
    [228.0, 37.7, 32.0, 21.5],
    [202.5, 22.3, 31.6, 16.6],
    [177.0, 33.4, 38.7, 17.1],
    [293.6, 27.7, 1.8, 20.7],
    [206.9, 8.4, 26.4, 12.9],
    [25.1, 25.7, 43.3, 8.5],
    [175.1, 22.5, 31.5, 14.9],
    [89.7, 9.9, 35.7, 10.6],
    [239.9, 5.1, 8.5, 12.3],
    [227.2, 15.8, 49.9, 14.8],
    [60.6, 59.3, 1.3, 9.7]
];

// Split into features and targets
const X_data = advertisingData.map(row => [row[0], row[1], row[2]]);
const y_data = advertisingData.map(row => row[3]);

// Initialize Polynomial Regression Models
let currentModel = null;
const linearModel = new PolynomialRegression(1); // Degree 1
const polyModel = new PolynomialRegression(2);   // Degree 2

// Train models
linearModel.fit(X_data, y_data);
polyModel.fit(X_data, y_data);

// Default to Linear Model initially
currentModel = linearModel;

// DOM Elements
const tvSlider = document.getElementById('tvBudget');
const radioSlider = document.getElementById('radioBudget');
const newspaperSlider = document.getElementById('newspaperBudget');

const tvVal = document.getElementById('tvVal');
const radioVal = document.getElementById('radioVal');
const newspaperVal = document.getElementById('newspaperVal');

const btnLinear = document.getElementById('btnLinear');
const btnPoly = document.getElementById('btnPoly');
const predictionOutput = document.getElementById('predictionOutput');

// Optimization Elements
const totalBudgetInput = document.getElementById('totalBudgetInput');
const btnOptimize = document.getElementById('btnOptimize');
const aiMessage = document.getElementById('aiMessage');

// Price catalog of goods (in thousands of dollars)
const itemPrices = {
    newspaper: 0.005, // $5
    radio: 0.05,      // $50
    phone: 0.8,       // $800
    tv: 1.5,          // $1500
    laptop: 2.5       // $2500
};

// Update Prediction based on Slider Inputs
function updatePrediction() {
    const tv = parseFloat(tvSlider.value);
    const radio = parseFloat(radioSlider.value);
    const newspaper = parseFloat(newspaperSlider.value);

    // Update Slider Labels
    tvVal.innerText = `$${tv.toFixed(1)}k`;
    radioVal.innerText = `$${radio.toFixed(1)}k`;
    newspaperVal.innerText = `$${newspaper.toFixed(1)}k`;

    // Predict
    const pred = currentModel.predict([[tv, radio, newspaper]])[0];
    const finalSales = Math.max(0, pred);
    
    // Set positive bound and print
    predictionOutput.innerText = finalSales.toFixed(2);
    
    // Draw regression curve updates
    updateCurveChart(tv, radio, newspaper, finalSales);
}

// Event Listeners for Sliders
tvSlider.addEventListener('input', updatePrediction);
radioSlider.addEventListener('input', updatePrediction);
newspaperSlider.addEventListener('input', updatePrediction);

// Toggle models
btnLinear.addEventListener('click', () => {
    btnLinear.classList.add('active');
    btnPoly.classList.remove('active');
    currentModel = linearModel;
    updatePrediction();
});

btnPoly.addEventListener('click', () => {
    btnPoly.classList.add('active');
    btnLinear.classList.remove('active');
    currentModel = polyModel;
    updatePrediction();
});

// Initialize the dynamic regression curve chart
let curveChart = null;

function initCurveChart() {
    try {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('regressionCurveChart');
        if (!ctx) return;
        
        curveChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Regression Curve (TV vs Sales)',
                    data: [],
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                }, {
                    label: 'Current Input Point',
                    data: [],
                    borderColor: '#f43f5e',
                    backgroundColor: '#f43f5e',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: 0,
                        max: 300,
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } },
                        title: { display: true, text: 'TV Budget ($k)', color: '#94a3b8', font: { family: 'Outfit', size: 11 } }
                    },
                    y: {
                        min: 0,
                        max: 30,
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } },
                        title: { display: true, text: 'Sales (k units)', color: '#94a3b8', font: { family: 'Outfit', size: 11 } }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error initializing curve chart:", err);
    }
}

function updateCurveChart(activeTv, activeRadio, activeNewspaper, predictedSales) {
    try {
        if (!curveChart || typeof Chart === 'undefined') return;
        
        // Generate 20 points along the TV axis
        const curvePoints = [];
        for (let tv = 0; tv <= 300; tv += 15) {
            const sales = currentModel.predict([[tv, activeRadio, activeNewspaper]])[0];
            curvePoints.push({ x: tv, y: Math.max(0, sales) });
        }
        
        curveChart.data.datasets[0].data = curvePoints;
        curveChart.data.datasets[1].data = [{ x: activeTv, y: predictedSales }];
        curveChart.update('none'); // Quick update without layout redraw
    } catch (err) {
        console.error("Error updating curve chart:", err);
    }
}

// Global variables for AI Allocation Charts
let salesGrowthChart = null;
let allocationPieChart = null;

function initAllocationCharts() {
    try {
        if (typeof Chart === 'undefined') return;
        const ctxLine = document.getElementById('salesGrowthChart');
        if (!ctxLine) return;
        
        salesGrowthChart = new Chart(ctxLine.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Expected Sales Growth',
                    data: [],
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        type: 'linear',
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 9 } },
                        title: { display: true, text: 'Budget ($k)', color: '#94a3b8', font: { family: 'Outfit', size: 10 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 9 } },
                        title: { display: true, text: 'Sales (k)', color: '#94a3b8', font: { family: 'Outfit', size: 10 } }
                    }
                }
            }
        });

        const ctxPie = document.getElementById('allocationPieChart');
        if (!ctxPie) return;
        
        allocationPieChart = new Chart(ctxPie.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['TV', 'Radio', 'News'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#f43f5e', '#06b6d4', '#eab308'],
                    borderColor: '#121420',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#94a3b8', boxWidth: 10, font: { family: 'Outfit', size: 10 } }
                    }
                },
                cutout: '60%'
            }
        });
    } catch (err) {
        console.error("Error initializing allocation charts:", err);
    }
}

// Run optimization and update recommendation
function runBudgetAnalysis() {
    const totalBudget = parseFloat(totalBudgetInput.value) || 0;

    // 1. Check Affordability and reset classes
    const affordableItems = [];
    Object.keys(itemPrices).forEach(item => {
        const price = itemPrices[item];
        const card = document.getElementById(`item-${item}`);
        
        card.classList.remove('high-rank');
        if (totalBudget >= price) {
            card.classList.add('affordable');
            affordableItems.push(item);
        } else {
            card.classList.remove('affordable');
        }
    });

    // High Rank recommendation logic based on budget brackets
    let highRankItem = 'laptop'; // default / otherwise
    if (totalBudget >= 1 && totalBudget <= 3) {
        highRankItem = 'newspaper';
    } else if (totalBudget >= 4 && totalBudget <= 15) {
        highRankItem = 'radio';
    } else if (totalBudget >= 16 && totalBudget <= 20) {
        highRankItem = 'tv';
    } else if (totalBudget >= 21 && totalBudget <= 25) {
        highRankItem = 'phone';
    }
    
    // Highlight the high-rank item card
    document.getElementById(`item-${highRankItem}`).classList.add('high-rank');

    // 2. Perform optimal ad budget allocation (simulating multi-channel allocation)
    let bestSales = -Infinity;
    let bestAllocation = [0, 0, 0]; // [TV, Radio, Newspaper]

    // Grid search to find the optimal point at the final budget
    if (totalBudget > 0) {
        const step = totalBudget / 20; 
        for (let tv = 0; tv <= totalBudget; tv += step) {
            for (let radio = 0; radio <= totalBudget - tv; radio += step) {
                const news = Math.max(0, totalBudget - tv - radio);
                const sales = polyModel.predict([[tv, radio, news]])[0];
                if (sales > bestSales) {
                    bestSales = sales;
                    bestAllocation = [tv, radio, news];
                }
            }
        }
    } else {
        bestSales = 0;
        bestAllocation = [0, 0, 0];
    }

    const [optTv, optRadio, optNews] = bestAllocation;

    // Update Doughnut Chart with the optimal percentages
    try {
        if (allocationPieChart && typeof Chart !== 'undefined') {
            allocationPieChart.data.datasets[0].data = [optTv, optRadio, optNews];
            allocationPieChart.update();
        }
    } catch (err) {
        console.error("Error updating allocation pie chart:", err);
    }

    // Generate Growth Line points (Expected Sales vs Budget up to totalBudget)
    try {
        if (salesGrowthChart && totalBudget > 0 && typeof Chart !== 'undefined') {
            const growthPoints = [];
            const stepCount = 10;
            const budgetStep = totalBudget / stepCount;

            for (let b = 0; b <= totalBudget; b += budgetStep) {
                let maxSalesForB = -Infinity;
                const subStep = Math.max(1, b / 10);
                for (let tv = 0; tv <= b; tv += subStep) {
                    for (let radio = 0; radio <= b - tv; radio += subStep) {
                        const news = Math.max(0, b - tv - radio);
                        const sales = polyModel.predict([[tv, radio, news]])[0];
                        if (sales > maxSalesForB) {
                            maxSalesForB = sales;
                        }
                    }
                }
                growthPoints.push({ x: b, y: Math.max(0, maxSalesForB) });
            }

            salesGrowthChart.data.datasets[0].data = growthPoints;
            salesGrowthChart.options.scales.x.max = totalBudget;
            salesGrowthChart.update();
        } else if (salesGrowthChart && typeof Chart !== 'undefined') {
            salesGrowthChart.data.datasets[0].data = [];
            salesGrowthChart.update();
        }
    } catch (err) {
        console.error("Error updating sales growth chart:", err);
    }

    // 3. Build Roman Urdu AI Message for the user
    let budgetText = `Aapka budget **$${totalBudget.toFixed(1)}k** hai. `;
    let purchaseText = "";
    
    if (affordableItems.length > 0) {
        const itemNames = affordableItems.map(item => item.toUpperCase());
        purchaseText = `Is budget me aap aasaani se ye cheezein le sakte hain: **${itemNames.join(', ')}**.<br><br>`;
    } else {
        purchaseText = "Ye budget bohot kam hai, isme aap koi cheez nahi le sakte. Budget barhayein!<br><br>";
    }

    let adAdviceText = `Sales maximize karne ke liye, optimal allocation hai:<br>` +
        `• **TV**: $${optTv.toFixed(1)}k spend karein<br>` +
        `• **Radio**: $${optRadio.toFixed(1)}k spend karein<br>` +
        `• **Newspaper**: $${optNews.toFixed(1)}k spend karein<br><br>` +
        `Is allocation se aapki estimated sales **${Math.max(0, bestSales).toFixed(2)}k units** tak pohnch sakti hai!`;

    aiMessage.innerHTML = `${budgetText}<br>${purchaseText}${adAdviceText}`;
}

btnOptimize.addEventListener('click', runBudgetAnalysis);

// Initialize view
initCurveChart();
initAllocationCharts();
updatePrediction();
runBudgetAnalysis();

