import { useEffect, useState } from 'react';
import api from '../../services/api';
import { FileText, ChevronDown, ChevronUp, Plus, DollarSign, CreditCard, AlertCircle, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/formatters';
import Pagination from '../../components/Pagination';

interface Factura {
  fac_id: number;
  fac_fecha: string;
  fac_total: number;
  fac_estado: string;
  cli_nombre?: string;
  cli_apellido?: string;
  cli_telefono?: string;
  detalle?: any[];
  pagos?: any[];
}

const glassCard = 'bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10';

export default function Facturas() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedData, setExpandedData] = useState<Factura | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal pago dividido (múltiples métodos)
  const [showPago, setShowPago] = useState(false);
  const [pagoFacturaId, setPagoFacturaId] = useState<number | null>(null);
  const [pagoFacturaTotal, setPagoFacturaTotal] = useState(0);
  const [pagosForm, setPagosForm] = useState<{ metodo: string; monto: string }[]>([]);

  const fetch = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (filterEstado) params.estado = filterEstado;
      const res = await api.get('/api/facturas/', { params });
      setFacturas(res.data.data || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filterEstado, page]);

  useEffect(() => { setPage(1); }, [filterEstado]);

  const toggleExpand = async (f: Factura) => {
    if (expandedId === f.fac_id) { setExpandedId(null); setExpandedData(null); return; }
    setExpandedId(f.fac_id);
    try {
      const res = await api.get(`/api/facturas/${f.fac_id}`);
      setExpandedData(res.data);
    } catch { setExpandedData(null); }
  };

  const openPago = (facId: number, saldoRestante: number) => {
    setPagoFacturaId(facId);
    setPagoFacturaTotal(saldoRestante);
    setPagosForm([{ metodo: 'efectivo', monto: String(saldoRestante) }]);
    setShowPago(true);
  };

  const [pagoError, setPagoError] = useState('');

  const agregarPagoLinea = () => {
    setPagosForm(prev => [...prev, { metodo: 'efectivo', monto: '' }]);
  };

  const eliminarPagoLinea = (idx: number) => {
    if (pagosForm.length <= 1) return;
    setPagosForm(prev => prev.filter((_, i) => i !== idx));
  };

  const actualizarPagoLinea = (idx: number, field: 'metodo' | 'monto', value: string) => {
    setPagosForm(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handlePagos = async () => {
    setPagoError('');
    if (!pagoFacturaId) return;

    // Validar cada pago
    for (let i = 0; i < pagosForm.length; i++) {
      const p = pagosForm[i];
      if (!p.metodo) { setPagoError(`El pago #${i+1} no tiene método`); return; }
      const monto = parseFloat(p.monto);
      if (isNaN(monto) || monto <= 0) { setPagoError(`El pago #${i+1} debe tener un monto mayor a 0`); return; }
    }

    // Validar suma total
    const suma = pagosForm.reduce((s, p) => s + (parseFloat(p.monto) || 0), 0);
    if (Math.abs(suma - pagoFacturaTotal) > 0.01) {
      setPagoError(`La suma de los pagos ($${suma.toLocaleString('es-CO')}) no coincide con el total pendiente ($${pagoFacturaTotal.toLocaleString('es-CO')})`);
      return;
    }

    try {
      // Crear cada pago individual (el backend auto-marca como pagado cuando suma ≥ total)
      for (const p of pagosForm) {
        await api.post('/api/pagos/', {
          pag_factura_id: pagoFacturaId,
          pag_metodo: p.metodo,
          pag_monto: parseFloat(p.monto),
        });
      }
      setShowPago(false);
      fetch();
      if (expandedId === pagoFacturaId) {
        const res = await api.get(`/api/facturas/${pagoFacturaId}`);
        setExpandedData(res.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al registrar pagos';
      setPagoError(msg);
    }
  };

  const cambiarEstado = async (id: number, estado: string) => {
    try {
      await api.put(`/api/facturas/${id}/estado`, { estado });
      fetch();
      if (expandedId === id) {
        const res = await api.get(`/api/facturas/${id}`);
        setExpandedData(res.data);
      }
    } catch (err) { console.error(err); }
  };

  const totalPagado = (pagos: any[]) => (pagos || []).reduce((s: number, p: any) => s + (p.pag_monto || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Facturas</h1>
          <p className="text-white/30 text-sm mt-1">{facturas.length} facturas registradas</p>
        </div>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-salon-gold/50">
          <option value="" className="bg-[#120c1a]">Todos los estados</option>
          <option value="pendiente" className="bg-[#120c1a]">Pendiente</option>
          <option value="pagado" className="bg-[#120c1a]">Pagado</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-white/30">Cargando...</div>
      ) : facturas.length === 0 ? (
        <div className={`${glassCard} p-12 text-center`}><FileText size={48} className="mx-auto text-white/10 mb-3" /><p className="text-white/30">No hay facturas</p></div>
      ) : (
        <div className="space-y-2">
          <Pagination page={page} pages={pages} total={total} limit={10} onChange={setPage} />
          {facturas.map(f => (
            <div key={f.fac_id} className={`${glassCard} overflow-hidden transition-all`}>
              <button onClick={() => toggleExpand(f)}
                className="w-full flex items-center justify-between p-4 lg:p-5 hover:bg-white/[0.02] transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${f.fac_estado === 'pagado' ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                    <FileText size={18} className={f.fac_estado === 'pagado' ? 'text-green-400' : 'text-yellow-400'} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Factura #{f.fac_id}</p>
                    <p className="text-xs text-white/30">
                      {f.cli_nombre ? `${f.cli_nombre} ${f.cli_apellido || ''}` : 'Venta directa'} · {formatDate(f.fac_fecha)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${f.fac_estado === 'pagado' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {f.fac_estado}
                  </span>
                  <span className="font-bold text-salon-pink">{formatCurrency(f.fac_total)}</span>
                  {expandedId === f.fac_id ? <ChevronUp size={16} className="text-white/20" /> : <ChevronDown size={16} className="text-white/20" />}
                </div>
              </button>

              {expandedId === f.fac_id && expandedData && (
                <div className="border-t border-white/5 px-4 lg:px-5 py-4 bg-white/[0.015]">
                  {/* Detalle de items */}
                  <h4 className="text-xs font-medium text-white/40 mb-2">Items</h4>
                  <div className="space-y-1 mb-4">
                    {(expandedData.detalle || []).map((d: any) => (
                      <div key={d.dfa_id} className="flex justify-between text-sm bg-white/5 rounded-lg px-3 py-2">
                        <span className="text-white/70">{d.ser_nombre || d.pro_nombre || 'Item'}</span>
                        <span className="text-salon-pink font-medium">{formatCurrency(d.dfa_subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pagos */}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-white/40">Pagos</h4>
                    {(expandedData.fac_estado === 'pendiente' || (expandedData.pagos || []).length === 0) ? (
                      <button onClick={() => openPago(f.fac_id, f.fac_total - totalPagado(expandedData.pagos || []))}
                        className="flex items-center gap-1 text-xs text-salon-pink hover:text-salon-lavender"><Plus size={12} /> Registrar pago</button>
                    ) : (
                      <span className="text-xs text-white/20 italic">Factura pagada — valor fijo, no se permiten más pagos</span>
                    )}
                  </div>
                  {(expandedData.pagos || []).length === 0 ? (
                    <p className="text-xs text-white/20 mb-3">Sin pagos registrados</p>
                  ) : (
                    <div className="space-y-1 mb-3">
                      {(expandedData.pagos || []).map((p: any) => (
                        <div key={p.pag_id} className="flex justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                          <span className="text-white/50 capitalize flex items-center gap-1"><CreditCard size={10} />{p.pag_metodo}</span>
                          <span className="text-green-400">{formatCurrency(p.pag_monto)}</span>
                        </div>
                      ))}
                      {/* Saldo pendiente */}
                      {(expandedData.fac_estado !== 'pagado') && (
                        <div className="flex justify-between text-xs bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/20">
                          <span className="text-amber-400 font-medium">Saldo pendiente</span>
                          <span className="text-amber-400 font-medium">{formatCurrency(f.fac_total - totalPagado(expandedData.pagos || []))}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Descargar factura (PDF vía impresión) */}
                  <button
                    onClick={() => {
                      const win = window.open('', '_blank');
                      if (!win) return;
                      const p = (n: number) => `$${n.toLocaleString('es')}`;
                      const d = expandedData;
                      win.document.write(`
                        <html><head><meta charset="utf-8"><title>Factura #${d.fac_id}</title>
                        <style>
                          @page { margin: 8mm; size: A4; }
                          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600;700&display=swap');
                          *{margin:0;padding:0;box-sizing:border-box}
                          body{font-family:'Inter',Georgia,serif;background:#FDF7FD;color:#461D3A;padding:0;min-height:100vh;-webkit-print-color-adjust:exact;print-color-adjust:exact}
                          .page{max-width:1000px;margin:0 auto;padding:60px 45px;background:#fff;min-height:100vh}
                          /* ── Decorative top bar ── */
                          .top-bar{height:10px;border-radius:5px;margin-bottom:45px;background:linear-gradient(90deg,#D4A843 0%,#BA71A2 50%,#ECD0EC 100%);-webkit-print-color-adjust:exact;print-color-adjust:exact}
                          /* ── Logo / Brand ── */
                          .brand{display:flex;align-items:center;gap:16px;margin-bottom:6px}
                          .brand-icon{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#D4A843,#BA71A2);display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:700;font-family:'Playfair Display',serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
                          .brand h1{font-family:'Playfair Display',Georgia,serif;font-size:38px;font-weight:700;background:linear-gradient(135deg,#D4A843,#BA71A2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;-webkit-print-color-adjust:exact;print-color-adjust:exact}
                          .brand-sub{font-size:14px;color:#BA71A2;letter-spacing:3px;text-transform:uppercase;margin-bottom:28px}
                          /* ── Header ── */
                          .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:28px;border-bottom:2px solid #ECD0EC}
                          .header-left h2{font-family:'Playfair Display',Georgia,serif;font-size:34px;color:#461D3A;margin-bottom:6px}
                          .header-left p{font-size:15px;color:#BA71A2}
                          .badge{display:inline-block;padding:8px 22px;border-radius:20px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
                          .badge-pagado{background:#C1E1C1;color:#2d6a2d}
                          .badge-pendiente{background:#FFE4B3;color:#8a6300}
                          /* ── Info ── */
                          .info-grid{display:flex;gap:50px;margin-bottom:40px;font-size:17px;line-height:2}
                          .info-grid .label{color:#BA71A2;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600}
                          .info-grid .value{color:#461D3A;font-weight:600}
                          /* ── Table ── */
                          table{width:100%;border-collapse:collapse;margin-bottom:35px;font-size:17px}
                          thead th{background:#FDF7FD;color:#7E2A53;padding:16px 20px;text-align:left;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #ECD0EC;-webkit-print-color-adjust:exact;print-color-adjust:exact}
                          thead th:last-child{text-align:right}
                          tbody td{padding:16px 20px;border-bottom:1px solid #F5E8F5;color:#461D3A}
                          tbody td:last-child{text-align:right;font-weight:600;color:#BA71A2;font-size:18px}
                          /* ── Total ── */
                          .total-row{display:flex;justify-content:flex-end;align-items:center;padding:22px 30px;margin-bottom:35px;background:linear-gradient(135deg,#FDF7FD,#FFF0F5);border-radius:14px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
                          .total-row .label{font-size:18px;font-weight:700;color:#7E2A53;text-transform:uppercase;letter-spacing:1.5px;margin-right:50px}
                          .total-row .value{font-size:36px;font-weight:700;background:linear-gradient(135deg,#D4A843,#BA71A2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;-webkit-print-color-adjust:exact;print-color-adjust:exact}
                          /* ── Pagos table ── */
                          .section-title{font-family:'Playfair Display',Georgia,serif;font-size:20px;color:#7E2A53;margin-bottom:14px;margin-top:35px}
                          .pagos-table th:last-child{text-align:right}
                          .pagos-table td:last-child{text-align:right;font-weight:600;font-size:17px}
                          .pagos-table td.capitalize::first-letter{text-transform:capitalize}
                          /* ── Footer ── */
                          .footer{margin-top:70px;padding-top:35px;border-top:2px solid #ECD0EC;text-align:center}
                          .footer .stars{font-size:26px;color:#D4A843;letter-spacing:10px;margin-bottom:8px}
                          .footer .highlight{font-family:'Playfair Display',Georgia,serif;font-size:22px;color:#D4A843;font-weight:700;margin-bottom:10px}
                          .footer .slogan{font-size:15px;color:#BA71A2;margin-bottom:25px;font-style:italic}
                          .footer .divider{width:70px;height:2px;background:linear-gradient(90deg,#D4A843,#BA71A2);margin:0 auto 25px;border-radius:2px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
                          .footer .contact-grid{display:flex;justify-content:center;gap:50px;margin-bottom:22px;font-size:16px;color:#7E2A53;line-height:2.2}
                          .footer .contact-grid .col{text-align:center}
                          .footer .contact-grid .col strong{display:block;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#BA71A2;margin-bottom:5px}
                          .footer .legal{font-size:13px;color:#BA71A2;margin-top:18px;padding-top:14px;border-top:1px solid #F5E8F5;letter-spacing:0.3px}
                          @media print{body{background:#FDF7FD}.page{box-shadow:none;padding:35px 30px}}
                        </style></head><body>
                        <div class="page">
                          <div class="top-bar"></div>
                          <div class="brand">
                            <div class="brand-icon">E</div>
                            <h1>Eliza Styles</h1>
                          </div>
                          <div class="brand-sub">Salón de Estética</div>
                          <div class="header">
                            <div class="header-left">
                              <h2>Factura #${d.fac_id}</h2>
                              <p>Documento de cobro</p>
                            </div>
                            <div>
                              <span class="badge ${d.fac_estado === 'pagado' ? 'badge-pagado' : 'badge-pendiente'}">${d.fac_estado === 'pagado' ? 'Pagado' : 'Pendiente'}</span>
                            </div>
                          </div>
                          <div class="info-grid">
                            <div>
                              <div class="label">Cliente</div>
                              <div class="value">${d.cli_nombre || 'Venta directa'} ${d.cli_apellido || ''}</div>
                            </div>
                            <div>
                              <div class="label">Fecha</div>
                              <div class="value">${d.fac_fecha}</div>
                            </div>
                          </div>
                          <table>
                            <thead><tr><th>Servicio</th><th>Subtotal</th></tr></thead>
                            <tbody>
                              ${(d.detalle || []).map((i: any) => `<tr><td>${i.ser_nombre || i.pro_nombre || 'Servicio'}</td><td>${p(Number(i.dfa_subtotal))}</td></tr>`).join('')}
                            </tbody>
                          </table>
                          <div class="total-row">
                            <span class="label">Total</span>
                            <span class="value">${p(Number(d.fac_total))}</span>
                          </div>
                          ${(d.pagos || []).length > 0 ? `
                            <div class="section-title">Pagos registrados</div>
                            <table class="pagos-table">
                              <thead><tr><th>Método</th><th>Monto</th></tr></thead>
                              <tbody>
                                ${(d.pagos || []).map((pg: any) => `<tr><td class="capitalize">${pg.pag_metodo}</td><td>${p(Number(pg.pag_monto))}</td></tr>`).join('')}
                              </tbody>
                            </table>` : ''}
                          <div class="footer">
                            <div class="stars">✦ ✦ ✦</div>
                            <p class="highlight">Gracias por su preferencia</p>
                            <p class="slogan">«Donde la belleza encuentra su estilo»</p>
                            <div class="divider"></div>
                            <div class="contact-grid">
                              <div class="col">
                                <strong>Ubicación</strong>
                                Av. Principal #123, Local 5<br/>
                                Ciudad, CP 1000
                              </div>
                              <div class="col">
                                <strong>Horario</strong>
                                Lun — Sáb: 9:00 — 19:00<br/>
                                Dom: Cerrado
                              </div>
                              <div class="col">
                                <strong>Contacto</strong>
                                +58 412-1234567<br/>
                                contacto@elizastyles.com
                              </div>
                            </div>
                            <div class="legal">
                              Documento generado digitalmente · Eliza Styles ® 2025 · Todos los derechos reservados
                            </div>
                          </div>
                        </div>
                        <script>window.onload = function(){setTimeout(function(){window.print();window.close()},300)}<\/script>
                        </body></html>`);
                      win.document.close();
                    }}
                    className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg bg-salon-gold/10 text-salon-gold hover:bg-salon-gold/20 w-full justify-center mb-2"
                  >
                    <FileText size={12} /> Descargar PDF
                  </button>

                  {/* Cambiar estado */}
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    {expandedData.fac_estado === 'pendiente' && (expandedData.pagos || []).length > 0 && (
                      <button onClick={() => cambiarEstado(expandedData.fac_id, 'pagado')}
                        className="text-xs px-4 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20">Marcar como pagado</button>
                    )}
                    {expandedData.fac_estado === 'pendiente' && (expandedData.pagos || []).length === 0 && (
                      <span className="text-xs text-white/30 italic">Registre un pago para marcar como pagado</span>
                    )}
                    {expandedData.fac_estado === 'pagado' && (
                      <span className="text-xs text-white/30 italic">Factura pagada — valor fijo</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <Pagination page={page} pages={pages} total={total} limit={10} onChange={setPage} />
        </div>
      )}

      {/* Modal Pago Dividido */}
      {showPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowPago(false)}>
          <div className="bg-[#120c1a] border border-white/10 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><DollarSign size={18} className="text-salon-gold" /> Registrar Pago</h2>
            <div className="space-y-3">
              {/* Total pendiente */}
              <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-salon-gold/10 border border-salon-gold/20">
                <span className="text-white/60 text-sm">Total a pagar</span>
                <span className="text-salon-gold font-bold text-lg">${pagoFacturaTotal.toLocaleString('es-CO')}</span>
              </div>

              {pagoError && <div className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/10 flex items-center gap-1"><AlertCircle size={10} />{pagoError}</div>}

              {/* Lista de pagos */}
              <div className="space-y-2">
                <label className="block text-white/40 text-xs mb-1">Métodos de pago</label>
                {pagosForm.map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <select value={p.metodo} onChange={e => actualizarPagoLinea(idx, 'metodo', e.target.value)}
                      className="flex-[2] px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50">
                      <option value="efectivo" className="bg-[#120c1a]">Efectivo</option>
                      <option value="tarjeta" className="bg-[#120c1a]">Tarjeta</option>
                      <option value="transferencia" className="bg-[#120c1a]">Transferencia</option>
                    </select>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                      <input type="number" min="0" value={p.monto}
                        onChange={e => actualizarPagoLinea(idx, 'monto', e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-salon-gold/50" />
                    </div>
                    {pagosForm.length > 1 && (
                      <button onClick={() => eliminarPagoLinea(idx)} className="p-2.5 text-red-400/50 hover:text-red-400 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Botón agregar método */}
              <button onClick={agregarPagoLinea}
                className="w-full py-2 rounded-xl border border-dashed border-white/10 text-white/30 text-xs hover:border-salon-gold/30 hover:text-salon-gold/50 transition-colors">
                + Agregar otro método de pago
              </button>

              {/* Resumen */}
              {(() => {
                const suma = pagosForm.reduce((s, p) => s + (parseFloat(p.monto) || 0), 0);
                const dif = pagoFacturaTotal - suma;
                return (
                  <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                    Math.abs(dif) < 0.01
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                  }`}>
                    <span>Total ingresado</span>
                    <span className="font-semibold">${suma.toLocaleString('es-CO')} {Math.abs(dif) > 0.01 && <>(faltan ${dif.toLocaleString('es-CO')})</>}</span>
                  </div>
                );
              })()}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPago(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5">Cancelar</button>
                <button onClick={handlePagos} className="flex-1 px-4 py-2.5 rounded-xl bg-salon-gold text-black text-sm font-semibold">Registrar pagos</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
