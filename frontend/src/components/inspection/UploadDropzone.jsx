import { useState, useRef } from 'react';

export default function UploadDropzone({ onFileDrop, title = "Drag and drop images here", accept = "image/*", multiple = true }) {
  const [isDragged, setIsDragged] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragged(true);
  };

  const handleDragLeave = () => {
    setIsDragged(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragged(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDrop(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileDrop(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
        isDragged 
          ? 'border-teal-500 bg-teal-50 ring-4 ring-teal-50' 
          : 'border-teal-200 bg-teal-50/20 hover:bg-teal-50 hover:border-teal-300'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full transition-colors ${isDragged ? 'bg-teal-200 text-teal-700' : 'bg-teal-100 text-teal-600'}`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
        </div>
        <div>
          <p className="text-base font-bold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold font-serif">Supported formats: JPG, PNG, WEBP</p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center rounded-xl bg-white border border-teal-200 px-6 py-2 text-sm font-bold text-teal-900 hover:bg-teal-100 hover:border-teal-300 shadow-sm transition-all active:scale-[0.98]"
          >
            Browse Local Files
          </button>
        </div>
      </div>
    </div>
  );
}

