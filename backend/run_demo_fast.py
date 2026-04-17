import os
import glob
import shutil
from ai.calibrate import calibrate_product
from ai.inference import inspect_image
import base64

def run_test():
    # 1. Setup paths
    upload_dir = 'uploads'
    product_id = 'ceramic_test_fast'
    
    # Use only 5 images for fast test
    calibration_images = glob.glob(os.path.join(upload_dir, 'ceramic_00[0-4].png'))
    print(f"Found {len(calibration_images)} images for calibration.")
    
    calib_folder = os.path.join(upload_dir, 'calib_temp_fast')
    if os.path.exists(calib_folder):
        shutil.rmtree(calib_folder)
    os.makedirs(calib_folder, exist_ok=True)
    
    for img_path in calibration_images:
        shutil.copy(img_path, calib_folder)
        
    print(f"Starting calibration for product: {product_id}...")
    try:
        model_path = calibrate_product(product_id, calib_folder)
        print(f"✅ Calibration complete! Model saved at: {model_path}")
    except Exception as e:
        print(f"❌ Calibration failed: {e}")
        return

    # Test with one image
    test_image = os.path.join(upload_dir, 'ceramic_015.png')
    if os.path.exists(test_image):
        print(f"\nInspecting: {test_image}...")
        try:
            result = inspect_image(product_id, test_image)
            print(f"  Anomaly Score: {result['anomaly_score']:.2f}")
            print(f"  Pass: {result['pass']}")
            print(f"  Heatmap (Base64 length): {len(result['heatmap_base64'])}")
            
            # Save heatmap
            heatmap_data = base64.b64decode(result['heatmap_base64'])
            with open("test_heatmap.png", "wb") as f:
                f.write(heatmap_data)
            print("  ✅ Heatmap saved as 'test_heatmap.png'")
        except Exception as e:
            print(f"  ❌ Inspection failed: {e}")

if __name__ == "__main__":
    run_test()
