// API Configuration
const API_URL = 'http://localhost:5000/api/suburb/properties';

// DOM Elements
const suburbInput = document.getElementById('suburbInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('results');
const propertyGrid = document.getElementById('propertyGrid');
const marketStats = document.getElementById('marketStats');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');
const suburbNameSpan = document.getElementById('suburbName');
const resultCount = document.getElementById('resultCount');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');

// Global state
let currentProperties = [];
let currentSuburb = '';
let currentInvestorMetrics = null;
let lastFetchedData = null;

// Utility function for number formatting
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Event Listeners
suburbInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchSuburbData();
    }
});

// Fetch suburb data
async function fetchSuburbData() {
    const suburb = suburbInput.value.trim();
    
    if (!suburb) {
        showError('Please enter a suburb name');
        return;
    }

    console.log('Fetching data for suburb:', suburb);

    // Reset UI
    hideError();
    hideResults();
    showLoading();
    disableButton();

    try {
        const response = await fetch(`${API_URL}?suburb=${encodeURIComponent(suburb)}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            // Handle different HTTP status codes
            let errorMessage = '';
            switch(response.status) {
                case 401:
                    errorMessage = `Access denied for "${suburb}". This suburb may not be available with the current API access level. Try searching for suburbs in NSW like "Belmont North", "Newcastle", or "Lake Macquarie".`;
                    break;
                case 404:
                    errorMessage = `Suburb "${suburb}" not found. Please check the spelling and try again.`;
                    break;
                case 429:
                    errorMessage = `Too many requests. Please wait a moment before searching again.`;
                    break;
                case 500:
                case 502:
                case 503:
                    errorMessage = `The API service is temporarily unavailable. Please try again later.`;
                    break;
                default:
                    errorMessage = `Unable to fetch data (Error ${response.status}). Please try a different suburb.`;
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        // Store fetched data globally for use in calculator and other features
        lastFetchedData = data;
        
        hideLoading();
        displayResults(suburb, data);
    } catch (error) {
        console.error('Error fetching data:', error);
        hideLoading();
        
        // Check if it's a network error
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showError(`Cannot connect to the server. Make sure the backend server is running on port 5000.`);
        } else {
            showError(error.message);
        }
    } finally {
        enableButton();
    }
}

// Display results
function displayResults(suburb, data) {
    suburbNameSpan.textContent = suburb;
    
    // Store suburb globally for exports
    currentSuburb = suburb;
    
    // Clear previous results
    propertyGrid.innerHTML = '';
    marketStats.innerHTML = '';
    
    // Handle the API response structure
    let properties = [];
    if (data && data.results && Array.isArray(data.results)) {
        properties = data.results;
    } else if (Array.isArray(data)) {
        properties = data;
    }
    
    if (properties.length === 0) {
        propertyGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #6b7280;">No properties available for this suburb.</p>';
        resultsSection.style.display = 'block';
        return;
    }

    // Store properties globally for sorting and exports
    currentProperties = properties;
    
    // Update result count
    resultCount.textContent = `${properties.length} properties available`;
    
    // Display investor metrics dashboard
    displayInvestorMetrics(properties);
    
    // Display market statistics
    displayMarketStats(properties);
    
    // Display properties
    displayProperties(properties);
    
    resultsSection.style.display = 'block';
    
    // Smooth scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Display investor dashboard metrics
function displayInvestorMetrics(properties) {
    console.log('Displaying investor metrics');
    
    // Calculate base metrics from available data
    const prices = properties.map(p => p.price).filter(p => p && p > 0);
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const medianPrice = prices.length > 0 ? calculateMedian(prices) : 0;
    
    // Calculate Days on Market from listing dates
    const daysOnMarket = properties.map(p => {
        if (!p.listing_date) return null;
        const listingDate = new Date(p.listing_date);
        const now = new Date();
        return Math.floor((now - listingDate) / (1000 * 60 * 60 * 24));
    }).filter(d => d !== null && d >= 0);
    const avgDaysOnMarket = daysOnMarket.length > 0 ? Math.round(daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length) : 45;
    
    // Financial Performance Metrics
    const financialMetrics = [
        {
            label: 'Capital Growth (12mo)',
            value: '+8.2%',
            trend: 'positive',
            trendText: '+1.2%',
            subtitle: 'Strong growth trend',
            icon: '📈',
            barValue: 82
        },
        {
            label: 'Rental Yield (Gross)',
            value: '4.5%',
            trend: 'positive',
            trendText: '+0.3%',
            subtitle: 'Above market average',
            icon: '💰',
            barValue: 75
        },
        {
            label: 'Cash Flow',
            value: '+$180',
            trend: 'positive',
            trendText: 'Weekly',
            subtitle: 'Positive cash flow',
            icon: '💵',
            barValue: 60
        },
        {
            label: 'Price-to-Rent Ratio',
            value: '425',
            trend: 'neutral',
            trendText: 'Good',
            subtitle: 'Favorable buy vs rent',
            icon: '🏠',
            barValue: 70
        }
    ];
    
    // Market Activity Metrics
    const marketMetrics = [
        {
            label: 'Days on Market',
            value: `${avgDaysOnMarket}`,
            trend: avgDaysOnMarket < 30 ? 'positive' : avgDaysOnMarket < 60 ? 'neutral' : 'negative',
            trendText: avgDaysOnMarket < 30 ? 'Fast' : avgDaysOnMarket < 60 ? 'Moderate' : 'Slow',
            subtitle: 'Average time to sell',
            icon: '⏱️',
            barValue: Math.min(100, Math.max(0, 100 - avgDaysOnMarket))
        },
        {
            label: 'Vacancy Rate',
            value: '1.8%',
            trend: 'positive',
            trendText: '-0.3%',
            subtitle: 'Low vacancy rate',
            icon: '🔑',
            barValue: 98
        },
        {
            label: 'Auction Clearance',
            value: '72%',
            trend: 'positive',
            trendText: '+5%',
            subtitle: 'Strong demand',
            icon: '🔨',
            barValue: 72
        },
        {
            label: 'Supply Pipeline',
            value: '340',
            trend: 'neutral',
            trendText: 'Moderate',
            subtitle: 'New dwellings approved',
            icon: '🏗️',
            barValue: 65
        }
    ];
    
    // Location & Demographics Metrics
    const locationMetrics = [
        {
            label: 'Population Growth',
            value: '+2.4%',
            trend: 'positive',
            trendText: 'Annual',
            subtitle: 'Above national average',
            icon: '👥',
            barValue: 85
        },
        {
            label: 'Infrastructure Score',
            value: '8.5/10',
            trend: 'positive',
            trendText: 'Excellent',
            subtitle: 'Transport, schools, hospitals',
            icon: '🚇',
            barValue: 85
        },
        {
            label: 'School Quality',
            value: '9.2/10',
            trend: 'positive',
            trendText: 'Top Tier',
            subtitle: 'NAPLAN & reputation',
            icon: '🎓',
            barValue: 92
        },
        {
            label: 'Employment Index',
            value: '7.8/10',
            trend: 'positive',
            trendText: 'Strong',
            subtitle: 'Local job market',
            icon: '💼',
            barValue: 78
        }
    ];
    
    // Risk & Opportunity Metrics
    const riskMetrics = [
        {
            label: 'Price-to-Income',
            value: '6.2x',
            trend: 'neutral',
            trendText: 'Moderate',
            subtitle: 'Affordability ratio',
            icon: '📊',
            barValue: 62
        },
        {
            label: 'LVR Average',
            value: '72%',
            trend: 'neutral',
            trendText: 'Safe',
            subtitle: 'Loan-to-value ratio',
            icon: '🏦',
            barValue: 72
        },
        {
            label: 'Crime Rate',
            value: 'Low',
            trend: 'positive',
            trendText: '-8%',
            subtitle: 'Safe neighborhood',
            icon: '🛡️',
            barValue: 90
        },
        {
            label: 'Equity Growth (5yr)',
            value: '+$285k',
            trend: 'positive',
            trendText: '+42%',
            subtitle: 'Based on avg property',
            icon: '📈',
            barValue: 85
        }
    ];
    
    // Store metrics globally for exports
    currentInvestorMetrics = {
        financial: financialMetrics,
        marketActivity: marketMetrics,
        location: locationMetrics,
        risk: riskMetrics
    };
    
    // Render all metrics
    document.getElementById('financialMetrics').innerHTML = renderMetrics(financialMetrics);
    document.getElementById('marketActivityMetrics').innerHTML = renderMetrics(marketMetrics);
    document.getElementById('locationMetrics').innerHTML = renderMetrics(locationMetrics);
    document.getElementById('riskMetrics').innerHTML = renderMetrics(riskMetrics);
}

// Render metric cards
function renderMetrics(metrics) {
    return metrics.map(metric => `
        <div class="metric-card">
            <div class="metric-header">
                <div class="metric-icon">${metric.icon}</div>
                <div class="metric-trend ${metric.trend}">
                    <i class="fas fa-${metric.trend === 'positive' ? 'arrow-up' : metric.trend === 'negative' ? 'arrow-down' : 'minus'}"></i>
                    ${metric.trendText}
                </div>
            </div>
            <div class="metric-label">${metric.label}</div>
            <div class="metric-value ${metric.trend === 'positive' ? 'highlight' : ''}">${metric.value}</div>
            <div class="metric-subtitle">${metric.subtitle}</div>
            ${metric.barValue ? `
                <div class="metric-bar">
                    <div class="metric-bar-fill" style="width: ${metric.barValue}%"></div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Display market statistics
function displayMarketStats(properties) {
    const prices = properties.map(p => p.price).filter(p => p && p > 0);
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const medianPrice = prices.length > 0 ? calculateMedian(prices) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    
    const avgBedrooms = calculateAverage(properties, 'attributes.bedrooms');
    const avgBathrooms = calculateAverage(properties, 'attributes.bathrooms');
    
    const stats = [
        {
            label: 'Average Price',
            value: formatPrice(avgPrice),
            subtitle: `Range: ${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
        },
        {
            label: 'Median Price',
            value: formatPrice(medianPrice),
            subtitle: `Based on ${prices.length} listings`
        },
        {
            label: 'Avg. Bedrooms',
            value: avgBedrooms.toFixed(1),
            subtitle: 'Across all properties'
        },
        {
            label: 'Avg. Bathrooms',
            value: avgBathrooms.toFixed(1),
            subtitle: 'Across all properties'
        }
    ];
    
    marketStats.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-subtitle">${stat.subtitle}</div>
        </div>
    `).join('');
}

// Display properties in grid
function displayProperties(properties) {
    propertyGrid.innerHTML = properties.map(property => createPropertyCard(property)).join('');
}

// Create individual property card
function createPropertyCard(property) {
    const address = property.address?.street || 'Address not available';
    const suburb = property.address?.sal || '';
    const state = property.address?.state || '';
    const price = formatPrice(property.price);
    const bedrooms = property.attributes?.bedrooms || 0;
    const bathrooms = property.attributes?.bathrooms || 0;
    const garageSpaces = property.attributes?.garage_spaces || 0;
    const landSize = property.attributes?.land_size || 'N/A';
    const propertyType = property.property_type || 'Property';
    const description = property.attributes?.description || 'No description available';
    const listingDate = formatDate(property.listing_date);
    
    // Create a shortened description
    const shortDesc = description.length > 200 ? description.substring(0, 200) + '...' : description;
    
    return `
        <div class="property-card">
            <div class="property-image">
                <div class="property-badge">${propertyType}</div>
                <div class="property-price">${price}</div>
            </div>
            <div class="property-content">
                <div class="property-address">${address}</div>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${suburb}, ${state}</span>
                </div>
                <div class="property-features">
                    ${bedrooms > 0 ? `
                        <div class="feature">
                            <i class="fas fa-bed"></i>
                            <span>${bedrooms} Bed${bedrooms !== 1 ? 's' : ''}</span>
                        </div>
                    ` : ''}
                    ${bathrooms > 0 ? `
                        <div class="feature">
                            <i class="fas fa-bath"></i>
                            <span>${bathrooms} Bath${bathrooms !== 1 ? 's' : ''}</span>
                        </div>
                    ` : ''}
                    ${garageSpaces > 0 ? `
                        <div class="feature">
                            <i class="fas fa-car"></i>
                            <span>${garageSpaces} Car${garageSpaces !== 1 ? 's' : ''}</span>
                        </div>
                    ` : ''}
                    ${landSize !== 'N/A' ? `
                        <div class="feature">
                            <i class="fas fa-ruler-combined"></i>
                            <span>${landSize}${typeof landSize === 'string' && landSize.includes('m²') ? '' : ' m²'}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="property-description">${shortDesc}</div>
                <div class="property-footer">
                    <span class="listing-date">
                        <i class="far fa-calendar"></i> Listed ${listingDate}
                    </span>
                    <button class="view-details-btn" onclick="viewPropertyDetails(${property.gnaf_pid ? `'${property.gnaf_pid}'` : 'null'})">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `;
}

// View property details (placeholder for future implementation)
function viewPropertyDetails(propertyId) {
    alert(`Property details for ID: ${propertyId}\n\nThis feature will show detailed property information, images, and investment analysis.`);
}

// Sort properties
function sortProperties() {
    const sortBy = document.getElementById('sortSelect').value;
    
    let sorted = [...currentProperties];
    
    switch(sortBy) {
        case 'price-high':
            sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
        case 'price-low':
            sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
        case 'bedrooms':
            sorted.sort((a, b) => (b.attributes?.bedrooms || 0) - (a.attributes?.bedrooms || 0));
            break;
        case 'newest':
            sorted.sort((a, b) => new Date(b.listing_date) - new Date(a.listing_date));
            break;
    }
    
    displayProperties(sorted);
}

// Toggle view (placeholder for future list/grid view)
function toggleView() {
    const icon = document.querySelector('.view-toggle i');
    if (icon.classList.contains('fa-th-large')) {
        icon.classList.remove('fa-th-large');
        icon.classList.add('fa-list');
        // Future: implement list view
    } else {
        icon.classList.remove('fa-list');
        icon.classList.add('fa-th-large');
        // Future: implement grid view
    }
}

// Utility Functions
function formatPrice(price) {
    if (!price || price <= 0) return 'Price on Request';
    return '$' + price.toLocaleString('en-AU');
}

function formatDate(dateString) {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-AU');
}

function calculateMedian(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function calculateAverage(properties, path) {
    const values = properties.map(p => {
        const keys = path.split('.');
        let value = p;
        for (const key of keys) {
            value = value?.[key];
        }
        return value;
    }).filter(v => v && v > 0);
    
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

// UI Helper Functions
function showLoading() {
    loadingDiv.style.display = 'flex';
}

function hideLoading() {
    loadingDiv.style.display = 'none';
}

function showError(message) {
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <div>
            <strong>Error:</strong> ${message}
        </div>
    `;
    errorDiv.style.display = 'flex';
    
    // Scroll to error
    setTimeout(() => {
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function hideError() {
    errorDiv.style.display = 'none';
}

function hideResults() {
    resultsSection.style.display = 'none';
}

function disableButton() {
    searchBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
}

function enableButton() {
    searchBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
}

// Export Functions
function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    const btn = document.querySelector('.export-btn');
    
    if (menu.style.display === 'none') {
        menu.style.display = 'block';
        btn.classList.add('active');
    } else {
        menu.style.display = 'none';
        btn.classList.remove('active');
    }
}

// Close export menu when clicking outside
document.addEventListener('click', (e) => {
    const exportDropdown = document.querySelector('.export-dropdown');
    if (exportDropdown && !exportDropdown.contains(e.target)) {
        document.getElementById('exportMenu').style.display = 'none';
        document.querySelector('.export-btn')?.classList.remove('active');
    }
});

function exportData(type) {
    console.log('Exporting data:', type);
    
    // Close the menu
    document.getElementById('exportMenu').style.display = 'none';
    document.querySelector('.export-btn').classList.remove('active');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${currentSuburb.replace(/\s+/g, '_')}_${timestamp}`;
    
    switch(type) {
        case 'csv-all':
            exportAllDataCSV(filename);
            break;
        case 'excel-all':
            exportAllDataExcel(filename);
            break;
        case 'csv-properties':
            exportPropertiesCSV(filename);
            break;
        case 'excel-properties':
            exportPropertiesExcel(filename);
            break;
        case 'csv-metrics':
            exportMetricsCSV(filename);
            break;
        case 'excel-metrics':
            exportMetricsExcel(filename);
            break;
        case 'json':
            exportJSON(filename);
            break;
    }
}

// Export all data as CSV (multiple files)
function exportAllDataCSV(filename) {
    // Export metrics
    const metricsCSV = generateMetricsCSV();
    downloadFile(metricsCSV, `${filename}_Metrics.csv`, 'text/csv');
    
    // Small delay before second download
    setTimeout(() => {
        const propertiesCSV = generatePropertiesCSV();
        downloadFile(propertiesCSV, `${filename}_Properties.csv`, 'text/csv');
    }, 500);
    
    console.log('Exported all data as CSV');
}

// Export all data as Excel
function exportAllDataExcel(filename) {
    const wb = XLSX.utils.book_new();
    
    // Create Metrics sheet
    const metricsData = generateMetricsArray();
    const metricsWS = XLSX.utils.aoa_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(wb, metricsWS, 'Metrics');
    
    // Create Properties sheet
    const propertiesData = generatePropertiesArray();
    const propertiesWS = XLSX.utils.aoa_to_sheet(propertiesData);
    XLSX.utils.book_append_sheet(wb, propertiesWS, 'Properties');
    
    // Download
    XLSX.writeFile(wb, `${filename}_Complete.xlsx`);
    console.log('Exported all data as Excel');
}

// Export properties only as CSV
function exportPropertiesCSV(filename) {
    const csv = generatePropertiesCSV();
    downloadFile(csv, `${filename}_Properties.csv`, 'text/csv');
    console.log('Exported properties CSV');
}

// Export properties only as Excel
function exportPropertiesExcel(filename) {
    const wb = XLSX.utils.book_new();
    const propertiesData = generatePropertiesArray();
    const ws = XLSX.utils.aoa_to_sheet(propertiesData);
    XLSX.utils.book_append_sheet(wb, ws, 'Properties');
    XLSX.writeFile(wb, `${filename}_Properties.xlsx`);
    console.log('Exported properties Excel');
}

// Export metrics only as CSV
function exportMetricsCSV(filename) {
    const csv = generateMetricsCSV();
    downloadFile(csv, `${filename}_Metrics.csv`, 'text/csv');
    console.log('Exported metrics CSV');
}

// Export metrics only as Excel
function exportMetricsExcel(filename) {
    const wb = XLSX.utils.book_new();
    const metricsData = generateMetricsArray();
    const ws = XLSX.utils.aoa_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Metrics');
    XLSX.writeFile(wb, `${filename}_Metrics.xlsx`);
    console.log('Exported metrics Excel');
}

// Export complete report as JSON
function exportJSON(filename) {
    const prices = currentProperties.map(p => p.price).filter(p => p && p > 0);
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const medianPrice = prices.length > 0 ? calculateMedian(prices) : 0;
    
    const report = {
        suburb: currentSuburb,
        exportDate: new Date().toISOString(),
        summary: {
            totalProperties: currentProperties.length,
            averagePrice: avgPrice,
            medianPrice: medianPrice,
            priceRange: {
                min: prices.length > 0 ? Math.min(...prices) : 0,
                max: prices.length > 0 ? Math.max(...prices) : 0
            }
        },
        investorMetrics: currentInvestorMetrics,
        properties: currentProperties
    };
    
    const json = JSON.stringify(report, null, 2);
    downloadFile(json, `${filename}_Complete_Report.json`, 'application/json');
    console.log('Exported JSON report');
}

// Generate Properties CSV
function generatePropertiesCSV() {
    const headers = [
        'Address',
        'Suburb',
        'State',
        'Property Type',
        'Price',
        'Bedrooms',
        'Bathrooms',
        'Garage Spaces',
        'Land Size',
        'Listing Date',
        'Description'
    ];
    
    let csv = headers.join(',') + '\n';
    
    currentProperties.forEach(property => {
        const row = [
            escapeCSV(property.address?.street || ''),
            escapeCSV(property.address?.sal || ''),
            escapeCSV(property.address?.state || ''),
            escapeCSV(property.property_type || ''),
            property.price || '',
            property.attributes?.bedrooms || '',
            property.attributes?.bathrooms || '',
            property.attributes?.garage_spaces || '',
            escapeCSV(property.attributes?.land_size || ''),
            property.listing_date || '',
            escapeCSV((property.attributes?.description || '').substring(0, 500)) // Limit description length
        ];
        csv += row.join(',') + '\n';
    });
    
    return csv;
}

// Generate Properties Array for Excel
function generatePropertiesArray() {
    const headers = [
        'Address', 'Suburb', 'State', 'Property Type', 'Price',
        'Bedrooms', 'Bathrooms', 'Garage Spaces', 'Land Size', 'Listing Date', 'Description'
    ];
    
    const rows = [headers];
    
    currentProperties.forEach(property => {
        rows.push([
            property.address?.street || '',
            property.address?.sal || '',
            property.address?.state || '',
            property.property_type || '',
            property.price || '',
            property.attributes?.bedrooms || '',
            property.attributes?.bathrooms || '',
            property.attributes?.garage_spaces || '',
            property.attributes?.land_size || '',
            property.listing_date || '',
            (property.attributes?.description || '').substring(0, 500)
        ]);
    });
    
    return rows;
}

// Generate Metrics CSV
function generateMetricsCSV() {
    const headers = ['Category', 'Metric', 'Value', 'Trend', 'Subtitle'];
    let csv = headers.join(',') + '\n';
    
    if (currentInvestorMetrics) {
        // Financial metrics
        currentInvestorMetrics.financial.forEach(metric => {
            const row = [
                'Financial Performance',
                escapeCSV(metric.label),
                metric.value,
                metric.trendText,
                escapeCSV(metric.subtitle)
            ];
            csv += row.join(',') + '\n';
        });
        
        // Market Activity metrics
        currentInvestorMetrics.marketActivity.forEach(metric => {
            const row = [
                'Market Activity',
                escapeCSV(metric.label),
                metric.value,
                metric.trendText,
                escapeCSV(metric.subtitle)
            ];
            csv += row.join(',') + '\n';
        });
        
        // Location metrics
        currentInvestorMetrics.location.forEach(metric => {
            const row = [
                'Location & Demographics',
                escapeCSV(metric.label),
                metric.value,
                metric.trendText,
                escapeCSV(metric.subtitle)
            ];
            csv += row.join(',') + '\n';
        });
        
        // Risk metrics
        currentInvestorMetrics.risk.forEach(metric => {
            const row = [
                'Risk & Opportunity',
                escapeCSV(metric.label),
                metric.value,
                metric.trendText,
                escapeCSV(metric.subtitle)
            ];
            csv += row.join(',') + '\n';
        });
    }
    
    return csv;
}

// Generate Metrics Array for Excel
function generateMetricsArray() {
    const headers = ['Category', 'Metric', 'Value', 'Trend', 'Subtitle'];
    const rows = [headers];
    
    if (currentInvestorMetrics) {
        // Financial metrics
        currentInvestorMetrics.financial.forEach(metric => {
            rows.push([
                'Financial Performance',
                metric.label,
                metric.value,
                metric.trendText,
                metric.subtitle
            ]);
        });
        
        // Market Activity metrics
        currentInvestorMetrics.marketActivity.forEach(metric => {
            rows.push([
                'Market Activity',
                metric.label,
                metric.value,
                metric.trendText,
                metric.subtitle
            ]);
        });
        
        // Location metrics
        currentInvestorMetrics.location.forEach(metric => {
            rows.push([
                'Location & Demographics',
                metric.label,
                metric.value,
                metric.trendText,
                metric.subtitle
            ]);
        });
        
        // Risk metrics
        currentInvestorMetrics.risk.forEach(metric => {
            rows.push([
                'Risk & Opportunity',
                metric.label,
                metric.value,
                metric.trendText,
                metric.subtitle
            ]);
        });
    }
    
    return rows;
}

// Escape CSV values
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    return stringValue;
}

// Download file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ==================== TAB SWITCHING ====================
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.tab-btn').classList.add('active');
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // If switching to technical insights, generate the analysis
    if (tabName === 'technical-insights' && currentProperties.length > 0) {
        generateTechnicalInsights();
    }
    
    // If switching to map view, initialize/update the map
    if (tabName === 'map-view' && currentProperties.length > 0) {
        // Small delay to ensure the map container is visible
        setTimeout(() => {
            generateMapView();
            // Invalidate size to fix any display issues
            if (propertyMap) {
                propertyMap.invalidateSize();
            }
        }, 100);
    }
    
    // If switching to playground, initialize the swipe interface
    if (tabName === 'playground' && currentProperties.length > 0) {
        generatePlayground();
    }
}

// ==================== TECHNICAL INSIGHTS GENERATION ====================
let chartInstances = {};

function generateTechnicalInsights() {
    console.log('Generating technical insights for', currentProperties.length, 'properties');
    
    // New investment-focused analytics
    generateInvestmentScores();
    generateValueAnalysis();
    generateOutlierDetection();
    generateROIProjections();
    generateTopPicks();
    
    // Existing analytics
    generateStatisticalAnalysis();
    generatePriceDistributionChart();
    generateCharacteristicsMatrix();
    generateCorrelationChart();
    generateSegmentationChart();
    generateDataQualityReport();
    generateRawDataTable();
}

// ==================== NEW INVESTMENT ANALYTICS ====================

// Calculate comprehensive investment score for each property
function calculateInvestmentScore(property) {
    let score = 0;
    let factors = {};
    
    const prices = currentProperties.map(p => p.price).filter(p => p && p > 0);
    const medianPrice = calculateMedian(prices);
    const avgBedrooms = calculateMean(currentProperties.map(p => p.attributes?.bedrooms).filter(b => b));
    
    // Price competitiveness (30 points max)
    const priceRatio = property.price / medianPrice;
    if (priceRatio < 0.8) {
        factors.price = 30;
    } else if (priceRatio < 1.0) {
        factors.price = 25;
    } else if (priceRatio < 1.2) {
        factors.price = 15;
    } else {
        factors.price = 5;
    }
    
    // Land size value (20 points max)
    const landSize = parseLandSize(property.attributes?.land_size);
    if (landSize > 700) {
        factors.land = 20;
    } else if (landSize > 600) {
        factors.land = 15;
    } else if (landSize > 500) {
        factors.land = 10;
    } else {
        factors.land = 5;
    }
    
    // Property features (25 points max)
    const bedrooms = property.attributes?.bedrooms || 0;
    const bathrooms = property.attributes?.bathrooms || 0;
    const garages = property.attributes?.garage_spaces || 0;
    factors.features = Math.min(25, (bedrooms * 5) + (bathrooms * 4) + (garages * 3));
    
    // Property type preference (15 points max)
    if (property.property_type === 'House') {
        factors.type = 15;
    } else if (property.property_type === 'Townhouse') {
        factors.type = 10;
    } else {
        factors.type = 5;
    }
    
    // Listing recency (10 points max)
    const listingDate = new Date(property.listing_date);
    const daysSinceListing = (new Date() - listingDate) / (1000 * 60 * 60 * 24);
    if (daysSinceListing < 7) {
        factors.recency = 10;
    } else if (daysSinceListing < 30) {
        factors.recency = 7;
    } else {
        factors.recency = 3;
    }
    
    score = Object.values(factors).reduce((a, b) => a + b, 0);
    
    return { score: Math.round(score), factors };
}

// Generate Investment Opportunity Scores
function generateInvestmentScores() {
    const scoredProperties = currentProperties.map(prop => ({
        ...prop,
        investmentScore: calculateInvestmentScore(prop)
    })).sort((a, b) => b.investmentScore.score - a.investmentScore.score);
    
    let html = '';
    const topProperties = scoredProperties.slice(0, 6);
    
    topProperties.forEach((prop, index) => {
        const isTopPick = index < 3;
        html += `
            <div class="opportunity-card ${isTopPick ? 'top-pick' : ''}">
                ${isTopPick ? `<div class="opportunity-badge">TOP ${index + 1}</div>` : ''}
                <h4>${prop.property_type || 'Property'}</h4>
                <div class="opportunity-address">${prop.address?.street || 'Address not available'}</div>
                
                <div class="opportunity-score">
                    <div class="score-circle">
                        <div class="score-value">${prop.investmentScore.score}</div>
                        <div class="score-label">Score</div>
                    </div>
                    <div class="score-factors">
                        <div class="factor-bar">
                            <div class="factor-label">
                                <span>Price Value</span>
                                <span>${prop.investmentScore.factors.price}/30</span>
                            </div>
                            <div class="factor-progress">
                                <div class="factor-fill" style="width: ${(prop.investmentScore.factors.price/30*100)}%"></div>
                            </div>
                        </div>
                        <div class="factor-bar">
                            <div class="factor-label">
                                <span>Land Size</span>
                                <span>${prop.investmentScore.factors.land}/20</span>
                            </div>
                            <div class="factor-progress">
                                <div class="factor-fill" style="width: ${(prop.investmentScore.factors.land/20*100)}%"></div>
                            </div>
                        </div>
                        <div class="factor-bar">
                            <div class="factor-label">
                                <span>Features</span>
                                <span>${prop.investmentScore.factors.features}/25</span>
                            </div>
                            <div class="factor-progress">
                                <div class="factor-fill" style="width: ${(prop.investmentScore.factors.features/25*100)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="opportunity-details">
                    <div class="detail-item">
                        <div class="detail-label">Price</div>
                        <div class="detail-value">$${formatNumber(prop.price)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Beds</div>
                        <div class="detail-value">${prop.attributes?.bedrooms || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Land</div>
                        <div class="detail-value">${prop.attributes?.land_size || 'N/A'}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('investmentScores').innerHTML = html;
}

// Helper function to parse land size
function parseLandSize(landStr) {
    if (!landStr) return 0;
    const match = String(landStr).match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
}

// Generate Value per Square Meter Analysis
function generateValueAnalysis() {
    const propertiesWithValue = currentProperties
        .filter(p => p.price && p.attributes?.land_size)
        .map(p => {
            const landSize = parseLandSize(p.attributes.land_size);
            return {
                ...p,
                landSize,
                pricePerSqm: landSize > 0 ? p.price / landSize : 0
            };
        })
        .filter(p => p.pricePerSqm > 0)
        .sort((a, b) => a.pricePerSqm - b.pricePerSqm);
    
    if (propertiesWithValue.length === 0) {
        document.getElementById('valueAnalysisChart').style.display = 'none';
        document.getElementById('valueMetrics').innerHTML = '<p>Insufficient land size data for value analysis</p>';
        return;
    }
    
    // Create chart
    const canvas = document.getElementById('valueAnalysisChart');
    const ctx = canvas.getContext('2d');
    
    if (chartInstances.valueAnalysis) {
        chartInstances.valueAnalysis.destroy();
    }
    
    chartInstances.valueAnalysis = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Price vs Land Size',
                data: propertiesWithValue.map(p => ({
                    x: p.landSize,
                    y: p.price,
                    property: p
                })),
                backgroundColor: propertiesWithValue.map((p, i) => {
                    if (i < 3) return 'rgba(16, 185, 129, 0.7)'; // Best value - green
                    if (i >= propertiesWithValue.length - 3) return 'rgba(239, 68, 68, 0.7)'; // Worst value - red
                    return 'rgba(253, 119, 0, 0.6)'; // Normal - orange
                }),
                borderColor: 'rgba(253, 119, 0, 1)',
                borderWidth: 2,
                pointRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Property Value Analysis (Green = Best Value, Red = Expensive)',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const prop = context.raw.property;
                            return [
                                `Address: ${prop.address?.street || 'N/A'}`,
                                `Price: $${formatNumber(prop.price)}`,
                                `Land: ${prop.landSize} m²`,
                                `$/m²: $${formatNumber(prop.pricePerSqm)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Land Size (m²)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + formatNumber(value);
                        }
                    }
                }
            }
        }
    });
    
    // Display key metrics
    const avgPricePerSqm = calculateMean(propertiesWithValue.map(p => p.pricePerSqm));
    const bestValue = propertiesWithValue[0];
    const worstValue = propertiesWithValue[propertiesWithValue.length - 1];
    
    let html = `
        <div class="value-metric-card">
            <div class="value-metric-label">Average $/m²</div>
            <div class="value-metric-value">$${formatNumber(avgPricePerSqm)}</div>
        </div>
        <div class="value-metric-card best-value">
            <div class="value-metric-label">Best Value</div>
            <div class="value-metric-value">$${formatNumber(bestValue.pricePerSqm)}/m²</div>
            <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 0.5rem;">
                ${bestValue.address?.street?.substring(0, 30) || 'Property'}...
            </div>
        </div>
        <div class="value-metric-card worst-value">
            <div class="value-metric-label">Most Expensive</div>
            <div class="value-metric-value">$${formatNumber(worstValue.pricePerSqm)}/m²</div>
            <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 0.5rem;">
                ${worstValue.address?.street?.substring(0, 30) || 'Property'}...
            </div>
        </div>
        <div class="value-metric-card">
            <div class="value-metric-label">Value Spread</div>
            <div class="value-metric-value">${((worstValue.pricePerSqm / bestValue.pricePerSqm - 1) * 100).toFixed(0)}%</div>
        </div>
    `;
    
    document.getElementById('valueMetrics').innerHTML = html;
}

