import torch
import numpy as np
import pickle
import cv2
from scipy.ndimage import gaussian_filter
from .feature_extractor import get_extractor


def run_inference(image_path, model_path):
    """
    Returns:
      heatmap_bgr: np.array (H, W, 3) — colored heatmap
      score: float — anomaly score (0-100)
      status: "PASS" or "FAIL"
      overlay: np.array — heatmap blended on original image
    """
    # Load model
    with open(model_path, "rb") as f:
        model_data = pickle.load(f)

    mean = torch.tensor(model_data["mean"])  # (C, H*W)
    cov_inv = torch.tensor(model_data["cov_inv"])  # (H*W, C, C)
    threshold = model_data["threshold"]
    H, W = model_data["spatial_size"]

    # Extract features from test image
    extractor = get_extractor()
    img_tensor = extractor.load_image(image_path)
    features = extractor.extract(img_tensor)  # (1, C, H, W)
    features = features.squeeze(0)  # (C, H, W)
    C = features.shape[0]

    # Reshape → (H*W, C)
    diff = (features.reshape(C, H * W) - mean).T  # (H*W, C)

    # Mahalanobis distance per pixel
    dist_map = (
        torch.sqrt(
            torch.clamp(torch.einsum("bi,bij,bj->b", diff, cov_inv, diff), min=0)
        )
        .reshape(H, W)
        .numpy()
    )  # (H, W)

    # Smooth the raw distance map
    dist_map = gaussian_filter(dist_map, sigma=2)

    # Upsample to 224x224
    score_map = cv2.resize(dist_map, (224, 224), interpolation=cv2.INTER_LINEAR)

    # Per-image normalization
    s_min, s_max = score_map.min(), score_map.max()
    if s_max - s_min > 1e-6:
        score_norm = (score_map - s_min) / (s_max - s_min)
    else:
        score_norm = np.zeros_like(score_map)

    # Anomaly score = max of normalized map (0-100)
    anomaly_score = float(score_norm.max() * 100)

    # PASS/FAIL using calibrated threshold
    # Normalize threshold to same scale
    thresh_norm = (threshold - s_min) / (s_max - s_min + 1e-6)
    status = "FAIL" if score_norm.max() > thresh_norm else "PASS"

    # Generate heatmap
    heatmap_bgr = cv2.applyColorMap(
        (score_norm * 255).astype(np.uint8), cv2.COLORMAP_JET
    )

    # Load original image and blend
    original = cv2.imread(image_path)
    original = cv2.resize(original, (224, 224))
    overlay = cv2.addWeighted(original, 0.5, heatmap_bgr, 0.5, 0)

    return {
        "heatmap": heatmap_bgr,
        "overlay": overlay,
        "score": round(anomaly_score, 2),
        "status": status,
        "threshold": round(threshold, 4),
    }
