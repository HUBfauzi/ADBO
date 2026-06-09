// ═══════════════════════════════════════════════════════════
// DB.JS — localStorage CRUD Wrapper + Seed Data
// ═══════════════════════════════════════════════════════════

const DB = {
  // ── Generic CRUD ──
  getAll(collection) {
    return JSON.parse(localStorage.getItem(collection) || '[]');
  },

  getById(collection, id) {
    return this.getAll(collection).find(item => item.id === id) || null;
  },

  insert(collection, item) {
    const data = this.getAll(collection);
    item.id = item.id || this.generateId();
    item.createdAt = item.createdAt || new Date().toISOString();
    data.push(item);
    localStorage.setItem(collection, JSON.stringify(data));
    return item;
  },

  update(collection, id, updates) {
    const data = this.getAll(collection);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;
    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(collection, JSON.stringify(data));
    return data[index];
  },

  delete(collection, id) {
    const data = this.getAll(collection).filter(item => item.id !== id);
    localStorage.setItem(collection, JSON.stringify(data));
  },

  count(collection, filterFn) {
    const data = this.getAll(collection);
    return filterFn ? data.filter(filterFn).length : data.length;
  },

  filter(collection, filterFn) {
    return this.getAll(collection).filter(filterFn);
  },

  generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  },

  // ── Seed Data ──
  seed() {
    if (localStorage.getItem('_seeded')) return;

    // Users
    const users = [
      { id: 'user_1', nama: 'Budi Santoso', email: 'masyarakat@demo.com', password: '123456', role: 'masyarakat', nik: '3201010101010001', alamat: 'Jl. Merdeka No. 10, Jakarta', telepon: '081234567890', createdAt: '2026-01-15T08:00:00Z' },
      { id: 'user_2', nama: 'Siti Rahayu', email: 'admin@demo.com', password: '123456', role: 'admin', nik: '3201010101010002', alamat: 'Jl. Sudirman No. 5, Jakarta', telepon: '081234567891', createdAt: '2026-01-10T08:00:00Z' },
      { id: 'user_3', nama: 'Ahmad Fauzi', email: 'petugas@demo.com', password: '123456', role: 'petugas', nik: '3201010101010003', alamat: 'Jl. Gatot Subroto No. 20, Jakarta', telepon: '081234567892', createdAt: '2026-01-12T08:00:00Z' },
      { id: 'user_4', nama: 'Dr. Hendra Wijaya', email: 'kepala@demo.com', password: '123456', role: 'kepala_dinas', nik: '3201010101010004', alamat: 'Jl. Thamrin No. 1, Jakarta', telepon: '081234567893', createdAt: '2026-01-08T08:00:00Z' },
      { id: 'user_5', nama: 'Dewi Lestari', email: 'dewi@contoh.com', password: '123456', role: 'masyarakat', nik: '3201010101010005', alamat: 'Jl. Asia Afrika No. 15, Bandung', telepon: '082345678901', createdAt: '2026-02-20T08:00:00Z' },
      { id: 'user_6', nama: 'Rizky Pratama', email: 'rizky@contoh.com', password: '123456', role: 'petugas', nik: '3201010101010006', alamat: 'Jl. Diponegoro No. 8, Surabaya', telepon: '082345678902', createdAt: '2026-02-25T08:00:00Z' },
    ];
    localStorage.setItem('users', JSON.stringify(users));

    // Kategori Kerusakan
    const kategori = [
      { id: 'kat_1', nama: 'Jalan Berlubang', deskripsi: 'Kerusakan permukaan jalan berupa lubang', icon: '🛣️', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'kat_2', nama: 'Lampu Jalan Mati', deskripsi: 'Penerangan jalan umum yang tidak berfungsi', icon: '💡', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'kat_3', nama: 'Jembatan Rusak', deskripsi: 'Kerusakan struktur jembatan', icon: '🌉', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'kat_4', nama: 'Taman Tidak Terawat', deskripsi: 'Taman kota yang rusak atau tidak terawat', icon: '🌳', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'kat_5', nama: 'Saluran Air Tersumbat', deskripsi: 'Drainase atau saluran air yang tersumbat', icon: '🚰', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'kat_6', nama: 'Trotoar Rusak', deskripsi: 'Kerusakan trotoar pejalan kaki', icon: '🚶', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'kat_7', nama: 'Fasilitas Umum Lainnya', deskripsi: 'Kerusakan fasilitas umum yang tidak termasuk kategori lain', icon: '🏗️', createdAt: '2026-01-01T00:00:00Z' },
    ];
    localStorage.setItem('kategori', JSON.stringify(kategori));

    // Laporan Kerusakan (sample data)
    const laporan = [
      {
        id: 'lap_1', userId: 'user_1', judul: 'Jalan Berlubang di Jl. Merdeka',
        deskripsi: 'Terdapat lubang besar di Jl. Merdeka depan kantor pos, diameter sekitar 1 meter, membahayakan pengendara motor.',
        kategoriId: 'kat_1', lokasi: 'Jl. Merdeka No. 10, Jakarta Pusat',
        foto: null, status: 'selesai', petugasId: 'user_3',
        fotoBukti: null, catatanAdmin: 'Laporan valid, segera ditangani.',
        catatanPetugas: 'Lubang telah ditambal dengan aspal baru.',
        createdAt: '2026-03-10T09:00:00Z', updatedAt: '2026-03-18T16:00:00Z'
      },
      {
        id: 'lap_2', userId: 'user_1', judul: 'Lampu Jalan Mati di RT 05',
        deskripsi: '3 lampu jalan mati berturut-turut di sepanjang gang RT 05, membuat jalan sangat gelap di malam hari.',
        kategoriId: 'kat_2', lokasi: 'Gang RT 05/RW 02, Kelurahan Menteng',
        foto: null, status: 'dalam_pengerjaan', petugasId: 'user_3',
        fotoBukti: null, catatanAdmin: 'Sudah diverifikasi, 3 lampu perlu diganti.',
        catatanPetugas: null,
        createdAt: '2026-04-05T14:00:00Z', updatedAt: '2026-04-12T10:00:00Z'
      },
      {
        id: 'lap_3', userId: 'user_5', judul: 'Trotoar Retak di Jl. Sudirman',
        deskripsi: 'Trotoar di depan Mall Sudirman retak parah, beberapa bagian sudah terangkat dan berbahaya untuk pejalan kaki.',
        kategoriId: 'kat_6', lokasi: 'Jl. Sudirman No. 45, Jakarta Selatan',
        foto: null, status: 'didisposisi', petugasId: 'user_6',
        fotoBukti: null, catatanAdmin: 'Didisposisi ke petugas Rizky.',
        catatanPetugas: null,
        createdAt: '2026-05-01T11:00:00Z', updatedAt: '2026-05-05T09:00:00Z'
      },
      {
        id: 'lap_4', userId: 'user_5', judul: 'Taman Kota Tidak Terawat',
        deskripsi: 'Taman kota di Kelurahan Cikini rumputnya sudah sangat panjang, banyak sampah, dan bangku taman rusak.',
        kategoriId: 'kat_4', lokasi: 'Taman Kota Cikini, Jakarta Pusat',
        foto: null, status: 'diverifikasi', petugasId: null,
        fotoBukti: null, catatanAdmin: 'Laporan valid.',
        catatanPetugas: null,
        createdAt: '2026-05-15T08:00:00Z', updatedAt: '2026-05-16T10:00:00Z'
      },
      {
        id: 'lap_5', userId: 'user_1', judul: 'Saluran Air Tersumbat di Jl. Kebon Sirih',
        deskripsi: 'Saluran drainase tersumbat, saat hujan air meluap ke jalan.',
        kategoriId: 'kat_5', lokasi: 'Jl. Kebon Sirih No. 30, Jakarta Pusat',
        foto: null, status: 'terkirim', petugasId: null,
        fotoBukti: null, catatanAdmin: null,
        catatanPetugas: null,
        createdAt: '2026-06-01T10:00:00Z', updatedAt: null
      },
      {
        id: 'lap_6', userId: 'user_5', judul: 'Jembatan Penyeberangan Retak',
        deskripsi: 'Jembatan penyeberangan orang di dekat halte bus Harmoni mengalami retakan pada lantai.',
        kategoriId: 'kat_3', lokasi: 'Halte Bus Harmoni, Jakarta Pusat',
        foto: null, status: 'ditolak', petugasId: null,
        fotoBukti: null, catatanAdmin: 'Laporan duplikat. Sudah dilaporkan sebelumnya.',
        catatanPetugas: null,
        createdAt: '2026-05-28T15:00:00Z', updatedAt: '2026-05-29T09:00:00Z'
      }
    ];
    localStorage.setItem('laporan', JSON.stringify(laporan));

    localStorage.setItem('_seeded', 'true');
    console.log('✅ Database seeded successfully');
  },

  // Reset all data
  reset() {
    localStorage.clear();
    this.seed();
  }
};

// Auto-seed on load
DB.seed();
