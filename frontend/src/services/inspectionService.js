const API_BASE_URL = `http://${window.location.hostname}:5005/api`;

export const inspectionService = {
  async getInspections() {
    const response = await fetch(`${API_BASE_URL}/inspections`);
    if (!response.ok) throw new Error('Failed to fetch inspection history');
    return await response.json();
  },

  async runInspection(file, templateId) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/products/${templateId}/inspect`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Inspection failed');
    }

    return await response.json();
  }
};
