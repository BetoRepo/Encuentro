import React, { useState, useEffect } from 'react';
import { supabase } from "../../supabaseClient";
import { Download, AlertTriangle, FileText, Bell, Award, CheckCircle, XCircle, Volume2, Smartphone, LogOut, RefreshCw } from 'lucide-react';

interface Alarma {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: 'informativa' | 'importante' | 'critica';
  audiencia: string;
  estado: 'pendiente' | 'publicada' | 'cancelada';
  created_at: string;
}

interface Consulta {
  id: string;
  region: string;
  distrito: string;
  responsable_nombre: string;
  respuestas: Record<string, any>;
  updated_at: string;
}

interface SolicitudLogro {
  id: string;
  user_id: string;
  insignia_id: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  detalles: string;
  fecha_solicitud: string;
  insignias?: {
    nombre: string;
    puntos: number;
  };
}

export const PanelPrograma: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alarmas' | 'consultas' | 'logros'>('alarmas');
  
  // Estado Alarmas
  const [alarmas, setAlarmas] = useState<Alarma[]>([]);
  const [loadingAlarma, setLoadingAlarma] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: string; message: string }>({ type: '', message: '' });
  const [toastAlarma, setToastAlarma] = useState<Alarma | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'informativa' as 'informativa' | 'importante' | 'critica',
    audiencia: 'todos'
  });

  // Estado Consultas
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loadingConsultas, setLoadingConsultas] = useState(false);

  // Estado Logros
  const [solicitudes, setSolicitudes] = useState<SolicitudLogro[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  useEffect(() => {
    fetchAlarmas();
    fetchConsultas();
    fetchSolicitudes();

    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }

    // Registrar Service Worker con alcance explícito en la raíz
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        console.warn('Error al registrar Service Worker:', err);
      });
    }

    // Canal en tiempo real de alarmas
    const channelAlarmas = supabase
      .channel('realtime-programa-alarmas')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'programa_alarmas' }, 
        (payload) => {
          fetchAlarmas();
          const nuevaAlarma = payload.new as Alarma;
          procesarAlarmaEntrante(nuevaAlarma);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'programa_alarmas' },
        () => fetchAlarmas()
      )
      .subscribe();

    const channelLogros = supabase
      .channel('realtime-solicitudes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'solicitudes_logros' },
        () => fetchSolicitudes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelAlarmas);
      supabase.removeChannel(channelLogros);
    };
  }, []);

  const procesarAlarmaEntrante = async (nuevaAlarma: Alarma) => {
    // 1. Vibración para móviles
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([300, 100, 300, 100, 500]);
      } catch (e) {
        console.warn('Vibración bloqueada');
      }
    }

    // 2. Disparo de Notificación Nativa a la BARRA del teléfono mediante Service Worker
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        const options: NotificationOptions & { vibrate?: number[]; tag?: string; renotify?: boolean } = {
          body: nuevaAlarma.descripcion,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [300, 100, 300, 100, 500],
          tag: nuevaAlarma.id,
          renotify: true
        };
        registration.showNotification(`🚨 ENJ 2026: ${nuevaAlarma.titulo}`, options as NotificationOptions);
      } catch (e) {
        console.warn('Error al enviar a la barra móvil:', e);
      }
    }

    // 3. Banner flotante en pantalla
    setToastAlarma(nuevaAlarma);
    setTimeout(() => setToastAlarma(null), 12000);
  };

  // Solicitar permiso expreso e inscribir el teléfono en las notificaciones
  const solicitarPermisoNotificaciones = async () => {
    if (!('Notification' in window)) {
      alert('Tu dispositivo no soporta notificaciones nativas.');
      return;
    }

    try {
      const permiso = await Notification.requestPermission();
      setNotifPermission(permiso);

      if (permiso === 'granted') {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          await navigator.serviceWorker.ready;
          
          const options: NotificationOptions & { vibrate?: number[] } = {
            body: '¡Listo! Ahora recibirás las alarmas del campamento en la barra de tu teléfono.',
            icon: '/favicon.ico',
            vibrate: [200, 100, 200]
          };

          // Muestra una prueba en la barra del teléfono inmediatamente
          registration.showNotification('🚨 ENJ 2026 Activado', options as NotificationOptions);
        }
        alert('¡Notificaciones en barra de estado activadas exitosamente!');
      } else {
        alert('Permiso denegado. Debes habilitar las notificaciones desde los ajustes de tu navegador en el teléfono.');
      }
    } catch (error) {
      console.error('Error al solicitar permiso:', error);
      alert('No se pudo activar las notificaciones.');
    }
  };

  const fetchAlarmas = async () => {
    const { data, error } = await supabase
      .from('programa_alarmas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);
      
    if (!error && data) setAlarmas(data as Alarma[]);
  };

  const fetchConsultas = async () => {
    setLoadingConsultas(true);
    const { data, error } = await supabase
      .from('consultas_distritales')
      .select('*')
      .order('distrito', { ascending: true });
      
    if (!error && data) setConsultas(data as Consulta[]);
    setLoadingConsultas(false);
  };

  const fetchSolicitudes = async () => {
    setLoadingSolicitudes(true);
    const { data, error } = await supabase
      .from('solicitudes_logros')
      .select('*, insignias(nombre, puntos)')
      .eq('estado', 'pendiente')
      .order('fecha_solicitud', { ascending: false });
      
    if (!error && data) setSolicitudes(data as SolicitudLogro[]);
    setLoadingSolicitudes(false);
  };

  const handleSubmitAlarma = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAlarma(true);
    setFeedback({ type: '', message: '' });

    try {
      let userId: string | null = null;
      
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        userId = authData.user.id;
      } else {
        const localUserStr = localStorage.getItem("enj_user");
        if (localUserStr) {
          const localUser = JSON.parse(localUserStr);
          userId = localUser.id || localUser.email || "usuario_programa";
        }
      }

      if (!userId) {
        throw new Error('No se pudo verificar la sesión. Por favor inicia sesión nuevamente.');
      }

      const { error } = await supabase.from('programa_alarmas').insert([{
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        prioridad: formData.prioridad,
        audiencia: formData.audiencia,
        estado: 'publicada',
        creado_por: userId
      }]);

      if (error) {
        throw new Error(`Error al emitir alarma: ${error.message}`);
      }

      setFeedback({ type: 'success', message: '🚨 ¡Alarma emitida a todos los participantes del ENJ 2026!' });
      setFormData({ titulo: '', descripcion: '', prioridad: 'informativa', audiencia: 'todos' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al emitir la alarma' });
    } finally {
      setLoadingAlarma(false);
    }
  };

  const handleCancelAlarma = async (id: string) => {
    if (!confirm('¿Deseas cancelar esta alarma?')) return;
    const { error } = await supabase.from('programa_alarmas').update({ estado: 'cancelada' }).eq('id', id);
    if (!error) fetchAlarmas();
  };

  const handleAprobarLogro = async (solicitud: SolicitudLogro) => {
    try {
      const { error: insertError } = await supabase.from('participante_insignias').insert([
        { user_id: solicitud.user_id, insignia_id: solicitud.insignia_id, otorgado_por: 'PANEL_PROGRAMA' }
      ]);
      if (insertError && insertError.code !== '23505') throw insertError;

      await supabase.from('solicitudes_logros').update({ estado: 'aprobado' }).eq('id', solicitud.id);
      setSolicitudes(prev => prev.filter(s => s.id !== solicitud.id));
    } catch (error) {
      alert("Error al aprobar el logro.");
      console.error(error);
    }
  };

  const handleRechazarLogro = async (solicitudId: string) => {
    if (!confirm('¿Estás seguro de rechazar este logro?')) return;
    try {
      await supabase.from('solicitudes_logros').update({ estado: 'rechazado' }).eq('id', solicitudId);
      setSolicitudes(prev => prev.filter(s => s.id !== solicitudId));
    } catch (error) {
      alert("Error al rechazar el logro.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("enj_user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-6 font-sans relative">
      {/* Toast Flotante */}
      {toastAlarma && (
        <div className="fixed top-4 left-3 right-3 md:left-auto md:right-5 md:max-w-md z-[100] bg-slate-900 text-white p-4 rounded-xl shadow-2xl border-2 border-amber-400 animate-bounce">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Volume2 className="text-amber-400 animate-pulse" size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">🚨 ALARMA ENJ 2026</span>
            </div>
            <button onClick={() => setToastAlarma(null)} className="text-slate-400 hover:text-white text-xs font-bold px-1">✕</button>
          </div>
          <h4 className="font-bold text-sm text-amber-200">{toastAlarma.titulo}</h4>
          <p className="text-xs text-slate-200 mt-1 leading-relaxed">{toastAlarma.descripcion}</p>
        </div>
      )}

      <header className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
        <div className="w-full md:w-auto flex justify-between items-center gap-3">
          <div>
            <span className="text-xs font-bold text-blue-700 tracking-wider">ENJ 2026 • ASV</span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900">Panel de Programa ⚜️</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Móvil de Activación Push */}
            {notifPermission !== 'granted' && (
              <button
                onClick={solicitarPermisoNotificaciones}
                className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-3 rounded-lg shadow transition-colors active:scale-95"
                title="Activar notificaciones en la barra del teléfono"
              >
                <Smartphone size={15} /> Activar Alert
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        
        {/* Navegación por Tabs */}
        <div className="w-full md:w-auto flex bg-slate-200 p-1 rounded-lg overflow-x-auto touch-pan-x">
          <button
            onClick={() => setActiveTab('alarmas')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 text-xs md:text-sm font-bold rounded-md transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'alarmas' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell size={16} /> Alarmas
          </button>
          <button
            onClick={() => setActiveTab('consultas')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 text-xs md:text-sm font-bold rounded-md transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'consultas' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={16} /> Consultas
          </button>
          <button
            onClick={() => setActiveTab('logros')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 text-xs md:text-sm font-bold rounded-md transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'logros' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award size={16} /> Logros
            {solicitudes.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{solicitudes.length}</span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {activeTab === 'alarmas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-5 bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-slate-800">📢 Emitir Alarma</h2>
              {feedback.message && (
                <div className={`p-3 rounded-lg text-xs font-semibold mb-4 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'} border`}>
                  {feedback.message}
                </div>
              )}
              <form onSubmit={handleSubmitAlarma} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">TÍTULO</label>
                  <input type="text" required maxLength={120} className="w-full px-3 py-2.5 border rounded-lg text-base md:text-sm" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ej: Inicio de Gran Juego Central" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">MENSAJE / INSTRUCCIÓN</label>
                  <textarea required rows={3} className="w-full px-3 py-2.5 border rounded-lg text-base md:text-sm" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Detalles o material necesario..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PRIORIDAD</label>
                    <select className="w-full px-3 py-2.5 border rounded-lg text-base md:text-sm bg-white" value={formData.prioridad} onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}>
                      <option value="informativa">Informativa</option>
                      <option value="importante">Importante</option>
                      <option value="critica">🚨 Crítica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">AUDIENCIA</label>
                    <select className="w-full px-3 py-2.5 border rounded-lg text-base md:text-sm bg-white" value={formData.audiencia} onChange={(e) => setFormData({ ...formData, audiencia: e.target.value })}>
                      <option value="todos">Todo el Campamento</option>
                      <option value="subcampo_1">Subcampo 1</option>
                      <option value="subcampo_2">Subcampo 2</option>
                      <option value="subcampo_3">Subcampo 3</option>
                      <option value="jefes_unidad">Jefes de Unidad</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={loadingAlarma} className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition active:scale-98 disabled:opacity-50">
                  {loadingAlarma ? 'Lanzando...' : '🚀 Lanzar Alarma'}
                </button>
              </form>
            </section>

            <section className="lg:col-span-7 bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-auto min-h-[400px] lg:h-[550px]">
              <h2 className="text-lg font-bold mb-4 text-slate-800">📡 Historial Reciente</h2>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[450px] lg:max-h-none">
                {alarmas.map((item) => (
                  <div key={item.id} className={`p-3.5 rounded-lg border ${item.prioridad === 'critica' ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-white'}`}>
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.prioridad === 'critica' ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-700'}`}>{item.prioridad}</span>
                      <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{item.titulo}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{item.descripcion}</p>
                    {item.estado === 'publicada' && (
                      <button onClick={() => handleCancelAlarma(item.id)} className="mt-2 text-[11px] text-red-600 font-bold hover:underline">Cancelar</button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'consultas' && (
          <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-800">Archivos y Acuerdos Distritales</h2>
              <button onClick={fetchConsultas} className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-700 px-3 py-2 rounded hover:bg-slate-200 active:scale-95">
                <RefreshCw size={13} /> Refrescar
              </button>
            </div>
            
            {loadingConsultas ? (
              <p className="text-center text-sm text-slate-500 py-10">Cargando datos de distritos...</p>
            ) : consultas.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
                <AlertTriangle className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-sm font-semibold text-slate-600">Aún no hay documentos cargados por los distritos.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="p-3 text-xs font-bold text-slate-500 uppercase">Región / Distrito</th>
                      <th className="p-3 text-xs font-bold text-slate-500 uppercase">Waingunga</th>
                      <th className="p-3 text-xs font-bold text-slate-500 uppercase">Comunidad</th>
                      <th className="p-3 text-xs font-bold text-slate-500 uppercase">Clan</th>
                      <th className="p-3 text-xs font-bold text-slate-500 uppercase">JAR</th>
                      <th className="p-3 text-xs font-bold text-slate-500 uppercase">Última Act.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {consultas.map((c) => {
                      const renderDownload = (key: string) => {
                        const fileData = c.respuestas?.[key];
                        if (!fileData || (!fileData.drive_file_url && !fileData.file_url)) return <span className="text-slate-300 text-xs italic">Pendiente</span>;
                        
                        return (
                          <a 
                            href={fileData.file_url || fileData.drive_file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors font-semibold text-xs active:scale-95"
                            title={fileData.file_name || 'Descargar archivo'}
                          >
                            <Download size={14} /> Bajar
                          </a>
                        );
                      };

                      return (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <p className="font-bold text-slate-800">{c.distrito}</p>
                            <p className="text-xs text-slate-500">{c.region}</p>
                          </td>
                          <td className="p-3">{renderDownload('waigunga')}</td>
                          <td className="p-3">{renderDownload('comunidad')}</td>
                          <td className="p-3">{renderDownload('clan')}</td>
                          <td className="p-3">{renderDownload('jar')}</td>
                          <td className="p-3 text-xs text-slate-500">
                            {new Date(c.updated_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logros' && (
          <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-800">Aprobación de Logros Virtuales</h2>
              <button onClick={fetchSolicitudes} className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-700 px-3 py-2 rounded hover:bg-slate-200 active:scale-95">
                <RefreshCw size={13} /> Refrescar
              </button>
            </div>

            {loadingSolicitudes ? (
              <p className="text-center text-sm text-slate-500 py-10">Buscando solicitudes pendientes...</p>
            ) : solicitudes.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
                <Award className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-sm font-semibold text-slate-600">¡Todo al día! No hay solicitudes de logros pendientes de revisión.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {solicitudes.map((sol) => (
                  <div key={sol.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-blue-800 text-sm flex items-center gap-2">
                          <Award size={16} className="text-pink-600" /> 
                          {sol.insignias?.nombre || "Insignia Desconocida"}
                        </h3>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                          +{sol.insignias?.puntos || 0} pts
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1"><strong>ID Usuario:</strong> {sol.user_id}</p>
                      <div className="bg-white p-3 rounded border border-slate-200 my-3 text-sm text-slate-700 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Prueba / Detalle enviado:</p>
                        <p className="break-words">{sol.detalles || "Sin detalles adicionales proporcionados."}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => handleAprobarLogro(sol)}
                        className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors active:scale-95"
                      >
                        <CheckCircle size={16} /> Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazarLogro(sol.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-bold transition-colors active:scale-95"
                      >
                        <XCircle size={16} /> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelPrograma;