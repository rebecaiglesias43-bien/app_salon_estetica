import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Filter, Plus, ChevronLeft, ChevronRight, User, MoreHorizontal, CheckCircle, X, CreditCard, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

export default function Citas() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [billingCita, setBillingCita] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

  const [citas, setCitas] = useState([
    { id: 1, hora: "10:00 AM", cliente: "Maria Garcia", servicio: "Corte + Color Pro", precio: 360000, estado: "Pendiente" },
    { id: 2, hora: "11:30 AM", cliente: "Ana Lopez", servicio: "Manicura Gel", precio: 135000, estado: "Confirmada" },
    { id: 3, hora: "01:00 PM", cliente: "Lucia Ruiz", servicio: "Balayage", precio: 450000, estado: "En Proceso" },
    { id: 4, hora: "04:00 PM", cliente: "Sofia Herrera", servicio: "Peinado Social", precio: 165000, estado: "Pendiente" },
  ]);

  const handleFinalizePayment = () => {
    alert(`Pago de ${formatCurrency(billingCita.precio)} registrado con éxito vía ${paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}.`);
    setCitas(citas.filter(c => c.id !== billingCita.id));
    setBillingCita(null);
  };

  return (
    <div className="p-8 lg:p-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif text-salon-gold font-bold tracking-tighter">Agenda de Citas</h1>
          <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-bold">Organización de Tiempos</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <div className="bg-white p-1 rounded-3xl flex shadow-sm border border-salon-pink/10">
              <button 
                onClick={() => setView('list')} 
                className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'list' ? 'bg-salon-pink/20 text-salon-dark' : 'text-gray-400'}`}
              >
                Lista
              </button>
              <button 
                onClick={() => setView('calendar')} 
                className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-salon-pink/20 text-salon-dark' : 'text-gray-400'}`}
              >
                Calendario
              </button>
           </div>
           <button className="bg-salon-gold text-white p-4 rounded-3xl shadow-xl shadow-salon-gold/20 hover:translate-y-[-2px] transition-all">
              <Plus size={24} />
           </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
         {['Hoy', 'Mañana', 'Esta Semana', 'Pasadas'].map((filter, idx) => (
           <button key={idx} className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${idx === 0 ? 'bg-salon-gold text-white shadow-lg shadow-salon-gold/20' : 'bg-white text-gray-400 border border-salon-pink/10'}`}>
              {filter}
           </button>
         ))}
      </div>

      {view === 'list' ? (
        <div className="space-y-6">
          {citas.map((cita, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={cita.id} 
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-salon-pink/10 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="bg-salon-bg px-6 py-4 rounded-[2rem] text-center min-w-[120px] border border-salon-pink/20 shadow-inner group-hover:bg-salon-pink/10 transition-colors">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Hora</p>
                  <p className="text-xl font-serif font-bold text-salon-dark">{cita.hora}</p>
                </div>
                <div className="flex-1">
                   <h3 className="text-2xl font-serif font-bold text-salon-dark flex items-center gap-3">
                      {cita.cliente}
                   </h3>
                   <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{cita.servicio}</span>
                      <span className="w-1 h-1 bg-salon-gold rounded-full"></span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${cita.estado === 'Confirmada' ? 'bg-green-50 text-green-600' : 'bg-salon-bg text-salon-gold/60 border border-salon-pink/30'}`}>
                         {cita.estado}
                      </span>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <button 
                  onClick={() => setBillingCita(cita)}
                  className="flex-1 md:flex-none px-8 py-4 bg-salon-gold text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-salon-gold/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <CheckCircle size={14} />
                  Facturar
                </button>
                <button className="p-4 bg-salon-bg text-gray-400 rounded-2xl hover:text-salon-gold transition-all border border-salon-pink/10">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-salon-pink/10 min-h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
             <div className="flex items-center gap-6">
                <button className="p-3 hover:bg-salon-bg rounded-full transition-all text-salon-gold"><ChevronLeft size={24} /></button>
                <h2 className="text-3xl font-serif text-salon-dark">Mayo 19, 2026</h2>
                <button className="p-3 hover:bg-salon-bg rounded-full transition-all text-salon-gold"><ChevronRight size={24} /></button>
             </div>
             <div className="flex items-center gap-4">
                <button className="p-3 bg-salon-bg rounded-2xl text-gray-400 hover:text-salon-gold transition-all shadow-sm border border-salon-pink/10">
                   <Filter size={20} />
                </button>
             </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 divide-y divide-gray-50">
             {['08:00', '10:00', '12:00', '14:00', '16:00'].map((time) => (
               <div key={time} className="py-12 flex gap-12 group relative">
                 <span className="text-[10px] font-bold text-gray-300 w-12 group-hover:text-salon-gold transition-colors">{time}</span>
                 <div className="flex-1 relative">
                    {time === '10:00' && (
                      <div className="absolute inset-0 top-2 bottom-2 bg-salon-pink/20 rounded-[2.5rem] p-8 border-l-8 border-salon-pink flex flex-col justify-between shadow-xl shadow-salon-pink/5 group-hover:scale-[1.01] transition-transform cursor-pointer">
                         <div>
                            <p className="text-[9px] font-bold text-salon-dark/60 uppercase tracking-[0.2em]">Maria Garcia</p>
                            <p className="font-serif font-bold text-xl leading-tight text-salon-dark">Corte + Color Pro</p>
                         </div>
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-salon-pink uppercase tracking-widest">{formatCurrency(360000)}</span>
                            <button onClick={() => setBillingCita(citas[0])} className="p-3 bg-white rounded-2xl shadow-sm text-salon-gold hover:scale-110 transition-transform">
                               <CheckCircle size={18} />
                            </button>
                         </div>
                      </div>
                    )}
                    <div className="h-full border-t border-gray-100 border-dashed transition-all group-hover:border-salon-gold/20"></div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* BILLING MODAL */}
      <AnimatePresence>
        {billingCita && (
          <div className="fixed inset-0 bg-salon-dark/40 backdrop-blur-md flex items-center justify-center p-6 z-[60]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setBillingCita(null)}
                className="absolute top-8 right-8 text-gray-300 hover:text-salon-dark transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-salon-bg rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-salon-gold border border-salon-pink/20">
                  <CheckCircle size={32} />
                </div>
                <h2 className="text-3xl font-serif text-salon-dark">Cobro de Servicio</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{billingCita.cliente}</p>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Servicio Realizado</span>
                  <span className="font-bold text-salon-dark">{billingCita.servicio}</span>
                </div>
                <div className="pt-6 border-t-2 border-dashed border-salon-bg flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bruto</span>
                  <span className="text-4xl font-serif font-bold text-salon-gold">{formatCurrency(billingCita.precio)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cash' ? 'bg-salon-gold text-white shadow-lg shadow-salon-gold/20' : 'bg-salon-bg text-gray-400 grayscale hover:grayscale-0'}`}
                >
                  <DollarSign size={18} />
                  Efectivo
                </button>
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className={`py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-salon-gold text-white shadow-lg shadow-salon-gold/20' : 'bg-salon-bg text-gray-400 grayscale hover:grayscale-0'}`}
                >
                  <CreditCard size={18} />
                  Tarjeta
                </button>
              </div>

              <button 
                onClick={handleFinalizePayment}
                className="w-full bg-salon-dark text-white font-bold py-6 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:translate-y-[-2px] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Finalizar y Cerrar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