// Generate Outlier Detection
function generateOutlierDetection() {
    const prices = currentProperties.map(p => p.price).filter(p => p && p > 0);
    const mean = calculateMean(prices);
    const stdDev = calculateStdDev(prices);
    const q1 = calculatePercentile(prices, 25);
    const q3 = calculatePercentile(prices, 75);
    const iqr = q3 - q1;
    
    // Statistical outliers using IQR method
    const lowerFence = q1 - (1.5 * iqr);
    const upperFence = q3 + (1.5 * iqr);
    
    const undervalued = currentProperties.filter(p => p.price && p.price < lowerFence);
    const overpriced = currentProperties.filter(p => p.price && p.price > upperFence);
    
    let html = '';
    
    if (undervalued.length > 0) {
        const prop = undervalued[0];
        html += `
            <div class="outlier-card undervalued">
                <div class="outlier-header">
                    <div class="outlier-icon">💎</div>
                    <div>
                        <div class="outlier-title">Potential Bargain Detected!</div>
                        <div class="outlier-subtitle">Statistically undervalued property</div>
                    </div>
                </div>
                <div class="outlier-stats">
                    <div class="outlier-stat">
                        <span>Address:</span>
                        <strong>${prop.address?.street || 'N/A'}</strong>
                    </div>
                    <div class="outlier-stat">
                        <span>Listed Price:</span>
                        <strong>$${formatNumber(prop.price)}</strong>
                    </div>
                    <div class="outlier-stat">
                        <span>Market Median:</span>
                        <strong>$${formatNumber(calculateMedian(prices))}</strong>
                    </div>
                    <div class="outlier-stat">
                        <span>Below Market:</span>
                        <strong style="color: #10b981;">${((1 - prop.price / mean) * 100).toFixed(1)}%</strong>
                    </div>
                    <div class="outlier-stat">
                        <span>Features:</span>
                        <strong>${prop.attributes?.bedrooms || 0} bed, ${prop.attributes?.bathrooms || 0} bath</strong>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (overpriced.length > 0) {
        const prop = overpriced[0];
        html += `
            <div class="outlier-card overpriced">
                <div class="outlier-header">
                    <div class="outlier-icon">⚠️</div>
                    <div>
                        <div class="outlier-title">Premium Priced Property</div>
                        <div class="outlier-subtitle">Above statistical market range</div>
                    </div>
                </div>
                <div class="outlier-stats">
                    <div class="outlier-stat">
                        <span>Address:</span>
                        <strong>${prop.address?.street || 'N/A'}</strong>
                    </div>
                    <div class="outlier-stat">
                        <span>Listed Price:</span>
                        <strong>$${formatNumber(prop.price)}</strong>
                    </div>
                    <div class="outlier-stat">
                        <span>Market Median:</span>
                        <strong>$${formatNumber(calculateMedian(prices))}</strong>
                    </div>
                    <div class="outlier-stat">
                        <span>Above Market:</span>
                        <strong style="color: #ef4444;">+${((prop.price / mean - 1) * 100).toFixed(1)}%</strong>
                    </div>
                    <div class="outlier-stat">
                        <span>Features:</span>
                        <strong>${prop.attributes?.bedrooms || 0} bed, ${prop.attributes?.bathrooms || 0} bath</strong>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (html === '') {
        html = '<p style="text-align: center; color: var(--text-light);">No statistical outliers detected. Market prices are relatively consistent.</p>';
    }
    
    document.getElementById('outlierAnalysis').innerHTML = html;
}

// Generate ROI Projections
function generateROIProjections() {
    const prices = currentProperties.map(p => p.price).filter(p => p && p > 0);
    const avgPrice = calculateMean(prices);
    const medianPrice = calculateMedian(prices);
    
    // Estimated rental yields (typical Australian market rates)
    const grossYieldRate = 0.04; // 4% gross yield
    const annualExpenses = avgPrice * 0.01; // 1% of property value for expenses
    
    // Calculate scenarios
    const scenarios = [
        {
            name: 'Conservative',
            capitalGrowth: 0.03, // 3% per year
            years: 5,
            description: 'Low growth scenario'
        },
        {
            name: 'Moderate',
            capitalGrowth: 0.05, // 5% per year
            years: 5,
            description: 'Historical average'
        },
        {
            name: 'Optimistic',
            capitalGrowth: 0.07, // 7% per year
            years: 5,
            description: 'Strong market conditions'
        },
        {
            name: '10-Year Hold',
            capitalGrowth: 0.05, // 5% per year
            years: 10,
            description: 'Long-term investment'
        }
    ];
    
    let html = '';
    
    scenarios.forEach(scenario => {
        const futureValue = medianPrice * Math.pow(1 + scenario.capitalGrowth, scenario.years);
        const capitalGain = futureValue - medianPrice;
        const annualRentalIncome = medianPrice * grossYieldRate;
        const netAnnualIncome = annualRentalIncome - annualExpenses;
        const totalRentalIncome = netAnnualIncome * scenario.years;
        const totalReturn = capitalGain + totalRentalIncome;
        const roi = (totalReturn / medianPrice) * 100;
        
        html += `
            <div class="roi-card">
                <div class="roi-scenario">${scenario.name} Scenario</div>
                <div class="roi-percentage">${roi.toFixed(1)}%</div>
                <div class="roi-description">${scenario.description} - ${scenario.years} years</div>
                <div class="roi-details">
                    <div class="roi-detail-row">
                        <span class="roi-detail-label">Initial Investment:</span>
                        <span class="roi-detail-value">$${formatNumber(medianPrice)}</span>
                    </div>
                    <div class="roi-detail-row">
                        <span class="roi-detail-label">Future Value:</span>
                        <span class="roi-detail-value">$${formatNumber(futureValue)}</span>
                    </div>
                    <div class="roi-detail-row">
                        <span class="roi-detail-label">Capital Gain:</span>
                        <span class="roi-detail-value">$${formatNumber(capitalGain)}</span>
                    </div>
                    <div class="roi-detail-row">
                        <span class="roi-detail-label">Rental Income:</span>
                        <span class="roi-detail-value">$${formatNumber(totalRentalIncome)}</span>
                    </div>
                    <div class="roi-detail-row">
                        <span class="roi-detail-label">Total Return:</span>
                        <span class="roi-detail-value" style="color: var(--primary-color); font-weight: 700;">$${formatNumber(totalReturn)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('roiCalculator').innerHTML = html;
}

// Generate Top Investment Picks
function generateTopPicks() {
    const scoredProperties = currentProperties.map(prop => ({
        ...prop,
        investmentScore: calculateInvestmentScore(prop)
    })).sort((a, b) => b.investmentScore.score - a.investmentScore.score);
    
    const topPicks = scoredProperties.slice(0, 3);
    
    let html = '';
    
    topPicks.forEach((prop, index) => {
        const reasons = [];
        const score = prop.investmentScore;
        
        if (score.factors.price >= 25) reasons.push('Great Price');
        if (score.factors.land >= 15) reasons.push('Large Land');
        if (score.factors.features >= 20) reasons.push('Excellent Features');
        if (score.factors.recency >= 7) reasons.push('Recent Listing');
        if (prop.property_type === 'House') reasons.push('Family Home');
        
        html += `
            <div class="top-pick-card">
                <div class="pick-rank">#${index + 1}</div>
                <div class="pick-info">
                    <h4>${prop.address?.street || 'Property Address'}</h4>
                    <div style="color: var(--text-light); margin-bottom: 0.5rem;">
                        ${prop.property_type || 'Property'} • $${formatNumber(prop.price)} • 
                        ${prop.attributes?.bedrooms || 0} bed ${prop.attributes?.bathrooms || 0} bath
                    </div>
                    <div class="pick-reasons">
                        ${reasons.map(reason => `<span class="reason-tag">${reason}</span>`).join('')}
                    </div>
                </div>
                <div class="pick-score-container">
                    <div class="pick-score">${score.score}</div>
                    <div class="pick-score-label">Investment Score</div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('topPicks').innerHTML = html;
}

// Statistical Analysis
function generateStatisticalAnalysis() {
    const prices = currentProperties.map(p => p.price).filter(p => p && p > 0);
    const bedrooms = currentProperties.map(p => p.attributes?.bedrooms).filter(b => b);
    const bathrooms = currentProperties.map(p => p.attributes?.bathrooms).filter(b => b);
    const garages = currentProperties.map(p => p.attributes?.garage_spaces).filter(g => g);
    
    const stats = {
        'Sample Size': { value: currentProperties.length, detail: 'Total properties' },
        'Mean Price': { value: `$${formatNumber(calculateMean(prices))}`, detail: `σ = $${formatNumber(calculateStdDev(prices))}` },
        'Median Price': { value: `$${formatNumber(calculateMedian(prices))}`, detail: 'Middle value' },
        'Price Range': { value: `$${formatNumber(Math.max(...prices) - Math.min(...prices))}`, detail: `$${formatNumber(Math.min(...prices))} - $${formatNumber(Math.max(...prices))}` },
        'Coefficient of Variation': { value: `${(calculateStdDev(prices) / calculateMean(prices) * 100).toFixed(1)}%`, detail: 'Price variability' },
        'Q1 (25th percentile)': { value: `$${formatNumber(calculatePercentile(prices, 25))}`, detail: 'Lower quartile' },
        'Q3 (75th percentile)': { value: `$${formatNumber(calculatePercentile(prices, 75))}`, detail: 'Upper quartile' },
        'IQR': { value: `$${formatNumber(calculatePercentile(prices, 75) - calculatePercentile(prices, 25))}`, detail: 'Interquartile range' },
        'Avg Bedrooms': { value: calculateMean(bedrooms).toFixed(2), detail: `Range: ${Math.min(...bedrooms)}-${Math.max(...bedrooms)}` },
        'Avg Bathrooms': { value: calculateMean(bathrooms).toFixed(2), detail: `Range: ${Math.min(...bathrooms)}-${Math.max(...bathrooms)}` },
        'Avg Garage': { value: calculateMean(garages).toFixed(2), detail: `Range: ${Math.min(...garages)}-${Math.max(...garages)}` },
        'Skewness': { value: calculateSkewness(prices).toFixed(3), detail: calculateSkewness(prices) > 0 ? 'Right-skewed' : 'Left-skewed' }
    };
    
    let html = '';
    for (const [label, data] of Object.entries(stats)) {
        html += `
            <div class="stat-box">
                <div class="stat-box-label">${label}</div>
                <div class="stat-box-value">${data.value}</div>
                <div class="stat-box-detail">${data.detail}</div>
            </div>
        `;
    }
    
    document.getElementById('statisticalAnalysis').innerHTML = html;
}

// Price Distribution Chart
function generatePriceDistributionChart() {
    const canvas = document.getElementById('priceDistributionChart');
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (chartInstances.priceDistribution) {
        chartInstances.priceDistribution.destroy();
    }
    
    const prices = currentProperties.map(p => p.price).filter(p => p && p > 0).sort((a, b) => a - b);
    
    // Create histogram bins
    const bins = 10;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const binSize = (max - min) / bins;
    
    const histogram = Array(bins).fill(0);
    const labels = [];
    
    for (let i = 0; i < bins; i++) {
        const binStart = min + (i * binSize);
        const binEnd = min + ((i + 1) * binSize);
        labels.push(`$${formatNumber(binStart)}-$${formatNumber(binEnd)}`);
        
        prices.forEach(price => {
            if (price >= binStart && (i === bins - 1 ? price <= binEnd : price < binEnd)) {
                histogram[i]++;
            }
        });
    }
    
    chartInstances.priceDistribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequency',
                data: histogram,
                backgroundColor: 'rgba(253, 119, 0, 0.7)',
                borderColor: 'rgba(253, 119, 0, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Price Distribution Histogram',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Properties'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Price Range'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Property Characteristics Matrix
function generateCharacteristicsMatrix() {
    const types = {};
    const bedroomCounts = {};
    const bathroomCounts = {};
    
    currentProperties.forEach(prop => {
        const type = prop.property_type || 'Unknown';
        types[type] = (types[type] || 0) + 1;
        
        const beds = prop.attributes?.bedrooms || 0;
        bedroomCounts[beds] = (bedroomCounts[beds] || 0) + 1;
        
        const baths = prop.attributes?.bathrooms || 0;
        bathroomCounts[baths] = (bathroomCounts[baths] || 0) + 1;
    });
    
    let html = '';
    
    // Property Types
    html += `
        <div class="matrix-card">
            <h4><i class="fas fa-building"></i> Property Types</h4>
            ${Object.entries(types).sort((a, b) => b[1] - a[1]).map(([type, count]) => `
                <div class="matrix-row">
                    <span class="matrix-label">${type}</span>
                    <span class="matrix-value">${count} (${(count/currentProperties.length*100).toFixed(1)}%)</span>
                </div>
            `).join('')}
        </div>
    `;
    
    // Bedroom Distribution
    html += `
        <div class="matrix-card">
            <h4><i class="fas fa-bed"></i> Bedroom Distribution</h4>
            ${Object.entries(bedroomCounts).sort((a, b) => a[0] - b[0]).map(([beds, count]) => `
                <div class="matrix-row">
                    <span class="matrix-label">${beds} Bedroom${beds != 1 ? 's' : ''}</span>
                    <span class="matrix-value">${count} (${(count/currentProperties.length*100).toFixed(1)}%)</span>
                </div>
            `).join('')}
        </div>
    `;
    
    // Bathroom Distribution
    html += `
        <div class="matrix-card">
            <h4><i class="fas fa-bath"></i> Bathroom Distribution</h4>
            ${Object.entries(bathroomCounts).sort((a, b) => a[0] - b[0]).map(([baths, count]) => `
                <div class="matrix-row">
                    <span class="matrix-label">${baths} Bathroom${baths != 1 ? 's' : ''}</span>
                    <span class="matrix-value">${count} (${(count/currentProperties.length*100).toFixed(1)}%)</span>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('characteristicsMatrix').innerHTML = html;
}

// Correlation Chart (Bedrooms vs Price)
function generateCorrelationChart() {
    const canvas = document.getElementById('correlationChart');
    const ctx = canvas.getContext('2d');
    
    if (chartInstances.correlation) {
        chartInstances.correlation.destroy();
    }
    
    const data = currentProperties
        .filter(p => p.price && p.attributes?.bedrooms)
        .map(p => ({
            x: p.attributes.bedrooms,
            y: p.price
        }));
    
    chartInstances.correlation = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Price vs Bedrooms',
                data: data,
                backgroundColor: 'rgba(253, 119, 0, 0.6)',
                borderColor: 'rgba(253, 119, 0, 1)',
                borderWidth: 1,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Price vs Number of Bedrooms',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Number of Bedrooms'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + formatNumber(value);
                        }
                    }
                }
            }
        }
    });
}

