import sys
import os
# Ensure we can import from the backend directory
sys.path.append(os.getcwd())

from ai.calibrate import calibrate
import torch
import glob

# Try to find images in the ashitosh directory
image_dir = 'uploads/ashitosh'
if not os.path.exists(image_dir):
    print(f"Directory {image_dir} not found!")
    sys.exit(1)

image_paths = glob.glob(os.path.join(image_dir, "*.png"))
output_path = 'models/test_model.pkl'

print(f"Testing calibration with {len(image_paths)} images...")
if not image_paths:
    print("No images found!")
    sys.exit(1)

try:
    threshold = calibrate(image_paths, output_path)
    print(f"✅ SUCCESS! Threshold: {threshold}")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"❌ FAILED: {str(e)}")
