import torch
import torch.nn.functional as F
import torchvision.models as models
import torchvision.transforms as transforms
import numpy as np
from PIL import Image
import ssl

# Fix for macOS certificate verification error when downloading model weights
ssl._create_default_https_context = ssl._create_unverified_context

# ── Shared transform (use this EVERYWHERE) ──────────
TRANSFORM = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


class FeatureExtractor:
    def __init__(self):
        backbone = models.resnet50(pretrained=True)
        backbone.eval()

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        backbone = backbone.to(self.device)

        self.layer2_out = None
        self.layer3_out = None

        # Register hooks on layer2 and layer3 ONLY
        backbone.layer2.register_forward_hook(
            lambda m, i, o: setattr(self, "layer2_out", o)
        )
        backbone.layer3.register_forward_hook(
            lambda m, i, o: setattr(self, "layer3_out", o)
        )

        self.backbone = backbone

        # PaDiM specific: Randomly select 256 dimensions out of 1536
        # to dramatically reduce covariance array size and inversion speeds
        np.random.seed(42)
        self.idx = torch.tensor(np.random.choice(1536, 256, replace=False)).to(
            self.device
        )

    def extract(self, image_tensor):
        """
        image_tensor: (1, 3, 224, 224)
        Returns concatenated feature map resized to (1, C, 28, 28)
        """
        with torch.no_grad():
            self.backbone(image_tensor.to(self.device))

        f2 = self.layer2_out  # (1, 512, 28, 28)
        f3 = self.layer3_out  # (1, 1024, 14, 14)

        # Resize layer3 to match layer2 spatial dims
        f3_up = F.interpolate(
            f3, size=f2.shape[-2:], mode="bilinear", align_corners=False
        )

        # Concatenate along channel dim → (1, 1536, 28, 28)
        combined = torch.cat([f2, f3_up], dim=1)

        # Dimension reduction to 256 for rapid model computation
        combined = torch.index_select(combined, 1, self.idx)
        return combined.cpu()

    def load_image(self, path):
        img = Image.open(path).convert("RGB")
        return TRANSFORM(img).unsqueeze(0)  # (1,3,224,224)


_extractor_instance = None


def get_extractor():
    global _extractor_instance
    if _extractor_instance is None:
        _extractor_instance = FeatureExtractor()
    return _extractor_instance
