const API_BASE_URL = `http://${window.location.hostname}:5005/api`;

const templateService = {
  async getTemplates() {
    const response = await fetch(`${API_BASE_URL}/templates`);
    if (!response.ok) throw new Error('Failed to fetch templates');
    return await response.json();
  },

  async createTemplate(templateData) {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });
    if (!response.ok) throw new Error('Failed to create template');
    return await response.json();
  },

  async calibrateTemplate(templateId, images) {
    const formData = new FormData();
    // Assuming 'images' are File objects
    for (let i = 0; i < images.length; i++) {
        formData.append('files', images[i]);
    }
    
    const response = await fetch(`${API_BASE_URL}/products/${templateId}/calibrate`, {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Calibration failed');
    }
    return await response.json();
  }
};

export { templateService };
export default templateService;
