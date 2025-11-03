# Microburbs - Professional Property Intelligence

A professional-grade web application that delivers comprehensive property data and market insights from the Microburbs API. Designed for real estate investors, agents, and clients seeking informed investment decisions.

## Features

### 🏢 Professional Interface
- Clean, modern design with professional navigation
- Responsive layout optimized for desktop, tablet, and mobile
- Intuitive search with auto-complete suggestions
- Grid and list view options (grid implemented)

### 📑 Multi-View Tabbed Interface
**Switch between four specialized views to match your analysis needs:**

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

#### 🗺️ Map View Tab (Geographic Intelligence)
Interactive mapping with advanced geospatial features powered by Leaflet.js + OpenStreetMap (no API key required):

**🎯 Interactive Map Features:**
- **Color-Coded Property Markers**:
  - 🟢 Green: Low-priced properties (below Q1 - 25th percentile)
  - 🟠 Orange: Medium-priced properties (between Q1 and Q3)
  - 🔴 Red: High-priced properties (above Q3 - 75th percentile)
  - Custom pin design with teardrop shape and gradients
  - Click markers to view property details in popup
  - "Add to Compare" button in each popup

- **Marker Clustering**:
  - Automatic grouping when zoomed out for performance
  - Shows property count in orange gradient cluster circles
  - Expands on click to reveal individual markers
  - Toggle clustering on/off with floating control button

- **Heat Map Overlay**:
  - Visual price density overlay
  - Color gradient: Green (low prices) → Orange (medium) → Red (high prices)
  - Based on normalized price intensity
  - Toggle on/off to reveal/hide heat layer
  - Radius: 25m, Blur: 15 for smooth visualization

