from ai.feature_extractor import FeatureExtractor
from PIL import Image
import numpy as np
import os

extractor = FeatureExtractor()

# create a dummy image if any_image.jpg doesn't exist
if not os.path.exists("any_image.jpg"):
    Image.new("RGB", (224, 224), color="red").save("any_image.jpg")

img = Image.open("any_image.jpg")  # drag any jpg into backend/
features = extractor.extract(img)
print("Feature shape:", features.shape)
print("✅ Model working!" if features is not None else "❌ Failed")
