const API_BASE_URL = "http://localhost:5005";

export const api = {
  // Placeholder for any categories if needed by frontend
  async getCategories() {
    return [{ id: 'Textile', name: 'Textile' }, { id: 'Ceramic', name: 'Ceramic' }, { id: 'Metal', name: 'Metal' }];
  },

  async getProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('getProducts Error:', error);
      throw error;
    }
  },

  async getStats(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('getStats Error:', error);
      throw error;
    }
  },

  async calibrate(productId, files) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/calibrate`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Calibration failed');
      return await response.json();
    } catch (error) {
      console.error('Calibration Error:', error);
      throw error;
    }
  },

  async inspect(productId, file, isLive = false) {
    const formData = new FormData();
    formData.append('file', file);
    if (isLive) {
      formData.append('live', 'true');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/inspect`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Inspection inference failed');
      }
      return await response.json(); // { anomaly_score, pass, heatmap_base64 }
    } catch (error) {
      console.error('Inspection Error:', error);
      throw error;
    }
  },

  async overrideStatus(inspectionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inspections/${inspectionId}/pass-override`, {
        method: 'POST'
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to override status');
      }
      return await response.json();
    } catch (error) {
      console.error('Override Error:', error);
      throw error;
    }
  },

  async downloadReport(inspectionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inspections/${inspectionId}/report`);
      if (!response.ok) throw new Error('Failed to download report');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Report_${inspectionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Download Report Error:', error);
      throw error;
    }
  }
};
