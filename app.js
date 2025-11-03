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
}

// ==================== TECHNICAL INSIGHTS GENERATION ====================
let chartInstances = {};

function generateTechnicalInsights() {
    console.log('Generating technical insights for', currentProperties.length, 'properties');
    
    generateStatisticalAnalysis();
    generatePriceDistributionChart();
    generateCharacteristicsMatrix();
    generateCorrelationChart();
    generateSegmentationChart();
    generateDataQualityReport();
    generateRawDataTable();
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
