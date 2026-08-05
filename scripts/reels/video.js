import { execFileSync } from 'node:child_process';

// Convierte el PNG del slide en un reel corto vertical (9:16).
// Aplica un zoom sutil (ken burns) y un fade de entrada y salida.

// Elige el primer codec H.264 disponible: libx264 (GitHub Actions) o
// libopenh264 (entornos donde libx264 no esta compilado).
function codecDisponible() {
  const salida = execFileSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' });
  if (salida.includes('libx264')) return 'libx264';
  if (salida.includes('libopenh264')) return 'libopenh264';
  throw new Error('No hay codificador H.264 disponible en este ffmpeg');
}

export function crearVideo(png, salida, duracionSegundos = 8) {
  const fps = 30;
  const frames = duracionSegundos * fps;
  const codec = codecDisponible();
  const filtro = [
    `scale=1440:-1`,
    `zoompan=z='min(1.0+0.0008*on,1.25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${fps}`,
    'format=yuv420p',
    `fade=t=in:st=0:d=0.4`,
    `fade=t=out:st=${duracionSegundos - 0.4}:d=0.4`,
  ].join(',');

  const argumentos = [
    '-y',
    '-loop',
    '1',
    '-i',
    png,
    '-t',
    String(duracionSegundos),
    '-vf',
    filtro,
    '-c:v',
    codec,
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    salida,
  ];
  // libx264 tiene presets de velocidad; openh264 se queda con sus valores por defecto.
  if (codec === 'libx264') {
    argumentos.splice(argumentos.indexOf('-pix_fmt'), 0, '-preset', 'fast');
  }

  execFileSync('ffmpeg', argumentos, { stdio: ['ignore', 'ignore', 'inherit'] });
}