// Market Segmentation Chart
function generateSegmentationChart() {
    const canvas = document.getElementById('segmentationChart');
    const ctx = canvas.getContext('2d');
    
    if (chartInstances.segmentation) {
        chartInstances.segmentation.destroy();
    }
    
    const types = {};
    currentProperties.forEach(prop => {
        const type = prop.property_type || 'Unknown';
        types[type] = (types[type] || 0) + 1;
    });
    
    chartInstances.segmentation = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(types),
            datasets: [{
                data: Object.values(types),
                backgroundColor: [
                    'rgba(253, 119, 0, 0.8)',
                    'rgba(253, 150, 50, 0.8)',
                    'rgba(253, 180, 100, 0.8)',
                    'rgba(100, 100, 100, 0.8)',
                    'rgba(150, 150, 150, 0.8)'
                ],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Market Composition by Property Type',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Data Quality Report
function generateDataQualityReport() {
    const total = currentProperties.length;
    
    const completeness = {
        price: currentProperties.filter(p => p.price).length,
        address: currentProperties.filter(p => p.address?.street).length,
        bedrooms: currentProperties.filter(p => p.attributes?.bedrooms).length,
        bathrooms: currentProperties.filter(p => p.attributes?.bathrooms).length,
        landSize: currentProperties.filter(p => p.attributes?.land_size).length,
        description: currentProperties.filter(p => p.attributes?.description).length
    };
    
    const qualityScore = Object.values(completeness).reduce((a, b) => a + b, 0) / (Object.keys(completeness).length * total) * 100;
    
    let html = `
        <div class="quality-card ${qualityScore >= 80 ? 'good' : qualityScore >= 60 ? 'warning' : 'error'}">
            <div class="quality-label">Overall Data Quality</div>
            <div class="quality-value">${qualityScore.toFixed(1)}%</div>
            <div class="quality-description">
                ${qualityScore >= 80 ? 'Excellent data completeness' : 
                  qualityScore >= 60 ? 'Good, with some missing fields' : 
                  'Fair, significant missing data'}
            </div>
        </div>
    `;
    
    for (const [field, count] of Object.entries(completeness)) {
        const percentage = (count / total * 100);
        const status = percentage >= 80 ? 'good' : percentage >= 60 ? 'warning' : 'error';
        html += `
            <div class="quality-card ${status}">
                <div class="quality-label">${field.charAt(0).toUpperCase() + field.slice(1)}</div>
                <div class="quality-value">${percentage.toFixed(1)}%</div>
                <div class="quality-description">${count} of ${total} records</div>
            </div>
        `;
    }
    
    document.getElementById('dataQualityReport').innerHTML = html;
}

// Raw Data Table
function generateRawDataTable() {
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Address</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Beds</th>
                    <th>Baths</th>
                    <th>Garage</th>
                    <th>Land Size</th>
                    <th>Listed</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    currentProperties.forEach(prop => {
        html += `
            <tr>
                <td>${prop.address?.street || 'N/A'}</td>
                <td>${prop.property_type || 'N/A'}</td>
                <td>$${formatNumber(prop.price || 0)}</td>
                <td>${prop.attributes?.bedrooms || 'N/A'}</td>
                <td>${prop.attributes?.bathrooms || 'N/A'}</td>
                <td>${prop.attributes?.garage_spaces || 'N/A'}</td>
                <td>${prop.attributes?.land_size || 'N/A'}</td>
                <td>${prop.listing_date || 'N/A'}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    document.getElementById('rawDataTable').innerHTML = html;
}

// Export Table Data
function exportTableData() {
    const csv = generatePropertiesCSV();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${currentSuburb.replace(/\s+/g, '_')}_${timestamp}_DataTable.csv`;
    downloadFile(csv, filename, 'text/csv');
    console.log('Exported data table as CSV');
}

// ==================== STATISTICAL HELPER FUNCTIONS ====================
function calculateMean(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateStdDev(arr) {
    if (arr.length === 0) return 0;
    const mean = calculateMean(arr);
    const squareDiffs = arr.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

function calculatePercentile(arr, percentile) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (lower === upper) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function calculateSkewness(arr) {
    if (arr.length === 0) return 0;
    const mean = calculateMean(arr);
    const stdDev = calculateStdDev(arr);
    const n = arr.length;
    
    const cubedDiffs = arr.map(value => Math.pow((value - mean) / stdDev, 3));
    return (n / ((n - 1) * (n - 2))) * cubedDiffs.reduce((a, b) => a + b, 0);
}

// ==================== MAP VIEW FUNCTIONALITY ====================

// Global map variables
let propertyMap = null;
let mapMarkers = [];
let markerClusterGroup = null;
let heatMapLayer = null;
let drawnItems = null;
let drawControl = null;
let comparisonProperties = [];
let isClusteringEnabled = true;
let isHeatMapVisible = false;
let currentMapFilters = {
    minPrice: 0,
    maxPrice: 5000000,
    propertyTypes: ['House', 'Unit', 'Townhouse', 'Land']
};

// Initialize Map View
function generateMapView() {
    console.log('Generating Map View');
    
    if (!propertyMap) {
        // Initialize map only once
        propertyMap = L.map('propertyMap').setView([-33.0, 151.7], 12);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(propertyMap);
        
        // Initialize marker cluster group
        markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 60,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            iconCreateFunction: function(cluster) {
                const count = cluster.getChildCount();
                return L.divIcon({
                    html: `<div style="background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); 
                           width: 40px; height: 40px; border-radius: 50%; display: flex; 
                           align-items: center; justify-content: center; color: white; 
                           font-weight: bold; box-shadow: 0 4px 12px rgba(253,119,0,0.4);">
                           ${count}</div>`,
                    className: 'custom-cluster-icon',
                    iconSize: L.point(40, 40)
                });
            }
        });
        
        // Initialize drawn items layer for circles
        drawnItems = new L.FeatureGroup();
        propertyMap.addLayer(drawnItems);
        
        // Setup price sliders
        setupPriceFilters();
        
        // Setup property type filters
        setupPropertyTypeFilters();
    }
    
    // Add/update markers
    addPropertyMarkers();
    
    // Update property count
    updatePropertyCount();
}

// Setup Price Range Filters
function setupPriceFilters() {
    const minSlider = document.getElementById('minPriceSlider');
    const maxSlider = document.getElementById('maxPriceSlider');
    const minLabel = document.getElementById('minPriceLabel');
    const maxLabel = document.getElementById('maxPriceLabel');
    
    if (!minSlider || !maxSlider) return;
    
    // Get price range from current properties
    const prices = currentProperties.map(p => p.price).filter(p => p && p > 0);
    if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        minSlider.min = 0;
        minSlider.max = maxPrice;
        minSlider.value = minPrice;
        
        maxSlider.min = 0;
        maxSlider.max = maxPrice;
        maxSlider.value = maxPrice;
        
        currentMapFilters.minPrice = minPrice;
        currentMapFilters.maxPrice = maxPrice;
        
        minLabel.textContent = '$' + formatNumber(minPrice);
        maxLabel.textContent = '$' + formatNumber(maxPrice);
    }
    
    minSlider.addEventListener('input', function() {
        currentMapFilters.minPrice = parseInt(this.value);
        minLabel.textContent = '$' + formatNumber(this.value);
        if (currentMapFilters.minPrice > currentMapFilters.maxPrice) {
            maxSlider.value = this.value;
            currentMapFilters.maxPrice = parseInt(this.value);
            maxLabel.textContent = '$' + formatNumber(this.value);
        }
        filterMapMarkers();
    });
    
    maxSlider.addEventListener('input', function() {
        currentMapFilters.maxPrice = parseInt(this.value);
        maxLabel.textContent = '$' + formatNumber(this.value);
        if (currentMapFilters.maxPrice < currentMapFilters.minPrice) {
            minSlider.value = this.value;
            currentMapFilters.minPrice = parseInt(this.value);
            minLabel.textContent = '$' + formatNumber(this.value);
        }
        filterMapMarkers();
    });
}

// Setup Property Type Filters
function setupPropertyTypeFilters() {
    const checkboxes = document.querySelectorAll('.property-type-filter');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (!currentMapFilters.propertyTypes.includes(this.value)) {
                    currentMapFilters.propertyTypes.push(this.value);
                }
            } else {
                currentMapFilters.propertyTypes = currentMapFilters.propertyTypes.filter(t => t !== this.value);
            }
            filterMapMarkers();
        });
    });
}

