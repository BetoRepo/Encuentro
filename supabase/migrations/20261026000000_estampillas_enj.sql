-- Catálogo de estampillas (logros) del ENJ 2026, según la "Guía de Estampillas".
-- Las imágenes viven en public/estampillas/. Se pueden volver a ejecutar sin duplicar: actualiza por nombre.
alter table public.insignias add column if not exists orden integer;
grant select (orden) on public.insignias to anon, authenticated;

with catalogo (orden, nombre, descripcion, imagen_url, tipo) as (
  values
    (1,  'Foto con el Asesor', 'Tómate una foto con el Asesor del ENJ.', '/estampillas/foto-asesor.png', 'reto'),
    (2,  'Conoce a otras personas', 'Conoce a 5 personas de diferentes estados.', '/estampillas/conoce-personas.png', 'reto'),
    (3,  'Foto con un joven del Staff Juvenil', 'Tómate una foto con cualquier miembro del Staff Juvenil.', '/estampillas/foto-staff-juvenil.png', 'reto'),
    (4,  'Desafío Generación Z', 'Asiste a más de 5 actividades del Desafío Generación Z.', '/estampillas/desafio-generacion-z.png', 'desafio'),
    (5,  'Foto persona secreta', 'Tómale una foto a la persona secreta.', '/estampillas/persona-secreta.png', 'reto'),
    (6,  'Rally de Velocidad', 'Participa en el Rally de Velocidad del Desafío Generación Z.', '/estampillas/rally-velocidad.png', 'desafio'),
    (7,  'Buen uso de la IA', 'Participa en la Masterclass de IA del Desafío Generación Z.', '/estampillas/buen-uso-ia.png', 'desafio'),
    (8,  'Taller LSV', 'Participa en la Masterclass de LSV del Desafío Generación Z.', '/estampillas/taller-lsv.png', 'desafio'),
    (9,  'Inglés Empresarial', 'Participa en la Masterclass de Inglés Empresarial del Desafío Generación Z.', '/estampillas/ingles-empresarial.png', 'desafio'),
    (10, 'Asamblea General', 'Participa en la Asamblea de la Red en Vivo.', '/estampillas/asamblea-general.png', 'red'),
    (11, 'Foto de diferentes pañoletas', 'Tómate 5 fotos intercambiando pañoletas con otras personas.', '/estampillas/panoletas.png', 'reto'),
    (12, 'Tus lugares favoritos', 'Lista y tómale foto a al menos 3 lugares favoritos en Set.', '/estampillas/lugares-favoritos.png', 'reto'),
    (13, 'Just Dance', 'Baila 3 canciones de Just Dance; una de ellas debes bailarla con al menos un amigo o compañero de aventura.', '/estampillas/just-dance.png', 'reto'),
    (14, 'Negociación', 'Participa en la Masterclass de Negociación del Desafío Generación Z.', '/estampillas/negociacion.png', 'desafio'),
    (15, 'Organización Financiera', 'Participa en la Masterclass de Excel del Desafío Generación Z.', '/estampillas/organizacion-financiera.png', 'desafio'),
    (16, 'Votación', 'Ejerce tu voto en la Red en Vivo.', '/estampillas/votacion.png', 'red'),
    (17, 'Mesas de Trabajo', 'Participa en las Mesas de Trabajo 1, 2 y 3 de la Red en Vivo.', '/estampillas/mesas-trabajo.png', 'red'),
    (18, 'Marca Personal', 'Participa en la Masterclass de CV del Desafío Generación Z.', '/estampillas/marca-personal.png', 'desafio'),
    (19, 'Comunicaciones', 'Participa en la Masterclass de Canva del Desafío Generación Z.', '/estampillas/comunicaciones.png', 'desafio'),
    (20, 'Juegos Extremos', 'Participa en los Juegos Extremos del Desafío Generación Z.', '/estampillas/juegos-extremos.png', 'desafio'),
    (21, 'Yoga', 'Participa en una actividad de Yoga.', '/estampillas/yoga.png', 'reto'),
    (22, 'Spooky Festival', 'Solicita un reto en la fiesta y cúmplelo antes de que se acabe.', '/estampillas/spooky-festival.png', 'reto'),
    (23, 'Salud Mental', 'Participa en todas las ponencias relacionadas con la salud mental y el bienestar.', '/estampillas/salud-mental.png', 'reto'),
    -- La descripción de cada estampilla no trae la de Demos Days; ajustar cuando esté definida.
    (24, 'Demos Days', 'Participa en los Demos Days del ENJ.', '/estampillas/demos-days.png', 'reto'),
    (25, 'Amistad', 'Ve con un amigo o compañero a hacer pulseras de la amistad e intercámbienlas.', '/estampillas/amistad.png', 'reto')
),
actualizadas as (
  update public.insignias i
  set orden = c.orden, descripcion = c.descripcion, imagen_url = c.imagen_url, tipo = c.tipo
  from catalogo c
  where i.nombre = c.nombre
  returning i.nombre
)
insert into public.insignias (orden, nombre, descripcion, imagen_url, tipo)
select c.orden, c.nombre, c.descripcion, c.imagen_url, c.tipo
from catalogo c
where not exists (select 1 from public.insignias i where i.nombre = c.nombre);
