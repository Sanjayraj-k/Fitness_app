import numpy as np
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
import cv2
import matplotlib.pyplot as plt
import os

# Load the MobileNetV2 model
model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')

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
    print(f"Feature vector shape for {img_path}: {features.shape}")
    return normalize(features)  # Normalize features for stable similarity

def analyze_transformation(image_before, image_after):
    try:
        # Extract features
        features_before = get_feature_vector(image_before)
        features_after = get_feature_vector(image_after)
        
        # Compute cosine similarity
        similarity = cosine_similarity(features_before, features_after)[0][0]
        
        # Compute transformation score: 0% (identical) to 100% (completely different)
        transformation_percentage = (1 - similarity) * 100
        
        # Display results
        print(f"Cosine Similarity: {similarity:.4f} ({similarity*100:.2f}%)")
        print(f"Body Transformation Score: {transformation_percentage:.2f}%")
        
        # Load and visualize the images
        img_before = cv2.imread(image_before)
        if img_before is None:
            raise ValueError(f"Failed to load image: {image_before}")
        img_before = cv2.cvtColor(img_before, cv2.COLOR_BGR2RGB)
        
        img_after = cv2.imread(image_after)
        if img_after is None:
            raise ValueError(f"Failed to load image: {image_after}")
        img_after = cv2.cvtColor(img_after, cv2.COLOR_BGR2RGB)
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))
        ax1.imshow(img_before)
        ax1.set_title('Before')
        ax1.axis('off')
        
        ax2.imshow(img_after)
        ax2.set_title('After')
        ax2.axis('off')
        
        plt.suptitle(f"Transformation Analysis: {transformation_percentage:.2f}% Change", fontsize=16)
        plt.tight_layout()
        plt.savefig("transformation_analysis.png")
        plt.show()
        
        return transformation_percentage
    
    except Exception as e:
        print(f"Error during analysis: {e}")
        return 0.0

if __name__ == "__main__":
    # Replace with your image file paths
    image_before = 'copy1before.jpg'
    image_after = 'copy1after.jpg'  # Ensure this is a different image
    
    # Verify images exist
    if not (os.path.exists(image_before) and os.path.exists(image_after)):
        print(f"Error: One or both images not found. Check paths:\n- {image_before}\n- {image_after}")
    else:
        # Run the analysis
        transformation_score = analyze_transformation(image_before, image_after)
        print(f"Final Transformation Score: {transformation_score:.2f}%")