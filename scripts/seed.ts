import fs from 'fs';
import path from 'path';

import mongoose from 'mongoose';

import User from '../src/models/User';
import Roadmap from '../src/models/Roadmap';

function parseEnvFile(envPath: string): Record<string, string> {
  if (!fs.existsSync(envPath)) return {};

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const env: Record<string, string> = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    // Strip optional surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function loadEnvFromDotEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  const parsed = parseEnvFile(envPath);

  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] == null || process.env[key] === '') {
      process.env[key] = value;
    }
  }
}

type SeedRoadmap = {
  title: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  isOfficial: boolean;
  nodes: any[];
  edges: any[];
};

const SEED_ROADMAPS: SeedRoadmap[] = [
  {
    title: 'Roadmap Tauhid (Aqidah Dasar)',
    slug: 'tauhid-dasar',
    description: 'Panduan tematik memahami tauhid, rukun iman, dan prinsip aqidah secara bertahap',
    icon: '🕌',
    category: 'aqidah',
    difficulty: 'beginner',
    tags: ['tauhid', 'aqidah', 'rukun-iman', 'asma-was-sifat'],
    isFeatured: true,
    isPublished: true,
    isOfficial: true,
    nodes: [
      {
        id: 't_1',
        label: 'Apa itu Tauhid?',
        description: 'Definisi tauhid dan mengapa ia menjadi fondasi utama dalam Islam.',
        type: 'topic',
        position: { x: 450, y: 80 },
        estimatedHours: 4,
        resources: [{ title: 'Ringkasan konsep tauhid (artikel)', url: 'https://islamqa.info/en', type: 'article' }],
      },
      { id: 't_2', label: 'Tiga Jenis Tauhid', description: 'Tauhid Rububiyyah, Uluhiyyah, dan Asma’ wa Sifat (gambaran umum).', type: 'topic', position: { x: 220, y: 200 }, estimatedHours: 6 },
      { id: 't_3', label: 'Rububiyyah', description: 'Mengimani Allah sebagai Rabb: pencipta, pengatur, dan pemilik segala sesuatu.', type: 'subtopic', position: { x: 120, y: 330 }, estimatedHours: 5 },
      { id: 't_4', label: 'Uluhiyyah', description: 'Memurnikan ibadah hanya kepada Allah (doa, tawakkal, nadzar, dll).', type: 'milestone', position: { x: 320, y: 330 }, estimatedHours: 8 },
      { id: 't_5', label: 'Asma’ wa Sifat', description: 'Adab memahami nama dan sifat Allah: menetapkan tanpa tahrif/takyif/tamsil.', type: 'topic', position: { x: 520, y: 200 }, estimatedHours: 7 },
      { id: 't_6', label: 'Syirik Besar vs Syirik Kecil', description: 'Mengenali bentuk-bentuk syirik dan dampaknya terhadap amal.', type: 'checkpoint', position: { x: 720, y: 330 }, estimatedHours: 6 },
      { id: 't_7', label: 'Rukun Iman (Ringkas)', description: 'Iman kepada Allah, malaikat, kitab, rasul, hari akhir, qadar (overview).', type: 'topic', position: { x: 480, y: 480 }, estimatedHours: 8 },
      { id: 't_8', label: 'Adab Ikhtilaf & Menguatkan Iman', description: 'Cara belajar yang lurus: adab, bertanya pada ahlinya, dan menjaga hati.', type: 'milestone', position: { x: 260, y: 620 }, estimatedHours: 6 },
    ],
    edges: [
      { source: 't_1', target: 't_2' },
      { source: 't_1', target: 't_5' },
      { source: 't_2', target: 't_3' },
      { source: 't_2', target: 't_4' },
      { source: 't_5', target: 't_6' },
      { source: 't_4', target: 't_6' },
      { source: 't_6', target: 't_7' },
      { source: 't_7', target: 't_8' },
    ],
  },
  {
    title: 'Roadmap Fiqh Ibadah (Praktik Harian)',
    slug: 'fiqh-ibadah',
    description: 'Belajar fiqh ibadah dari dasar: thaharah, shalat, puasa, zakat, hingga haji',
    icon: '📿',
    category: 'fiqh',
    difficulty: 'beginner',
    tags: ['fiqh', 'thaharah', 'shalat', 'puasa', 'zakat'],
    isFeatured: true,
    isPublished: true,
    isOfficial: true,
    nodes: [
      { id: 'f_1', label: 'Peta Fiqh Ibadah', description: 'Gambaran umum apa saja topik fiqh ibadah yang akan dipelajari.', type: 'topic', position: { x: 450, y: 80 }, estimatedHours: 3 },
      { id: 'f_2', label: 'Thaharah (Bersuci)', description: 'Air, najis, wudhu, mandi, tayammum, dan hal-hal yang membatalkan.', type: 'milestone', position: { x: 250, y: 220 }, estimatedHours: 12 },
      { id: 'f_3', label: 'Shalat', description: 'Syarat, rukun, wajib, sunnah, dan kesalahan umum.', type: 'milestone', position: { x: 650, y: 220 }, estimatedHours: 16 },
      { id: 'f_4', label: 'Puasa', description: 'Niat, pembatal, qadha, fidyah, dan adab Ramadhan.', type: 'topic', position: { x: 250, y: 400 }, estimatedHours: 10 },
      { id: 'f_5', label: 'Zakat', description: 'Konsep harta, nisab, haul, zakat fitrah, dan zakat maal (overview).', type: 'topic', position: { x: 650, y: 400 }, estimatedHours: 10 },
      { id: 'f_6', label: 'Haji & Umrah (Ringkas)', description: 'Manasik dasar: ihram, tawaf, sa’i, wukuf, tahallul.', type: 'checkpoint', position: { x: 450, y: 560 }, estimatedHours: 8 },
      { id: 'f_7', label: 'Adab Ibadah & Konsistensi', description: 'Ikhlas, ittiba’, dan membangun rutinitas ibadah yang berkelanjutan.', type: 'milestone', position: { x: 450, y: 720 }, estimatedHours: 6 },
    ],
    edges: [
      { source: 'f_1', target: 'f_2' },
      { source: 'f_1', target: 'f_3' },
      { source: 'f_2', target: 'f_3' },
      { source: 'f_3', target: 'f_4' },
      { source: 'f_3', target: 'f_5' },
      { source: 'f_4', target: 'f_6' },
      { source: 'f_5', target: 'f_6' },
      { source: 'f_6', target: 'f_7' },
    ],
  },
  {
    title: 'Roadmap Sirah Nabawiyah (Sejarah & Pelajaran)',
    slug: 'sirah-nabawiyah',
    description: 'Mempelajari sirah Nabi ﷺ secara kronologis dan tematik beserta ibrah-nya',
    icon: '📖',
    category: 'sirah',
    difficulty: 'intermediate',
    tags: ['sirah', 'makkah', 'madinah', 'akhlaq', 'ibrah'],
    isFeatured: true,
    isPublished: true,
    isOfficial: true,
    nodes: [
      { id: 's_1', label: 'Pengenalan Sirah', description: 'Mengapa belajar sirah, sumber-sumber, dan cara mengambil pelajaran.', type: 'topic', position: { x: 450, y: 80 }, estimatedHours: 4 },
      { id: 's_2', label: 'Masa Pra-Kenabian', description: 'Mekkah, keluarga, dan lingkungan sebelum diangkat menjadi nabi.', type: 'topic', position: { x: 250, y: 220 }, estimatedHours: 6 },
      { id: 's_3', label: 'Dakwah di Makkah', description: 'Tahapan dakwah, ujian, hijrah ke Habasyah, dan pelajaran kesabaran.', type: 'milestone', position: { x: 650, y: 220 }, estimatedHours: 12 },
      { id: 's_4', label: 'Hijrah', description: 'Makna hijrah, persiapan, dan dampak strategis bagi umat.', type: 'checkpoint', position: { x: 250, y: 420 }, estimatedHours: 6 },
      { id: 's_5', label: 'Madinah: Membangun Masyarakat', description: 'Masjid, ukhuwah, piagam, dan fondasi sosial.', type: 'milestone', position: { x: 650, y: 420 }, estimatedHours: 10 },
      { id: 's_6', label: 'Ghazawat & Diplomasi', description: 'Pelajaran kepemimpinan, strategi, dan adab dalam konflik.', type: 'topic', position: { x: 450, y: 600 }, estimatedHours: 10 },
      { id: 's_7', label: 'Akhir Kehidupan & Warisan', description: 'Haji wada’, pesan-pesan, dan prinsip-prinsip yang tetap relevan.', type: 'milestone', position: { x: 450, y: 760 }, estimatedHours: 8 },
    ],
    edges: [
      { source: 's_1', target: 's_2' },
      { source: 's_1', target: 's_3' },
      { source: 's_3', target: 's_4' },
      { source: 's_4', target: 's_5' },
      { source: 's_5', target: 's_6' },
      { source: 's_6', target: 's_7' },
    ],
  },
  {
    title: 'Roadmap Al-Qur’an (Tilawah → Tadabbur)',
    slug: 'quran-tilawah-tadabbur',
    description: 'Tahsin & tajwid, hafalan bertahap, hingga dasar-dasar tadabbur dan pengamalan',
    icon: '📗',
    category: 'quran',
    difficulty: 'beginner',
    tags: ['quran', 'tajwid', 'tahsin', 'hafalan', 'tadabbur'],
    isFeatured: false,
    isPublished: true,
    isOfficial: true,
    nodes: [
      { id: 'q_1', label: 'Niat & Adab dengan Al-Qur’an', description: 'Adab belajar dan menjaga konsistensi (sedikit tapi rutin).', type: 'topic', position: { x: 450, y: 80 }, estimatedHours: 3 },
      { id: 'q_2', label: 'Makharij & Sifat Huruf', description: 'Dasar tahsin: cara keluarnya huruf dan sifat-sifatnya.', type: 'milestone', position: { x: 250, y: 220 }, estimatedHours: 14 },
      { id: 'q_3', label: 'Hukum Tajwid Dasar', description: 'Mad, ghunnah, nun/mim sukun, qalqalah (overview).', type: 'milestone', position: { x: 650, y: 220 }, estimatedHours: 16 },
      { id: 'q_4', label: 'Tilawah Harian', description: 'Membuat jadwal tilawah harian + evaluasi bacaan.', type: 'topic', position: { x: 250, y: 420 }, estimatedHours: 8 },
      { id: 'q_5', label: 'Hafalan Bertahap', description: 'Metode menghafal: target kecil, murajaah, dan konsistensi.', type: 'topic', position: { x: 650, y: 420 }, estimatedHours: 20 },
      { id: 'q_6', label: 'Dasar Tadabbur', description: 'Memahami konteks, tema ayat, dan mengambil pelajaran praktis.', type: 'checkpoint', position: { x: 450, y: 610 }, estimatedHours: 12 },
      { id: 'q_7', label: 'Amalan & Evaluasi', description: 'Membuat catatan amal, muhasabah, dan menjaga peningkatan.', type: 'milestone', position: { x: 450, y: 770 }, estimatedHours: 8 },
    ],
    edges: [
      { source: 'q_1', target: 'q_2' },
      { source: 'q_1', target: 'q_3' },
      { source: 'q_2', target: 'q_4' },
      { source: 'q_3', target: 'q_4' },
      { source: 'q_4', target: 'q_5' },
      { source: 'q_5', target: 'q_6' },
      { source: 'q_6', target: 'q_7' },
    ],
  },
  {
    title: 'Roadmap Ulumul Hadits (Dasar Sanad & Matan)',
    slug: 'ulumul-hadits-dasar',
    description: 'Memahami istilah hadits, validasi riwayat, dan adab berinteraksi dengan sunnah',
    icon: '🧾',
    category: 'hadith',
    difficulty: 'intermediate',
    tags: ['hadits', 'isnad', 'matan', 'musthalah', 'adab'],
    isFeatured: false,
    isPublished: true,
    isOfficial: true,
    nodes: [
      { id: 'h_1', label: 'Pengenalan Hadits', description: 'Peran sunnah, istilah dasar, dan adab belajar hadits.', type: 'topic', position: { x: 450, y: 80 }, estimatedHours: 4 },
      { id: 'h_2', label: 'Sanad & Perawi', description: 'Apa itu sanad, generasi perawi, dan mengapa sanad penting.', type: 'milestone', position: { x: 250, y: 220 }, estimatedHours: 10 },
      { id: 'h_3', label: 'Matan & Makna', description: 'Memahami teks hadits dan prinsip kehati-hatian dalam menyimpulkan.', type: 'topic', position: { x: 650, y: 220 }, estimatedHours: 8 },
      { id: 'h_4', label: 'Klasifikasi Hadits', description: 'Shahih, hasan, da’if (gambaran umum dan contoh sederhana).', type: 'checkpoint', position: { x: 250, y: 420 }, estimatedHours: 10 },
      { id: 'h_5', label: 'Musthalah Hadits Dasar', description: 'Istilah inti yang sering muncul dalam kitab-kitab hadits.', type: 'topic', position: { x: 650, y: 420 }, estimatedHours: 12 },
      { id: 'h_6', label: 'Cara Rujuk Sumber', description: 'Membedakan teks, syarah, dan takhrij secara konseptual (tanpa teknis berat).', type: 'milestone', position: { x: 450, y: 620 }, estimatedHours: 10 },
      { id: 'h_7', label: 'Praktik: Ringkas & Amalkan', description: 'Meringkas faedah hadits dan merencanakan pengamalan harian.', type: 'milestone', position: { x: 450, y: 780 }, estimatedHours: 8 },
    ],
    edges: [
      { source: 'h_1', target: 'h_2' },
      { source: 'h_1', target: 'h_3' },
      { source: 'h_2', target: 'h_4' },
      { source: 'h_3', target: 'h_5' },
      { source: 'h_4', target: 'h_6' },
      { source: 'h_5', target: 'h_6' },
      { source: 'h_6', target: 'h_7' },
    ],
  },
];

