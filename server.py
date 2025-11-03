"""
Microburbs API Proxy Server
This server acts as a proxy to avoid CORS issues when calling the Microburbs API from the browser.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import math
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Microburbs API Configuration
MICROBURBS_API_URL = "https://www.microburbs.com.au/report_generator/api/suburb/properties"
MICROBURBS_HEADERS = {
    "Authorization": "Bearer test",
    "Content-Type": "application/json"
}

def sanitize_data(obj):
    """
    Recursively sanitize data to replace NaN, Infinity, and -Infinity with None (null in JSON)
    """
    if isinstance(obj, dict):
        return {key: sanitize_data(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_data(item) for item in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            print(f"[Server] Sanitizing invalid float value: {obj}")
            return None
    return obj

@app.route('/api/suburb/properties', methods=['GET'])
def get_suburb_properties():
    """
    Proxy endpoint to fetch suburb properties from Microburbs API
    Query Parameters:
        suburb (str): The suburb name to search for
    """
    suburb = request.args.get('suburb')
    
    print(f"[Server] Received request for suburb: {suburb}")
    
    if not suburb:
        print("[Server] Error: No suburb parameter provided")
        return jsonify({"error": "Suburb parameter is required"}), 400
    
    try:
        # Make request to Microburbs API
        print(f"[Server] Making request to Microburbs API for: {suburb}")
        response = requests.get(
            MICROBURBS_API_URL,
            params={"suburb": suburb},
            headers=MICROBURBS_HEADERS,
            timeout=10
        )
        
        print(f"[Server] Microburbs API responded with status: {response.status_code}")
        
        # Get the raw response text and parse it
        raw_data = response.text
        print(f"[Server] Raw response length: {len(raw_data)} characters")
        
        # Parse JSON with NaN handling
        data = json.loads(raw_data, parse_constant=lambda x: None)
        print(f"[Server] Data received from Microburbs API: {type(data)}")
        
        if isinstance(data, list):
            print(f"[Server] Data is a list with {len(data)} items")
        elif isinstance(data, dict):
            print(f"[Server] Data is a dict with keys: {list(data.keys())}")
        
        # Sanitize the data to handle any NaN values
        sanitized_data = sanitize_data(data)
        print(f"[Server] Data sanitized and ready to send")
        
        return jsonify(sanitized_data), response.status_code
        
    except requests.exceptions.Timeout:
        print("[Server] Error: Request to Microburbs API timed out")
        return jsonify({"error": "Request timed out"}), 504
        
    except requests.exceptions.RequestException as e:
        print(f"[Server] Error making request to Microburbs API: {str(e)}")
        return jsonify({"error": f"Failed to fetch data: {str(e)}"}), 500
        
    except Exception as e:
        print(f"[Server] Unexpected error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    print("[Server] Health check requested")
    return jsonify({"status": "healthy", "service": "Microburbs Proxy Server"}), 200

@app.route('/', methods=['GET'])
def home():
    """Root endpoint with API information"""
    return jsonify({
        "message": "Microburbs API Proxy Server",
        "endpoints": {
            "/api/suburb/properties": "GET - Fetch properties for a suburb (param: suburb)",
            "/health": "GET - Health check"
        }
    }), 200

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting Microburbs API Proxy Server")
    print("=" * 60)
    print("Server will run on: http://localhost:5000")
    print("API endpoint: http://localhost:5000/api/suburb/properties?suburb=<suburb_name>")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)