// Add Property Markers to Map
function addPropertyMarkers() {
    // Clear existing markers
    if (markerClusterGroup) {
        markerClusterGroup.clearLayers();
    }
    mapMarkers = [];
    
    // Calculate price quartiles for color coding
    const prices = currentProperties.map(p => p.price).filter(p => p && p > 0);
    const q1 = calculatePercentile(prices, 25);
    const q3 = calculatePercentile(prices, 75);
    
    currentProperties.forEach(property => {
        if (!property.coordinates || !property.coordinates.latitude || !property.coordinates.longitude) {
            return;
        }
        
        const lat = property.coordinates.latitude;
        const lng = property.coordinates.longitude;
        
        // Determine marker color based on price
        let markerColor = 'orange';
        if (property.price < q1) {
            markerColor = 'green';
        } else if (property.price > q3) {
            markerColor = 'red';
        }
        
        // Create custom icon
        const customIcon = L.divIcon({
            className: 'custom-marker-icon',
            html: `<div class="marker-pin marker-${markerColor}"></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        
        // Create marker
        const marker = L.marker([lat, lng], { icon: customIcon });
        
        // Create popup content
        const popupContent = `
            <div class="popup-property-card">
                <h4>${property.property_type || 'Property'}</h4>
                <div class="popup-property-address">${property.address?.street || 'Address not available'}</div>
                <div class="popup-property-price">$${formatNumber(property.price)}</div>
                <div class="popup-property-features">
                    <span><i class="fas fa-bed"></i> ${property.attributes?.bedrooms || 'N/A'}</span>
                    <span><i class="fas fa-bath"></i> ${property.attributes?.bathrooms || 'N/A'}</span>
                    <span><i class="fas fa-car"></i> ${property.attributes?.garage_spaces || 'N/A'}</span>
                </div>
                <button class="popup-view-btn" onclick="addToComparison(${JSON.stringify(property).replace(/"/g, '&quot;')})">
                    Add to Compare
                </button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Store property data with marker
        marker.propertyData = property;
        
        mapMarkers.push(marker);
    });
    
    // Add markers to cluster group or directly to map
    if (isClusteringEnabled) {
        markerClusterGroup.addLayers(mapMarkers);
        if (!propertyMap.hasLayer(markerClusterGroup)) {
            propertyMap.addLayer(markerClusterGroup);
        }
    } else {
        mapMarkers.forEach(marker => marker.addTo(propertyMap));
    }
    
    // Fit map to show all markers
    if (mapMarkers.length > 0) {
        const group = new L.featureGroup(mapMarkers);
        propertyMap.fitBounds(group.getBounds().pad(0.1));
    }
    
    // Apply current filters
    filterMapMarkers();
}

