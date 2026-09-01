import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDashboardPayload } from './dashboardData.mjs';

test('buildDashboardPayload agrega pagos y documentos para cada participante', () => {
  const payload = buildDashboardPayload({
    participants: [
      {
        cedula: 'V-12345678',
        nombre: 'Ana',
        apellido: 'López',
        correo: 'ana@test.com',
        region: 'ZULIA',
        distrito: 'COQUIVACOA',
      },
    ],
    payments: [
      { cedula_participante: 'V-12345678', monto_bs: 80 },
      { cedula_participante: 'V-12345678', monto_bs: 20 },
      { cedula_participante: 'V-99999999', monto_bs: 50 },
    ],
    documents: [
      { cedula_participante: 'V-12345678', nombre_archivo: 'foto.jpg', tipo_documento: 'foto', mime_type: 'image/jpeg' },
      { cedula_participante: 'V-12345678', nombre_archivo: 'pago.pdf', tipo_documento: 'comprobante', mime_type: 'application/pdf' },
    ],
  });

  assert.equal(payload.metrics.participants, 1);
  assert.equal(payload.metrics.payments, 3);
  assert.equal(payload.metrics.totalAmount, 150);
  assert.equal(payload.participants[0].documentos.length, 2);
  assert.equal(payload.participants[0].pagos.length, 2);
  assert.equal(payload.participants[0].totalPagado, 100);
});
