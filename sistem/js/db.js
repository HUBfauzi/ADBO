// ==========================================================
// DB.JS - Simulasi database LocalStorage + seed data UML
// ==========================================================

const DB = {
  VERSION_KEY: '_adbo_db_version',
  VERSION: '2.0.0',

  COLLECTION_ALIASES: {
    laporan: 'reports',
    kategori: 'categories'
  },

  STATUSES: [
    'diajukan',
    'menunggu_verifikasi',
    'perlu_perbaikan_data',
    'ditolak',
    'terverifikasi',
    'didisposisikan',
    'menunggu_diproses',
    'dalam_perbaikan',
    'status_diperbarui',
    'bukti_diunggah',
    'selesai'
  ],

  STATUS_FLOW: [
    'diajukan',
    'menunggu_verifikasi',
    'terverifikasi',
    'didisposisikan',
    'menunggu_diproses',
    'dalam_perbaikan',
    'status_diperbarui',
    'bukti_diunggah',
    'selesai'
  ],

  _key(collection) {
    return this.COLLECTION_ALIASES[collection] || collection;
  },

  _readRaw(key, fallback = []) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      console.warn('Gagal membaca LocalStorage:', key, error);
      return fallback;
    }
  },

  _writeRaw(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  normalizeStatus(status) {
    const legacyMap = {
      draft: 'diajukan',
      terkirim: 'menunggu_verifikasi',
      diverifikasi: 'terverifikasi',
      didisposisi: 'didisposisikan',
      dalam_pengerjaan: 'dalam_perbaikan'
    };
    const normalized = legacyMap[status] || status || 'menunggu_verifikasi';
    return this.STATUSES.includes(normalized) ? normalized : 'menunggu_verifikasi';
  },

  normalizeUser(user) {
    const name = user.name || user.nama || '';
    const address = user.address || user.alamat || '';
    const phone = user.phone || user.telepon || '';
    return {
      ...user,
      id: user.id || this.generateId('user'),
      name,
      nama: name,
      email: (user.email || '').trim().toLowerCase(),
      password: user.password || '123456',
      role: user.role || 'masyarakat',
      nik: user.nik || '',
      address,
      alamat: address,
      phone,
      telepon: phone,
      createdAt: user.createdAt || new Date().toISOString()
    };
  },

  normalizeCategory(category) {
    const name = category.name || category.nama || '';
    const description = category.description || category.deskripsi || '';
    return {
      ...category,
      id: category.id || this.generateId('cat'),
      name,
      nama: name,
      description,
      deskripsi: description,
      icon: category.icon || '📋',
      createdAt: category.createdAt || new Date().toISOString()
    };
  },

  normalizeReport(report) {
    const createdAt = report.createdAt || report.date || report.tanggal || new Date().toISOString();
    const status = this.normalizeStatus(report.status);
    const title = report.title || report.judul || '';
    const description = report.description || report.deskripsi || '';
    const location = report.location || report.lokasi || '';
    const categoryId = report.categoryId || report.kategoriId || '';
    const damagePhoto = report.damagePhoto || report.foto || null;
    const repairPhoto = report.repairPhoto || report.fotoBukti || null;
    const adminNote = report.adminNote || report.catatanAdmin || '';
    const officerNote = report.officerNote || report.catatanPetugas || '';
    const userId = report.userId || report.masyarakatId || '';
    const petugasId = report.petugasId || report.officerId || null;

    const history = Array.isArray(report.statusHistory) && report.statusHistory.length
      ? report.statusHistory.map(item => ({
          status: this.normalizeStatus(item.status),
          at: item.at || createdAt,
          by: item.by || null,
          note: item.note || ''
        }))
      : this.createInitialHistory(status, createdAt);

    return {
      ...report,
      id: report.id || this.generateId('rep'),
      title,
      judul: title,
      description,
      deskripsi: description,
      categoryId,
      kategoriId: categoryId,
      location,
      lokasi: location,
      damagePhoto,
      foto: damagePhoto,
      repairPhoto,
      fotoBukti: repairPhoto,
      status,
      userId,
      masyarakatId: userId,
      petugasId,
      officerId: petugasId,
      adminNote,
      catatanAdmin: adminNote,
      officerNote,
      catatanPetugas: officerNote,
      createdAt,
      date: report.date || createdAt,
      submittedAt: report.submittedAt || createdAt,
      updatedAt: report.updatedAt || null,
      statusHistory: history
    };
  },

  normalizeAssignment(assignment) {
    return {
      ...assignment,
      id: assignment.id || this.generateId('asg'),
      reportId: assignment.reportId,
      petugasId: assignment.petugasId || assignment.officerId,
      officerId: assignment.officerId || assignment.petugasId,
      adminId: assignment.adminId || null,
      note: assignment.note || assignment.catatan || '',
      status: assignment.status || 'aktif',
      createdAt: assignment.createdAt || new Date().toISOString(),
      updatedAt: assignment.updatedAt || null
    };
  },

  createInitialHistory(status, createdAt) {
    const history = [{ status: 'diajukan', at: createdAt, by: null, note: 'Laporan dibuat oleh masyarakat.' }];
    if (status !== 'diajukan') {
      history.push({ status, at: createdAt, by: null, note: 'Laporan masuk ke sistem.' });
    }
    return history;
  },

  // Generic CRUD
  getAll(collection) {
    return this._readRaw(this._key(collection), []);
  },

  setAll(collection, items) {
    const key = this._key(collection);
    const normalized = items.map(item => this.normalizeByCollection(key, item));
    this._writeRaw(key, normalized);
    return normalized;
  },

  getById(collection, id) {
    return this.getAll(collection).find(item => item.id === id) || null;
  },

  insert(collection, item) {
    const key = this._key(collection);
    const data = this.getAll(key);
    const normalized = this.normalizeByCollection(key, {
      ...item,
      id: item.id || this.generateId(this.getPrefix(key)),
      createdAt: item.createdAt || new Date().toISOString()
    });
    data.push(normalized);
    this._writeRaw(key, data);
    return normalized;
  },

  update(collection, id, updates) {
    const key = this._key(collection);
    const data = this.getAll(key);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;

    const merged = {
      ...data[index],
      ...updates,
      updatedAt: updates.updatedAt || new Date().toISOString()
    };
    data[index] = this.normalizeByCollection(key, merged);
    this._writeRaw(key, data);
    return data[index];
  },

  delete(collection, id) {
    const key = this._key(collection);
    const data = this.getAll(key).filter(item => item.id !== id);
    this._writeRaw(key, data);
  },

  count(collection, filterFn) {
    const data = this.getAll(collection);
    return filterFn ? data.filter(filterFn).length : data.length;
  },

  filter(collection, filterFn) {
    return this.getAll(collection).filter(filterFn);
  },

  normalizeByCollection(collection, item) {
    if (collection === 'users') return this.normalizeUser(item);
    if (collection === 'categories') return this.normalizeCategory(item);
    if (collection === 'reports') return this.normalizeReport(item);
    if (collection === 'assignments') return this.normalizeAssignment(item);
    return item;
  },

  getPrefix(collection) {
    const prefixes = {
      users: 'user',
      categories: 'cat',
      reports: 'rep',
      assignments: 'asg'
    };
    return prefixes[collection] || 'id';
  },

  generateId(prefix = 'id') {
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  },

  setSession(user) {
    const session = {
      userId: user.id,
      name: user.name || user.nama,
      email: user.email,
      role: user.role,
      loginAt: new Date().toISOString()
    };
    localStorage.setItem('currentSession', JSON.stringify(session));
    sessionStorage.setItem('currentUser', JSON.stringify(session));
    return session;
  },

  getSession() {
    const session = this._readRaw('currentSession', null);
    if (session && session.userId) return session;

    try {
      const legacyRaw = sessionStorage.getItem('currentUser');
      const legacySession = legacyRaw ? JSON.parse(legacyRaw) : null;
      return legacySession && legacySession.userId ? legacySession : null;
    } catch (error) {
      return null;
    }
  },

  clearSession() {
    localStorage.setItem('currentSession', 'null');
    sessionStorage.removeItem('currentUser');
  },

  updateReportStatus(reportId, status, updates = {}) {
    const report = this.getById('reports', reportId);
    if (!report) return null;

    const nextStatus = this.normalizeStatus(status);
    const now = new Date().toISOString();
    const history = Array.isArray(report.statusHistory) ? [...report.statusHistory] : [];
    const session = this.getSession();
    const last = history[history.length - 1];
    const statusNote = updates.statusNote || updates.adminNote || updates.catatanAdmin || updates.officerNote || updates.catatanPetugas || '';

    if (!last || last.status !== nextStatus) {
      history.push({
        status: nextStatus,
        at: now,
        by: session ? session.userId : null,
        note: statusNote
      });
    }

    const cleanUpdates = { ...updates };
    delete cleanUpdates.statusNote;

    return this.update('reports', reportId, {
      ...cleanUpdates,
      status: nextStatus,
      statusHistory: history,
      updatedAt: now
    });
  },

  createAssignment(reportId, petugasId, adminId, note = '') {
    const existing = this.getAll('assignments').find(item => item.reportId === reportId);
    if (existing) {
      return this.update('assignments', existing.id, { petugasId, officerId: petugasId, adminId, note, status: 'aktif' });
    }
    return this.insert('assignments', { reportId, petugasId, officerId: petugasId, adminId, note, status: 'aktif' });
  },

  migrate() {
    const users = this._readRaw('users', []).map(user => this.normalizeUser(user));
    this._writeRaw('users', users);

    const savedCategories = this._readRaw('categories', null);
    const legacyCategories = this._readRaw('kategori', []);
    const categoriesSource = Array.isArray(savedCategories) && savedCategories.length ? savedCategories : legacyCategories;
    this._writeRaw('categories', categoriesSource.map(category => this.normalizeCategory(category)));

    const savedReports = this._readRaw('reports', null);
    const legacyReports = this._readRaw('laporan', []);
    const reportsSource = Array.isArray(savedReports) && savedReports.length ? savedReports : legacyReports;
    this._writeRaw('reports', reportsSource.map(report => this.normalizeReport(report)));

    const assignments = this._readRaw('assignments', []).map(assignment => this.normalizeAssignment(assignment));
    this._writeRaw('assignments', assignments);

    if (localStorage.getItem('currentSession') === null) {
      localStorage.setItem('currentSession', 'null');
    }
  },

  seed() {
    this.migrate();
    this.ensureDemoUsers();
    this.ensureCategories();
    this.ensureReports();
    this.ensureAssignmentsFromReports();
    localStorage.setItem(this.VERSION_KEY, this.VERSION);
  },

  ensureDemoUsers() {
    const demos = [
      { id: 'user_masyarakat', name: 'Budi Santoso', email: 'masyarakat@demo.com', password: '123456', role: 'masyarakat', nik: '3201010101010001', address: 'Jl. Merdeka No. 10, Jakarta', phone: '081234567890', createdAt: '2026-01-15T08:00:00Z' },
      { id: 'user_admin', name: 'Siti Rahayu', email: 'admin@demo.com', password: '123456', role: 'admin', nik: '3201010101010002', address: 'Jl. Sudirman No. 5, Jakarta', phone: '081234567891', createdAt: '2026-01-10T08:00:00Z' },
      { id: 'user_petugas', name: 'Ahmad Fauzi', email: 'petugas@demo.com', password: '123456', role: 'petugas', nik: '3201010101010003', address: 'Jl. Gatot Subroto No. 20, Jakarta', phone: '081234567892', createdAt: '2026-01-12T08:00:00Z' },
      { id: 'user_kepala', name: 'Dr. Hendra Wijaya', email: 'kepala@demo.com', password: '123456', role: 'kepala_dinas', nik: '3201010101010004', address: 'Jl. Thamrin No. 1, Jakarta', phone: '081234567893', createdAt: '2026-01-08T08:00:00Z' },
      { id: 'user_dewi', name: 'Dewi Lestari', email: 'dewi@contoh.com', password: '123456', role: 'masyarakat', nik: '3201010101010005', address: 'Jl. Asia Afrika No. 15, Bandung', phone: '082345678901', createdAt: '2026-02-20T08:00:00Z' },
      { id: 'user_rizky', name: 'Rizky Pratama', email: 'rizky@contoh.com', password: '123456', role: 'petugas', nik: '3201010101010006', address: 'Jl. Diponegoro No. 8, Surabaya', phone: '082345678902', createdAt: '2026-02-25T08:00:00Z' }
    ];

    const users = this.getAll('users');
    demos.forEach(demo => {
      const index = users.findIndex(user => user.email === demo.email);
      if (index === -1) users.push(this.normalizeUser(demo));
      else users[index] = this.normalizeUser({ ...demo, ...users[index], id: users[index].id || demo.id });
    });
    this._writeRaw('users', users.map(user => this.normalizeUser(user)));
  },

  ensureCategories() {
    if (this.getAll('categories').length > 0) return;

    const categories = [
      { id: 'cat_jalan', name: 'Jalan Berlubang', description: 'Kerusakan permukaan jalan berupa lubang atau retakan.', icon: '🛣️', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cat_lampu', name: 'Lampu Jalan Mati', description: 'Penerangan jalan umum yang tidak berfungsi.', icon: '💡', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cat_jembatan', name: 'Jembatan Rusak', description: 'Kerusakan struktur jembatan atau jembatan penyeberangan.', icon: '🌉', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cat_taman', name: 'Taman Tidak Terawat', description: 'Taman kota yang rusak, kotor, atau tidak terawat.', icon: '🌳', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cat_drainase', name: 'Saluran Air Tersumbat', description: 'Drainase atau saluran air yang tersumbat.', icon: '🚰', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cat_trotoar', name: 'Trotoar Rusak', description: 'Kerusakan trotoar pejalan kaki.', icon: '🚶', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cat_lainnya', name: 'Fasilitas Umum Lainnya', description: 'Kerusakan fasilitas umum lain di luar kategori utama.', icon: '🏗️', createdAt: '2026-01-01T00:00:00Z' }
    ];
    this.setAll('categories', categories);
  },

  ensureReports() {
    if (this.getAll('reports').length > 0) return;

    const reports = [
      {
        id: 'rep_001',
        userId: 'user_masyarakat',
        title: 'Jalan Berlubang di Jl. Merdeka',
        description: 'Terdapat lubang besar di depan kantor pos. Diameter sekitar 1 meter dan berbahaya untuk pengendara motor.',
        categoryId: 'cat_jalan',
        location: 'Jl. Merdeka No. 10, Jakarta Pusat',
        status: 'selesai',
        petugasId: 'user_petugas',
        adminNote: 'Laporan valid dan sudah didisposisikan.',
        officerNote: 'Lubang telah ditambal dengan aspal baru.',
        createdAt: '2026-03-10T09:00:00Z',
        updatedAt: '2026-03-18T16:00:00Z',
        statusHistory: [
          { status: 'diajukan', at: '2026-03-10T09:00:00Z', by: 'user_masyarakat', note: 'Laporan dibuat.' },
          { status: 'menunggu_verifikasi', at: '2026-03-10T09:00:00Z', by: null, note: 'Laporan masuk sistem.' },
          { status: 'terverifikasi', at: '2026-03-11T08:30:00Z', by: 'user_admin', note: 'Laporan valid.' },
          { status: 'didisposisikan', at: '2026-03-12T10:00:00Z', by: 'user_admin', note: 'Disposisi ke petugas.' },
          { status: 'menunggu_diproses', at: '2026-03-13T08:00:00Z', by: 'user_petugas', note: 'Tugas diterima.' },
          { status: 'dalam_perbaikan', at: '2026-03-15T09:00:00Z', by: 'user_petugas', note: 'Perbaikan dimulai.' },
          { status: 'status_diperbarui', at: '2026-03-17T14:00:00Z', by: 'user_petugas', note: 'Penambalan hampir selesai.' },
          { status: 'bukti_diunggah', at: '2026-03-18T15:30:00Z', by: 'user_petugas', note: 'Bukti perbaikan diunggah.' },
          { status: 'selesai', at: '2026-03-18T16:00:00Z', by: 'user_petugas', note: 'Laporan selesai.' }
        ]
      },
      {
        id: 'rep_002',
        userId: 'user_masyarakat',
        title: 'Lampu Jalan Mati di RT 05',
        description: 'Tiga lampu jalan mati berturut-turut di gang RT 05 sehingga jalan sangat gelap pada malam hari.',
        categoryId: 'cat_lampu',
        location: 'Gang RT 05/RW 02, Kelurahan Menteng',
        status: 'dalam_perbaikan',
        petugasId: 'user_petugas',
        adminNote: 'Sudah diverifikasi, perlu penggantian lampu.',
        officerNote: 'Pengecekan kabel dan lampu sedang dilakukan.',
        createdAt: '2026-04-05T14:00:00Z',
        updatedAt: '2026-04-12T10:00:00Z'
      },
      {
        id: 'rep_003',
        userId: 'user_dewi',
        title: 'Trotoar Retak di Jl. Sudirman',
        description: 'Trotoar di depan Mall Sudirman retak parah dan beberapa bagian terangkat.',
        categoryId: 'cat_trotoar',
        location: 'Jl. Sudirman No. 45, Jakarta Selatan',
        status: 'didisposisikan',
        petugasId: 'user_rizky',
        adminNote: 'Didisposisikan ke petugas Rizky.',
        createdAt: '2026-05-01T11:00:00Z',
        updatedAt: '2026-05-05T09:00:00Z'
      },
      {
        id: 'rep_004',
        userId: 'user_dewi',
        title: 'Taman Kota Tidak Terawat',
        description: 'Rumput taman sangat panjang, banyak sampah, dan bangku taman rusak.',
        categoryId: 'cat_taman',
        location: 'Taman Kota Cikini, Jakarta Pusat',
        status: 'terverifikasi',
        adminNote: 'Laporan valid dan siap didisposisikan.',
        createdAt: '2026-05-15T08:00:00Z',
        updatedAt: '2026-05-16T10:00:00Z'
      },
      {
        id: 'rep_005',
        userId: 'user_masyarakat',
        title: 'Saluran Air Tersumbat di Jl. Kebon Sirih',
        description: 'Saluran drainase tersumbat. Saat hujan air meluap ke jalan.',
        categoryId: 'cat_drainase',
        location: 'Jl. Kebon Sirih No. 30, Jakarta Pusat',
        status: 'menunggu_verifikasi',
        createdAt: '2026-06-01T10:00:00Z',
        updatedAt: null
      },
      {
        id: 'rep_006',
        userId: 'user_dewi',
        title: 'Jembatan Penyeberangan Retak',
        description: 'Jembatan penyeberangan orang dekat halte Harmoni mengalami retakan pada lantai.',
        categoryId: 'cat_jembatan',
        location: 'Halte Bus Harmoni, Jakarta Pusat',
        status: 'ditolak',
        adminNote: 'Laporan duplikat. Sudah dilaporkan sebelumnya.',
        createdAt: '2026-05-28T15:00:00Z',
        updatedAt: '2026-05-29T09:00:00Z'
      }
    ];
    this.setAll('reports', reports);
  },

  ensureAssignmentsFromReports() {
    const assignments = this.getAll('assignments');
    if (assignments.length > 0) return;

    this.getAll('reports')
      .filter(report => report.petugasId)
      .forEach(report => {
        assignments.push(this.normalizeAssignment({
          id: 'asg_' + report.id,
          reportId: report.id,
          petugasId: report.petugasId,
          adminId: 'user_admin',
          note: report.adminNote || 'Disposisi laporan.',
          status: report.status === 'selesai' ? 'selesai' : 'aktif',
          createdAt: report.updatedAt || report.createdAt
        }));
      });
    this._writeRaw('assignments', assignments);
  },

  reset() {
    ['users', 'reports', 'categories', 'assignments', 'currentSession', this.VERSION_KEY, '_seeded', 'laporan', 'kategori'].forEach(key => {
      localStorage.removeItem(key);
    });
    this.seed();
  }
};

// Auto-seed on load
DB.seed();