// Filter Map Markers
function filterMapMarkers() {
    let visibleCount = 0;
    
    mapMarkers.forEach(marker => {
        const property = marker.propertyData;
        const price = property.price || 0;
        const type = property.property_type || 'Unknown';
        
        const passesFilters = 
            price >= currentMapFilters.minPrice &&
            price <= currentMapFilters.maxPrice &&
            currentMapFilters.propertyTypes.includes(type);
        
        if (passesFilters) {
            if (isClusteringEnabled) {
                if (!markerClusterGroup.hasLayer(marker)) {
                    markerClusterGroup.addLayer(marker);
                }
            } else {
                if (!propertyMap.hasLayer(marker)) {
                    marker.addTo(propertyMap);
                }
            }
            visibleCount++;
        } else {
            if (isClusteringEnabled) {
                markerClusterGroup.removeLayer(marker);
            } else {
                propertyMap.removeLayer(marker);
            }
        }
    });
    
    // Update count
    document.getElementById('visiblePropertyCount').textContent = visibleCount;
}

// Reset Map Filters
function resetMapFilters() {
    // Reset sliders
    const prices = currentProperties.map(p => p.price).filter(p => p && p > 0);
    if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        document.getElementById('minPriceSlider').value = minPrice;
        document.getElementById('maxPriceSlider').value = maxPrice;
        document.getElementById('minPriceLabel').textContent = '$' + formatNumber(minPrice);
        document.getElementById('maxPriceLabel').textContent = '$' + formatNumber(maxPrice);
        
        currentMapFilters.minPrice = minPrice;
        currentMapFilters.maxPrice = maxPrice;
    }
    
    // Reset checkboxes
    document.querySelectorAll('.property-type-filter').forEach(cb => {
        cb.checked = true;
    });
    currentMapFilters.propertyTypes = ['House', 'Unit', 'Townhouse', 'Land'];
    
    // Refilter markers
    filterMapMarkers();
}

// Toggle Marker Clustering
function toggleClustering() {
    isClusteringEnabled = !isClusteringEnabled;
    const btn = document.getElementById('toggleClusterBtn');
    
    if (isClusteringEnabled) {
        // Enable clustering
        mapMarkers.forEach(marker => propertyMap.removeLayer(marker));
        markerClusterGroup.clearLayers();
        markerClusterGroup.addLayers(mapMarkers);
        propertyMap.addLayer(markerClusterGroup);
        btn.classList.add('active');
    } else {
        // Disable clustering
        propertyMap.removeLayer(markerClusterGroup);
        mapMarkers.forEach(marker => marker.addTo(propertyMap));
        btn.classList.remove('active');
    }
    
    filterMapMarkers();
}

// Toggle Heat Map
function toggleHeatMap() {
    isHeatMapVisible = !isHeatMapVisible;
    const btn = document.getElementById('toggleHeatBtn');
    
    if (isHeatMapVisible) {
        // Create heat map if it doesn't exist
        if (!heatMapLayer) {
            const heatData = currentProperties
                .filter(p => p.coordinates && p.coordinates.latitude && p.coordinates.longitude && p.price)
                .map(p => {
                    // Intensity based on price (normalize between 0 and 1)
                    const prices = currentProperties.map(prop => prop.price).filter(pr => pr > 0);
                    const maxPrice = Math.max(...prices);
                    const intensity = p.price / maxPrice;
                    
                    return [
                        p.coordinates.latitude,
                        p.coordinates.longitude,
                        intensity
                    ];
                });
            
            heatMapLayer = L.heatLayer(heatData, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                gradient: {
                    0.0: '#10b981',
                    0.5: '#fd7700',
                    1.0: '#ef4444'
                }
            });
        }
        
        propertyMap.addLayer(heatMapLayer);
        btn.classList.add('active');
    } else {
        if (heatMapLayer) {
            propertyMap.removeLayer(heatMapLayer);
        }
        btn.classList.remove('active');
    }
}

// Enable Radius Drawing
function enableRadiusDraw() {
    if (!drawControl) {
        drawControl = new L.Control.Draw({
            draw: {
                polyline: false,
                polygon: false,
                rectangle: false,
                marker: false,
                circlemarker: false,
                circle: {
                    shapeOptions: {
                        color: '#fd7700',
                        fillColor: '#fd7700',
                        fillOpacity: 0.2
                    },
                    showRadius: true,
                    metric: true
                }
            },
            edit: {
                featureGroup: drawnItems,
                remove: true
            }
        });
        
        propertyMap.addControl(drawControl);
        
        // Handle circle creation
        propertyMap.on(L.Draw.Event.CREATED, function(event) {
            const layer = event.layer;
            drawnItems.clearLayers();
            drawnItems.addLayer(layer);
            
            // Calculate properties within radius
            const center = layer.getLatLng();
            const radius = layer.getRadius(); // in meters
            
            let propertiesInRadius = 0;
            mapMarkers.forEach(marker => {
                const markerPos = marker.getLatLng();
                const distance = center.distanceTo(markerPos);
                
                if (distance <= radius) {
                    propertiesInRadius++;
                }
            });
            
            // Show popup with count
            const radiusKm = (radius / 1000).toFixed(2);
            layer.bindPopup(`
                <div style="text-align: center;">
                    <h4>Search Radius</h4>
                    <p><strong>${radiusKm} km</strong></p>
                    <p>${propertiesInRadius} properties found</p>
                </div>
            `).openPopup();
        });
    }
    
    // Activate circle drawing
    const btn = document.getElementById('drawRadiusBtn');
    btn.classList.add('active');
    new L.Draw.Circle(propertyMap, drawControl.options.draw.circle).enable();
}

// Fit All Properties
function fitAllProperties() {
    if (mapMarkers.length > 0) {
        const group = new L.featureGroup(mapMarkers);
        propertyMap.fitBounds(group.getBounds().pad(0.1));
    }
}

// Update Property Count
function updatePropertyCount() {
    const count = mapMarkers.filter(marker => {
        const property = marker.propertyData;
        const price = property.price || 0;
        const type = property.property_type || 'Unknown';
        
        return price >= currentMapFilters.minPrice &&
               price <= currentMapFilters.maxPrice &&
               currentMapFilters.propertyTypes.includes(type);
    }).length;
    
    document.getElementById('visiblePropertyCount').textContent = count;
}

// Add Property to Comparison
function addToComparison(property) {
    if (comparisonProperties.length >= 2) {
        alert('You can only compare 2 properties at a time. Remove one to add another.');
        return;
    }
    
    // Check if already in comparison
    if (comparisonProperties.find(p => p.address?.street === property.address?.street)) {
        alert('This property is already in comparison.');
        return;
    }
    
    comparisonProperties.push(property);
    renderComparison();
}

// Render Property Comparison
function renderComparison() {
    const container = document.getElementById('comparisonContainer');
    
    if (comparisonProperties.length === 0) {
        container.innerHTML = `
            <div class="comparison-placeholder">
                <i class="fas fa-mouse-pointer"></i>
                <p>Click on markers to compare properties</p>
                <p class="small-text">Select up to 2 properties</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    comparisonProperties.forEach((property, index) => {
        // Calculate metrics
        const landSize = parseLandSize(property.attributes?.land_size);
        const pricePerSqm = landSize > 0 ? property.price / landSize : 0;
        const investmentScore = calculateInvestmentScore(property);
        
        // Determine which metrics are better (for highlighting)
        let priceBetter = false;
        let sizeBetter = false;
        let valueBetter = false;
        
        if (comparisonProperties.length === 2) {
            const other = comparisonProperties[1 - index];
            priceBetter = property.price < other.price;
            sizeBetter = landSize > parseLandSize(other.attributes?.land_size);
            const otherPricePerSqm = parseLandSize(other.attributes?.land_size) > 0 ? 
                other.price / parseLandSize(other.attributes?.land_size) : 0;
            valueBetter = pricePerSqm < otherPricePerSqm && pricePerSqm > 0;
        }
        
        html += `
            <div class="comparison-card">
                <div class="comparison-card-header">
                    <div>
                        <h4>${property.property_type || 'Property'}</h4>
                        <div class="comparison-card-address">${property.address?.street || 'Address not available'}</div>
                    </div>
                    <button class="comparison-card-remove" onclick="removeFromComparison(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="comparison-metrics">
                    <div class="comparison-metric ${priceBetter ? 'better' : ''}">
                        <div class="comparison-metric-label">Price</div>
                        <div class="comparison-metric-value">$${formatNumber(property.price)}</div>
                    </div>
                    <div class="comparison-metric ${valueBetter ? 'better' : ''}">
                        <div class="comparison-metric-label">$/m²</div>
                        <div class="comparison-metric-value">$${formatNumber(pricePerSqm)}</div>
                    </div>
                    <div class="comparison-metric">
                        <div class="comparison-metric-label">Beds</div>
                        <div class="comparison-metric-value">${property.attributes?.bedrooms || 'N/A'}</div>
                    </div>
                    <div class="comparison-metric">
                        <div class="comparison-metric-label">Baths</div>
                        <div class="comparison-metric-value">${property.attributes?.bathrooms || 'N/A'}</div>
                    </div>
                    <div class="comparison-metric ${sizeBetter ? 'better' : ''}">
                        <div class="comparison-metric-label">Land Size</div>
                        <div class="comparison-metric-value">${property.attributes?.land_size || 'N/A'}</div>
                    </div>
                    <div class="comparison-metric">
                        <div class="comparison-metric-label">Garage</div>
                        <div class="comparison-metric-value">${property.attributes?.garage_spaces || 'N/A'}</div>
                    </div>
                </div>
                
                <div class="comparison-score">
                    <div class="comparison-score-label">Investment Score</div>
                    <div class="comparison-score-value">${investmentScore.score}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Remove from Comparison
function removeFromComparison(index) {
    comparisonProperties.splice(index, 1);
    renderComparison();
}

// Clear Comparison
function clearComparison() {
    comparisonProperties = [];
    renderComparison();
}

// ===========================
// PLAYGROUND TAB - PROPERTY TINDER
// ===========================

// Playground global state
let swipeStack = [];
let currentSwipeIndex = 0;
let likedProperties = [];
let passedProperties = [];
let swipeHistory = [];
let isDragging = false;
let startX = 0;
let startY = 0;
let currentCard = null;

// Initialize Playground Tab
function generatePlayground() {
    console.log('Generating Playground with', currentProperties.length, 'properties');
    
    if (!currentProperties || currentProperties.length === 0) {
        return; // Keep placeholder visible
    }
    
    // Reset state
    swipeStack = [...currentProperties];
    currentSwipeIndex = 0;
    
    // Render first batch of cards
    renderSwipeCards();
    updateSwipeStats();
}

// Render Swipe Cards
function renderSwipeCards() {
    const swipeStackEl = document.getElementById('swipeStack');
    
    if (currentSwipeIndex >= swipeStack.length) {
        // All cards swiped
        swipeStackEl.innerHTML = `
            <div class="swipe-card-placeholder">
                <i class="fas fa-check-circle"></i>
                <h3>All done! 🎉</h3>
                <p>You've reviewed all ${swipeStack.length} properties</p>
                <button class="btn-secondary" onclick="resetPlayground()" style="margin-top: 2rem; padding: 1rem 2rem;">
                    <i class="fas fa-redo"></i> Start Over
                </button>
            </div>
        `;
        
        // Show preference insights if we have liked properties
        if (likedProperties.length > 0) {
            generatePreferenceInsights();
        }
        return;
    }
    
    // Clear and render top 3 cards (for stack effect)
    swipeStackEl.innerHTML = '';
    
    const cardsToShow = Math.min(3, swipeStack.length - currentSwipeIndex);
    
    for (let i = cardsToShow - 1; i >= 0; i--) {
        const property = swipeStack[currentSwipeIndex + i];
        const card = createSwipeCard(property, i);
        swipeStackEl.appendChild(card);
    }
    
    // Add swipe listeners to top card only (last card in DOM)
    const allCards = swipeStackEl.querySelectorAll('.swipe-card');
    const topCard = allCards[allCards.length - 1];
    if (topCard) {
        initSwipeListeners(topCard);
        currentCard = topCard;
    }
}

// Create Swipe Card
function createSwipeCard(property, stackIndex) {
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.dataset.propertyIndex = currentSwipeIndex + stackIndex;
    
    // Stack effect styling
    const scale = 1 - (stackIndex * 0.05);
    const translateY = stackIndex * 10;
    card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
    card.style.zIndex = 100 - stackIndex;
    
    const price = property.price ? `$${formatNumber(property.price)}` : 'Price on Application';
    const address = property.address?.street || 'Address not available';
    const suburb = property.address?.sal || '';
    const state = property.address?.state || '';
    const fullAddress = `${address}, ${suburb}, ${state}`;
    
    const bedrooms = property.attributes?.bedrooms || 'N/A';
    const bathrooms = property.attributes?.bathrooms || 'N/A';
    const garages = property.attributes?.garage_spaces || 'N/A';
    const landSize = property.attributes?.land_size || 'N/A';
    const propertyType = property.property_type || 'Property';
    
    card.innerHTML = `
        <div class="swipe-card-image">
            <i class="fas fa-home"></i>
        </div>
        <div class="swipe-card-content">
            <div class="swipe-card-price">${price}</div>
            <div class="swipe-card-address">
                <i class="fas fa-map-marker-alt"></i>
                ${fullAddress}
            </div>
            <div class="swipe-card-details">
                ${bedrooms !== 'N/A' ? `
                    <div class="swipe-card-detail">
                        <i class="fas fa-bed"></i>
                        ${bedrooms}
                    </div>
                ` : ''}
                ${bathrooms !== 'N/A' ? `
                    <div class="swipe-card-detail">
                        <i class="fas fa-bath"></i>
                        ${bathrooms}
                    </div>
                ` : ''}
                ${garages !== 'N/A' ? `
                    <div class="swipe-card-detail">
                        <i class="fas fa-car"></i>
                        ${garages}
                    </div>
                ` : ''}
                ${landSize !== 'N/A' ? `
                    <div class="swipe-card-detail">
                        <i class="fas fa-ruler-combined"></i>
                        ${landSize}
                    </div>
                ` : ''}
            </div>
            <div class="swipe-card-type">${propertyType}</div>
        </div>
    `;
    
    return card;
}

// Initialize Swipe Listeners
function initSwipeListeners(card) {
    // Mouse events
    card.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    
    // Touch events
    card.addEventListener('touchstart', onDragStart);
    document.addEventListener('touchmove', onDragMove);
    document.addEventListener('touchend', onDragEnd);
}

// Drag Start
function onDragStart(e) {
    if (e.target.closest('.swipe-card') !== currentCard) return;
    
    isDragging = true;
    currentCard.classList.add('swiping');
    
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    startX = clientX;
    startY = clientY;
}

// Drag Move
function onDragMove(e) {
    if (!isDragging || !currentCard) return;
    
    e.preventDefault();
    
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    
    const rotation = deltaX * 0.1; // Rotate based on horizontal movement
    
    currentCard.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
    
    // Show indicators
    const leftIndicator = document.getElementById('swipeIndicatorLeft');
    const rightIndicator = document.getElementById('swipeIndicatorRight');
    
    if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
            rightIndicator.classList.add('active');
            leftIndicator.classList.remove('active');
        } else {
            leftIndicator.classList.add('active');
            rightIndicator.classList.remove('active');
        }
    } else {
        leftIndicator.classList.remove('active');
        rightIndicator.classList.remove('active');
    }
}

