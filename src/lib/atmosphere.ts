export type Rgb = { r: number; g: number; b: number };

export type Palette = {
  glow: string;
  accent: string;
  wash: string;
  deep: string;
};

const SAMPLE = 48;
const NIGHT: Rgb = { r: 18, g: 17, b: 2 };
const PAPER: Rgb = { r: 237, g: 238, b: 255 };
const cache = new Map<string, Promise<{ dark: Palette; light: Palette }>>();

export const DEFAULT_PALETTE: Palette = {
  glow: 'rgb(42, 38, 22)',
  accent: 'rgb(28, 32, 28)',
  wash: 'rgb(22, 21, 10)',
  deep: 'rgb(18, 17, 2)',
};

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s, l };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function toCss(c: Rgb) {
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function tintToward(
  sample: Rgb,
  base: Rgb,
  { lightness, saturation, mix = 0.55 }: { lightness: number; saturation: number; mix?: number }
) {
  const hsl = rgbToHsl(sample.r, sample.g, sample.b);
  const shifted = hslToRgb(hsl.h, Math.min(0.55, hsl.s * saturation + 0.12), lightness);
  return mixRgb(base, shifted, mix);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

type Bucket = Rgb & { count: number; sat: number; hue: number };

function sampleBuckets(img: HTMLImageElement): Bucket[] {
  const canvas = document.createElement('canvas');
  canvas.width = SAMPLE;
  canvas.height = SAMPLE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
  const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);
  const map = new Map<number, Bucket>();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (data[i + 3] < 200) continue;
    const { h, s, l } = rgbToHsl(r, g, b);
    if (l < 0.08 || l > 0.92 || s < 0.08) continue;
    const hue = Math.round(h / 24) * 24;
    const prev = map.get(hue);
    if (prev) {
      prev.r += r;
      prev.g += g;
      prev.b += b;
      prev.count += 1;
      prev.sat += s;
    } else {
      map.set(hue, { r, g, b, count: 1, sat: s, hue });
    }
  }
  return Array.from(map.values())
    .map((b) => ({
      r: Math.round(b.r / b.count),
      g: Math.round(b.g / b.count),
      b: Math.round(b.b / b.count),
      count: b.count,
      sat: b.sat / b.count,
      hue: b.hue,
    }))
    .sort((a, b) => b.count * (0.65 + b.sat) - a.count * (0.65 + a.sat));
}

function roles(buckets: Bucket[]) {
  const primary = buckets[0] ?? { r: 90, g: 78, b: 42, hue: 40, count: 1, sat: 0.2 };
  const secondary =
    buckets.find((b) => {
      const d = Math.abs(b.hue - primary.hue);
      return Math.min(d, 360 - d) > 40;
    }) ??
    buckets[1] ??
    primary;
  return {
    primary,
    secondary,
    tertiary: buckets[2] ?? mixRgb(primary, secondary, 0.5),
  };
}

function paletteFrom(buckets: Bucket[], theme: 'dark' | 'light'): Palette {
  const { primary, secondary, tertiary } = roles(buckets);
  const base = theme === 'light' ? PAPER : NIGHT;
  const light = theme === 'light';
  const glow = tintToward(primary, base, {
    lightness: light ? 0.68 : 0.28,
    saturation: light ? 1.2 : 1.25,
    mix: 0.82,
  });
  const accent = tintToward(secondary, base, {
    lightness: light ? 0.76 : 0.2,
    saturation: 1.05,
    mix: 0.7,
  });
  const wash = tintToward(tertiary, base, {
    lightness: light ? 0.84 : 0.14,
    saturation: 0.85,
    mix: 0.55,
  });
  const deep = mixRgb(
    base,
    tintToward(primary, base, {
      lightness: light ? 0.9 : 0.1,
      saturation: light ? 0.65 : 0.75,
      mix: light ? 0.4 : 0.48,
    }),
    light ? 0.65 : 0.7
  );
  return { glow: toCss(glow), accent: toCss(accent), wash: toCss(wash), deep: toCss(deep) };
}

export async function paletteFromImage(src: string): Promise<Palette> {
  if (!src) return DEFAULT_PALETTE;
  const hit = cache.get(src);
  if (hit) return (await hit).dark;
  const pending = (async () => {
    try {
      const buckets = sampleBuckets(await loadImage(src));
      return { dark: paletteFrom(buckets, 'dark'), light: paletteFrom(buckets, 'light') };
    } catch {
      return { dark: DEFAULT_PALETTE, light: DEFAULT_PALETTE };
    }
  })();
  cache.set(src, pending);
  return (await pending).dark;
}

export function applyPalette(el: HTMLElement | null, palette: Palette) {
  if (!el) return;
  el.style.setProperty('--page-glow', palette.glow);
  el.style.setProperty('--page-accent', palette.accent);
  el.style.setProperty('--page-wash', palette.wash);
  el.style.setProperty('--page-deep', palette.deep);
}
