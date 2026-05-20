import { useState, useEffect } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Phone, CheckCircle2, ChevronRight, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../lib/formatters';

export default function LandingPage() {
  const [servicios, setServicios] = useState<{ id: number; nombre: string; precio: number }[]>([]);
  const [formData, setFormData] = useState({ nombre: '', telefono: '', servicio_id: '', fecha: '' });
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    const mockServicios = [
      { id: 1, nombre: 'Corte de Autor', precio: 85000 },
      { id: 2, nombre: 'Coloración Premium', precio: 250000 },
      { id: 3, nombre: 'Manicura Spa', precio: 65000 },
      { id: 4, nombre: 'Tratamiento Hidratante', precio: 95000 }
    ];
    setServicios(mockServicios);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ tipo: 'success', texto: '¡Solicitud enviada! Te contactaremos pronto.' });
    setFormData({ nombre: '', telefono: '', servicio_id: '', fecha: '' });
  };

  return (
    <div className="min-h-screen bg-salon-bg selection:bg-salon-gold selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-xl border-b border-salon-pink/20 h-20 flex items-center px-8 lg:px-20 justify-between">
        <h1 className="text-2xl font-serif text-salon-gold tracking-tighter">Elegancia</h1>
        <Link 
          to="/login"
          className="bg-salon-gold text-white px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-salon-gold/20 hover:scale-105 active:scale-95 transition-all"
        >
          Iniciar sesión
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-8 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 bg-salon-pink/20 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold text-salon-dark"
            >
              The Art of Hair
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl lg:text-8xl font-serif text-salon-dark leading-[0.95] tracking-tighter"
            >
              Capturando tu <br />
              <span className="text-salon-gold">Belleza Interior.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 text-lg lg:text-xl max-w-xl leading-relaxed"
            >
              Un espacio minimalista donde la técnica impecable se encuentra con la relajación absoluta. 
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center lg:justify-start"
            >
              <button 
                onClick={() => document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-salon-dark text-white px-10 py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center gap-4 group"
              >
                Comenzar Experiencia
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex-1 relative"
          >
            <div className="w-full aspect-[4/5] bg-gray-100 rounded-[5rem] overflow-hidden shadow-2xl relative z-10 group">
              <img 
                src="https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop" 
                alt="Salon Interior" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-salon-gold/10 to-transparent"></div>
            </div>
            {/* Geometric Accents */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-salon-pink/30 rounded-full blur-3xl -z-0"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-salon-lavender/20 rounded-full blur-3xl -z-0"></div>
          </motion.div>
        </div>
      </section>

      {/* Services & Reservation Section */}
      <section id="reservar" className="py-24 px-8 lg:px-20 bg-white rounded-t-[5rem] shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-serif text-salon-dark tracking-tight">Nuestra Colección</h3>
            <p className="text-gray-400 mt-4 text-[10px] uppercase tracking-[0.4em] font-bold">Servicios Exclusivos</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-stretch">
            {/* Service Menu */}
            <div className="space-y-6">
              {servicios.map((s, idx) => (
                <motion.div 
                   key={s.id}
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: idx * 0.1 }}
                   className="flex justify-between items-center p-8 rounded-[2.5rem] bg-salon-bg border border-transparent hover:border-salon-gold/20 transition-all group"
                >
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-salon-gold shadow-sm group-hover:scale-110 transition-transform">
                        <Star size={18} />
                     </div>
                     <div>
                        <h4 className="font-serif text-lg text-salon-dark mb-1">{s.nombre}</h4>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Experiencia Personalizada</p>
                     </div>
                  </div>
                  <span className="text-2xl font-serif text-salon-gold/70">{formatCurrency(s.precio)}</span>
                </motion.div>
              ))}
            </div>

            {/* Booking Form */}
            <div className="bg-salon-bg rounded-[3.5rem] p-10 lg:p-14 relative overflow-hidden border border-salon-pink/20">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-salon-gold/5 rounded-full blur-3xl"></div>
              
              <h4 className="text-3xl font-serif text-salon-dark mb-2">Agendar Cita</h4>
              <p className="text-gray-400 mb-10 text-[10px] uppercase tracking-widest font-bold">Reserva tu momento</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <input 
                      type="text" placeholder="Nombre completo" required
                      className="w-full p-5 pl-12 rounded-[2rem] bg-white border border-transparent focus:border-salon-gold/30 outline-none transition-all text-salon-dark"
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      value={formData.nombre}
                    />
                    <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 text-salon-gold/40" size={18} />
                  </div>
                  
                  <div className="relative group">
                    <input 
                      type="tel" placeholder="WhatsApp" required
                      className="w-full p-5 pl-12 rounded-[2rem] bg-white border border-transparent focus:border-salon-gold/30 outline-none transition-all text-salon-dark"
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      value={formData.telefono}
                    />
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-salon-gold/40" size={18} />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <select 
                      required className="w-full p-5 rounded-[2rem] bg-white border border-transparent focus:border-salon-gold/30 outline-none appearance-none cursor-pointer"
                      onChange={(e) => setFormData({...formData, servicio_id: e.target.value})}
                      value={formData.servicio_id}
                    >
                      <option value="">Servicio</option>
                      {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                    
                    <input 
                      type="datetime-local" required
                      className="w-full p-5 rounded-[2rem] bg-white border border-transparent focus:border-salon-gold/30 outline-none"
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      value={formData.fecha}
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-salon-gold text-white font-bold py-6 rounded-full shadow-2xl shadow-salon-gold/20 hover:translate-y-[-2px] transition-all text-[10px] uppercase tracking-[0.3em]">
                  Programar Visita
                </button>
                
                {mensaje && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-white rounded-3xl flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-green-600 border border-green-50"
                  >
                    <CheckCircle2 size={16} />
                    {mensaje.texto}
                  </motion.div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 text-center bg-white">
        <h5 className="text-xl font-serif text-salon-gold mb-4">Elegancia</h5>
        <p className="text-gray-300 text-[10px] uppercase tracking-[0.5em] font-bold">© 2026 Your Beauty Sanctuary</p>
      </footer>
    </div>
  );
}
