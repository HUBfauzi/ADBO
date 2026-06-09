// ==========================================================
// AUTH.JS - Authentication & session berbasis LocalStorage
// ==========================================================

const Auth = {
  login(email, password) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const users = DB.getAll('users');
    const user = users.find(item => item.email === normalizedEmail && item.password === password);

    if (!user) {
      return { success: false, message: 'Email atau password salah.' };
    }

    const session = DB.setSession(user);
    return { success: true, user: this.sanitizeUser({ ...user, ...session }) };
  },

  logout() {
    DB.clearSession();
    window.location.href = this.getBasePath() + 'index.html';
  },

  getCurrentUser() {
    const session = DB.getSession();
    if (!session) return null;

    const user = DB.getById('users', session.userId);
    if (!user) {
      DB.clearSession();
      return null;
    }

    return this.sanitizeUser(user);
  },

  sanitizeUser(user) {
    if (!user) return null;
    const cleaned = {
      ...user,
      name: user.name || user.nama,
      nama: user.name || user.nama
    };
    delete cleaned.password;
    return cleaned;
  },

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  getRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

  requireAuth(allowedRoles = []) {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = this.getBasePath() + 'index.html';
      return false;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      window.location.href = this.getDashboardUrl(user.role);
      return false;
    }
    return true;
  },

  getDashboardUrl(role) {
    const base = this.getBasePath();
    const routes = {
      masyarakat: base + 'pages/masyarakat/dashboard.html',
      admin: base + 'pages/admin/dashboard.html',
      petugas: base + 'pages/petugas/dashboard.html',
      kepala_dinas: base + 'pages/kepala-dinas/dashboard.html'
    };
    return routes[role] || base + 'index.html';
  },

  getRoleName(role) {
    const names = {
      masyarakat: 'Masyarakat',
      admin: 'Admin',
      petugas: 'Petugas Lapangan',
      kepala_dinas: 'Kepala Dinas'
    };
    return names[role] || role;
  },

  getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/')) return '../../';
    return '';
  },

  register(data) {
    const users = DB.getAll('users');
    const email = (data.email || '').trim().toLowerCase();

    if (users.find(user => user.email === email)) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }

    const newUser = DB.insert('users', {
      name: data.name || data.nama,
      nama: data.name || data.nama,
      email,
      password: data.password,
      role: data.role || 'masyarakat',
      nik: data.nik || '',
      address: data.address || data.alamat || '',
      alamat: data.address || data.alamat || '',
      phone: data.phone || data.telepon || '',
      telepon: data.phone || data.telepon || '',
      createdAt: new Date().toISOString()
    });

    return { success: true, user: this.sanitizeUser(newUser) };
  }
};
