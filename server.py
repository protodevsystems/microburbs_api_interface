"""
Microburbs API Proxy Server
This server acts as a proxy to avoid CORS issues when calling the Microburbs API from the browser.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import math
import json
import base64
from io import BytesIO

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Microburbs API Configuration
MICROBURBS_API_URL = "https://www.microburbs.com.au/report_generator/api/suburb/properties"
MICROBURBS_HEADERS = {
    "Authorization": "Bearer test",
    "Content-Type": "application/json"
}

# OpenAI API Configuration
import os
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')  # REQUIRED: Set as environment variable
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

# Validate API key is set
if not OPENAI_API_KEY:
    print("=" * 60)
    print("⚠️  WARNING: OPENAI_API_KEY environment variable not set!")
    print("AI Vision Analysis will not work without an OpenAI API key.")
    print("=" * 60)
    print("To set the API key:")
    print("  Windows: set OPENAI_API_KEY=your-api-key-here")
    print("  Linux/Mac: export OPENAI_API_KEY=your-api-key-here")
    print("=" * 60)

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

@app.route('/api/analyze-orientation', methods=['POST'])
def analyze_orientation():
    """
    AI-powered orientation detection using GPT-4o Vision
    Analyzes satellite imagery to determine house orientation
    
    Request Body:
        latitude (float): Property latitude
        longitude (float): Property longitude
        address (str): Property address for context
    """
    try:
        data = request.get_json()
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        address = data.get('address', 'Unknown Address')
        
        print(f"[Server] AI Orientation Analysis requested for: {address}")
        print(f"[Server] Coordinates: {latitude}, {longitude}")
        
        if not latitude or not longitude:
            return jsonify({"error": "Latitude and longitude are required"}), 400
        
        # Generate satellite image URL (Google Maps Static API)
        # Note: For production, you should add a Google Maps API key
        # For now, using basic URL which may have limitations
        zoom = 20  # Maximum zoom for detailed view
        size = "600x600"
        maptype = "satellite"
        
        # Construct Google Maps Static API URL with marker
        image_url = (
            f"https://maps.googleapis.com/maps/api/staticmap?"
            f"center={latitude},{longitude}"
            f"&zoom={zoom}"
            f"&size={size}"
            f"&maptype={maptype}"
            f"&markers=color:red%7C{latitude},{longitude}"
        )
        
        # If you have a Google Maps API key, add it here:
        # GOOGLE_MAPS_API_KEY = "YOUR_KEY_HERE"
        # image_url += f"&key={GOOGLE_MAPS_API_KEY}"
        
        print(f"[Server] Fetching satellite image from Google Maps...")
        
        # Fetch the satellite image
        image_response = requests.get(image_url, timeout=10)
        
        if image_response.status_code != 200:
            print(f"[Server] Failed to fetch image: {image_response.status_code}")
            return jsonify({"error": "Failed to fetch satellite image"}), 500
        
        # Convert image to base64
        image_base64 = base64.b64encode(image_response.content).decode('utf-8')
        
        print(f"[Server] Image fetched successfully, size: {len(image_response.content)} bytes")
        print(f"[Server] Sending to GPT-4o Vision for analysis...")
        
        # Prepare GPT-4o Vision API request
        openai_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        
        openai_payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert in analyzing property orientation from satellite imagery. You provide precise, confident assessments of which direction a house faces based on visual cues like driveways, front entrances, roof lines, and property layout."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"""Analyze this satellite image of a property located at {address}.

**CRITICAL INSTRUCTIONS:**
1. The image is oriented with NORTH at the TOP (0°/360°), EAST on the RIGHT (90°), SOUTH at the BOTTOM (180°), and WEST on the LEFT (270°).
2. The RED MARKER indicates the property you need to analyze.
3. Determine which direction the HOUSE/BUILDING faces (where the main entrance/front door is).
4. Look for these visual cues:
   - Driveway location and orientation
   - Front entrance/porch
   - Garage doors
   - Building shape and roof lines
   - Yard layout (front vs back yard)
   - Street access point

**RESPONSE FORMAT (JSON ONLY):**
{{
    "orientation": "North|South|East|West|North-East|North-West|South-East|South-West",
    "confidence": "high|medium|low",
    "reasoning": "Detailed explanation of visual cues that led to this determination (2-3 sentences)",
    "visual_cues": ["driveway facing X", "entrance on Y side", "etc"]
}}

Return ONLY valid JSON, no other text."""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 500,
            "temperature": 0.3  # Lower temperature for more consistent results
        }
        
        # Call OpenAI API
        openai_response = requests.post(
            OPENAI_API_URL,
            headers=openai_headers,
            json=openai_payload,
            timeout=30
        )
        
        if openai_response.status_code != 200:
            print(f"[Server] OpenAI API error: {openai_response.status_code}")
            print(f"[Server] Response: {openai_response.text}")
            return jsonify({"error": "Failed to analyze image with AI"}), 500
        
        # Parse GPT-4o response
        ai_result = openai_response.json()
        ai_message = ai_result['choices'][0]['message']['content']
        
        print(f"[Server] GPT-4o Response: {ai_message}")
        
        # Parse the JSON response from GPT-4o
        try:
            # Remove markdown code blocks if present
            if "```json" in ai_message:
                ai_message = ai_message.split("```json")[1].split("```")[0].strip()
            elif "```" in ai_message:
                ai_message = ai_message.split("```")[1].split("```")[0].strip()
            
            orientation_data = json.loads(ai_message)
            
            print(f"[Server] AI detected orientation: {orientation_data.get('orientation')} (confidence: {orientation_data.get('confidence')})")
            
            return jsonify({
                "success": True,
                "orientation": orientation_data.get('orientation', 'Unknown'),
                "confidence": orientation_data.get('confidence', 'medium'),
                "reasoning": orientation_data.get('reasoning', 'AI analysis completed'),
                "visual_cues": orientation_data.get('visual_cues', []),
                "method": "AI Vision Analysis (GPT-4o)",
                "image_url": image_url  # Return for debugging/verification
            }), 200
            
        except json.JSONDecodeError as e:
            print(f"[Server] Failed to parse AI response as JSON: {e}")
            print(f"[Server] Raw response: {ai_message}")
            # Fallback: try to extract orientation from text
            return jsonify({
                "success": False,
                "error": "Failed to parse AI response",
                "raw_response": ai_message
            }), 500
        
    except Exception as e:
        print(f"[Server] Error in AI orientation analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

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

