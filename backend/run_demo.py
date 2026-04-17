import os
import glob
from ai.calibrate import calibrate_product
from ai.inference import inspect_image
import base64

def run_test():
    # 1. Setup paths
    upload_dir = 'uploads'
    product_id = 'ceramic_test'
    
    # Let's use images ceramic_003.png to ceramic_017.png for calibration (15 images)
    # These are presumably 'good' images
    calibration_images = glob.glob(os.path.join(upload_dir, 'ceramic_0*.png'))
    print(f"Found {len(calibration_images)} images for calibration.")
    
    # 2. Calibration
    print(f"Starting calibration for product: {product_id}...")
    # Since calibrate_product takes a folder path, let's create a temporary calibration folder
    calib_folder = os.path.join(upload_dir, 'calib_temp')
    os.makedirs(calib_folder, exist_ok=True)
    import shutil
    for img_path in calibration_images:
        shutil.copy(img_path, calib_folder)
        
    try:
        model_path = calibrate_product(product_id, calib_folder)
        print(f"✅ Calibration complete! Model saved at: {model_path}")
    except Exception as e:
        print(f"❌ Calibration failed: {e}")
        return

    # 3. Testing/Inference
    # Let's test with ceramic_1.jpeg to ceramic_6.jpeg
    test_images = glob.glob(os.path.join(upload_dir, 'ceramic_[1-6].jpeg'))
    print(f"\nFound {len(test_images)} images for testing.")
    
    for img_path in test_images:
        print(f"\nInspecting: {img_path}...")
        try:
            result = inspect_image(product_id, img_path)
            print(f"  Anomaly Score: {result['anomaly_score']:.2f}")
            print(f"  Pass: {result['pass']}")
            
            # Save the heatmap to a file to verify
            heatmap_data = base64.b64decode(result['heatmap_base64'])
            output_heatmap_path = f"heatmap_{os.path.basename(img_path)}.png"
            with open(output_heatmap_path, "wb") as f:
                f.write(heatmap_data)
            print(f"  Heatmap saved as: {output_heatmap_path}")
            
        except Exception as e:
            print(f"  ❌ Inspection failed: {e}")

if __name__ == "__main__":
    run_test()
