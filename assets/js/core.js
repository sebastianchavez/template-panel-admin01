/**
 * Admin Panel - Core JavaScript Utilities
 * Dark mode, sidebar, toasts, modals, drawers, table utilities
 */

// ============================================================
// DARK MODE
// ============================================================
const DarkMode = {
    KEY: 'admin-dark-mode',
    init() {
        // Always default to light mode
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.removeItem(this.KEY);
        document.querySelectorAll('[data-toggle-dark]').forEach(btn => {
            btn.addEventListener('click', () => this.toggle());
        });
        this.updateIcons();
    },
    toggle() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        html.classList.replace(isDark ? 'dark' : 'light', isDark ? 'light' : 'dark');
        localStorage.setItem(this.KEY, !isDark);
        this.updateIcons();
        // Update ApexCharts theme if any
        document.querySelectorAll('.apexcharts-canvas').forEach(() => {
            window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: { dark: !isDark } }));
        });
    },
    isDark() {
        return document.documentElement.classList.contains('dark');
    },
    updateIcons() {
        const dark = this.isDark();
        document.querySelectorAll('[data-dark-icon]').forEach(el => {
            el.textContent = dark ? 'light_mode' : 'dark_mode';
        });
    }
};

// ============================================================
// SIDEBAR
// ============================================================
const Sidebar = {
    init() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const toggleBtn = document.getElementById('sidebar-toggle');
        const collapseBtn = document.getElementById('sidebar-collapse');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.openMobile());
        }
        if (overlay) {
            overlay.addEventListener('click', () => this.closeMobile());
        }
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.toggleCollapse());
        }

        // Restore collapsed state
        if (localStorage.getItem('sidebar-collapsed') === 'true' && sidebar) {
            sidebar.classList.add('sidebar-collapsed');
            document.getElementById('main-content')?.classList.add('lg:ml-20');
            document.getElementById('main-content')?.classList.remove('lg:ml-64');
            document.getElementById('top-header')?.classList.add('lg:left-20');
            document.getElementById('top-header')?.classList.remove('lg:left-64');
        }
    },
    openMobile() {
        document.getElementById('sidebar')?.classList.add('sidebar-mobile-open');
        document.getElementById('sidebar-overlay')?.classList.remove('hidden');
    },
    closeMobile() {
        document.getElementById('sidebar')?.classList.remove('sidebar-mobile-open');
        document.getElementById('sidebar-overlay')?.classList.add('hidden');
    },
    toggleCollapse() {
        const sidebar = document.getElementById('sidebar');
        const main = document.getElementById('main-content');
        const header = document.getElementById('top-header');
        if (!sidebar) return;
        const collapsed = sidebar.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebar-collapsed', collapsed);
        if (main) { main.classList.toggle('lg:ml-20', collapsed); main.classList.toggle('lg:ml-64', !collapsed); }
        if (header) { header.classList.toggle('lg:left-20', collapsed); header.classList.toggle('lg:left-64', !collapsed); }
    }
};

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
const Toast = {
    container: null,
    init() {
        if (!document.getElementById('toast-container')) {
            const c = document.createElement('div');
            c.id = 'toast-container';
            c.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none';
            document.body.appendChild(c);
        }
        this.container = document.getElementById('toast-container');
    },
    show(message, type = 'success', duration = 4000) {
        if (!this.container) this.init();
        const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
        const colors = {
            success: 'bg-green-600 dark:bg-green-500',
            error: 'bg-red-600 dark:bg-red-500',
            warning: 'bg-amber-500 dark:bg-amber-400',
            info: 'bg-blue-600 dark:bg-blue-500'
        };
        const toast = document.createElement('div');
        toast.className = `pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium ${colors[type]} toast-enter`;
        toast.innerHTML = `
            <span class="material-symbols-outlined text-lg">${icons[type]}</span>
            <span class="flex-1">${this.escapeHtml(message)}</span>
            <button onclick="this.parentElement.remove()" class="ml-2 opacity-70 hover:opacity-100 transition-opacity">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>
        `;
        this.container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// ============================================================
// MODALS
// ============================================================
const Modal = {
    open(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        requestAnimationFrame(() => {
            modal.querySelector('.modal-backdrop')?.classList.add('opacity-100');
            modal.querySelector('.modal-panel')?.classList.add('modal-panel-visible');
        });
        document.body.style.overflow = 'hidden';
        // Close on Escape
        const handler = (e) => {
            if (e.key === 'Escape') { this.close(id); document.removeEventListener('keydown', handler); }
        };
        document.addEventListener('keydown', handler);
        modal._escHandler = handler;
    },
    close(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.querySelector('.modal-backdrop')?.classList.remove('opacity-100');
        modal.querySelector('.modal-panel')?.classList.remove('modal-panel-visible');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
        }, 200);
        if (modal._escHandler) document.removeEventListener('keydown', modal._escHandler);
    }
};

