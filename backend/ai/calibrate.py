import torch
import numpy as np
import pickle
import os
from .feature_extractor import get_extractor


def calibrate(image_paths, output_path):
    """
    image_paths: list of paths to GOOD/normal training images
    output_path: where to save .pkl model file
    """
    extractor = get_extractor()
    all_features = []  # list of (B, C, H, W) tensors

    # Process in batches
    batch_size = 16
    for i in range(0, len(image_paths), batch_size):
        batch_paths = image_paths[i : i + batch_size]
        batch_tensors = [extractor.load_image(p).squeeze(0) for p in batch_paths]
        batch_img_tensor = torch.stack(batch_tensors, dim=0)

        features = extractor.extract(batch_img_tensor)  # (B, C, 28, 28)
        all_features.append(features)

    # Stack/cat → (N, C, H, W)
    all_features = torch.cat(all_features, dim=0)
    N, C, H, W = all_features.shape

    # Reshape → (N, C, H*W)
    feats = all_features.reshape(N, C, H * W)

    # Per-pixel mean and covariance
    mean = feats.mean(dim=0)  # (C, H*W)
    eps = 0.01

    # Vectorized covariance calculation
    # feats is (N, C, H*W) -> permute to (H*W, N, C) for batched matmul
    x = feats.permute(2, 0, 1)  # (H*W, N, C)
    x_centered = x - x.mean(dim=1, keepdim=True)  # (H*W, N, C)

    # Batch matrix multiplication: (H*W, C, N) @ (H*W, N, C) -> (H*W, C, C)
    cov = torch.bmm(x_centered.transpose(1, 2), x_centered) / (N - 1)

    # Regularization
    cov_reg = cov + eps * torch.eye(C).unsqueeze(0)

    # Batched matrix inversion
    cov_inv_tensor = torch.linalg.inv(cov_reg)  # (H*W, C, C)

    # Compute train scores for threshold
    diff = feats - mean.unsqueeze(0)  # (N, C, H*W)
    diff = diff.permute(0, 2, 1)  # (N, H*W, C)

    # Batched Mahalanobis distance
    dists_sq = torch.einsum("nbi,bij,nbj->nb", diff, cov_inv_tensor, diff)
    dists = torch.sqrt(torch.clamp(dists_sq, min=0))  # (N, H*W)

    train_scores = dists.reshape(N, H, W)
    flat = train_scores.reshape(-1)
    threshold = float(flat.mean() + 2.5 * flat.std())

    model_data = {
        "mean": mean.numpy(),  # (C, H*W)
        "cov_inv": cov_inv_tensor.numpy(),  # (H*W, C, C)
        "threshold": threshold,
        "spatial_size": (H, W),
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        pickle.dump(model_data, f)

    print(f"✅ Calibration done. Threshold={threshold:.4f}")
    return threshold