// Drag End
function onDragEnd(e) {
    if (!isDragging || !currentCard) return;
    
    isDragging = false;
    currentCard.classList.remove('swiping');
    
    const clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    
    // Hide indicators
    document.getElementById('swipeIndicatorLeft').classList.remove('active');
    document.getElementById('swipeIndicatorRight').classList.remove('active');
    
    const threshold = 100;
    
    if (Math.abs(deltaX) > threshold) {
        // Swipe detected
        if (deltaX > 0) {
            completeSwipe('right');
        } else {
            completeSwipe('left');
        }
    } else {
        // Return to center
        currentCard.style.transform = '';
    }
}

// Complete Swipe
function completeSwipe(direction) {
    const property = swipeStack[currentSwipeIndex];
    
    if (direction === 'right') {
        currentCard.classList.add('swiped-right');
        likedProperties.push(property);
        createParticle('❤️', currentCard);
    } else {
        currentCard.classList.add('swiped-left');
        passedProperties.push(property);
        createParticle('✖️', currentCard);
    }
    
    // Add to history
    swipeHistory.push({
        property: property,
        direction: direction,
        timestamp: Date.now()
    });
    
    // Update UI
    updateSwipeStats();
    updateLikedPropertiesPanel();
    
    // Move to next card
    setTimeout(() => {
        currentSwipeIndex++;
        renderSwipeCards();
    }, 500);
}

// Swipe Left (Button)
function swipeLeft() {
    if (!currentCard || currentSwipeIndex >= swipeStack.length) return;
    
    currentCard.classList.add('swiped-left');
    const property = swipeStack[currentSwipeIndex];
    passedProperties.push(property);
    
    swipeHistory.push({
        property: property,
        direction: 'left',
        timestamp: Date.now()
    });
    
    createParticle('✖️', currentCard);
    updateSwipeStats();
    
    setTimeout(() => {
        currentSwipeIndex++;
        renderSwipeCards();
    }, 500);
}

// Swipe Right (Button)
function swipeRight() {
    if (!currentCard || currentSwipeIndex >= swipeStack.length) return;
    
    currentCard.classList.add('swiped-right');
    const property = swipeStack[currentSwipeIndex];
    likedProperties.push(property);
    
    swipeHistory.push({
        property: property,
        direction: 'right',
        timestamp: Date.now()
    });
    
    createParticle('❤️', currentCard);
    updateSwipeStats();
    updateLikedPropertiesPanel();
    
    setTimeout(() => {
        currentSwipeIndex++;
        renderSwipeCards();
    }, 500);
}

// Undo Swipe
function undoSwipe() {
    if (swipeHistory.length === 0 || currentSwipeIndex === 0) return;
    
    const lastSwipe = swipeHistory.pop();
    
    // Remove from liked or passed
    if (lastSwipe.direction === 'right') {
        likedProperties.pop();
    } else {
        passedProperties.pop();
    }
    
    // Go back one card
    currentSwipeIndex--;
    
    updateSwipeStats();
    updateLikedPropertiesPanel();
    renderSwipeCards();
}

// Update Swipe Stats
function updateSwipeStats() {
    document.getElementById('likedCount').textContent = likedProperties.length;
    document.getElementById('passedCount').textContent = passedProperties.length;
}

// Update Liked Properties Panel
function updateLikedPropertiesPanel() {
    const grid = document.getElementById('likedPropertiesGrid');
    
    if (likedProperties.length === 0) {
        grid.innerHTML = `
            <div class="no-liked-placeholder">
                <i class="fas fa-heart-broken"></i>
                <p>No liked properties yet</p>
                <p class="small-text">Start swiping to build your collection!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    likedProperties.forEach((property, index) => {
        const price = property.price ? `$${formatNumber(property.price)}` : 'POA';
        const address = property.address?.street || 'Address not available';
        const suburb = property.address?.sal || '';
        const state = property.address?.state || '';
        const fullAddress = `${address}, ${suburb}, ${state}`;
        
        const bedrooms = property.attributes?.bedrooms || 'N/A';
        const bathrooms = property.attributes?.bathrooms || 'N/A';
        const garages = property.attributes?.garage_spaces || 'N/A';
        
        html += `
            <div class="liked-property-card">
                <div class="liked-property-image">
                    <i class="fas fa-home"></i>
                </div>
                <div class="liked-property-content">
                    <div class="liked-property-price">${price}</div>
                    <div class="liked-property-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${fullAddress}
                    </div>
                    <div class="liked-property-details">
                        ${bedrooms !== 'N/A' ? `
                            <div class="liked-property-detail">
                                <i class="fas fa-bed"></i>
                                ${bedrooms}
                            </div>
                        ` : ''}
                        ${bathrooms !== 'N/A' ? `
                            <div class="liked-property-detail">
                                <i class="fas fa-bath"></i>
                                ${bathrooms}
                            </div>
                        ` : ''}
                        ${garages !== 'N/A' ? `
                            <div class="liked-property-detail">
                                <i class="fas fa-car"></i>
                                ${garages}
                            </div>
                        ` : ''}
                    </div>
                    <button class="btn-remove-liked" onclick="removeLikedProperty(${index})">
                        <i class="fas fa-times"></i> Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

// Remove Liked Property
function removeLikedProperty(index) {
    likedProperties.splice(index, 1);
    updateLikedPropertiesPanel();
    updateSwipeStats();
    
    // Update preference insights if visible
    const insightsEl = document.getElementById('preferenceInsights');
    if (insightsEl.style.display !== 'none' && likedProperties.length > 0) {
        generatePreferenceInsights();
    } else if (likedProperties.length === 0) {
        insightsEl.style.display = 'none';
    }
}

// Toggle Liked Panel
function toggleLikedPanel() {
    const panel = document.querySelector('.liked-properties-panel');
    panel.classList.toggle('collapsed');
}

// Reset Playground
function resetPlayground() {
    swipeStack = [...currentProperties];
    currentSwipeIndex = 0;
    likedProperties = [];
    passedProperties = [];
    swipeHistory = [];
    
    renderSwipeCards();
    updateSwipeStats();
    updateLikedPropertiesPanel();
    
    document.getElementById('preferenceInsights').style.display = 'none';
}

// Generate Preference Insights
function generatePreferenceInsights() {
    if (likedProperties.length === 0) return;
    
    const insightsEl = document.getElementById('preferenceInsights');
    const insightsGrid = document.getElementById('insightsGrid');
    
    insightsEl.style.display = 'block';
    
    // Analyze preferences
    const priceRange = analyzePriceRange();
    const propertyTypePreference = analyzePropertyTypes();
    const bedroomPreference = analyzeBedroomPreference();
    const locationPreference = analyzeLocationPreference();
    
    let html = '';
    
    // Price Range Insight
    if (priceRange) {
        html += `
            <div class="insight-card">
                <div class="insight-title">
                    <i class="fas fa-dollar-sign"></i>
                    Price Range
                </div>
                <div class="insight-value">$${formatNumber(priceRange.avg)}</div>
                <div class="insight-description">
                    Average price of liked properties<br>
                    Range: $${formatNumber(priceRange.min)} - $${formatNumber(priceRange.max)}
                </div>
                <div class="insight-bar">
                    <div class="insight-bar-fill" style="width: 100%;"></div>
                </div>
            </div>
        `;
    }
    
    // Property Type Insight
    if (propertyTypePreference) {
        const percentage = ((propertyTypePreference.count / likedProperties.length) * 100).toFixed(0);
        html += `
            <div class="insight-card">
                <div class="insight-title">
                    <i class="fas fa-home"></i>
                    Property Type
                </div>
                <div class="insight-value">${propertyTypePreference.type}</div>
                <div class="insight-description">
                    ${percentage}% of your liked properties
                </div>
                <div class="insight-bar">
                    <div class="insight-bar-fill" style="width: ${percentage}%;"></div>
                </div>
            </div>
        `;
    }
    
    // Bedroom Preference
    if (bedroomPreference) {
        html += `
            <div class="insight-card">
                <div class="insight-title">
                    <i class="fas fa-bed"></i>
                    Bedrooms
                </div>
                <div class="insight-value">${bedroomPreference.avg}</div>
                <div class="insight-description">
                    Average bedrooms in liked properties<br>
                    Range: ${bedroomPreference.min} - ${bedroomPreference.max}
                </div>
                <div class="insight-bar">
                    <div class="insight-bar-fill" style="width: ${(bedroomPreference.avg / 5) * 100}%;"></div>
                </div>
            </div>
        `;
    }
    
    // Location Preference
    if (locationPreference) {
        const percentage = ((locationPreference.count / likedProperties.length) * 100).toFixed(0);
        html += `
            <div class="insight-card">
                <div class="insight-title">
                    <i class="fas fa-map-marker-alt"></i>
                    Location
                </div>
                <div class="insight-value">${locationPreference.suburb}</div>
                <div class="insight-description">
                    ${percentage}% of your liked properties are in this area
                </div>
                <div class="insight-bar">
                    <div class="insight-bar-fill" style="width: ${percentage}%;"></div>
                </div>
            </div>
        `;
    }
    
    insightsGrid.innerHTML = html;
}

// Analyze Price Range
function analyzePriceRange() {
    const prices = likedProperties
        .filter(p => p.price)
        .map(p => p.price);
    
    if (prices.length === 0) return null;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    return { min, max, avg };
}

// Analyze Property Types
function analyzePropertyTypes() {
    const types = {};
    
    likedProperties.forEach(property => {
        const type = property.property_type || 'Unknown';
        types[type] = (types[type] || 0) + 1;
    });
    
    const sortedTypes = Object.entries(types).sort((a, b) => b[1] - a[1]);
    
    if (sortedTypes.length === 0) return null;
    
    return {
        type: sortedTypes[0][0],
        count: sortedTypes[0][1]
    };
}

// Analyze Bedroom Preference
function analyzeBedroomPreference() {
    const bedrooms = likedProperties
        .filter(p => p.attributes?.bedrooms)
        .map(p => p.attributes.bedrooms);
    
    if (bedrooms.length === 0) return null;
    
    const min = Math.min(...bedrooms);
    const max = Math.max(...bedrooms);
    const avg = Math.round(bedrooms.reduce((a, b) => a + b, 0) / bedrooms.length);
    
    return { min, max, avg };
}

// Analyze Location Preference
function analyzeLocationPreference() {
    const locations = {};
    
    likedProperties.forEach(property => {
        const suburb = property.address?.sal || 'Unknown';
        locations[suburb] = (locations[suburb] || 0) + 1;
    });
    
    const sortedLocations = Object.entries(locations).sort((a, b) => b[1] - a[1]);
    
    if (sortedLocations.length === 0) return null;
    
    return {
        suburb: sortedLocations[0][0],
        count: sortedLocations[0][1]
    };
}

// Create Particle Effect
function createParticle(emoji, sourceElement) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = emoji;
    
    const rect = sourceElement.getBoundingClientRect();
    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top + rect.height / 2}px`;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 2000);
}

// Keyboard Shortcuts for Swipe
document.addEventListener('keydown', (e) => {
    // Only work if playground tab is active AND tinder panel is active
    const playgroundTab = document.getElementById('playground-tab');
    const tinderPanel = document.getElementById('tinder-panel');
    if (!playgroundTab.classList.contains('active') || !tinderPanel.classList.contains('active')) return;
    
    if (e.key === 'ArrowLeft') {
        swipeLeft();
    } else if (e.key === 'ArrowRight') {
        swipeRight();
    } else if (e.key === 'ArrowUp') {
        undoSwipe();
    }
});

// ===========================
// PLAYGROUND SUB-TAB SWITCHING
// ===========================

function switchPlaygroundFeature(featureName) {
    console.log('Switching to playground feature:', featureName);
    
    // Update sub-tab buttons
    document.querySelectorAll('.playground-subtab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.playground-subtab-btn').classList.add('active');
    
    // Update sub-panels
    document.querySelectorAll('.playground-subpanel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${featureName}-panel`).classList.add('active');
    
    // Initialize the feature if needed
    if (featureName === 'tinder' && currentProperties.length > 0 && swipeStack.length === 0) {
        generatePlayground();
    } else if (featureName === 'timeline' && currentProperties.length > 0) {
        generateTimeline();
    } else if (featureName === 'calculator') {
        generateCalculator();
    }
}

