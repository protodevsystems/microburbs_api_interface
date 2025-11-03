# Microburbs - Professional Property Intelligence

A professional-grade web application that delivers comprehensive property data and market insights from the Microburbs API. Designed for real estate investors, agents, and clients seeking informed investment decisions.

## Features

### 🏢 Professional Interface
- Clean, modern design with professional navigation
- Responsive layout optimized for desktop, tablet, and mobile
- Intuitive search with auto-complete suggestions
- Grid and list view options (grid implemented)

### 📑 Dual-View Tabbed Interface
**Switch between two specialized views to match your analysis needs:**

#### 🏠 Property Finder Tab (Commercialized View)
- Beautiful property cards with images and key details
- Investment intelligence dashboard with intuitive metrics
- Perfect for client presentations and quick browsing
- Professional layout for real estate agents and investors

#### 🔬 Technical Insights Tab (Data Science View)
Advanced analytics for data-driven decision making with **WOW factor** features:

**🎯 Investment-Focused Analytics:**
- **Investment Opportunity Scores**: AI-like 100-point scoring system
  - Multi-factor analysis: price competitiveness (30pts), land size (20pts), features (25pts), property type (15pts), listing recency (10pts)
  - Visual progress bars showing score breakdown
  - TOP 3 badges highlighting best opportunities
  - Animated hover effects on opportunity cards
  
- **Value per Square Meter Analysis**: Find the best deals
  - Interactive scatter plot with color-coded points (🟢 Best Value, 🔴 Expensive)
  - Hover tooltips with detailed property information
  - Best/worst value metrics with highlights
  - Value spread percentage calculation
  
- **Outlier Detection & Opportunities**: Statistical bargain finder
  - 💎 **Undervalued Gems**: Properties below statistical lower fence (IQR method)
  - ⚠️ **Premium Priced**: Properties above statistical upper fence
  - Below/above market percentage calculations
  - Professional green/red color-coded cards
  
- **ROI Projection Calculator**: Real investment returns
  - **4 Scenarios**: Conservative (3%/5yr), Moderate (5%/5yr), Optimistic (7%/5yr), 10-Year (5%/10yr)
  - Capital growth + rental income projections
  - Detailed breakdown: initial investment, future value, capital gains, rental income, total return
  - Based on Australian market rates (4% gross yield)
  
- **Top Investment Picks**: Data-driven recommendations
  - Top 3 properties ranked by comprehensive scoring
  - Reason tags (Great Price, Large Land, Excellent Features, Recent Listing, Family Home)
  - Large investment scores with orange gradient styling
  - Professional horizontal card layout with #1, #2, #3 ranks

**📊 Statistical & Market Analysis:**
- **Statistical Analysis**: 12+ statistical metrics including:
  - Sample size, mean, median, standard deviation
  - Quartiles (Q1, Q3), IQR, coefficient of variation
  - Price range and skewness analysis
  - Average property characteristics
- **Price Distribution Chart**: Interactive histogram showing market price spread across 10 bins
- **Property Characteristics Matrix**: Distribution breakdown of:
  - Property types (House, Unit, etc.)
  - Bedroom counts
  - Bathroom counts
- **Correlation Analysis**: Scatter plot showing price vs. number of bedrooms
- **Market Segmentation**: Doughnut chart visualizing market composition by property type
- **Data Quality Report**: Real-time assessment of data completeness across 6 key fields
- **Raw Data Table**: Sortable, searchable table with all property details
- **One-Click Export**: Export technical data table directly to CSV
- **All charts built with Chart.js** for interactive, professional visualizations

### 📊 Investment Intelligence Dashboard
- **Comprehensive investor metrics** organized in 4 key categories:
  
  **Financial Performance:**
  - Capital Growth (Historical & Forecasted)
  - Rental Yield (Gross & Net)
  - Cash Flow Analysis (Positive/Negative)
  - Price-to-Rent Ratio
  
  **Market Activity:**
  - Days on Market (DOM)
  - Vacancy Rate tracking
  - Auction Clearance Rates
  - Supply Pipeline analysis
  
  **Location & Demographics:**
  - Population Growth trends
  - Infrastructure Score (transport, schools, hospitals)
  - School Quality ratings (NAPLAN scores)
  - Employment & Economic Drivers
  
  **Risk & Opportunity:**
  - Price-to-Income Ratio (affordability)
  - Loan-to-Value Ratio (LVR)
  - Crime Rate indicators
  - Equity Growth projections

