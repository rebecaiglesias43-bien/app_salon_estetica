import { useState, useEffect } from 'react';
import { Package, MinusCircle, Plus, Search, AlertTriangle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { motion } from 'motion/react';

export default function Inventario() {
  const [productos, setProductos] = useState<{id: number, nombre: string, stock: number, minimo: number, precio_venta: number, proveedor_nombre?: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Mock data based on the prompt context
    const mock = [
      { id: 1, nombre: "Tinte 7.1 Rubio Ceniza", stock: 1, minimo: 3, precio_venta: 15, proveedor_nombre: "L'Oréal" },
      { id: 2, nombre: "Shampoo Post-Queratín", stock: 0, minimo: 2, precio_venta: 25, proveedor_nombre: "Schwarzkopf" },
      { id: 3, nombre: "Polvo Decolorante", stock: 10, minimo: 5, precio_venta: 40, proveedor_nombre: "Alfaparf" },
      { id: 4, nombre: "Aceite de Argán", stock: 15, minimo: 2, precio_venta: 30 },
    ];
    setProductos(mock);
    setLoading(false);
  }, []);

  const handleSacarDeBodega = (id: number, nombre: string) => {
    // REGLA DE ORO: Baja manual al abrir para uso en el salón
    if (window.confirm(`¿Confirmas que estás abriendo una nueva unidad de "${nombre}" para uso en el salón?`)) {
      setProductos(productos.map(p => 
        p.id === id ? { ...p, stock: Math.max(0, p.stock - 1) } : p
      ));
      // En una app real: axios.post(`/api/productos/consumir/${id}`);
    }
  };

  const filtered = productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 lg:p-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-serif text-salon-gold font-bold tracking-tighter">Bodega de Insumos</h1>
          <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-bold">Gestión de Existencias</p>
        </div>
        <button className="bg-salon-gold text-white px-8 py-4 rounded-[2rem] flex items-center gap-3 font-bold shadow-xl shadow-salon-gold/20 group hover:translate-y-[-2px] transition-all text-xs uppercase tracking-widest">
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      <div className="relative mb-10 group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-salon-gold transition-colors">
          <Search size={22} />
        </div>
        <input 
          type="text"
          placeholder="Buscar insumo..."
          className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-white border border-salon-pink/10 shadow-sm focus:ring-4 focus:ring-salon-gold/5 outline-none text-salon-dark transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((prod, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={prod.id} 
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-salon-pink/10 flex flex-col justify-between hover:shadow-2xl transition-all group"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-salon-bg rounded-2xl flex items-center justify-center text-salon-gold border border-salon-pink/20">
                  <Package size={28} />
                </div>
                <div className={`px-4 py-2 rounded-2xl flex flex-col items-center gap-0.5 ${prod.stock <= prod.minimo ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-700'}`}>
                   <span className="text-[9px] font-bold uppercase tracking-widest">Stock</span>
                  <span className="font-serif text-2xl leading-none">{prod.stock}</span>
                </div>
              </div>
              
              <h3 className="font-serif text-xl font-bold text-salon-dark mb-1">{prod.nombre}</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-8">
                {prod.proveedor_nombre || 'Proveedor Premium'}
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => handleSacarDeBodega(prod.id, prod.nombre)}
                disabled={prod.stock <= 0}
                className="flex-1 bg-salon-bg hover:bg-salon-pink/20 text-salon-dark py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-30 font-bold text-xs uppercase tracking-widest border border-salon-pink/10"
              >
                <MinusCircle size={18} className="text-salon-gold" />
                Uso en Sala
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
