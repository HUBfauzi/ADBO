// ═══════════════════════════════════════════════════════════
// UTILS.JS — Helper Functions
// ═══════════════════════════════════════════════════════════

const Utils = {
  // Format date to Indonesian locale
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  formatTimeAgo(dateStr) {
    if (!dateStr) return '-';
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return Math.floor(diff / 60) + ' menit lalu';
    if (diff < 86400) return Math.floor(diff / 3600) + ' jam lalu';
    if (diff < 604800) return Math.floor(diff / 86400) + ' hari lalu';
    return Utils.formatDate(dateStr);
  },

  // Status helpers
  getStatusLabel(status) {
    const labels = {
      draft: 'Draft',
      terkirim: 'Terkirim',
      diverifikasi: 'Diverifikasi',
      didisposisi: 'Didisposisi',
      dalam_pengerjaan: 'Dalam Pengerjaan',
      selesai: 'Selesai',
      ditolak: 'Ditolak'
    };
    return labels[status] || status;
  },

  getStatusBadge(status) {
    const cssClass = 'badge-' + status.replace('_', '-');
    const label = this.getStatusLabel(status);
    return `<span class="badge ${cssClass}"><span class="dot"></span>${label}</span>`;
  },

  // Get category name by ID
  getCategoryName(katId) {
    const kat = DB.getById('kategori', katId);
    return kat ? kat.nama : '-';
  },

  getCategoryIcon(katId) {
    const kat = DB.getById('kategori', katId);
    return kat ? kat.icon : '📋';
  },

  // Get user name by ID
  getUserName(userId) {
    const user = DB.getById('users', userId);
    return user ? user.nama : '-';
  },

  // Generate initials from name
  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  },

  // Toast notification
  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Truncate text
  truncate(text, maxLen = 60) {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  },

  // Query params
  getParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  },

  // Escape HTML
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Debounce
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
};