**🎛️ Advanced Filters & Controls:**
- **Left Sidebar - Filters**:
  - **Price Range Sliders**: Dual sliders for min/max price filtering
    - Real-time updates as you drag
    - Displays current values in formatted currency
    - Synced sliders (min can't exceed max)
  - **Property Type Checkboxes**: Filter by House, Unit, Townhouse, Land
    - Multiple selections allowed
    - Real-time marker visibility updates
  - **Reset Filters Button**: One-click reset to show all properties
  - **Price Legend**: Visual guide to marker colors

- **Floating Map Controls** (Top-right):
  - **Fit All Properties**: Auto-zoom to show all visible properties
  - **Toggle Clustering**: Enable/disable marker grouping
  - **Toggle Heat Map**: Show/hide price density overlay
  - **Draw Search Radius**: Interactive circle drawing tool
  - **Property Count Badge**: Live count of visible properties

**📏 Search Radius Tool:**
- Draw circles on map to define search areas
- Shows radius in kilometers
- Calculates and displays property count within radius
- Distance calculation using Haversine formula
- Clear drawn circles and redraw as needed
- Perfect for location-based property searches

**⚖️ Side-by-Side Property Comparison:**
- **Right Sidebar - Compare Properties**:
  - Click "Add to Compare" in marker popups
  - Compare up to 2 properties simultaneously
  - **Comparison Metrics** (auto-highlighted):
    - 💰 Price (cheaper property highlighted in green)
    - 📐 $/m² value (better value highlighted)
    - 🛏️ Bedrooms & 🛁 Bathrooms
    - 🏞️ Land Size (larger highlighted in green)
    - 🚗 Garage spaces
    - 📊 Investment Score (reused from Technical Insights)
  - Green highlighting automatically shows which property wins each metric
  - Remove properties individually or clear all
  - Comparison placeholder guides when empty

**🎨 Professional Design:**
- Orange/black theme integration matching the platform
- Smooth animations and transitions
- Custom Leaflet popup styling
- Responsive sidebars with scroll
- Floating controls with hover effects
- Interactive tooltips on all controls

**🚀 Performance Features:**
- Lazy map initialization (only loads on first tab switch)
- Marker clustering for smooth performance with many properties
- Efficient filter updates without full re-render
- Map size invalidation to prevent display issues

#### 🎮 Playground Tab (Interactive Features Hub)
**Multiple engaging ways to explore properties** - switch between different interactive features using sub-tabs:

##### 📑 Sub-Tab Navigation
The Playground features its own horizontal sub-navigation allowing you to switch between:
- **💖 Property Tinder** - Swipe-based discovery
- **📊 Timeline View** - Historical visualization  
- **💰 Investment Calculator** - Comprehensive financial analysis
- **📁 Portfolio** - Coming Soon

---

##### 💖 Property Tinder
**Swipe-based property discovery** - a gamified interface inspired by Tinder:

**❤️ Swipe Interface:**
- **Tinder-style card stack**: Properties displayed as beautiful swipeable cards
- **Interactive gestures**: 
  - Swipe RIGHT (or click ❤️) to LIKE a property
  - Swipe LEFT (or click ✖️) to PASS
  - Drag cards with mouse or touch for smooth animations
- **Visual feedback**:
  - Live swipe indicators ("LIKE" in green, "PASS" in red)
  - Card rotation and movement follow your finger/mouse
  - Smooth card exit animations (fly off screen)
  - Particle effects (❤️ or ✖️) on each swipe
- **Card stack effect**: See the next 2 cards behind the current one
- **Keyboard shortcuts**: 
  - ← Arrow = Pass
  - → Arrow = Like  
  - ↑ Arrow = Undo last swipe

**📊 Swipe Statistics:**
- Real-time counter for liked and passed properties
- Swipe history tracking with undo capability
- Live stats display at the top of the interface

**💖 Liked Properties Collection:**
- Beautiful grid of all your liked properties
- Property cards with full details (price, address, features)
- One-click remove from liked list
- Collapsible panel to save screen space
- Export your liked properties (CSV, Excel, JSON)

**🧠 AI-Like Preference Insights:**
After reviewing properties, the system analyzes your swipe patterns and generates:
- **Price Range Preference**: Your average preferred price and range
- **Property Type Preference**: What % of your likes are Houses vs Units
- **Bedroom Preference**: Your ideal bedroom count (min, max, average)
- **Location Preference**: Your most-liked suburbs
- Visual progress bars showing preference strength
- Animated reveals when insights become available

**✨ Engagement Features:**
- **Stack replenishment**: Automatically shows next properties as you swipe
- **Completion celebration**: "All done! 🎉" screen when finished
- **One-click reset**: Start over and review properties again
- **Smooth animations**: Professional card transitions and effects
- **Mobile-friendly**: Works perfectly on touch devices
- **No properties? Friendly prompt** to search first

**🎯 Perfect For:**
- Quick property browsing sessions
- Fun way to shortlist properties with partners/family
- Decision-making when overwhelmed by options
- Engaging client presentations
- Mobile property discovery on-the-go

---

##### 📊 Timeline View
**Visualize listing history and market activity over time** - see when properties entered the market:

**📈 Interactive Timeline Chart:**
- **Dual-axis line chart** powered by Chart.js
- **Left axis**: Number of listings per month (orange line)
- **Right axis**: Average price per month (green line)
- **Interactive tooltips**: Hover to see exact numbers
- **Grouped by month**: Automatic monthly aggregation
- **Visual trends**: Spot busy periods and price patterns

**🎯 Timeline Stats Cards:**
- **Earliest Listing**: Date of first property listed
- **Latest Listing**: Date of most recent property
- **Avg Days on Market**: How long properties have been listed
- **Currently Showing**: Count of properties in current view

**⏯️ Interactive Playback:**
- **Play button**: Animated 10-second playback through entire timeline
- **Pause button**: Stop animation at any point
- **Reset button**: Jump back to the end (all properties)
- **Smooth animation**: Properties appear chronologically

**🎚️ Timeline Slider:**
- **Scrub through time**: Drag slider to travel through listing history
- **Real-time filtering**: Properties filter as you move the slider
- **Date display**: Shows current date at slider position
- **Date range markers**: Start and end dates labeled below slider
- **Orange slider thumb**: Smooth, responsive dragging

**🏘️ Filtered Property Grid:**
- **Dynamic filtering**: Only shows properties listed before slider date
- **Property cards** with:
  - Listing date badge ("X days ago" or "Today")
  - Full property details (price, address, beds, baths, garage)
  - Animated card entrance
- **Sort options**:
  - Newest First / Oldest First
  - Price: High to Low / Low to High
- **No properties message**: Clear feedback when slider is before first listing

**✨ Use Cases:**
- Understand market listing patterns (busy vs slow periods)
- Identify fresh listings vs stale inventory
- See price trends over time
- Discover when most competition entered market
- Find recently-reduced properties
- Analyze listing velocity

**💡 Perfect For:**
- Market timing analysis
- Identifying stale vs fresh inventory
- Understanding seasonal patterns
- Client presentations showing market dynamics
- Investment timing decisions

---

##### 💰 Investment Calculator
**Comprehensive financial calculators for property investment analysis** - make informed decisions with real numbers:

**🏦 Mortgage Calculator:**
- **Loan parameters**: Property price, deposit %, interest rate, loan term
- **Interactive sliders**: Adjust deposit (5-50%), rate (2-12%), term (5-30 years)
- **Live calculations**:
  - Monthly mortgage payment
  - Total loan amount
  - Total interest over life of loan
  - Total repayment amount
- **Visual breakdown**: Doughnut chart showing principal vs interest vs deposit
- **Instant updates**: All calculations update in real-time as you adjust sliders

**📈 ROI Scenarios:**
- **Investment parameters**: Purchase price, appreciation rate, rental yield, timeframe
- **Three scenarios**:
  - **Optimistic** (30% above baseline): High growth market
  - **Realistic** (baseline): Expected market conditions
  - **Conservative** (30% below baseline): Slow market growth
- **Projections**:
  - Future property value
  - Total rental income
  - Total return on investment
  - ROI percentage
- **Interactive chart**: Line graph showing property value projection over time for all three scenarios
- **Adjustable timeframes**: 1-30 years

**💵 Cash Flow Analysis:**
- **Income inputs**:
  - Weekly rent amount
- **Expense inputs**:
  - Monthly mortgage payment
  - Annual council rates
  - Quarterly strata/body corp fees
  - Annual insurance
  - Annual maintenance budget
  - Property management fee (%)
- **Calculations**:
  - Annual income and expenses
  - Net annual cash flow
  - Weekly cash flow (positive/negative)
- **Visual feedback**:
  - ✅ **Cashflow Positive**: Green indicator
  - ⚠️ **Cashflow Negative**: Red indicator with weekly shortfall amount
  - Bar chart showing income vs all expense categories
- **Investment decision**: Instantly see if property generates income or requires topping up

**🏠 Affordability Assessment:**
- **Your financial situation**:
  - Annual household income
  - Available deposit amount
  - Monthly living expenses
  - Other monthly debts
  - Target property price
- **Borrowing capacity calculation** based on simplified lending criteria:
  - Max borrowing capacity
  - Max affordable property price
  - Required monthly commitment
  - Debt-to-income ratio
- **Three possible verdicts**:
  - ✅ **Can Comfortably Afford**: Property well within budget (green)
  - ⚠️ **Marginal - Proceed with Caution**: At upper limit of capacity (orange)
  - ❌ **Currently Out of Reach**: Shows shortfall amount (red)
- **Personalized tips**: Actionable advice to improve affordability:
  - Deposit saving targets
  - Debt reduction suggestions
  - Alternative price range recommendations
  - First home buyer grant information

**🎯 Smart Features:**
- **Property dropdown**: Load any property from search results
- **Custom values**: Enter your own property details
- **Real-time calculations**: Instant updates as you adjust sliders
- **Chart.js visualizations**: Professional, interactive charts
- **Australian formatting**: Currency and date formats
- **Mobile responsive**: Works perfectly on all devices

**✨ Use Cases:**
- Compare mortgage options (different deposits, rates, terms)
- Stress test investments with optimistic/conservative scenarios
- Determine if rental income covers expenses (cashflow positive)
- Calculate exact borrowing capacity before talking to banks
- Get personalized affordability verdict
- Present financial scenarios to partners/investors
- Plan deposit targets based on purchase price

**💡 Perfect For:**
- First home buyers checking affordability
- Investors analyzing cash flow potential
- Property buyers comparing loan scenarios
- Financial planners advising clients
- Real estate agents helping buyers understand budgets
- Anyone wanting to run numbers before committing

---

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

6. **Explore Map View** (Optional - For Geographic Analysis)
   - Click the **"Map View"** tab at the top
   - Interactive features:
     - View properties on OpenStreetMap (color-coded by price)
     - Click markers to see property details
     - Use price range sliders to filter properties
     - Toggle marker clustering on/off
     - Enable heat map overlay to see price density
     - Draw search radius circles to find properties within distance
     - Compare up to 2 properties side-by-side
     - Click "Fit All" to auto-zoom to all properties
   - Perfect for understanding geographic distribution and location-based decisions

7. **Explore Playground Features** (Optional - Interactive Tools)
   - Click the **"Playground"** tab at the top
   - Choose from sub-tabs at the top of Playground:
   
   **💖 Property Tinder:**
   - Swipe through properties Tinder-style
   - **Swipe RIGHT** or click ❤️ to LIKE
   - **Swipe LEFT** or click ✖️ to PASS
   - **Keyboard shortcuts**: ← (Pass), → (Like), ↑ (Undo)
   - Build your liked properties collection
   - View AI-like preference insights after swiping
   - Export your shortlist for further analysis
   
   **📊 Timeline View:**
   - See interactive chart of listings over time
   - Use slider to scrub through timeline
   - Click **Play** for animated playback
   - Filter properties by listing date
   - Sort by date or price
   - See "days on market" for each property
   - Understand market activity patterns
   
   **💰 Investment Calculator:**
   - Select a property from dropdown or enter custom values
   - **Mortgage tab**: Adjust loan parameters with sliders
   - **ROI tab**: Set growth assumptions, see 3 scenarios
   - **Cash Flow tab**: Enter income/expenses, check if cashflow positive
   - **Affordability tab**: Input your finances, get instant verdict
   - All calculations update in real-time
   - Charts visualize your projections
   - Get personalized tips and recommendations

8. **Sort and Filter**
   - Use the dropdown to sort by:
     - Price: High to Low
     - Price: Low to High
     - Number of Bedrooms
     - Newest Listings

9. **Export Data for Analysis**
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

10. **View Details**
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

