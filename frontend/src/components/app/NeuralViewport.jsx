import { useRef, useEffect, useState } from 'react';
import { Camera, AlertCircle, CheckCircle2, X, RefreshCw, Loader, Activity } from 'lucide-react';

export default function NeuralViewport({ onCapture, onLiveFrame, onClose, isInspecting }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null); // base64 preview of frozen frame
  const [isFlashing, setIsFlashing] = useState(false);
  const [result, setResult] = useState(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not available (requires HTTPS or localhost).');
        }

        let mediaStream;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
          });
        } catch (initialErr) {
          console.warn('Primary camera config failed, attempting fallback...', initialErr);
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Camera error:', err);
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please click the site settings icon in your URL bar, allow the camera, and refresh the page.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera device found plugged into this computer.');
        } else {
          setError('Camera error: ' + (err.message || 'Unknown error occurred.'));
        }
      }
    }
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || isInspecting) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    
    const sWidth = canvas.width / zoomLevel;
    const sHeight = canvas.height / zoomLevel;
    const sx = (canvas.width - sWidth) / 2;
    const sy = (canvas.height - sHeight) / 2;

    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

    // Freeze: show captured frame as image
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    setResult(null);

    // Shutter flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    // Convert to File and send to AI
    canvas.toBlob((blob) => {
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      onCapture(file, (aiResult) => {
        setResult(aiResult);
      });
    }, 'image/jpeg', 0.9);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setResult(null);
  };

  useEffect(() => {
    let intervalId;
    
    if (isLiveMode && videoRef.current && canvasRef.current && onLiveFrame) {
      intervalId = setInterval(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (video.videoWidth === 0) return;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        
        const sWidth = canvas.width / zoomLevel;
        const sHeight = canvas.height / zoomLevel;
        const sx = (canvas.width - sWidth) / 2;
        const sy = (canvas.height - sHeight) / 2;

        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (!blob) return;
          const file = new File([blob], 'live_frame.jpg', { type: 'image/jpeg' });
          onLiveFrame(file, (aiResult) => {
            setResult(aiResult);
          });
        }, 'image/jpeg', 0.8);
      }, 1000); // Poll every 1 second
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLiveMode, onLiveFrame, zoomLevel]);

  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode);
    setResult(null);
    setCapturedImage(null);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-12 text-center space-y-4">
        <AlertCircle className="mx-auto text-red-400" size={40} />
        <p className="text-red-800 font-medium text-sm">{error}</p>
        <button onClick={onClose} className="text-sm text-gray-500 underline">Go back</button>
      </div>
    );
  }

  const isPass = result?.status === 'pass';

  return (
    <div className="space-y-4">
      {/* Grid structure for side-by-side */}
      <div className={`grid gap-4 transition-all duration-500 ${result?.heatmap_base64 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Viewfinder */}
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-lg border border-gray-200">

        {/* Shutter flash */}
        {isFlashing && <div className="absolute inset-0 bg-white z-20 pointer-events-none" />}

        {/* Live video feed (hidden when image captured) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ transform: `scale(${zoomLevel})` }}
          className={`w-full h-full object-cover transition-transform duration-100 ${capturedImage ? 'hidden' : 'block'}`}
        />

        {/* Frozen captured frame */}
        {capturedImage && (
          <img src={capturedImage} alt="Captured frame" className="w-full h-full object-cover" />
        )}

        {/* Removed internal heatmap overlay to move it side-by-side */}

        {/* Corner guides (only on live feed) */}
        {!capturedImage && (
          <div className="absolute inset-[12%] pointer-events-none">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400" />
          </div>
        )}

        {/* Processing overlay */}
        {capturedImage && isInspecting && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 z-10">
            <Loader className="text-white animate-spin" size={36} />
            <span className="text-white font-semibold text-sm tracking-wide">Analyzing frame...</span>
          </div>
        )}

        {/* Result overlay */}
        {result && !isInspecting && !isLiveMode && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
            <div className={`px-8 py-5 rounded-2xl flex flex-col items-center gap-2 shadow-2xl border-2 ${isPass ? 'bg-green-500/90 border-green-400' : 'bg-red-500/90 border-red-400'} text-white`}>
              {isPass ? <CheckCircle2 size={44} /> : <AlertCircle size={44} />}
              <span className="text-3xl font-black uppercase tracking-tight">{result.status}</span>
              <span className="text-sm font-semibold opacity-90">{isPass ? 'Uniform surface detected' : 'Anomaly found'}</span>
            </div>
          </div>
        )}

        {/* Live Mode Result Float */}
        {result && isLiveMode && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 pointer-events-none">
            <div className={`px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border backdrop-blur-md ${isPass ? 'bg-green-500/80 border-green-300' : 'bg-red-500/80 border-red-300'} text-white`}>
              {isPass ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              <span className="text-xl font-bold uppercase tracking-wide">{result.status}</span>
              <div className="w-px h-6 bg-white/40 mx-1" />
              <span className="text-sm font-bold tracking-wide">{isPass ? 'Uniform surface' : 'Anomaly found'}</span>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full border border-gray-200 text-gray-600 shadow z-30"
        >
          <X size={16} />
        </button>
      </div>

      {/* Side Heatmap View */}
      {result?.heatmap_base64 && (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-lg border border-gray-200 animate-in fade-in duration-300">
          <img 
            src={`data:image/jpeg;base64,${result.heatmap_base64}`} 
            className="w-full h-full object-cover"
            alt="Anomaly Heatmap" 
          />
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-md font-semibold tracking-wide shadow-sm border border-white/10">
            Inference Heatmap
          </div>
          {!isLiveMode && (
            <div className={`absolute bottom-3 left-3 px-4 py-2 rounded-lg text-white text-sm font-bold shadow-md ${isPass ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
              {isPass ? 'PASS' : 'FAIL'}
            </div>
          )}
        </div>
      )}
    </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Zoom Control */}
      {!capturedImage && (
        <div className="flex items-center justify-center gap-4 px-6 bg-white py-4 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 transform scale-100">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Zoom</span>
          <input
            type="range"
            min="1"
            max="4"
            step="0.1"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="w-full max-w-[200px] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 outline-none"
          />
          <span className="text-sm font-bold text-gray-700 w-8">{zoomLevel.toFixed(1)}x</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!capturedImage ? (
          <>
            <button
              onClick={handleCapture}
              disabled={isInspecting || isLiveMode}
              className={`flex items-center gap-2 px-8 py-3 ${isLiveMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold rounded-full shadow-md transition-all active:scale-95`}
            >
              <Camera size={18} />
              Capture & Inspect
            </button>
            <button
              onClick={toggleLiveMode}
              className={`flex items-center gap-2 px-8 py-3 outline-none focus:outline-none font-bold rounded-full shadow-md transition-all active:scale-95 ${isLiveMode ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
              <Activity size={18} />
              {isLiveMode ? 'Stop Live Scan' : 'Start Live Scan'}
            </button>
          </>
        ) : (
          <button
            onClick={handleRetake}
            disabled={isInspecting}
            className="flex items-center gap-2 px-8 py-3 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold rounded-full shadow-md transition-all active:scale-95"
          >
            <RefreshCw size={18} />
            Retake
          </button>
        )}
      </div>
    </div>
  );
}
