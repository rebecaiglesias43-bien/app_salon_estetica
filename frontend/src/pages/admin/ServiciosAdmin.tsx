import { useState } from 'react';
import { Edit3, Trash2, Plus, Clock, Tag, ChevronDown, Sparkles, Wand2, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../../lib/formatters';

export default function ServiciosAdmin() {
  const [servicios, setServicios] = useState([
    { id: 1, nombre: "Corte de Dama Pro", precio: 80000, duracion: "45 min", categoria: "Cabello", color: "bg-salon-pink" },
    { id: 2, nombre: "Tinte Global / Balayage", precio: 280000, duracion: "150 min", categoria: "Color", color: "bg-salon-lavender" },
    { id: 3, nombre: "Uñas Esculpidas Gel", precio: 130000, duracion: "90 min", categoria: "Uñas", color: "bg-salon-cream" },
    { id: 4, nombre: "Peinado de Ceremonia", precio: 160000, duracion: "60 min", categoria: "Estética", color: "bg-salon-success" },
  ]);

  return (
    <div className="p-8 lg:p-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-display text-salon-dark font-bold">Catálogo de Servicios</h1>
          <p className="text-gray-400 mt-2">Ajusta tu oferta y tiempos en un clic.</p>
        </div>
        <button className="bg-salon-dark text-white px-10 py-5 rounded-[28px] font-bold flex items-center gap-3 shadow-2xl hover:translate-y-[-2px] active:scale-95 transition-all">
          <div className="p-1 bg-white/20 rounded-lg">
            <Plus size={18} />
          </div>
          Nuevo Servicio
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode='popLayout'>
          {servicios.map((s, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={s.id} 
              className="bg-white p-8 rounded-[40px] shadow-sm border border-salon-pink/10 hover:shadow-xl transition-all group flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className={`w-20 h-20 ${s.color} rounded-[32px] flex items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-105 transition-transform`}>
                   <Scissors size={32} className="text-salon-dark opacity-40" />
                   <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                     <span className={`${s.color} bg-opacity-20 text-salon-dark text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest`}>
                        {s.categoria}
                     </span>
                     <Sparkles size={12} className="text-salon-pink" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-salon-dark">{s.nombre}</h3>
                  <div className="flex items-center gap-6 mt-4">
                     <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                        <Clock size={14} className="text-salon-lavender" />
                        {s.duracion}
                     </div>
                     <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                        <Wand2 size={14} className="text-salon-pink" />
                        Servicio Premium
                     </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-6 md:pt-0 border-salon-light">
                <div className="text-right">
                   <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-1">Inversión Cliente</p>
                   <div className="flex items-center gap-1 font-display text-4xl font-bold text-salon-dark underline decoration-salon-pink underline-offset-4">
                      <Tag className="text-salon-lavender w-5 h-5" />
                      {formatCurrency(s.precio)}
                   </div>
                </div>
                
                <div className="flex gap-3">
                  <button className="p-5 bg-salon-light text-gray-400 hover:text-salon-dark hover:bg-salon-cream rounded-[24px] transition-all shadow-sm">
                    <Edit3 size={20} />
                  </button>
                  <button className="p-5 bg-salon-light text-gray-300 hover:text-salon-error hover:bg-red-50 rounded-[24px] transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tip UX */}
      <div className="mt-16 bg-white p-10 rounded-[50px] border border-dashed border-salon-pink/40 flex flex-col items-center text-center">
         <div className="w-16 h-16 bg-salon-cream rounded-3xl flex items-center justify-center text-salon-pink mb-6 shadow-inner">
            <Tag size={32} />
         </div>
         <h4 className="font-display text-2xl font-bold text-salon-dark mb-4">Gestión de Precios Inteligente</h4>
         <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
           Recuerda revisar tus costos de insumos periódicamente. Si el precio de los tintes aumenta en bodega, asegúrate de reflejarlo en tus servicios de color para mantener la rentabilidad de tu salón.
         </p>
         <button className="mt-8 flex items-center gap-2 text-salon-lavender font-bold text-xs uppercase tracking-widest hover:underline transition-all">
            Ver guía de costos <ChevronDown size={14} />
         </button>
      </div>
    </div>
  );
}