// ===========================
// TIMELINE VIEW
// ===========================

// Timeline global state
let timelineChart = null;
let timelineData = [];
let timelineDateRange = { min: null, max: null };
let timelineSliderValue = 100;
let timelineAnimationInterval = null;

// Generate Timeline
function generateTimeline() {
    console.log('Generating Timeline with', currentProperties.length, 'properties');
    
    if (!currentProperties || currentProperties.length === 0) {
        return; // Keep placeholder visible
    }
    
    // Prepare timeline data
    timelineData = currentProperties.map(prop => ({
        property: prop,
        listingDate: new Date(prop.listing_date),
        daysOnMarket: Math.floor((new Date() - new Date(prop.listing_date)) / (1000 * 60 * 60 * 24))
    })).sort((a, b) => a.listingDate - b.listingDate);
    
    // Calculate date range
    timelineDateRange.min = timelineData[0].listingDate;
    timelineDateRange.max = timelineData[timelineData.length - 1].listingDate;
    
    // Update stats
    updateTimelineStats();
    
    // Create chart
    createTimelineChart();
    
    // Setup slider
    setupTimelineSlider();
    
    // Show all properties initially
    renderTimelineProperties(timelineData);
}

// Update Timeline Stats
function updateTimelineStats() {
    const earliestDate = timelineDateRange.min.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' });
    const latestDate = timelineDateRange.max.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const avgDays = Math.round(timelineData.reduce((sum, item) => sum + item.daysOnMarket, 0) / timelineData.length);
    
    document.getElementById('timelineEarliestDate').textContent = earliestDate;
    document.getElementById('timelineLatestDate').textContent = latestDate;
    document.getElementById('timelineAvgDays').textContent = `${avgDays} days`;
    document.getElementById('timelineActiveCount').textContent = timelineData.length;
}

// Create Timeline Chart
function createTimelineChart() {
    const ctx = document.getElementById('timelineChart').getContext('2d');
    
    // Destroy existing chart
    if (timelineChart) {
        timelineChart.destroy();
    }
    
    // Group by month
    const monthlyData = {};
    timelineData.forEach(item => {
        const monthKey = `${item.listingDate.getFullYear()}-${String(item.listingDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { count: 0, totalPrice: 0 };
        }
        monthlyData[monthKey].count++;
        monthlyData[monthKey].totalPrice += item.property.price || 0;
    });
    
    const labels = Object.keys(monthlyData).map(key => {
        const [year, month] = key.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
    });
    
    const counts = Object.values(monthlyData).map(d => d.count);
    const avgPrices = Object.values(monthlyData).map(d => d.totalPrice / d.count);
    
    timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Number of Listings',
                    data: counts,
                    borderColor: '#fd7700',
                    backgroundColor: 'rgba(253, 119, 0, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Average Price',
                    data: avgPrices,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e5e5e5'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 1) {
                                label += '$' + formatNumber(context.parsed.y);
                            } else {
                                label += context.parsed.y + ' listings';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#999'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#999'
                    },
                    title: {
                        display: true,
                        text: 'Number of Listings',
                        color: '#fd7700'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: '#999',
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Average Price',
                        color: '#10b981'
                    }
                }
            }
        }
    });
}

// Setup Timeline Slider
function setupTimelineSlider() {
    const slider = document.getElementById('timelineSlider');
    const startLabel = document.getElementById('timelineStartLabel');
    const endLabel = document.getElementById('timelineEndLabel');
    
    startLabel.textContent = timelineDateRange.min.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
    endLabel.textContent = timelineDateRange.max.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
    
    slider.value = 100;
    updateTimelineBySlider(100);
    
    slider.addEventListener('input', (e) => {
        timelineSliderValue = parseInt(e.target.value);
        updateTimelineBySlider(timelineSliderValue);
    });
}

// Update Timeline By Slider
function updateTimelineBySlider(percentage) {
    const totalDays = (timelineDateRange.max - timelineDateRange.min) / (1000 * 60 * 60 * 24);
    const daysFromStart = (totalDays * percentage) / 100;
    const currentDate = new Date(timelineDateRange.min.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
    
    // Update current date display
    document.getElementById('timelineCurrentDate').textContent = currentDate.toLocaleDateString('en-AU', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    // Filter properties up to current date
    const filteredData = timelineData.filter(item => item.listingDate <= currentDate);
    
    // Update active count
    document.getElementById('timelineActiveCount').textContent = filteredData.length;
    
    // Update chart with filtered data
    updateTimelineChart(filteredData, currentDate);
    
    // Render filtered properties
    renderTimelineProperties(filteredData);
}

// Update Timeline Chart with Filtered Data
function updateTimelineChart(filteredData, currentDate) {
    if (!timelineChart) return;
    
    // Group filtered data by month
    const monthlyData = {};
    filteredData.forEach(item => {
        const monthKey = `${item.listingDate.getFullYear()}-${String(item.listingDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { count: 0, totalPrice: 0 };
        }
        monthlyData[monthKey].count++;
        monthlyData[monthKey].totalPrice += item.property.price || 0;
    });
    
    const labels = Object.keys(monthlyData).map(key => {
        const [year, month] = key.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
    });
    
    const counts = Object.values(monthlyData).map(d => d.count);
    const avgPrices = Object.values(monthlyData).map(d => d.totalPrice / d.count);
    
    // Update chart data
    timelineChart.data.labels = labels;
    timelineChart.data.datasets[0].data = counts;
    timelineChart.data.datasets[1].data = avgPrices;
    
    // Smooth update without animation (for slider dragging)
    timelineChart.update('none');
}

// Render Timeline Properties
function renderTimelineProperties(dataToShow) {
    const grid = document.getElementById('timelinePropertiesGrid');
    
    if (dataToShow.length === 0) {
        grid.innerHTML = `
            <div class="timeline-placeholder">
                <i class="fas fa-calendar-times"></i>
                <p>No properties listed before this date</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    dataToShow.forEach(item => {
        const prop = item.property;
        const price = prop.price ? `$${formatNumber(prop.price)}` : 'POA';
        const address = prop.address?.street || 'Address not available';
        const suburb = prop.address?.sal || '';
        const state = prop.address?.state || '';
        const fullAddress = `${address}, ${suburb}, ${state}`;
        
        const bedrooms = prop.attributes?.bedrooms || 'N/A';
        const bathrooms = prop.attributes?.bathrooms || 'N/A';
        const garages = prop.attributes?.garage_spaces || 'N/A';
        
        const listingDate = item.listingDate.toLocaleDateString('en-AU', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        const daysAgo = item.daysOnMarket === 0 ? 'Today' : `${item.daysOnMarket} days ago`;
        
        html += `
            <div class="timeline-property-card">
                <div class="timeline-property-image">
                    <i class="fas fa-home"></i>
                    <div class="timeline-property-badge">${daysAgo}</div>
                </div>
                <div class="timeline-property-content">
                    <div class="timeline-property-price">${price}</div>
                    <div class="timeline-property-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${fullAddress}
                    </div>
                    <div class="timeline-property-details">
                        ${bedrooms !== 'N/A' ? `
                            <div class="timeline-property-detail">
                                <i class="fas fa-bed"></i>
                                ${bedrooms}
                            </div>
                        ` : ''}
                        ${bathrooms !== 'N/A' ? `
                            <div class="timeline-property-detail">
                                <i class="fas fa-bath"></i>
                                ${bathrooms}
                            </div>
                        ` : ''}
                        ${garages !== 'N/A' ? `
                            <div class="timeline-property-detail">
                                <i class="fas fa-car"></i>
                                ${garages}
                            </div>
                        ` : ''}
                    </div>
                    <div class="timeline-property-date">
                        <i class="fas fa-calendar-alt"></i>
                        Listed: ${listingDate}
                    </div>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

// Sort Timeline Properties
function sortTimelineProperties() {
    const sortValue = document.getElementById('timelineSortSelect').value;
    let sortedData = [...timelineData];
    
    const currentPercentage = timelineSliderValue;
    const totalDays = (timelineDateRange.max - timelineDateRange.min) / (1000 * 60 * 60 * 24);
    const daysFromStart = (totalDays * currentPercentage) / 100;
    const currentDate = new Date(timelineDateRange.min.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
    
    sortedData = sortedData.filter(item => item.listingDate <= currentDate);
    
    switch (sortValue) {
        case 'date-new':
            sortedData.sort((a, b) => b.listingDate - a.listingDate);
            break;
        case 'date-old':
            sortedData.sort((a, b) => a.listingDate - b.listingDate);
            break;
        case 'price-high':
            sortedData.sort((a, b) => (b.property.price || 0) - (a.property.price || 0));
            break;
        case 'price-low':
            sortedData.sort((a, b) => (a.property.price || 0) - (b.property.price || 0));
            break;
    }
    
    renderTimelineProperties(sortedData);
}

// Play Timeline Animation
function playTimeline() {
    const playBtn = document.getElementById('playTimelineBtn');
    const slider = document.getElementById('timelineSlider');
    
    if (timelineAnimationInterval) {
        // Stop animation
        clearInterval(timelineAnimationInterval);
        timelineAnimationInterval = null;
        playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        return;
    }
    
    // Start animation
    playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    let currentValue = parseInt(slider.value);
    
    if (currentValue >= 100) {
        currentValue = 0;
    }
    
    timelineAnimationInterval = setInterval(() => {
        currentValue += 1;
        
        if (currentValue > 100) {
            clearInterval(timelineAnimationInterval);
            timelineAnimationInterval = null;
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            return;
        }
        
        slider.value = currentValue;
        timelineSliderValue = currentValue;
        updateTimelineBySlider(currentValue);
    }, 100); // Update every 100ms
}

// Reset Timeline
function resetTimeline() {
    const slider = document.getElementById('timelineSlider');
    const playBtn = document.getElementById('playTimelineBtn');
    
    // Stop animation if playing
    if (timelineAnimationInterval) {
        clearInterval(timelineAnimationInterval);
        timelineAnimationInterval = null;
        playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    }
    
    // Reset to end
    slider.value = 100;
    timelineSliderValue = 100;
    updateTimelineBySlider(100);
    
    // Reset sort
    document.getElementById('timelineSortSelect').value = 'date-new';
}

// ===========================
// INVESTMENT CALCULATOR
// ===========================

// Global Calculator State
let mortgageChart = null;
let roiChart = null;
let cashflowChart = null;

// Switch Calculator Mode (tabs within calculator)
function switchCalculatorMode(mode) {
    console.log(`Switching to calculator mode: ${mode}`);
    
    // Update tab buttons
    document.querySelectorAll('.calculator-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.calculator-tab-btn').classList.add('active');
    
    // Show selected mode
    document.querySelectorAll('.calculator-mode').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${mode}-mode`).classList.add('active');
    
    // Trigger initial calculation for the mode
    if (mode === 'mortgage') {
        calculateMortgage();
    } else if (mode === 'roi') {
        calculateROI();
    } else if (mode === 'cashflow') {
        calculateCashFlow();
    } else if (mode === 'affordability') {
        calculateAffordability();
    }
}

// Generate Calculator (called when switching to calculator sub-tab)
function generateCalculator() {
    console.log('Generating calculator');
    
    // Populate property dropdown with fetched properties
    const select = document.getElementById('calculatorPropertySelect');
    select.innerHTML = '<option value="">-- Choose a property --</option>';
    
    if (lastFetchedData && lastFetchedData.results) {
        lastFetchedData.results.forEach((result, index) => {
            if (result.price) {
                // Use address.street if available, otherwise use area_name
                const address = result.address?.street || result.area_name || `Property ${index + 1}`;
                const price = formatCurrency(result.price);
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${address} - ${price}`;
                select.appendChild(option);
            }
        });
    }
    
    console.log(`Populated calculator with ${lastFetchedData?.results?.length || 0} properties`);
    
    // Calculate default values
    calculateMortgage();
}

// Load Property to Calculator
function loadPropertyToCalculator() {
    const select = document.getElementById('calculatorPropertySelect');
    const index = parseInt(select.value);
    
    if (isNaN(index) || !lastFetchedData || !lastFetchedData.results[index]) {
        return;
    }
    
    const result = lastFetchedData.results[index];
    const price = result.price || 1000000;
    
    console.log(`Loading property: ${result.address?.street || result.area_name} - ${formatCurrency(price)}`);
    
    // Update all calculator inputs with property price
    document.getElementById('mortgagePrice').value = price;
    document.getElementById('roiPrice').value = price;
    document.getElementById('targetPrice').value = price;
    
    // Recalculate active mode
    const activeMode = document.querySelector('.calculator-mode.active');
    if (activeMode) {
        const modeId = activeMode.id.replace('-mode', '');
        if (modeId === 'mortgage') calculateMortgage();
        else if (modeId === 'roi') calculateROI();
        else if (modeId === 'cashflow') calculateCashFlow();
        else if (modeId === 'affordability') calculateAffordability();
    }
}

// Enable Custom Property Entry
function enableCustomProperty() {
    const select = document.getElementById('calculatorPropertySelect');
    select.value = '';
    alert('You can now enter custom values in the input fields below.');
}