async function upsertAdminUser() {
  const name = process.env.SEED_ADMIN_NAME || 'Admin';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@roadmap.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

  let admin = await User.findOne({ email }).select('+password');
  if (!admin) {
    admin = new (User as any)({
      name,
      email,
      password,
      role: 'admin',
    });
    await admin.save();
    return { admin, created: true, email, password };
  }

  let changed = false;
  if (admin.role !== 'admin') {
    admin.role = 'admin';
    changed = true;
  }

  // Allow forcing password reset via flag
  if (process.argv.includes('--reset-admin-password')) {
    admin.password = password;
    changed = true;
  }

  if (changed) {
    await admin.save();
  }

  return { admin, created: false, email, password };
}

async function upsertRoadmaps(adminId: any) {
  for (const seed of SEED_ROADMAPS) {
    const existing = await Roadmap.findOne({ slug: seed.slug });

    if (!existing) {
      const doc = new (Roadmap as any)({
        ...seed,
        author: adminId,
      });
      await doc.save();
      continue;
    }

    existing.set({
      ...seed,
      author: existing.author || adminId,
    });

    await existing.save();
  }
}

async function main() {
  loadEnvFromDotEnvLocal();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Put it in .env.local');
  }

  const shouldReset = process.argv.includes('--reset');

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  } as any);

  if (shouldReset) {
    await Roadmap.deleteMany({});
  }

  const { admin, created, email, password } = await upsertAdminUser();
  await upsertRoadmaps(admin._id);

  await mongoose.disconnect();

  // Only print credentials when a fresh admin is created (or when explicitly requested)
  if (created || process.argv.includes('--print-admin-credentials')) {
    // Avoid printing the Mongo URI; only print login info.
    console.log(`Admin login: ${email}`);
    console.log(`Admin password: ${password}`);
  } else {
    console.log('Seed completed. Admin already existed (password unchanged).');
  }
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