// ============================================================
// DRAWERS
// ============================================================
const Drawer = {
    open(id) {
        const drawer = document.getElementById(id);
        if (!drawer) return;
        drawer.classList.remove('hidden');
        drawer.classList.add('flex');
        requestAnimationFrame(() => {
            drawer.querySelector('.drawer-backdrop')?.classList.add('opacity-100');
            drawer.querySelector('.drawer-panel')?.classList.add('drawer-panel-visible');
        });
        document.body.style.overflow = 'hidden';
        const handler = (e) => {
            if (e.key === 'Escape') { this.close(id); document.removeEventListener('keydown', handler); }
        };
        document.addEventListener('keydown', handler);
        drawer._escHandler = handler;
    },
    close(id) {
        const drawer = document.getElementById(id);
        if (!drawer) return;
        drawer.querySelector('.drawer-backdrop')?.classList.remove('opacity-100');
        drawer.querySelector('.drawer-panel')?.classList.remove('drawer-panel-visible');
        setTimeout(() => {
            drawer.classList.add('hidden');
            drawer.classList.remove('flex');
            document.body.style.overflow = '';
        }, 300);
        if (drawer._escHandler) document.removeEventListener('keydown', drawer._escHandler);
    }
};

// ============================================================
// TABLE UTILITIES
// ============================================================
const TableUtils = {
    sort(tableId, colIndex, type = 'string') {
        const table = document.getElementById(tableId);
        if (!table) return;
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const header = table.querySelectorAll('thead th')[colIndex];
        const asc = header?.dataset.sortDir !== 'asc';

        // Reset all headers
        table.querySelectorAll('thead th').forEach(th => {
            th.dataset.sortDir = '';
            const icon = th.querySelector('.sort-icon');
            if (icon) icon.textContent = 'unfold_more';
        });
        header.dataset.sortDir = asc ? 'asc' : 'desc';
        const icon = header?.querySelector('.sort-icon');
        if (icon) icon.textContent = asc ? 'arrow_upward' : 'arrow_downward';

        rows.sort((a, b) => {
            let valA = a.cells[colIndex]?.textContent.trim() || '';
            let valB = b.cells[colIndex]?.textContent.trim() || '';
            if (type === 'number') {
                valA = parseFloat(valA.replace(/[^0-9.-]/g, '')) || 0;
                valB = parseFloat(valB.replace(/[^0-9.-]/g, '')) || 0;
            } else if (type === 'date') {
                valA = new Date(valA).getTime() || 0;
                valB = new Date(valB).getTime() || 0;
            } else {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            return asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });
        rows.forEach(row => tbody.appendChild(row));
    },

    search(tableId, query) {
        const table = document.getElementById(tableId);
        if (!table) return;
        const rows = table.querySelectorAll('tbody tr');
        const q = query.toLowerCase().trim();
        let visible = 0;
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const show = !q || text.includes(q);
            row.style.display = show ? '' : 'none';
            if (show) visible++;
        });
        // Update count if element exists
        const countEl = document.getElementById(tableId + '-count');
        if (countEl) countEl.textContent = visible;
        return visible;
    },

    paginate(tableId, page, perPage = 10) {
        const table = document.getElementById(tableId);
        if (!table) return;
        const rows = Array.from(table.querySelectorAll('tbody tr')).filter(r => r.style.display !== 'none');
        const totalPages = Math.ceil(rows.length / perPage);
        page = Math.max(1, Math.min(page, totalPages));

        rows.forEach((row, i) => {
            row.style.display = (i >= (page - 1) * perPage && i < page * perPage) ? '' : 'none';
        });

        // Update pagination UI
        const paginationEl = document.getElementById(tableId + '-pagination');
        if (paginationEl) {
            paginationEl.dataset.currentPage = page;
            const info = paginationEl.querySelector('.page-info');
            if (info) info.textContent = `Página ${page} de ${totalPages}`;
            const prevBtn = paginationEl.querySelector('.page-prev');
            const nextBtn = paginationEl.querySelector('.page-next');
            if (prevBtn) prevBtn.disabled = page <= 1;
            if (nextBtn) nextBtn.disabled = page >= totalPages;
        }
        return { page, totalPages, total: rows.length };
    }
};

