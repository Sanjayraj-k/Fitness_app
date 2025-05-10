import numpy as np
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
import cv2
import matplotlib.pyplot as plt
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import base64
from io import BytesIO
import shutil
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native frontend

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load the MobileNetV2 model
model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')

# Create a temporary directory for image storage
TEMP_DIR = "temp_images"
os.makedirs(TEMP_DIR, exist_ok=True)

def preprocess(img_path):
    if not os.path.exists(img_path):
        raise FileNotFoundError(f"Image not found: {img_path}")
    img = image.load_img(img_path, target_size=(224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    return preprocess_input(x)

def get_feature_vector(img_path):
    x = preprocess(img_path)
    features = model.predict(x)
    logger.debug(f"Feature vector shape for {img_path}: {features.shape}")
    return normalize(features)

def analyze_transformation(image_before_path, image_after_path):
    try:
        # Verify images can be loaded
        img_before = cv2.imread(image_before_path)
        if img_before is None:
            raise ValueError(f"Failed to load image: {image_before_path}")
        img_after = cv2.imread(image_after_path)
        if img_after is None:
            raise ValueError(f"Failed to load image: {image_after_path}")

        # Extract features
        features_before = get_feature_vector(image_before_path)
        features_after = get_feature_vector(image_after_path)
        
        # Compute cosine similarity
        similarity = cosine_similarity(features_before, features_after)[0][0]
        
        # Compute transformation score
        transformation_percentage = (1 - similarity) * 100
        
        # Convert images to RGB for visualization
        img_before = cv2.cvtColor(img_before, cv2.COLOR_BGR2RGB)
        img_after = cv2.cvtColor(img_after, cv2.COLOR_BGR2RGB)
        
        # Create plot
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))
        ax1.imshow(img_before)
        ax1.set_title('Before')
        ax1.axis('off')
        
        ax2.imshow(img_after)
        ax2.set_title('After')
        ax2.axis('off')
        
        plt.suptitle(f"Transformation Analysis: {transformation_percentage:.2f}% Change", fontsize=16)
        plt.tight_layout()
        
        # Save plot to BytesIO and encode to base64
        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close(fig)
        buf.seek(0)
        plot_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        buf.close()
        
        return transformation_percentage, plot_base64
    
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise Exception(f"Analysis error: {str(e)}")

@app.route('/analyze', methods=['POST'])
def analyze_images():
    try:
        logger.debug("Received POST request to /analyze")
        logger.debug(f"Request files: {request.files}")

        # Check if images are provided
        if 'before' not in request.files or 'after' not in request.files:
            logger.error("Missing before or after image")
            return jsonify({'error': 'Missing before or after image'}), 400
        
        before_file = request.files['before']
        after_file = request.files['after']
        logger.debug(f"Before file: {before_file.filename}")
        logger.debug(f"After file: {after_file.filename}")

        # Check if files are empty
        if before_file.filename == '' or after_file.filename == '':
            logger.error("Empty file uploaded")
            return jsonify({'error': 'Empty file uploaded'}), 400

        # Validate file extensions
        allowed_extensions = {'.jpg', '.jpeg', '.png'}
        before_ext = os.path.splitext(before_file.filename)[1].lower()
        after_ext = os.path.splitext(after_file.filename)[1].lower()
        logger.debug(f"Before extension: {before_ext}")
        logger.debug(f"After extension: {after_ext}")

        if before_ext not in allowed_extensions or after_ext not in allowed_extensions:
            logger.error(f"Invalid file format: before={before_ext}, after={after_ext}")
            return jsonify({'error': 'Invalid file format. Use JPG or PNG'}), 400

        # Check file size (e.g., max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        before_file.seek(0, os.SEEK_END)
        after_file.seek(0, os.SEEK_END)
        if before_file.tell() > max_size or after_file.tell() > max_size:
            logger.error("File size exceeds 10MB limit")
            return jsonify({'error': 'File size exceeds 10MB limit'}), 400
        before_file.seek(0)
        after_file.seek(0)

        # Generate unique filenames
        unique_id = str(uuid.uuid4())
        before_path = os.path.join(TEMP_DIR, f"before_{unique_id}{before_ext}")
        after_path = os.path.join(TEMP_DIR, f"after_{unique_id}{after_ext}")
        logger.debug(f"Saving files: {before_path}, {after_path}")

        # Save uploaded images
        before_file.save(before_path)
        after_file.save(after_path)

        # Verify saved files exist and are readable
        if not os.path.exists(before_path) or not os.path.exists(after_path):
            logger.error("Failed to save one or both images")
            return jsonify({'error': 'Failed to save images'}), 500

        # Run analysis
        transformation_score, plot_base64 = analyze_transformation(before_path, after_path)
        logger.debug(f"Analysis complete: score={transformation_score}")

        # Clean up temporary files
        for path in [before_path, after_path]:
            if os.path.exists(path):
                os.remove(path)
        
        # Return response
        return jsonify({
            'transformation_score': round(transformation_score, 2),
            'plot': f"data:image/png;base64,{plot_base64}"
        })
    
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        # Clean up any temporary files in case of error
        for path in [before_path, after_path]:
            if 'path' in locals() and os.path.exists(path):
                os.remove(path)
        return jsonify({'error': str(e)}), 500

@app.teardown_appcontext
def cleanup_temp_dir(exception=None):
    """Clean up temporary directory on app shutdown."""
    logger.debug("Cleaning up temp directory")
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR, ignore_errors=True)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)