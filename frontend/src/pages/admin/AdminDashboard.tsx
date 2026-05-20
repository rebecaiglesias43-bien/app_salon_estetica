import { TrendingUp, AlertCircle, DollarSign, Calendar, ArrowRight, User } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../lib/formatters';

const StatCard = ({ title, value, icon: Icon, variant, delay }: { title: string, value: string, icon: any, variant?: 'gold' | 'white', delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`p-6 rounded-[2rem] shadow-sm transition-all flex flex-col justify-between h-32 ${
      variant === 'gold' 
      ? 'bg-salon-gold text-white shadow-lg shadow-salon-gold/20' 
      : 'bg-white border border-salon-pink/20 text-salon-dark'
    }`}
  >
    <div className="flex justify-between items-start">
      <p className={`text-[10px] uppercase tracking-widest font-bold ${variant === 'gold' ? 'text-white/70' : 'text-gray-400'}`}>
        {title}
      </p>
      <Icon size={16} className={variant === 'gold' ? 'text-white/40' : 'text-salon-pink'} />
    </div>
    <h3 className="text-3xl font-serif leading-none">{value}</h3>
  </motion.div>
);

export default function AdminDashboard() {
  const stats = {
    ingresos: formatCurrency(2450000),
    egresos: formatCurrency(850000),
    ganancia: formatCurrency(1600000),
    citasHoy: "08"
  };

  const alertasStock = [
    { id: 1, producto: "Tinte 7.1 Rubio", actual: 1, minimo: 3 },
    { id: 2, producto: "Shampoo Keratin", actual: 0, minimo: 2 },
  ];

  const proximasCitas = [
    { id: 1, hora: "10:00 AM", cliente: "Lucía Méndez", servicio: "Corte + Color" },
    { id: 2, hora: "11:30 AM", cliente: "Roberto Frausto", servicio: "Manicura" },
    { id: 3, hora: "01:00 PM", cliente: "Ana Laura G.", servicio: "Peinado" },
  ];

  return (
    <div className="p-8 flex flex-col gap-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Ingresos" value={stats.ingresos} icon={DollarSign} delay={0.1} />
        <StatCard title="Egresos" value={stats.egresos} icon={TrendingUp} delay={0.2} />
        <StatCard title="Ganancia Neta" value={stats.ganancia} icon={DollarSign} variant="gold" delay={0.3} />
        <StatCard title="Citas Hoy" value={stats.citasHoy} icon={Calendar} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Section */}
        <section className="lg:col-span-2 bg-white rounded-[2.5rem] border border-salon-pink/20 p-8 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-serif text-gray-800">Próximas Citas</h3>
            <button className="text-[11px] font-bold text-salon-gold uppercase tracking-widest border-b border-salon-gold">Ver Calendario</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                  <th className="pb-4 font-bold">Hora</th>
                  <th className="pb-4 font-bold">Cliente</th>
                  <th className="pb-4 font-bold">Servicio</th>
                  <th className="pb-4 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {proximasCitas.map((cita) => (
                  <tr key={cita.id} className="border-b border-gray-50 group hover:bg-salon-bg transition-colors">
                    <td className="py-5 font-bold text-gray-400">{cita.hora}</td>
                    <td className="py-5 text-salon-dark font-medium">{cita.cliente}</td>
                    <td className="py-5">
                      <span className="bg-salon-pink/20 px-3 py-1 rounded-full text-[10px] font-bold text-salon-dark uppercase tracking-wider">
                        {cita.servicio}
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      <button className="text-salon-gold font-bold border-b border-salon-gold text-xs hover:text-salon-dark hover:border-salon-dark transition-all">
                        Cobrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sidebar Actions in Dashboard */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          {/* Bajo Stock */}
          <div className="bg-white rounded-[2rem] border border-red-100 p-6 shadow-sm">
            <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Alertas de Stock
            </h4>
            <div className="space-y-4">
              {alertasStock.map(item => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div>
                    <p className="text-xs font-bold text-gray-700">{item.producto}</p>
                    <p className="text-[10px] text-red-500 underline decoration-dotted">{item.actual === 0 ? 'Agotado' : `${item.actual} unidad restante`}</p>
                  </div>
                  <button className="p-2 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                    <ArrowRight size={14} className="text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action */}
          <div className="bg-salon-lavender/5 rounded-[2rem] border-2 border-dashed border-salon-lavender/30 p-8 flex-1 flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-salon-lavender shadow-sm mb-4">
               <TrendingUp size={24} />
             </div>
             <h4 className="font-serif text-gray-800 text-lg">Sacar de Bodega</h4>
             <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">Registra manualmente la apertura de una nueva botella.</p>
             <button className="mt-6 w-full bg-salon-lavender text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:shadow-lg transition-all shadow-salon-lavender/30">
               Seleccionar Producto
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
