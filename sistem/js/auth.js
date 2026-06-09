// ═══════════════════════════════════════════════════════════
// AUTH.JS — Authentication & Session Management
// ═══════════════════════════════════════════════════════════

const Auth = {
  login(email, password) {
    const users = DB.getAll('users');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const session = { ...user };
      delete session.password;
      sessionStorage.setItem('currentUser', JSON.stringify(session));
      return { success: true, user: session };
    }
    return { success: false, message: 'Email atau password salah.' };
  },

  logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = this.getBasePath() + 'index.html';
  },

  getCurrentUser() {
    const data = sessionStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
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
    if (path.includes('/pages/')) {
      return '../../';
    }
    return '';
  },

  register(data) {
    const users = DB.getAll('users');
    if (users.find(u => u.email === data.email)) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }
    const newUser = {
      id: DB.generateId(),
      nama: data.nama,
      email: data.email,
      password: data.password,
      role: 'masyarakat',
      nik: data.nik || '',
      alamat: data.alamat || '',
      telepon: data.telepon || '',
      createdAt: new Date().toISOString()
    };
    DB.insert('users', newUser);
    return { success: true, user: newUser };
  }
};