- Real-time market statistics (average, median, min, max prices)
- Visual trend indicators (positive/negative/neutral)
- Progress bars for comparative analysis
- Color-coded risk assessments

### 🏠 Property Display
- Professional property cards with key information
- Property type badges (House, Unit, Land, etc.)
- Detailed property features (beds, baths, parking, land size)
- Property descriptions and listing dates
- Price formatting in Australian currency

### 🔧 Advanced Features
- Sort by: Price (high/low), Bedrooms, Newest listings
- Filter and search capabilities
- Smooth scrolling and animations
- Error handling and loading states
- NaN/Infinity value sanitization in backend

### 📤 Data Export for Investors
- **Export to CSV** - Perfect for Excel/Google Sheets analysis
  - Export All Data (2 files: Metrics + Properties)
  - Export Properties Only (detailed property listings)
  - Export Metrics Only (investment intelligence data)
- **Export to Excel (.xlsx)** - Professional multi-sheet workbooks
  - Export All Data (single file with 2 sheets: Metrics + Properties)
  - Export Properties Only (single sheet)
  - Export Metrics Only (single sheet)
- **Export to JSON** - Complete structured report
  - All metrics, properties, and summary statistics
  - Easy to integrate with other tools
- **Professional filename format**: `Suburb_Name_YYYY-MM-DD_Type.ext`
- **Proper CSV escaping** for special characters
- **Compare multiple suburbs** by exporting each search result

## Architecture

The application consists of three main components:

1. **Frontend** (`index.html`, `styles.css`, `app.js`)
   - Professional HTML5/CSS3/JavaScript interface
   - Modern CSS Grid and Flexbox layouts
   - Font Awesome icons for visual enhancement
   - Dynamic property card rendering
   - Real-time market statistics calculation
   - Advanced sorting and filtering
   - Smooth animations and transitions

2. **Backend** (`server.py`)
   - Flask-based Python proxy server
   - CORS-enabled for cross-origin requests
   - API authentication handling
   - NaN/Infinity value sanitization
   - Comprehensive logging for debugging
   - Error handling and timeout management

3. **API Integration**
   - Connects to Microburbs API
   - Endpoint: `https://www.microburbs.com.au/report_generator/api/suburb/properties`
   - Authorization: Bearer token authentication
   - JSON response parsing with invalid value handling

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. **Create a Python virtual environment:**

```bash
python -m venv microburbs
```

2. **Activate the virtual environment:**

```bash
microburbs\Scripts\activate
```

3. **Install Python dependencies:**

```bash
pip install -r requirements.txt
```

### Running the Application

#### Step 1: Start the Backend Server

**Option A - Using the Batch Script (Easiest):**

Simply double-click `start_server.bat` in Windows Explorer. This will:
- Activate the virtual environment
- Start the Flask server
- Show you the server logs

**Option B - Manual Start:**

Run the following commands in your terminal:

```bash
microburbs\Scripts\activate
python server.py
```

You should see:
```
🚀 Starting Microburbs API Proxy Server
Server will run on: http://localhost:5000
```

Keep this terminal window open while using the application.

#### Step 2: Open the Frontend

