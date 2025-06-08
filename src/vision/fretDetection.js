export async function loadOpenCV() {
  if (window.cv) return window.cv;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/opencv.js@4.10.0/opencv.js';
    script.async = true;
    script.onload = () => {
      if (window.cv && window.cv.ready) {
        window.cv.onRuntimeInitialized = () => resolve(window.cv);
      } else {
        resolve(window.cv);
      }
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export function detectFrets(src, opts = { cannyThreshold1: 50, cannyThreshold2: 150, houghThreshold: 50 }) {
  const cv = window.cv;
  if (!cv) throw new Error('OpenCV.js no cargado');

  const canvas = document.createElement('canvas');
  canvas.width = src.videoWidth || src.width;
  canvas.height = src.videoHeight || src.height;
  canvas.getContext('2d').drawImage(src, 0, 0, canvas.width, canvas.height);

  const mat = cv.imread(canvas);
  const gray = new cv.Mat();
  const blur = new cv.Mat();
  const edges = new cv.Mat();
  const lines = new cv.Mat();

  cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
  cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);
  cv.Canny(blur, edges, opts.cannyThreshold1, opts.cannyThreshold2);
  cv.HoughLinesP(edges, lines, 1, Math.PI / 180, opts.houghThreshold, 50, 10);

  const frets = [];
  for (let i = 0; i < lines.rows; i++) {
    const data = lines.data32S.subarray(i * 4, i * 4 + 4);
    const angle = Math.atan2(data[3] - data[1], data[2] - data[0]) * (180 / Math.PI);
    if (Math.abs(angle) < 10) frets.push({ x1: data[0], y1: data[1], x2: data[2], y2: data[3] });
  }
  frets.sort((a, b) => a.y1 - b.y1);

  const clusters = [];
  frets.forEach((l) => {
    const existing = clusters.find((c) => Math.abs(c.y - l.y1) < 15);
    if (existing) {
      existing.lines.push(l);
      existing.y = (existing.y * (existing.lines.length - 1) + l.y1) / existing.lines.length;
    } else {
      clusters.push({ y: l.y1, lines: [l] });
    }
  });

  const averaged = clusters.map((c) => {
    const sum = c.lines.reduce(
      (acc, l) => ({ x1: acc.x1 + l.x1, y1: acc.y1 + l.y1, x2: acc.x2 + l.x2, y2: acc.y2 + l.y2 }),
      { x1: 0, y1: 0, x2: 0, y2: 0 },
    );
    const n = c.lines.length;
    return {
      x1: (sum.x1 / n) | 0,
      y1: (sum.y1 / n) | 0,
      x2: (sum.x2 / n) | 0,
      y2: (sum.y2 / n) | 0,
    };
  });

  mat.delete();
  gray.delete();
  blur.delete();
  edges.delete();
  lines.delete();

  return averaged;
}
