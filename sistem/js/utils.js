// ==========================================================
// UTILS.JS - Helper tampilan, status, dan data lookup
// ==========================================================

const Utils = {
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    return this.formatDate(dateStr);
  },

  getStatusLabel(status) {
    const labels = {
      diajukan: 'Diajukan',
      menunggu_verifikasi: 'Menunggu Verifikasi',
      perlu_perbaikan_data: 'Perlu Perbaikan Data',
      ditolak: 'Ditolak',
      terverifikasi: 'Terverifikasi',
      didisposisikan: 'Didisposisikan',
      menunggu_diproses: 'Menunggu Diproses',
      dalam_perbaikan: 'Dalam Perbaikan',
      status_diperbarui: 'Status Diperbarui',
      bukti_diunggah: 'Bukti Diunggah',
      selesai: 'Selesai',

      // Kompatibilitas status lama
      draft: 'Draft',
      terkirim: 'Menunggu Verifikasi',
      diverifikasi: 'Terverifikasi',
      didisposisi: 'Didisposisikan',
      dalam_pengerjaan: 'Dalam Perbaikan'
    };
    return labels[status] || status || '-';
  },

  getStatusBadge(status) {
    const normalized = DB.normalizeStatus ? DB.normalizeStatus(status) : status;
    const cssClass = 'badge-' + normalized.replaceAll('_', '-');
    return `<span class="badge ${cssClass}"><span class="dot"></span>${this.getStatusLabel(normalized)}</span>`;
  },

  getStatusOptions() {
    return DB.STATUSES.map(status => ({ value: status, label: this.getStatusLabel(status) }));
  },

  getCategoryName(categoryId) {
    const category = DB.getById('categories', categoryId);
    return category ? (category.name || category.nama) : '-';
  },

  getCategoryIcon(categoryId) {
    const category = DB.getById('categories', categoryId);
    return category ? category.icon : '📋';
  },

  getUserName(userId) {
    const user = DB.getById('users', userId);
    return user ? (user.name || user.nama) : '-';
  },

  getReportTitle(report) {
    return report ? (report.title || report.judul || '-') : '-';
  },

  getReportDescription(report) {
    return report ? (report.description || report.deskripsi || '') : '';
  },

  getReportLocation(report) {
    return report ? (report.location || report.lokasi || '') : '';
  },

  getReportCategoryId(report) {
    return report ? (report.categoryId || report.kategoriId || '') : '';
  },

  getReportPhoto(report) {
    return report ? (report.damagePhoto || report.foto || null) : null;
  },

  getRepairPhoto(report) {
    return report ? (report.repairPhoto || report.fotoBukti || null) : null;
  },

  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  },

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

  truncate(text, maxLen = 60) {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  },

  getParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  },

  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
};
