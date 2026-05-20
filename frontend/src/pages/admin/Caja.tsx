import { useState } from 'react';
import { DollarSign, Lock, Unlock, ArrowUpRight, ArrowDownLeft, Trash2, Plus, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../lib/formatters';

export default function Caja() {
  const [isCajaAbierta, setIsCajaAbierta] = useState(false);
  const [montoInicial, setMontoInicial] = useState("");
  
  // Datos simulados
  const [movimientos, setMovimientos] = useState([
    { id: 1, tipo: 'ingreso', concepto: 'Corte y Tinte - Ana L.', monto: 135000, hora: '10:30 AM' },
    { id: 2, tipo: 'egreso', concepto: 'Pago Garrafón Agua', monto: 15000, hora: '11:15 AM' },
  ]);

  const totalIngresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((acc, curr) => acc + curr.monto, 0);
  const totalEgresos = movimientos.filter(m => m.tipo === 'egreso').reduce((acc, curr) => acc + curr.monto, 0);
  const balance = (parseFloat(montoInicial || "0") + totalIngresos - totalEgresos);

  return (
    <div className="p-8 lg:p-12">
      <header className="mb-10">
        <h1 className="text-4xl font-serif text-salon-gold font-bold tracking-tighter">Control de Caja</h1>
        <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-bold">Flujo de Efectivo</p>
      </header>

      {!isCajaAbierta ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto bg-white p-12 rounded-[2.5rem] shadow-2xl border border-salon-gold/10 text-center relative overflow-hidden"
        >
          <div className="w-24 h-24 bg-salon-bg rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-salon-gold border border-salon-pink/20 shadow-inner">
            <Unlock size={44} />
          </div>
          <h2 className="font-serif text-3xl font-bold mb-4">Apertura</h2>
          <p className="text-gray-400 mb-10 text-xs leading-relaxed">Ingresa el fondo de caja inicial para comenzar el día.</p>
          <div className="relative mb-8">
             <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-serif font-bold text-salon-gold">$</span>
             <input 
                id="input-cash"
                type="number" 
                placeholder="0.00"
                className="w-full py-8 pl-14 pr-8 text-center text-4xl font-serif font-bold rounded-3xl bg-salon-bg border-none focus:ring-4 focus:ring-salon-gold/5 outline-none text-salon-dark"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
              />
          </div>
          <button 
            id="btn-open-cash"
            onClick={() => setIsCajaAbierta(true)}
            className="w-full bg-salon-gold text-white font-bold py-6 rounded-2xl shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-salon-gold/20"
          >
            Abrir Caja Hoy
            <ArrowUpRight size={20} />
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Resumen de Efectivo */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ rotate: -2 }}
              animate={{ rotate: 0 }}
              className="bg-salon-gold text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group shadow-salon-gold/30"
            >
              <div className="relative z-10 text-center">
                <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-2 font-sans">Balance Actual</p>
                <h2 className="text-5xl font-serif font-bold leading-none">{formatCurrency(balance)}</h2>
                
                <div className="mt-10 space-y-3 pt-8 border-t border-white/10">
                  <div className="flex justify-between text-[11px] font-sans">
                    <span className="opacity-60 uppercase font-bold">Base</span>
                    <span className="font-bold">{formatCurrency(parseFloat(montoInicial || "0"))}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-sans">
                    <span className="opacity-60 uppercase font-bold">Servicios (+)</span>
                    <span className="font-bold">{formatCurrency(totalIngresos)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-sans">
                    <span className="opacity-60 uppercase font-bold">Gastos (-)</span>
                    <span className="font-bold">{formatCurrency(totalEgresos)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <button 
              id="btn-close-cash"
              onClick={() => { if(window.confirm("¿Segura que deseas cerrar el día?")){setIsCajaAbierta(false); setMontoInicial("");} }}
              className="w-full bg-white border-2 border-salon-gold text-salon-gold font-bold py-6 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-salon-bg transition-all shadow-sm text-xs uppercase tracking-widest"
            >
              <Lock size={16} /> Cerrar Caja
            </button>
          </div>

          {/* Listado de Movimientos */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-salon-gold/5 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-serif text-2xl font-bold text-salon-dark">Movimientos</h3>
              <button 
                 id="btn-add-expense"
                 className="bg-salon-bg text-salon-gold font-bold text-[10px] uppercase tracking-widest px-6 py-3 rounded-full hover:bg-salon-gold hover:text-white transition-all border border-salon-gold/20"
                >
                + Gasto Manual
              </button>
            </div>

            <div className="space-y-4">
              {movimientos.map(m => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={m.id} 
                  className="flex items-center justify-between p-6 bg-salon-bg rounded-3xl group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-salon-gold/10"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.tipo === 'ingreso' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {m.tipo === 'ingreso' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-salon-dark">{m.concepto}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{m.hora}</p>
                    </div>
                  </div>
                  <span className={`text-xl font-serif font-bold ${m.tipo === 'ingreso' ? 'text-green-600' : 'text-salon-gold'}`}>
                    {m.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(m.monto)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
