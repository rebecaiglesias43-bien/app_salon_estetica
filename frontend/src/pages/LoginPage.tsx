import { useState } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import { Lock, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'admin' && password === 'admin123') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/admin');
    } else {
      setError('Credenciales incorrectas.');
    }
  };

  return (
    <div className="min-h-screen bg-salon-bg flex items-center justify-center p-6 selection:bg-salon-gold selection:text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl border border-salon-gold/10 relative overflow-hidden"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-salon-gold font-bold tracking-tighter">Bienvenida</h2>
          <p className="text-gray-400 mt-2 text-[10px] uppercase tracking-widest font-bold">Portal de Administración</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Usuario</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-salon-gold transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="admin"
                    className="w-full pl-14 pr-6 py-5 bg-salon-bg border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-salon-gold/5 transition-all text-salon-dark font-medium"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Contraseña</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-salon-gold transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-5 bg-salon-bg border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-salon-gold/5 transition-all text-salon-dark font-mono"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

          {error && <p className="text-red-500 text-[10px] text-center font-bold tracking-widest uppercase">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-salon-gold text-white font-bold py-6 rounded-[2rem] shadow-xl shadow-salon-gold/20 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
          >
            Entrar al Sistema
            <ArrowRight size={18} />
          </button>

          <button 
            type="button"
            onClick={() => navigate('/')}
            className="w-full text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-salon-gold transition-colors mt-4"
          >
            Volver a la Web
          </button>
        </form>

        <p className="mt-12 text-center text-[10px] text-gray-300 uppercase tracking-widest font-bold">
          Elegancia Management System
        </p>
      </motion.div>
    </div>
  );
}
