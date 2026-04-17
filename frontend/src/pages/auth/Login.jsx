import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Boxes, ShieldCheck, Cpu, User, Building2, Lock, Terminal } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login('technician', email, password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      alert(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden font-sans text-gray-900">
      
      <div className="w-full max-w-lg relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded bg-blue-600 flex items-center justify-center shadow-lg transform rotate-45">
               <Boxes size={32} className="text-white -rotate-45" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              DevDestany
            </h1>
            <p className="text-gray-500 mt-2">Sign in to your account</p>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-xl bg-white overflow-hidden p-0">
           <div className="p-6 pb-0 mb-[-1rem] text-center border-b border-gray-100 flex flex-col items-center text-gray-900">
              <Building2 size={24} className="text-blue-600 mb-2" />
              <h2 className="text-xl font-bold mb-4">Enterprise Login</h2>
           </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <Input 
              icon={<User size={18} className="text-gray-400" />}
              label="Email Address" 
              type="email" 
              placeholder="Enter your email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-gray-300 focus:border-blue-500 text-gray-900"
            />
            
            <Input 
              icon={<Lock size={18} className="text-gray-400" />}
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border-gray-300 focus:border-blue-500 text-gray-900"
            />

            <Button 
              variant="primary" 
              fullWidth={true} 
              loading={loading} 
              className="py-4 font-bold text-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white"
            >
              Log In
            </Button>
          </form>
        </Card>

        <div className="flex flex-col items-center gap-4">
           <p className="text-sm text-gray-500 text-center">
             Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline font-medium">Sign up</Link>
           </p>
        </div>
      </div>
    </div>
  );
}
