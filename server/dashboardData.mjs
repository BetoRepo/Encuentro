export function convertBsToUsd(montoBs, tasaBcv = 39) {
  const monto = Number(montoBs) || 0;
  const tasa = Number(tasaBcv) || 1;
  if (tasa <= 0) return 0;
  return Number((monto / tasa).toFixed(2));
}

export function buildDashboardPayload({ participants = [], payments = [], documents = [], bcvRate = 39 }) {
  const paymentsByParticipant = new Map();
  const documentsByParticipant = new Map();

  for (const payment of payments) {
    const cedula = String(payment.cedula_participante || '').trim();
    if (!cedula) continue;
    const existing = paymentsByParticipant.get(cedula) || [];
    const montoBs = Number(payment.monto_bs) || 0;
    existing.push({
      id: payment.id || null,
      numero_cuota: payment.numero_cuota || 'N/A',
      monto_bs: montoBs,
      monto_usd: convertBsToUsd(montoBs, bcvRate),
      referencia: payment.referencia || '',
      fecha_pago: payment.fecha_pago || null,
      tasa_cambio: Number(payment.tasa_cambio) || 1,
      tasa_bcv: Number(bcvRate) || 1,
      estado: payment.estado || 'pendiente',
    });
    paymentsByParticipant.set(cedula, existing);
  }

  for (const document of documents) {
    const cedula = String(document.cedula_participante || '').trim();
    if (!cedula) continue;
    const existing = documentsByParticipant.get(cedula) || [];
    existing.push({
      id: document.id || null,
      tipo_documento: document.tipo_documento || 'documento',
      nombre_archivo: document.nombre_archivo || document.path_archivo || 'archivo',
      url_archivo: document.url_archivo || '',
      path_archivo: document.path_archivo || '',
      mime_type: document.mime_type || '',
      peso_bytes: Number(document.peso_bytes) || 0,
    });
    documentsByParticipant.set(cedula, existing);
  }

  const participantEntries = participants.map((participant) => {
    const cedula = String(participant.cedula || '').trim();
    const pagos = paymentsByParticipant.get(cedula) || [];
    const documentos = documentsByParticipant.get(cedula) || [];
    const totalPagado = pagos.reduce((sum, payment) => sum + Number(payment.monto_bs || 0), 0);
    const totalPagadoUsd = convertBsToUsd(totalPagado, bcvRate);

    return {
      cedula,
      nombre: participant.nombre || '',
      apellido: participant.apellido || '',
      correo: participant.correo || '',
      telefono: participant.telefono || '',
      region: participant.region || '',
      distrito: participant.distrito || '',
      grupo_scout: participant.grupo_scout || '',
      rama: participant.rama || '',
      tipo_participante: participant.tipo_participante || '',
      created_at: participant.created_at || null,
      pagos,
      documentos,
      totalPagado,
      totalPagadoUsd,
      totalCuotas: pagos.length,
    };
  });

  const totalAmount = payments.reduce((sum, payment) => sum + (Number(payment.monto_bs) || 0), 0);
  const totalAmountUsd = convertBsToUsd(totalAmount, bcvRate);

  return {
    bcvRate: Number(bcvRate) || 1,
    metrics: {
      participants: participantEntries.length,
      payments: payments.length,
      totalAmount,
      totalAmountUsd,
    },
    participants: participantEntries,
  };
}

export default { buildDashboardPayload, convertBsToUsd };
