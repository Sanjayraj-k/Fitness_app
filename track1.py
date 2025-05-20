import os
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import matplotlib.pyplot as plt
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Directory for temporary image storage
TEMP_DIR = "temp_images_flask"
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

# Simulated transformation analysis function with visualization
def perform_transformation_analysis(before_path, after_path):
    # Placeholder for actual image analysis logic
    score = np.float32(20.86)  # Example score as float32
    
    # Generate a simple plot
    plt.figure(figsize=(6, 4))
    plt.bar(['Transformation Score'], [score], color='blue')
    plt.title('Transformation Analysis Result')
    plt.ylabel('Score (%)')
    plt.ylim(0, 100)
    
    # Save the plot
    plot_filename = f"score_plot_{os.path.basename(before_path).split('.')[0]}.png"
    plot_path = os.path.join(TEMP_DIR, plot_filename)
    plt.savefig(plot_path)
    plt.close()
    
    return score, plot_filename

# Serve static files (plots)
@app.route('/temp_images_flask/<filename>')
def serve_temp_file(filename):
    return send_from_directory(TEMP_DIR, filename)

# Route to analyze images
@app.route('/analyze', methods=['POST'])
def analyze_images_route():
    # Initialize paths as empty list to track files for cleanup
    temp_files = []
    
    try:
        # Log the incoming request details
        logger.debug(f"Received request with files: {request.files.keys()}")
        
        # Check if files are present
        if 'before' not in request.files or 'after' not in request.files:
            logger.warning("Missing required files in request")
            return jsonify({"error": "Before and after images are required"}), 400

        before_file = request.files['before']
        after_file = request.files['after']

        # Validate that the files are not empty
        if not before_file or not after_file:
            logger.warning("One or both uploaded files are empty")
            return jsonify({"error": "Before and after images cannot be empty"}), 400

        import uuid
        request_id = str(uuid.uuid4())

        before_filename = secure_filename(f"before_{request_id}.jpg")
        after_filename = secure_filename(f"after_{request_id}.jpg")

        before_path = os.path.join(TEMP_DIR, before_filename)
        after_path = os.path.join(TEMP_DIR, after_filename)

        # Save the files
        before_file.save(before_path)
        after_file.save(after_path)

        # Add paths to temp_files for cleanup
        temp_files.extend([before_path, after_path])

        score, plot_filename = perform_transformation_analysis(before_path, after_path)
        logger.info(f"Transformation analysis complete. Score: {score}%")

        if isinstance(score, np.floating):
            score = float(score)

        result = {
            "score": score,
            "message": "Analysis completed successfully",
            "plot_path": f"temp_images_flask/{plot_filename}"
        }

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error in /analyze: {str(e)}")
        return jsonify({"error": str(e)}), 500

    finally:
        # Clean up temporary files
        for path in temp_files:  # Only iterate over files that were actually created
            if os.path.exists(path):
                try:
                    os.remove(path)
                    logger.debug(f"Removed temporary file: {path}")
                except Exception as e:
                    logger.error(f"Failed to remove temporary file {path}: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)