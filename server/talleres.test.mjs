import test from 'node:test';
import assert from 'node:assert/strict';

import { ACTIVIDADES, buildTalleresPayload, validarInscripcion } from './talleres.mjs';

test('validarInscripcion permite una sesión libre', () => {
  assert.equal(validarInscripcion('yoga-2', []).ok, true);
});

test('validarInscripcion rechaza una segunda sesión de la misma actividad', () => {
  const result = validarInscripcion('yoga-3', ['yoga-1']);
  assert.equal(result.ok, false);
  assert.match(result.error, /Ya estás inscrito/);
});

test('validarInscripcion rechaza horarios que se cruzan pero no los contiguos', () => {
  // Lengua de señas 12:45–13:20 choca con Inglés 13:00–13:50
  assert.equal(validarInscripcion('ingles-emprendedor-1', ['lengua-senas-1']).ok, false);
  // CV 13:15–13:45 empieza justo cuando termina Excel 12:45–13:15
  assert.equal(validarInscripcion('cv-1', ['excel-1']).ok, true);
});

test('validarInscripcion con permitirCruces acepta choques pero no repetir actividad', () => {
  assert.equal(validarInscripcion('ingles-emprendedor-1', ['lengua-senas-1'], { permitirCruces: true }).ok, true);
  assert.equal(validarInscripcion('yoga-3', ['yoga-1'], { permitirCruces: true }).ok, false);
});

test('validarInscripcion rechaza sesiones inexistentes', () => {
  assert.equal(validarInscripcion('no-existe', []).ok, false);
});

test('buildTalleresPayload cuenta inscritos y lista personas solo cuando se piden', () => {
  const filas = [
    { user_id: 'u1', sesion_id: 'canva-1', created_at: '2026-10-23' },
    { user_id: 'u2', sesion_id: 'canva-1', created_at: '2026-10-23' },
  ];
  const publico = buildTalleresPayload(filas);
  const canva = publico.find((act) => act.id === 'canva');
  assert.equal(canva.sesiones[0].inscritos, 2);
  assert.equal(canva.sesiones[0].personas, undefined);

  const personas = new Map([['u1', { id: 'u1', nombre: 'Ana' }]]);
  const programa = buildTalleresPayload(filas, personas);
  assert.deepEqual(programa.find((act) => act.id === 'canva').sesiones[0].personas.map((p) => p.nombre), ['Ana', 'Sin nombre']);
  assert.equal(programa.length, ACTIVIDADES.length);
});
