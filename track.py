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

def get_user_weights():
    """Prompt user for weight before and after training."""
    try:
        weight_before = float(input("Enter weight before training (in kg): "))
        weight_after = float(input("Enter weight after training (in kg): "))
        if weight_before <= 0 or weight_after <= 0:
            raise ValueError("Weights must be positive numbers.")
        return weight_before, weight_after
    except ValueError as e:
        print(f"Error: Invalid input. {e}")
        return None, None

def estimate_fat_loss_percentage(weight_before, weight_after):
    """Estimate fat loss percentage based on weight change."""
    try:
        weight_change = weight_before - weight_after
        if weight_change < 0:
            print("Warning: Weight increased, assuming no fat loss for percentage calculation.")
            return 0.0, weight_change, "gain"
        
        # For weight loss: assume 90% of weight loss is fat
        fat_loss = weight_change * 0.9
        fat_loss_percentage = (fat_loss / weight_before) * 100
        return fat_loss_percentage, weight_change, "loss"
    except Exception as e:
        print(f"Error in fat loss calculation: {e}")
        return 0.0, 0.0, "loss"

def calculate_body_transformation_percentage(image_similarity, weight_before, weight_after):
    """
    Calculate overall body transformation percentage by combining image-based
    and weight-based transformations.
    """
    # Image-based transformation: 0% (identical) to 100% (completely different)
    image_transformation = (1 - image_similarity) * 100
    
    # Weight-based transformation: Percentage of absolute weight change relative to starting weight
    weight_change = abs(weight_before - weight_after)
    weight_transformation = (weight_change / weight_before) * 100
    
    # Combine: 70% weight on image transformation, 30% on weight change (adjustable)
    overall_transformation = (0.7 * image_transformation) + (0.3 * min(weight_transformation, 50))  # Cap weight contribution
    return overall_transformation, image_transformation, weight_transformation

def analyze_transformation(image_before, image_after):
    try:
        # Get weights from user
        weight_before, weight_after = get_user_weights()
        if weight_before is None or weight_after is None:
            raise ValueError("Invalid weight inputs. Analysis aborted.")
        
        # Extract features from images
        features_before = get_feature_vector(image_before)
        features_after = get_feature_vector(image_after)
        
        # Compute cosine similarity
        similarity = cosine_similarity(features_before, features_after)[0][0]
        
        # Calculate body transformation percentage
        overall_transformation, image_transformation, weight_transformation = calculate_body_transformation_percentage(
            similarity, weight_before, weight_after
        )
        
        # Estimate fat loss percentage and determine weight change type
        fat_loss_percentage, weight_change, change_type = estimate_fat_loss_percentage(weight_before, weight_after)
        
        # Prepare weight change string
        weight_change_str = f"Weight {'Loss' if change_type == 'loss' else 'Gain'}: {abs(weight_change):.2f} kg"
        
        # Display results
        print(f"Cosine Similarity: {similarity:.4f} ({similarity*100:.2f}%)")
        print(f"Image-based Transformation: {image_transformation:.2f}%")
        print(f"Weight-based Transformation: {weight_transformation:.2f}%")
        print(f"Overall Body Transformation Score: {overall_transformation:.2f}%")
        print(f"Weight Before: {weight_before:.2f} kg, Weight After: {weight_after:.2f} kg")
        print(weight_change_str)
        print(f"Estimated Fat Loss Percentage: {fat_loss_percentage:.2f}%")
        
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
        
        plt.suptitle(f"Transformation Analysis (Approximate)\n"
                     f"Body Transformation: {overall_transformation:.2f}% | "
                     f"Fat Loss: {fat_loss_percentage:.2f}% | "
                     f"{weight_change_str}\n"
                     f"Note: Results are approximate and not accurate.", fontsize=16)
        plt.tight_layout()
        plt.savefig("transformation_analysis.png")
        plt.show()
        
        return overall_transformation, fat_loss_percentage, weight_change, change_type
    
    except Exception as e:
        print(f"Error during analysis: {e}")
        return 0.0, 0.0, 0.0, "loss"

if __name__ == "__main__":
    # Replace with your image file paths
    image_before = 'copy1before.jpg'
    image_after = 'copy1after.jpg'  # Fixed from 'copy1before.jpg' to 'copy1after.jpg'
    
    # Verify images exist
    if not (os.path.exists(image_before) and os.path.exists(image_after)):
        print(f"Error: One or both images not found. Check paths:\n- {image_before}\n- {image_after}")
    else:
        # Run the analysis
        transformation_score, fat_loss_score, weight_change, change_type = analyze_transformation(image_before, image_after)
        weight_change_str = f"Weight {'Loss' if change_type == 'loss' else 'Gain'}: {abs(weight_change):.2f} kg"
        print(f"Final Results:")
        print(f"Overall Body Transformation Score: {transformation_score:.2f}%")
        print(f"Estimated Fat Loss Percentage: {fat_loss_score:.2f}%")
        print(weight_change_str)