import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { 
  Layers, 
  Grid3X3, 
  Cpu,
  ArrowRight
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5005/api';

const ICON_MAP = {
  textile: Layers,
  ceramic: Grid3X3,
  metal: Cpu
};

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError('System Connectivity Failure. Could not reach industry library.');
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const handleSelect = (category) => {
    navigate(`/add-product?category=${category.name}`);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader />
        <p className="mt-4 text-sm text-gray-500 font-medium">Accessing Industry Viewports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm max-w-md text-center font-medium">
          {error}
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry Initialization</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500">
      <div className="border-b border-gray-200 pb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Industry Viewports</h1>
        <p className="text-sm text-gray-500 mt-2">Select a domain to configure specialized anomaly detection thresholds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.id] || Layers;
          return (
            <Card key={cat.id} padding={false} className="flex flex-col group hover:shadow-xl transition-all border-gray-200 bg-white overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <div className="w-12 h-12 rounded bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{cat.shortDescription}</p>
              </div>
              
              <div className="p-8 flex-1 bg-gray-50/30">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Common Defect Profiles</span>
                <div className="flex flex-wrap gap-2 mb-8">
                  {cat.commonDefects.map((defect) => (
                    <Badge key={defect} variant="neutral" size="sm" className="bg-white border-gray-200 text-gray-600 px-3">{defect}</Badge>
                  ))}
                </div>
                
                <Button 
                  variant="primary" 
                  fullWidth={true} 
                  className="font-bold bg-blue-600 hover:bg-blue-700 shadow-lg"
                  onClick={() => handleSelect(cat)}
                >
                  Configure Domain
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white border-dashed border-gray-300 p-8 text-center flex flex-col items-center">
         <h4 className="text-lg font-bold text-gray-900 mb-2">Request Custom Domain</h4>
         <p className="text-sm text-gray-500 max-w-lg mb-6">Need specialized detection for a material not listed? Our engineering team can train models for unique surface textures and geometries.</p>
         <button className="text-sm font-bold text-blue-600 hover:underline">Contact Systems Integration &rarr;</button>
      </Card>
    </div>
  );
}
