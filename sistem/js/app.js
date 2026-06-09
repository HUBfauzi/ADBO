// ═══════════════════════════════════════════════════════════
// APP.JS — App Shell: Sidebar, Topbar, Page Init
// ═══════════════════════════════════════════════════════════

const App = {
  init(pageTitle, allowedRoles) {
    if (!Auth.requireAuth(allowedRoles)) return false;
    const user = Auth.getCurrentUser();
    this.renderSidebar(user);
    this.renderTopbar(pageTitle, user);
    return true;
  },

  renderSidebar(user) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const base = Auth.getBasePath();
    const role = user.role;

    let navItems = '';

    if (role === 'masyarakat') {
      navItems = `
        <div class="nav-section-label">Menu Utama</div>
        <a href="${base}pages/masyarakat/dashboard.html" class="nav-item" data-page="dashboard"><span class="icon">📊</span> Dashboard</a>
        <a href="${base}pages/masyarakat/buat-laporan.html" class="nav-item" data-page="buat-laporan"><span class="icon">📝</span> Buat Laporan</a>
        <a href="${base}pages/masyarakat/status-laporan.html" class="nav-item" data-page="status-laporan"><span class="icon">📋</span> Status Laporan</a>
      `;
    } else if (role === 'admin') {
      const pendingCount = DB.count('laporan', l => l.status === 'terkirim');
      const verifCount = DB.count('laporan', l => l.status === 'diverifikasi');
      navItems = `
        <div class="nav-section-label">Menu Utama</div>
        <a href="${base}pages/admin/dashboard.html" class="nav-item" data-page="dashboard"><span class="icon">📊</span> Dashboard</a>
        <a href="${base}pages/admin/verifikasi.html" class="nav-item" data-page="verifikasi"><span class="icon">✅</span> Verifikasi Laporan ${pendingCount > 0 ? `<span class="badge-count">${pendingCount}</span>` : ''}</a>
        <a href="${base}pages/admin/disposisi.html" class="nav-item" data-page="disposisi"><span class="icon">📤</span> Disposisi Laporan ${verifCount > 0 ? `<span class="badge-count">${verifCount}</span>` : ''}</a>
        <div class="nav-section-label">Kelola Data</div>
        <a href="${base}pages/admin/kategori.html" class="nav-item" data-page="kategori"><span class="icon">🏷️</span> Kategori Kerusakan</a>
        <a href="${base}pages/admin/pengguna.html" class="nav-item" data-page="pengguna"><span class="icon">👥</span> Data Pengguna</a>
      `;
    } else if (role === 'petugas') {
      const taskCount = DB.count('laporan', l => (l.status === 'didisposisi' || l.status === 'dalam_pengerjaan') && l.petugasId === user.id);
      navItems = `
        <div class="nav-section-label">Menu Utama</div>
        <a href="${base}pages/petugas/dashboard.html" class="nav-item" data-page="dashboard"><span class="icon">📊</span> Dashboard</a>
        <a href="${base}pages/petugas/tugas.html" class="nav-item" data-page="tugas"><span class="icon">🔧</span> Daftar Tugas ${taskCount > 0 ? `<span class="badge-count">${taskCount}</span>` : ''}</a>
        <a href="${base}pages/petugas/proses.html" class="nav-item" data-page="proses"><span class="icon">⚙️</span> Proses Perbaikan</a>
      `;
    } else if (role === 'kepala_dinas') {
      navItems = `
        <div class="nav-section-label">Menu Utama</div>
        <a href="${base}pages/kepala-dinas/dashboard.html" class="nav-item" data-page="dashboard"><span class="icon">📊</span> Dashboard</a>
        <a href="${base}pages/kepala-dinas/rekap.html" class="nav-item" data-page="rekap"><span class="icon">📑</span> Rekap Laporan</a>
        <a href="${base}pages/kepala-dinas/cetak.html" class="nav-item" data-page="cetak"><span class="icon">🖨️</span> Cetak Laporan</a>
      `;
    }

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-logo">🏛️</div>
        <div class="sidebar-brand">
          Lapor Fasilitas
          <small>Sistem Pelaporan</small>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${navItems}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="avatar">${Utils.getInitials(user.nama)}</div>
          <div class="user-info">
            <div class="user-name">${Utils.escapeHtml(user.nama)}</div>
            <div class="user-role">${Auth.getRoleName(user.role)}</div>
          </div>
        </div>
      </div>
    `;

    // Highlight active nav item
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    sidebar.querySelectorAll('.nav-item').forEach(item => {
      if (item.dataset.page === currentPage) {
        item.classList.add('active');
      }
    });
  },

  renderTopbar(title, user) {
    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    topbar.innerHTML = `
      <div class="topbar-left">
        <button class="topbar-btn menu-toggle" onclick="App.toggleSidebar()" style="display:none;">☰</button>
        <div>
          <div class="topbar-breadcrumb">
            <span>${Auth.getRoleName(user.role)}</span>
            <span class="sep">›</span>
            <span>${title}</span>
          </div>
          <div class="topbar-title">${title}</div>
        </div>
      </div>
      <div class="topbar-right">
        <button class="btn-logout" onclick="Auth.logout()">
          <span>🚪</span> Logout
        </button>
      </div>
    `;
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  }
};
