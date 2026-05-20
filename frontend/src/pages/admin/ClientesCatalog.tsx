import { useState } from 'react';
import { Plus, Phone, User, Edit3, Calendar, MoreHorizontal, Sparkles, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ClientesCatalog() {
  const [clientes, setClientes] = useState([
    { id: 1, nombre: "Lucía Méndez", telefono: "555-0192", ultima_visita: "Hace 2 días", notas: "Prefiere tinte sin amoniaco y café sin azúcar." },
    { id: 2, nombre: "Roberto Frausto", telefono: "555-0120", ultima_visita: "Hace 1 semana", notas: "Corte clásico, suele venir los sábados." },
    { id: 3, nombre: "Ana Sofía García", telefono: "555-0345", ultima_visita: "Ayer", notas: "Trae a su hija, servicio de uñas gel." },
  ]);

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-8 lg:p-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display text-salon-dark font-bold">Mis Consentidos</h1>
          <p className="text-gray-400 mt-2">Cultiva relaciones, no solo cortes.</p>
        </div>
        <button 
          id="btn-add-client"
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto bg-salon-pink text-salon-dark px-10 py-5 rounded-[28px] font-bold flex items-center justify-center gap-3 shadow-xl shadow-salon-pink/20 hover:translate-y-[-2px] active:scale-95 transition-all"
        >
          <div className="p-1 bg-white rounded-lg">
             <Plus size={18} />
          </div>
          Nuevo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {clientes.map((cliente, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={cliente.id} 
            className="bg-white rounded-[40px] p-8 shadow-sm border border-salon-pink/10 hover:shadow-2xl transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transform group-hover:scale-150 transition-all duration-700">
               <Sparkles size={80} />
            </div>

            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-salon-cream rounded-[24px] flex items-center justify-center text-salon-pink shadow-inner relative z-10 group-hover:scale-110 transition-transform">
                <User size={32} />
              </div>
              <div className="flex gap-2 relative z-10">
                 <button className="p-3 bg-salon-light text-gray-400 rounded-2xl hover:text-salon-lavender hover:bg-white hover:shadow-sm transition-all">
                    <Edit3 size={18} />
                 </button>
                 <button className="p-3 bg-salon-light text-gray-400 rounded-2xl hover:text-salon-pink transition-all">
                    <MoreHorizontal size={18} />
                 </button>
              </div>
            </div>

            <h3 className="text-2xl font-display font-bold text-salon-dark mb-2">{cliente.nombre}</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-salon-dark/60 text-sm font-medium">
                <div className="w-8 h-8 rounded-full bg-salon-light flex items-center justify-center text-salon-lavender">
                   <Phone size={14} />
                </div>
                <span>{cliente.telefono}</span>
              </div>
              <div className="flex items-center gap-4 text-salon-dark/60 text-sm font-medium">
                <div className="w-8 h-8 rounded-full bg-salon-light flex items-center justify-center text-salon-pink">
                   <Calendar size={14} />
                </div>
                <span>Visita: {cliente.ultima_visita}</span>
              </div>
            </div>

            {cliente.notas && (
              <div className="p-5 bg-salon-cream/30 rounded-3xl text-xs text-salon-dark/70 leading-relaxed border border-salon-cream/50 relative">
                <div className="absolute -top-2 left-6 text-salon-pink bg-white p-1 rounded-full shadow-sm">
                   <MessageCircle size={10} />
                </div>
                "{cliente.notas}"
              </div>
            )}
            
            <button className="w-full mt-8 py-4 bg-salon-dark text-white rounded-[24px] text-xs font-bold uppercase tracking-widest hover:shadow-xl hover:translate-y-[-2px] active:scale-95 transition-all">
              Ver Historial de Citas
            </button>
          </motion.div>
        ))}
      </div>

      {/* Modal - Simplificado para estética */}
      {showModal && (
        <div id="modal-overlay" className="fixed inset-0 bg-salon-dark/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[48px] p-12 shadow-2xl relative"
          >
             <div className="absolute top-0 right-0 p-8 animate-spin-slow">
                <Sparkles className="text-salon-pink opacity-20" size={100} />
             </div>
            <h2 className="text-4xl font-display font-bold text-salon-dark mb-8">Nuevo Cliente</h2>
            <div className="space-y-5 relative z-10">
              <input type="text" placeholder="Nombre completo" className="w-full p-5 rounded-[24px] bg-salon-light border-none focus:ring-4 focus:ring-salon-pink/10 outline-none" />
              <input type="tel" placeholder="WhatsApp / Teléfono" className="w-full p-5 rounded-[24px] bg-salon-light border-none focus:ring-4 focus:ring-salon-pink/10 outline-none" />
              <textarea placeholder="Notas, gustos o alergias..." className="w-full p-5 rounded-[24px] bg-salon-light border-none h-40 focus:ring-4 focus:ring-salon-pink/10 outline-none resize-none"></textarea>
              <div className="flex gap-4 mt-10">
                <button onClick={() => setShowModal(false)} className="flex-1 py-5 font-bold text-gray-400 hover:text-salon-dark transition-colors">Tal vez luego</button>
                <button className="flex-2 py-5 bg-salon-pink text-salon-dark rounded-[24px] font-bold shadow-xl shadow-salon-pink/20 hover:translate-y-[-2px] transition-all">Registrar Cliente</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