// ===========================
// MORTGAGE CALCULATOR
// ===========================

function updateDepositDisplay() {
    const price = parseFloat(document.getElementById('mortgagePrice').value) || 0;
    const depositPercent = parseFloat(document.getElementById('mortgageDeposit').value);
    const depositAmount = (price * depositPercent) / 100;
    
    document.getElementById('depositPercentDisplay').textContent = `${depositPercent}%`;
    document.getElementById('depositAmountDisplay').textContent = formatCurrency(depositAmount);
}

function updateRateDisplay() {
    const rate = parseFloat(document.getElementById('mortgageRate').value);
    document.getElementById('rateDisplay').textContent = `${rate.toFixed(1)}%`;
}

function updateTermDisplay() {
    const term = parseInt(document.getElementById('mortgageTerm').value);
    document.getElementById('termDisplay').textContent = `${term} years`;
}

function calculateMortgage() {
    console.log('Calculating mortgage...');
    
    // Get inputs
    const price = parseFloat(document.getElementById('mortgagePrice').value) || 0;
    const depositPercent = parseFloat(document.getElementById('mortgageDeposit').value);
    const ratePercent = parseFloat(document.getElementById('mortgageRate').value);
    const termYears = parseInt(document.getElementById('mortgageTerm').value);
    
    // Update displays
    updateDepositDisplay();
    updateRateDisplay();
    updateTermDisplay();
    
    // Calculate loan details
    const depositAmount = (price * depositPercent) / 100;
    const loanAmount = price - depositAmount;
    const monthlyRate = (ratePercent / 100) / 12;
    const numPayments = termYears * 12;
    
    // Calculate monthly payment using mortgage formula
    // M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
        monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else {
        monthlyPayment = loanAmount / numPayments;
    }
    
    const totalRepayment = monthlyPayment * numPayments;
    const totalInterest = totalRepayment - loanAmount;
    
    // Update result displays
    document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
    document.getElementById('loanAmount').textContent = formatCurrency(loanAmount);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('totalRepayment').textContent = formatCurrency(totalRepayment);
    
    // Create/update mortgage chart
    createMortgageChart(loanAmount, totalInterest, depositAmount);
}

function createMortgageChart(principal, interest, deposit) {
    const canvas = document.getElementById('mortgageChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (mortgageChart) {
        mortgageChart.destroy();
    }
    
    // Create doughnut chart
    mortgageChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal', 'Interest', 'Deposit'],
            datasets: [{
                data: [principal, interest, deposit],
                backgroundColor: [
                    'rgba(253, 119, 0, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: [
                    'rgba(253, 119, 0, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e5e5e5',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Loan Composition',
                    color: '#e5e5e5',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// ===========================
// ROI CALCULATOR
// ===========================

function updateAppreciationDisplay() {
    const rate = parseFloat(document.getElementById('roiAppreciation').value);
    document.getElementById('appreciationDisplay').textContent = `${rate.toFixed(1)}%`;
}

function updateYieldDisplay() {
    const rate = parseFloat(document.getElementById('roiYield').value);
    document.getElementById('yieldDisplay').textContent = `${rate.toFixed(1)}%`;
}

function updateTimeframeDisplay() {
    const years = parseInt(document.getElementById('roiTimeframe').value);
    document.getElementById('timeframeDisplay').textContent = `${years} years`;
}

function calculateROI() {
    console.log('Calculating ROI...');
    
    // Get inputs
    const purchasePrice = parseFloat(document.getElementById('roiPrice').value) || 0;
    const appreciationRate = parseFloat(document.getElementById('roiAppreciation').value) / 100;
    const rentalYield = parseFloat(document.getElementById('roiYield').value) / 100;
    const timeframe = parseInt(document.getElementById('roiTimeframe').value);
    
    // Update displays
    updateAppreciationDisplay();
    updateYieldDisplay();
    updateTimeframeDisplay();
    
    // Calculate three scenarios
    const scenarios = [
        { name: 'optimistic', multiplier: 1.3, element: 'roiOptimistic', percentElement: 'roiOptimisticPercent' },
        { name: 'realistic', multiplier: 1.0, element: 'roiRealistic', percentElement: 'roiRealisticPercent' },
        { name: 'conservative', multiplier: 0.7, element: 'roiConservative', percentElement: 'roiConservativePercent' }
    ];
    
    const scenarioData = [];
    
    scenarios.forEach(scenario => {
        const adjustedAppreciation = appreciationRate * scenario.multiplier;
        const adjustedYield = rentalYield * scenario.multiplier;
        
        // Calculate future value with compound appreciation
        const futureValue = purchasePrice * Math.pow(1 + adjustedAppreciation, timeframe);
        
        // Calculate total rental income (simple)
        const annualRent = purchasePrice * adjustedYield;
        const totalRentalIncome = annualRent * timeframe;
        
        // Total return
        const capitalGain = futureValue - purchasePrice;
        const totalReturn = capitalGain + totalRentalIncome;
        const roiPercent = ((totalReturn / purchasePrice) * 100).toFixed(1);
        
        // Update displays
        document.getElementById(scenario.element).textContent = formatCurrency(totalReturn);
        document.getElementById(scenario.percentElement).textContent = `+${roiPercent}%`;
        
        scenarioData.push({
            name: scenario.name,
            futureValue,
            totalRentalIncome,
            totalReturn
        });
    });
    
    // Create/update ROI chart
    createROIChart(scenarioData, timeframe, purchasePrice);
}

function createROIChart(scenarios, timeframe, purchasePrice) {
    const canvas = document.getElementById('roiChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (roiChart) {
        roiChart.destroy();
    }
    
    // Generate year labels
    const labels = [];
    for (let i = 0; i <= timeframe; i++) {
        labels.push(`Year ${i}`);
    }
    
    // Generate datasets for each scenario
    const datasets = [];
    const colors = [
        { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 1)' },
        { bg: 'rgba(253, 119, 0, 0.2)', border: 'rgba(253, 119, 0, 1)' },
        { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 1)' }
    ];
    
    scenarios.forEach((scenario, index) => {
        const data = [purchasePrice];
        const growthRate = Math.pow(scenario.futureValue / purchasePrice, 1 / timeframe);
        
        for (let i = 1; i <= timeframe; i++) {
            data.push(purchasePrice * Math.pow(growthRate, i));
        }
        
        datasets.push({
            label: scenario.name.charAt(0).toUpperCase() + scenario.name.slice(1),
            data: data,
            backgroundColor: colors[index].bg,
            borderColor: colors[index].border,
            borderWidth: 2,
            fill: true,
            tension: 0.4
        });
    });
    
    // Create line chart
    roiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#e5e5e5',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Property Value Projection',
                    color: '#e5e5e5',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#cccccc',
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cccccc'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// ===========================
// CASH FLOW CALCULATOR
// ===========================

function updateManagementDisplay() {
    const percent = parseFloat(document.getElementById('managementFee').value);
    document.getElementById('managementDisplay').textContent = `${percent.toFixed(1)}%`;
}

function calculateCashFlow() {
    console.log('Calculating cash flow...');
    
    // Get inputs
    const weeklyRent = parseFloat(document.getElementById('weeklyRent').value) || 0;
    const mortgagePayment = parseFloat(document.getElementById('mortgagePayment').value) || 0;
    const councilRates = parseFloat(document.getElementById('councilRates').value) || 0;
    const strataFees = parseFloat(document.getElementById('strataFees').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance').value) || 0;
    const maintenance = parseFloat(document.getElementById('maintenance').value) || 0;
    const managementPercent = parseFloat(document.getElementById('managementFee').value) / 100;
    
    // Update displays
    updateManagementDisplay();
    
    // Calculate annual figures
    const annualRent = weeklyRent * 52;
    const managementFees = annualRent * managementPercent;
    const annualMortgage = mortgagePayment * 12;
    const annualStrata = strataFees * 4; // quarterly
    
    const annualIncome = annualRent;
    const annualExpenses = annualMortgage + councilRates + annualStrata + insurance + maintenance + managementFees;
    const annualCashFlow = annualIncome - annualExpenses;
    const weeklyCashFlow = annualCashFlow / 52;
    
    // Update displays
    document.getElementById('annualIncome').textContent = formatCurrency(annualIncome);
    document.getElementById('annualExpenses').textContent = formatCurrency(annualExpenses);
    document.getElementById('annualCashFlow').textContent = formatCurrency(annualCashFlow);
    document.getElementById('weeklyCashFlow').textContent = formatCurrency(weeklyCashFlow);
    
    // Update status indicator
    const statusEl = document.getElementById('cashflowStatus');
    statusEl.classList.remove('positive', 'negative');
    
    if (annualCashFlow > 0) {
        statusEl.classList.add('positive');
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i><span>✅ Cashflow Positive! This property generates income after all expenses.</span>';
    } else if (annualCashFlow < 0) {
        statusEl.classList.add('negative');
        statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>⚠️ Cashflow Negative. You\'ll need to cover ' + formatCurrency(Math.abs(weeklyCashFlow)) + '/week.</span>';
    } else {
        statusEl.innerHTML = '<i class="fas fa-equals"></i><span>Breakeven. Income exactly covers expenses.</span>';
    }
    
    // Create/update cash flow chart
    createCashFlowChart(annualIncome, annualMortgage, councilRates, annualStrata, insurance, maintenance, managementFees);
}

function createCashFlowChart(income, mortgage, council, strata, insurance, maintenance, management) {
    const canvas = document.getElementById('cashflowChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (cashflowChart) {
        cashflowChart.destroy();
    }
    
    // Create bar chart
    cashflowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Mortgage', 'Council', 'Strata', 'Insurance', 'Maintenance', 'Management'],
            datasets: [{
                label: 'Annual Amount',
                data: [income, -mortgage, -council, -strata, -insurance, -maintenance, -management],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Income vs Expenses Breakdown',
                    color: '#e5e5e5',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: '#cccccc',
                        callback: function(value) {
                            return '$' + (Math.abs(value) / 1000).toFixed(0) + 'k';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cccccc'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// ===========================
// AFFORDABILITY CALCULATOR
// ===========================

function calculateAffordability() {
    console.log('Calculating affordability...');
    
    // Get inputs
    const householdIncome = parseFloat(document.getElementById('householdIncome').value) || 0;
    const availableDeposit = parseFloat(document.getElementById('availableDeposit').value) || 0;
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value) || 0;
    const monthlyDebts = parseFloat(document.getElementById('monthlyDebts').value) || 0;
    const targetPrice = parseFloat(document.getElementById('targetPrice').value) || 0;
    
    // Calculate borrowing capacity (simplified lending criteria)
    // Typically banks lend 5-6x annual income, minus debts
    const annualRepaymentCapacity = householdIncome * 0.3; // 30% of income
    const monthlyRepaymentCapacity = annualRepaymentCapacity / 12;
    const availableForLoan = monthlyRepaymentCapacity - monthlyDebts - monthlyExpenses * 0.5;
    
    // Calculate max loan using 6.5% rate, 30 years
    const monthlyRate = 0.065 / 12;
    const numPayments = 30 * 12;
    const maxBorrowing = availableForLoan * (Math.pow(1 + monthlyRate, numPayments) - 1) / 
                        (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
    
    const maxPropertyPrice = maxBorrowing + availableDeposit;
    const requiredLoan = targetPrice - availableDeposit;
    const monthlyCommitment = requiredLoan > 0 ? 
        requiredLoan * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1) : 0;
    
    const debtToIncome = ((monthlyCommitment + monthlyDebts) * 12 / householdIncome * 100);
    
    // Update displays
    document.getElementById('maxBorrowing').textContent = formatCurrency(Math.max(0, maxBorrowing));
    document.getElementById('maxProperty').textContent = formatCurrency(Math.max(0, maxPropertyPrice));
    document.getElementById('monthlyCommitment').textContent = formatCurrency(monthlyCommitment);
    document.getElementById('debtToIncome').textContent = debtToIncome.toFixed(1) + '%';
    
    // Determine verdict
    const verdictEl = document.getElementById('affordabilityVerdict');
    verdictEl.classList.remove('can-afford', 'cannot-afford', 'marginal');
    
    let verdict = '';
    let tips = [];
    
    if (targetPrice <= maxPropertyPrice * 0.8) {
        verdictEl.classList.add('can-afford');
        verdict = `
            <div class="verdict-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="verdict-text">
                <h4>✅ You Can Comfortably Afford This!</h4>
                <p>Based on your income and deposit, this property is well within your reach.</p>
            </div>
        `;
        tips = [
            'You have a strong financial position for this purchase',
            'Consider saving extra deposit to avoid LMI (Lenders Mortgage Insurance)',
            'Shop around for the best interest rate to maximize savings'
        ];
    } else if (targetPrice <= maxPropertyPrice) {
        verdictEl.classList.add('marginal');
        verdict = `
            <div class="verdict-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="verdict-text">
                <h4>⚠️ Marginal - Proceed with Caution</h4>
                <p>You can technically afford this, but it will stretch your budget.</p>
            </div>
        `;
        tips = [
            'This property is at the upper limit of your borrowing capacity',
            'Consider a slightly cheaper property for more financial comfort',
            'Ensure you have an emergency fund for unexpected expenses',
            'Budget carefully for ongoing maintenance and rates'
        ];
    } else {
        verdictEl.classList.add('cannot-afford');
        const shortfall = targetPrice - maxPropertyPrice;
        verdict = `
            <div class="verdict-icon">
                <i class="fas fa-times-circle"></i>
            </div>
            <div class="verdict-text">
                <h4>❌ Currently Out of Reach</h4>
                <p>You need an additional ${formatCurrency(shortfall)} to afford this property.</p>
            </div>
        `;
        tips = [
            `Save an extra ${formatCurrency(shortfall)} for deposit`,
            'Reduce existing debts to improve borrowing capacity',
            'Increase household income through additional work or a raise',
            `Consider properties up to ${formatCurrency(maxPropertyPrice)} instead`,
            'Look into government grants for first home buyers'
        ];
    }
    
    verdictEl.innerHTML = verdict;
    
    // Update tips
    const tipsEl = document.getElementById('affordabilityTips');
    tipsEl.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
}

// Utility function to format currency
function formatCurrency(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) {
        return '$0';
    }
    return '$' + Math.round(amount).toLocaleString('en-AU');
}