// ============================================================
// DROPDOWN MENUS
// ============================================================
const Dropdown = {
    init() {
        document.addEventListener('click', (e) => {
            // Close all dropdowns when clicking outside
            document.querySelectorAll('[data-dropdown-menu].dropdown-open').forEach(menu => {
                if (!menu.contains(e.target) && !e.target.closest(`[data-dropdown-toggle="${menu.id}"]`)) {
                    menu.classList.remove('dropdown-open');
                }
            });
        });
        document.querySelectorAll('[data-dropdown-toggle]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const menuId = btn.dataset.dropdownToggle;
                const menu = document.getElementById(menuId);
                if (menu) menu.classList.toggle('dropdown-open');
            });
        });
    }
};

// ============================================================
// TAB NAVIGATION
// ============================================================
const Tabs = {
    init() {
        document.querySelectorAll('[data-tabs]').forEach(container => {
            const buttons = container.querySelectorAll('[data-tab]');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabGroup = container.dataset.tabs;
                    const targetId = btn.dataset.tab;
                    // Deactivate all tabs in group
                    buttons.forEach(b => {
                        b.classList.remove('bg-primary', 'text-white', 'text-on-primary');
                        b.classList.add('bg-surface-container-low', 'text-secondary');
                    });
                    // Activate clicked tab
                    btn.classList.remove('bg-surface-container-low', 'text-secondary');
                    btn.classList.add('bg-primary', 'text-white', 'text-on-primary');
                    // Show/hide panels
                    document.querySelectorAll(`[data-tab-panel="${tabGroup}"]`).forEach(panel => {
                        panel.classList.add('hidden');
                    });
                    const target = document.getElementById(targetId);
                    if (target) target.classList.remove('hidden');
                });
            });
        });
    }
};

// ============================================================
// FORM VALIDATION
// ============================================================
const FormValidator = {
    validate(formEl) {
        let valid = true;
        formEl.querySelectorAll('[required]').forEach(input => {
            const error = input.parentElement.querySelector('.field-error') || input.closest('.space-y-2')?.querySelector('.field-error');
            if (!input.value.trim()) {
                input.classList.add('ring-2', 'ring-red-400');
                if (error) { error.textContent = 'Este campo es obligatorio'; error.classList.remove('hidden'); }
                valid = false;
            } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                input.classList.add('ring-2', 'ring-red-400');
                if (error) { error.textContent = 'Ingrese un email válido'; error.classList.remove('hidden'); }
                valid = false;
            } else {
                input.classList.remove('ring-2', 'ring-red-400');
                if (error) error.classList.add('hidden');
            }
        });
        return valid;
    },
    clearErrors(formEl) {
        formEl.querySelectorAll('.ring-red-400').forEach(el => el.classList.remove('ring-2', 'ring-red-400'));
        formEl.querySelectorAll('.field-error').forEach(el => el.classList.add('hidden'));
    }
};

// ============================================================
// FORMATTERS
// ============================================================
const Fmt = {
    currency(n, currency = 'USD') {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(n);
    },
    number(n) {
        return new Intl.NumberFormat('es-MX').format(n);
    },
    date(d) {
        return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d));
    },
    dateTime(d) {
        return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
    }
};

// ============================================================
// CSV EXPORT
// ============================================================
const CSVExport = {
    fromTable(tableId, filename = 'export.csv') {
        const table = document.getElementById(tableId);
        if (!table) return;
        const rows = [];
        table.querySelectorAll('tr').forEach(tr => {
            const cols = [];
            tr.querySelectorAll('th, td').forEach(td => {
                // Skip action columns
                if (td.classList.contains('col-actions')) return;
                cols.push('"' + td.textContent.trim().replace(/"/g, '""') + '"');
            });
            if (cols.length) rows.push(cols.join(','));
        });
        const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }
};

// ============================================================
// USER AVATAR DROPDOWN
// ============================================================
const UserMenu = {
    init() {
        const toggle = document.getElementById('user-menu-toggle');
        const menu = document.getElementById('user-menu-dropdown');
        if (!toggle || !menu) return;
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });
        document.addEventListener('click', () => {
            menu.classList.add('hidden');
        });
    }
};

// ============================================================
// INIT ALL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    DarkMode.init();
    Sidebar.init();
    Toast.init();
    Dropdown.init();
    Tabs.init();
    UserMenu.init();
});
