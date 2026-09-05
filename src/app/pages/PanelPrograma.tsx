import React, { useState, useEffect } from 'react';
import { supabase } from '../index'; // Ajusta la importación según dónde tengas instanciado el cliente de Supabase

interface Alarma {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: 'informativa' | 'importante' | 'critica';
  audiencia: string;
  estado: 'pendiente' | 'publicada' | 'cancelada';
  created_at: string;
}

export const PanelPrograma: React.FC = () => {
  const [alarmas, setAlarmas] = useState<Alarma[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: string; message: string }>({ type: '', message: '' });

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'informativa' as 'informativa' | 'importante' | 'critica',
    audiencia: 'todos'
  });

  const fetchAlarmas = async () => {
    const { data, error } = await supabase
      .from('programa_alarmas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);

    if (!error && data) {
      setAlarmas(data as Alarma[]);
    }
  };

  useEffect(() => {
    fetchAlarmas();

    const channel = supabase
      .channel('realtime-programa-alarmas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'programa_alarmas' },
        () => fetchAlarmas()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase.from('programa_alarmas').insert([
        {
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim(),
          prioridad: formData.prioridad,
          audiencia: formData.audiencia,
          estado: 'publicada',
          creado_por: user.id
        }
      ]);

      if (error) throw error;

      setFeedback({ type: 'success', message: '🚨 ¡Alarma emitida al campamento ENJ 2026!' });
      setFormData({ titulo: '', descripcion: '', prioridad: 'informativa', audiencia: 'todos' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al emitir la alarma' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAlarma = async (id: string) => {
    if (!confirm('¿Deseas cancelar esta alarma?')) return;

    const { error } = await supabase
      .from('programa_alarmas')
      .update({ estado: 'cancelada' })
      .eq('id', id);

    if (!error) fetchAlarmas();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-7xl mx-auto mb-6 flex justify-between items-center border-b pb-4">
        <div>
          <span className="text-xs font-bold text-blue-700 tracking-wider">ENJ 2026 • ASV</span>
          <h1 className="text-2xl font-black text-slate-900">Panel de Programa ⚜️</h1>
        </div>
        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Realtime Conectado
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario */}
        <section className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-slate-800">📢 Emitir Alarma</h2>

          {feedback.message && (
            <div className={`p-3 rounded-lg text-xs font-semibold mb-4 ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">TÍTULO</label>
              <input
                type="text"
                required
                maxLength={120}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Inicio de Gran Juego Central"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">MENSAJE / INSTRUCCIÓN</label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Detalles o material necesario..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PRIORIDAD</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  value={formData.prioridad}
                  onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}
                >
                  <option value="informativa">Informativa</option>
                  <option value="importante">Importante</option>
                  <option value="critica">🚨 Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">AUDIENCIA</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  value={formData.audiencia}
                  onChange={(e) => setFormData({ ...formData, audiencia: e.target.value })}
                >
                  <option value="todos">Todo el Campamento</option>
                  <option value="subcampo_1">Subcampo 1</option>
                  <option value="subcampo_2">Subcampo 2</option>
                  <option value="subcampo_3">Subcampo 3</option>
                  <option value="jefes_unidad">Jefes de Unidad</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Lanzando...' : '🚀 Lanzar Alarma'}
            </button>
          </form>
        </section>

        {/* Historial */}
        <section className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[550px]">
          <h2 className="text-lg font-bold mb-4 text-slate-800">📡 Historial Reciente</h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {alarmas.map((item) => (
              <div key={item.id} className={`p-3 rounded-lg border ${
                item.prioridad === 'critica' ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    item.prioridad === 'critica' ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.prioridad}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{item.titulo}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{item.descripcion}</p>
                {item.estado === 'publicada' && (
                  <button
                    onClick={() => handleCancelAlarma(item.id)}
                    className="mt-2 text-[11px] text-red-600 font-bold hover:underline"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PanelPrograma;