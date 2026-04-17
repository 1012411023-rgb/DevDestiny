import { createContext, useContext, useState, useEffect } from 'react';
import { templateService } from '../services/templateService';

const TemplateContext = createContext();

export const useTemplates = () => useContext(TemplateContext);

export const TemplateProvider = ({ children }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const data = await templateService.getTemplates();
        setTemplates(data);
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const addTemplate = async (templateData) => {
    try {
      const newTemplate = await templateService.createTemplate(templateData);
      setTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    } catch (err) {
      console.error('Failed to create template:', err);
      throw err;
    }
  };

  const updateTemplateStatus = (id, status, count) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, status, referenceImageCount: count || t.referenceImageCount, updatedAt: new Date().toISOString() } : t));
  };

  return (
    <TemplateContext.Provider value={{ templates, selectedTemplate, setSelectedTemplate, addTemplate, updateTemplateStatus, loading }}>
      {children}
    </TemplateContext.Provider>
  );
};
