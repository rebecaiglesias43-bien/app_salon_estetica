import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Scissors, DollarSign, Wallet, Calendar, PieChart, Info, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../lib/formatters';

export default function Reportes() {
  const datosVentas = [
    { name: 'Lun', ingresos: 1350000 },
    { name: 'Mar', ingresos: 2160000 },
    { name: 'Mie', ingresos: 1740000 },
    { name: 'Jue', ingresos: 2820000 },
    { name: 'Vie', ingresos: 4050000 },
    { name: 'Sab', ingresos: 5400000 },
    { name: 'Dom', ingresos: 600000 },
  ];

  const serviciosPopulares = [
    { name: 'Corte', total: 45, color: '#FAD2E1' },
    { name: 'Tinte', total: 32, color: '#E2BCF7' },
    { name: 'Uñas', total: 28, color: '#FFF1E6' },
    { name: 'Tratam.', total: 15, color: '#C1E1C1' },
  ];

  return (
    <div className="p-8 lg:p-12">
      <header className="mb-12">
        <h1 className="text-4xl font-display text-salon-dark font-bold">Resumen Estratégico</h1>
        <p className="text-gray-400 mt-2">Toma decisiones basadas en datos reales.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Gráfico de Ingresos */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[48px] shadow-sm border border-salon-pink/10 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
             <TrendingUp size={120} />
          </div>
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="w-12 h-12 bg-salon-lavender/20 rounded-2xl flex items-center justify-center text-salon-lavender">
              <TrendingUp size={24} />
            </div>
            <h2 className="font-display text-2xl font-bold text-salon-dark">Ventas de la Semana</h2>
          </div>
          <div className="h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosVentas}>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F8F9FA" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '15px' }}
                  itemStyle={{ fontWeight: 'bold', color: '#4A4A4A' }}
                />
                <Line type="monotone" dataKey="ingresos" stroke="#E2BCF7" strokeWidth={5} dot={{ r: 7, fill: '#E2BCF7', stroke: '#fff', strokeWidth: 3 }} activeDot={{ r: 9, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráfico de Barras - Servicios */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-white p-10 rounded-[48px] shadow-sm border border-salon-pink/10 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
             <PieChart size={120} />
          </div>
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="w-12 h-12 bg-salon-pink/20 rounded-2xl flex items-center justify-center text-salon-pink">
              <Scissors size={24} />
            </div>
            <h2 className="font-display text-2xl font-bold text-salon-dark">Demanda por Servicio</h2>
          </div>
          <div className="h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviciosPopulares}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '24px', border: 'none' }} />
                <Bar dataKey="total" radius={[15, 15, 15, 15]} barSize={40}>
                  {serviciosPopulares.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Panel de Rentabilidad */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2 }}
           className="lg:col-span-2 bg-salon-dark text-white p-12 rounded-[60px] shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 animate-spin-slow">
             <Sparkles size={200} />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-4">
                 <Wallet size={12} className="text-salon-pink" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-salon-pink">Neto este mes</span>
              </div>
              <h3 className="text-7xl font-display font-bold leading-none">{formatCurrency(10620000)}</h3>
              <p className="text-gray-400 mt-4 text-sm font-medium flex items-center gap-2 justify-center md:justify-start">
                 <Calendar size={14} /> Período: Mayo 2026
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { label: 'Servicios', val: formatCurrency(10620000), icon: Scissors, col: 'text-salon-lavender' },
                { label: 'Gtos Fijos', val: formatCurrency(2550000), icon: TrendingUp, col: 'text-salon-error' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 hover:bg-white/10 backdrop-blur-md p-8 rounded-[40px] text-center min-w-[160px] border border-white/5 transition-all hover:translate-y-[-5px]">
                  <div className={`w-12 h-12 ${item.col.replace('text-', 'bg-')}/10 rounded-2xl flex items-center justify-center ${item.col} mx-auto mb-4`}>
                     <item.icon size={22} />
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                  <p className={`text-2xl font-display font-bold ${item.col}`}>{item.val}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 bg-salon-cream/30 p-8 rounded-[40px] border border-salon-pink/20 flex items-start gap-6">
         <div className="p-4 bg-white rounded-[24px] shadow-sm text-salon-pink">
            <Info size={28} />
         </div>
         <div>
            <h4 className="font-bold text-salon-dark mb-2">Insight Administrativo</h4>
            <p className="text-sm text-salon-dark/60 leading-relaxed max-w-3xl">
              Tus ingresos han aumentado un <strong>12%</strong> respecto al mes pasado, principalmente impulsado por el servicio de color. Considera una promoción especial en servicios de hidratación profunda para elevar el ticket promedio este mes.
            </p>
         </div>
      </div>
    </div>
  );
}