Open `index.html` in your web browser:
- Double-click the file, or
- Right-click and select "Open with" your preferred browser, or
- Use a local development server (e.g., Python's http.server, Live Server extension)

Alternative using Python's built-in server (in a new terminal):
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

### Using the Application

1. **Search for Properties**
   - Enter a suburb name in the search box (e.g., "Belmont North")
   - Click "Search Properties" or press Enter
   - Wait for the data to load

2. **Analyze Investment Intelligence Dashboard**
   - **Top priority section with black & orange theme**
   - Review Financial Performance metrics (growth, yield, cash flow)
   - Check Market Activity indicators (DOM, vacancy, clearance rates)
   - Assess Location & Demographics (population, infrastructure, schools)
   - Evaluate Risk & Opportunity factors (affordability, LVR, crime, equity)
   - Visual trend indicators show positive/negative/neutral status
   - Progress bars provide quick comparative analysis

3. **View Current Listings Overview**
   - See average and median prices for the suburb
   - View price range (min to max)
   - Check average bedrooms and bathrooms

4. **Browse Properties** (Property Finder Tab - Default)
   - Scroll through professional property cards
   - View key features: bedrooms, bathrooms, parking, land size
   - Read property descriptions and listing dates
   - See property type badges (House, Unit, etc.)

5. **Switch to Technical Insights** (Optional - For Data Analysis)
   - Click the **"Technical Insights"** tab at the top
   - Review comprehensive statistical analysis:
     - Mean, median, standard deviation, quartiles
     - Coefficient of variation and skewness
   - Analyze interactive charts:
     - Price distribution histogram
     - Price vs. bedrooms correlation scatter plot
     - Market segmentation doughnut chart
   - Examine property characteristics matrix
   - Check data quality report (completeness percentages)
   - Browse sortable raw data table
   - Export table data directly to CSV

6. **Sort and Filter**
   - Use the dropdown to sort by:
     - Price: High to Low
     - Price: Low to High
     - Number of Bedrooms
     - Newest Listings

7. **Export Data for Analysis**
   - Click the orange **"Export Data"** button (top right of results)
   - Choose your export format:
     - **Export All (CSV)** - Downloads 2 files: Metrics CSV + Properties CSV
     - **Export All (Excel)** - Single Excel file with 2 sheets: Metrics + Properties
     - **Properties (CSV)** - Property listings for spreadsheet analysis
     - **Properties (Excel)** - Property listings in Excel format
     - **Metrics (CSV)** - Investment metrics for comparison
     - **Metrics (Excel)** - Investment metrics in Excel format
     - **Complete Report (JSON)** - Full structured data report
   - Files are named: `Suburb_Name_YYYY-MM-DD_Type.ext`
   - Open CSV/Excel files in Excel, Google Sheets, or any spreadsheet software
   - Compare data from multiple suburbs side-by-side

8. **View Details**
   - Click "View Details" on any property card for more information
   - Properties display with professional formatting and icons

## API Configuration

The application uses the following API configuration:

- **URL:** `https://www.microburbs.com.au/report_generator/api/suburb/properties`
- **Method:** GET
- **Parameters:** `suburb` (string)
- **Headers:**
  - `Authorization: Bearer test`
  - `Content-Type: application/json`

## Project Structure

```
Microburbs/
├── index.html          # Main HTML page
├── styles.css          # Styling and responsive design
├── app.js             # Frontend JavaScript logic
├── server.py          # Backend Flask proxy server
├── start_server.bat   # Windows batch script to start server
├── requirements.txt   # Python dependencies
├── README.md          # This file
└── microburbs/        # Virtual environment directory (created during setup)
```

## Logging

The backend server includes comprehensive logging to trace data flow:
- Request reception logs
- API call logs
- Response status logs
- Error logs
- Data type and structure logs

All logs are printed to the console where `server.py` is running.

## Troubleshooting

### Error: "Failed to fetch data"
- Ensure the backend server (`server.py`) is running
- Check that port 5000 is not blocked by firewall
- Verify internet connection for API access

### Error: "401 UNAUTHORIZED - Access Denied"
- **This is an API limitation, not a bug in the code**
- The Microburbs API with "Bearer test" token has restricted access
- Some suburbs (like "Sydney") are not authorized with this token
- **Solution:** Try suburbs in NSW like:
  - ✓ Belmont North (confirmed working)
  - Newcastle
  - Lake Macquarie
  - Other regional NSW suburbs
- The app displays helpful error messages with suburb suggestions

### Error: "No data available"
- Check the suburb name spelling
- Some suburbs may not have data in the API
- Check server console logs for API response details

### Other API Errors
- **404:** Suburb not found - verify spelling
- **429:** Rate limit exceeded - wait before searching again
- **500/502/503:** API service temporarily down - try again later

### CORS Issues
- The proxy server should handle CORS automatically
- If issues persist, ensure flask-cors is properly installed

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Commands Reference

**Create Virtual Environment:**
```bash
python -m venv microburbs
```

**Activate Virtual Environment:**
```bash
microburbs\Scripts\activate
```

**Install Dependencies:**
```bash
pip install -r requirements.txt
```

**Start Backend Server:**
```bash
python server.py
```

**Or use the batch script:**
```bash
start_server.bat
```

**Run with Local Dev Server (optional):**
```bash
python -m http.server 8000
```

## Development Notes

- The backend server runs on `http://localhost:5000`
- The frontend can be served from any port or opened directly
- API authentication uses a test Bearer token
- All logging is enabled for debugging purposes

## License

This project is for demonstration purposes.

