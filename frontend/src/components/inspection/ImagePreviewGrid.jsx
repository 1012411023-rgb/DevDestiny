export default function ImagePreviewGrid({ images, onRemove }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {images.map((img, idx) => {
        const url = img instanceof File ? URL.createObjectURL(img) : img.url;
        return (
          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-teal-100 bg-teal-50 shadow-inner">
            <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-teal-900/0 group-hover:bg-teal-900/20 transition-all"></div>
            <button
              type="button"
              onClick={() => onRemove && onRemove(idx)}
              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600 shadow-sm border border-teal-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

