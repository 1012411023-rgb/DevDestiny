import { useState } from 'react';
import { categories } from '../../data/categories';

export default function CreateTemplateForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0].name,
    description: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-teal-100 bg-white p-8 shadow-sm space-y-6">
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Template Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Matte Glazed Tile 300x300"
            className="w-full rounded-xl border border-teal-100 bg-teal-50/20 px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Industry Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-teal-100 bg-teal-50/20 px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
            >
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="block text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Inspection Notes</label>
            <input
              type="text"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Focus on edges"
              className="w-full rounded-xl border border-teal-100 bg-teal-50/20 px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Detailed Product Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Briefly describe the product's normal appearance..."
            className="w-full rounded-xl border border-teal-100 bg-teal-50/20 px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all resize-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="pt-6 flex items-center justify-end gap-3 border-t border-teal-50">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-teal-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 shadow-sm transition-all active:scale-[0.98]"
        >
          Save and Continue
        </button>
      </div>

    </form>
  );
}

