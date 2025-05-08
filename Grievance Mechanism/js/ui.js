// js/ui.js

/**
 * Mengisi dropdown Kabupaten dari data `wilayah`.
 */
function populateKabupatenDropdown() {
    const kabupatenSelect = document.getElementById("kabupaten");
    if (!kabupatenSelect) {
        console.error("[UI] Dropdown #kabupaten tidak ditemukan.");
        return;
    }
    if (typeof wilayah === 'undefined') {
        console.error("[UI] Variabel 'wilayah' tidak terdefinisi saat mengisi dropdown kabupaten.");
        kabupatenSelect.innerHTML = '<option value="">Error: Data wilayah tidak ada</option>';
        return;
    }
    kabupatenSelect.innerHTML = '<option value="">-- Pilih Kabupaten --</option>';
    Object.keys(wilayah).forEach(kab => {
        const opt = document.createElement("option");
        opt.value = kab;
        opt.textContent = kab;
        kabupatenSelect.appendChild(opt);
    });
    // console.log("[UI] Dropdown Kabupaten diisi."); // Komentari log yang terlalu detail jika sudah stabil
}

/**
 * Memperbarui dropdown Kecamatan berdasarkan Kabupaten yang dipilih.
 */
function updateKecamatanDropdown() {
    // console.log("[UI] updateKecamatanDropdown dipanggil.");
    const kecamatanSelect = document.getElementById("kecamatan");
    const desaSelect = document.getElementById("desa");

    if (!kecamatanSelect || !desaSelect) {
        console.error("[UI] Dropdown #kecamatan atau #desa tidak ditemukan.");
        return;
    }
    if (typeof getFormValue !== 'function') {
         console.error("[UI] Fungsi getFormValue tidak ditemukan.");
         kecamatanSelect.innerHTML = '<option value="">Error: Fungsi helper hilang</option>';
         kecamatanSelect.disabled = true;
         desaSelect.innerHTML = '<option value="">-- Pilih Desa --</option>';
         desaSelect.disabled = true;
         return;
    }
    const kabupaten = getFormValue("kabupaten");
    // console.log(`[UI] Kabupaten dipilih: "${kabupaten}"`);

    kecamatanSelect.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
    kecamatanSelect.disabled = true;
    desaSelect.innerHTML = '<option value="">-- Pilih Desa --</option>';
    desaSelect.disabled = true;

    if (typeof wilayah === 'undefined') {
        console.error("[UI] Variabel 'wilayah' tidak terdefinisi saat update kecamatan.");
        return;
    }

    if (kabupaten && wilayah.hasOwnProperty(kabupaten)) {
        // console.log("[UI] Data kecamatan ditemukan untuk kabupaten:", kabupaten);
        const kecamatanData = wilayah[kabupaten];
        if (typeof kecamatanData === 'object' && kecamatanData !== null && Object.keys(kecamatanData).length > 0) {
            Object.keys(kecamatanData).forEach(kecamatan => {
                const opt = document.createElement("option");
                opt.value = kecamatan;
                opt.textContent = kecamatan;
                kecamatanSelect.appendChild(opt);
            });
            kecamatanSelect.disabled = false;
            // console.log("[UI] Dropdown Kecamatan diaktifkan.");
            updateDesaDropdown();
        } else {
             console.warn(`[UI] Tidak ada data kecamatan (atau format salah) untuk wilayah[${kabupaten}]:`, kecamatanData);
        }
    } else {
        // console.log("[UI] Kabupaten tidak dipilih atau tidak ada data kecamatan untuk kabupaten:", kabupaten);
    }
}

/**
 * Memperbarui dropdown Desa berdasarkan Kecamatan yang dipilih.
 */
function updateDesaDropdown() {
    // console.log("[UI] updateDesaDropdown dipanggil.");
    const desaSelect = document.getElementById("desa");
     if (!desaSelect) {
         console.error("[UI] Dropdown #desa tidak ditemukan.");
         return;
     }
    if (typeof getFormValue !== 'function') {
         console.error("[UI] Fungsi getFormValue tidak ditemukan.");
         desaSelect.innerHTML = '<option value="">Error: Fungsi helper hilang</option>';
         desaSelect.disabled = true;
         return;
    }
    const kabupaten = getFormValue("kabupaten");
    const kecamatan = getFormValue("kecamatan");
    // console.log(`[UI] Kecamatan dipilih: "${kecamatan}" (Kabupaten: "${kabupaten}")`);

    desaSelect.innerHTML = '<option value="">-- Pilih Desa --</option>';
    desaSelect.disabled = true;

    if (typeof wilayah === 'undefined') {
        console.error("[UI] Variabel 'wilayah' tidak terdefinisi saat update desa.");
        return;
    }

    if (kabupaten && kecamatan &&
        wilayah.hasOwnProperty(kabupaten) &&
        typeof wilayah[kabupaten] === 'object' && wilayah[kabupaten] !== null &&
        wilayah[kabupaten].hasOwnProperty(kecamatan) &&
        Array.isArray(wilayah[kabupaten][kecamatan]) &&
        wilayah[kabupaten][kecamatan].length > 0)
    {
        // console.log("[UI] Data desa ditemukan untuk:", kabupaten, "-", kecamatan);
        const desaArray = wilayah[kabupaten][kecamatan];
        desaArray.forEach(desa => {
            const opt = document.createElement("option");
            opt.value = desa;
            opt.textContent = desa;
            desaSelect.appendChild(opt);
        });
        desaSelect.disabled = false;
        // console.log("[UI] Dropdown Desa diaktifkan.");
    } else {
        // console.log("[UI] Kecamatan/Kabupaten tidak dipilih atau tidak ada data desa untuk:", kabupaten, "-", kecamatan);
    }
}

/**
 * Membuat elemen badge HTML untuk status atau prioritas.
 * @param {'status' | 'priority'} type Tipe badge ('status' atau 'priority').
 * @param {string} value Nilai status atau prioritas.
 * @returns {string} String HTML untuk badge.
 */
function createBadge(type, value) {
    let iconClass = '', badgeClass = '', text = value || 'N/A';
    const statusClasses = {
        'On Progress': 'badge-status-onprogress', 'Hold': 'badge-status-hold',
        'Done': 'badge-status-done', 'default': 'badge-status-default'
    };
    const priorityClasses = {
        'Low Risk': 'badge-priority-low', 'Medium Risk': 'badge-priority-medium',
        'High Risk': 'badge-priority-high', 'default': 'badge-priority-default'
    };
    const statusIcons = {
        'On Progress': 'fas fa-spinner fa-spin', 'Hold': 'fas fa-pause-circle',
        'Done': 'fas fa-check-circle', 'default': 'fas fa-question-circle'
    };
     const priorityIcons = {
        'Low Risk': 'fas fa-info-circle', 'Medium Risk': 'fas fa-exclamation-circle',
        'High Risk': 'fas fa-exclamation-triangle', 'default': 'fas fa-question-circle'
    };
    let baseClass = `badge`;

    if (type === 'status') {
        badgeClass = statusClasses[value] || statusClasses['default'];
        iconClass = statusIcons[value] || statusIcons['default'];
    } else if (type === 'priority') {
        badgeClass = priorityClasses[value] || priorityClasses['default'];
        iconClass = priorityIcons[value] || priorityIcons['default'];
    }
     return `<span class="${baseClass} ${badgeClass} rounded-pill"><i class="${iconClass} me-1"></i>${text}</span>`;
}

/**
 * Menampilkan detail pengaduan dalam modal.
 * @param {number} originalIndex Index asli data di localStorage.
 */
function showDetailModal(originalIndex) {
     if (typeof getDataFromStorage !== 'function' || typeof STORAGE_KEYS === 'undefined') {
        console.error("[UI] Fungsi getDataFromStorage atau STORAGE_KEYS tidak tersedia untuk modal detail.");
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', 'Gagal memuat data detail (fungsi storage hilang).', 'danger');
        return;
    }
    const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances);
     if (originalIndex < 0 || originalIndex >= dataPengaduan.length) {
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', 'Data detail tidak ditemukan (index salah).', 'danger');
        return;
    }
    const item = dataPengaduan[originalIndex];
    const detailModalElement = document.getElementById('detailModal');
    if (!detailModalElement) {
        console.error("[UI] Elemen modal #detailModal tidak ditemukan.");
        return;
    }
    if (typeof bootstrap === 'undefined' || typeof bootstrap.Modal === 'undefined') {
        console.error("[UI] Bootstrap Modal tidak tersedia.");
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', 'Komponen modal tidak dapat ditampilkan.', 'danger');
        return;
    }
    const detailModal = bootstrap.Modal.getOrCreateInstance(detailModalElement);

    const formatTanggalModal = (tgl) => {
        if (!tgl) return "-";
        try {
            return new Date(tgl).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
             console.warn("[UI] Error format tanggal modal:", e);
             return tgl;
        }
    };
     const createModalBadge = (type, value) => {
        let iconClass = '', badgeBgClass = '', badgeTextClass = 'text-white', text = value || 'N/A';
        const baseClass = `badge p-2`;
        const statusStyles = {
            'On Progress': { icon: 'fas fa-spinner fa-spin', bg: 'bg-primary', text: 'text-white' },
            'Hold': { icon: 'fas fa-pause-circle', bg: 'bg-warning', text: 'text-dark' },
            'Done': { icon: 'fas fa-check-circle', bg: 'bg-success', text: 'text-white' },
            'default': { icon: 'fas fa-question-circle', bg: 'bg-secondary', text: 'text-white' }
        };
        const priorityStyles = {
            'Low Risk': { icon: 'fas fa-info-circle', bg: 'bg-success', text: 'text-white' },
            'Medium Risk': { icon: 'fas fa-exclamation-circle', bg: 'bg-warning', text: 'text-dark' },
            'High Risk': { icon: 'fas fa-exclamation-triangle', bg: 'bg-danger', text: 'text-white' },
            'default': { icon: 'fas fa-question-circle', bg: 'bg-secondary', text: 'text-white' }
        };
        let styles;
        if (type === 'status') styles = statusStyles[value] || statusStyles['default'];
        else if (type === 'priority') styles = priorityStyles[value] || priorityStyles['default'];
        else return text;
        iconClass = styles.icon; badgeBgClass = styles.bg; badgeTextClass = styles.text;
        return `<span class="${baseClass} ${badgeBgClass} ${badgeTextClass} rounded-pill" style="font-size: 0.9rem;"><i class="${iconClass} me-1"></i>${text}</span>`;
    };
    const setContent = (id, content) => {
        const el = document.getElementById(id);
        if(el) {
             if (typeof content === 'string' && content.startsWith('<span')) el.innerHTML = content;
             else el.textContent = content || '-';
        } else console.warn(`[UI] Elemen modal dengan ID "${id}" tidak ditemukan.`);
    };

    setContent('detailNoRef', item.noReferensi);
    setContent('modalNoRef', item.noReferensi);
    setContent('modalTanggal', formatTanggalModal(item.tanggal));
    setContent('modalKategori', item.kategori);
    setContent('modalPelapor', item.pelapor);
    setContent('modalKontak', item.kontak);
    setContent('modalKabupaten', item.kabupaten);
    setContent('modalKecamatan', item.kecamatan);
    setContent('modalDesa', item.desa);
    setContent('modalAksi', item.aksi);
    setContent('modalTenggat', formatTanggalModal(item.tenggat));
    setContent('modalDeskripsi', item.deskripsi || '(Tidak ada deskripsi)');
    setContent('modalStatus', createModalBadge('status', item.status));
    setContent('modalPic', item.pic);
    setContent('modalPrioritas', createModalBadge('priority', item.prioritas));

    const modalEditBtn = document.getElementById('modalEditBtn');
    if(modalEditBtn) {
        const newEditBtn = modalEditBtn.cloneNode(true); // Re-clone untuk event listener bersih
        modalEditBtn.parentNode.replaceChild(newEditBtn, modalEditBtn);
        newEditBtn.addEventListener('click', () => {
            // console.log("[UI] Tombol edit modal diklik.");
            detailModal.hide();
            if (typeof editGrievance === 'function') editGrievance(originalIndex);
            else {
                 console.error("[UI] Fungsi editGrievance tidak ditemukan.");
                 if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', 'Fungsi untuk edit tidak tersedia.', 'danger');
            }
        });
    } else console.warn("[UI] Tombol edit modal #modalEditBtn tidak ditemukan.");
    detailModal.show();
}

/**
 * Menampilkan notifikasi toast Bootstrap.
 */
function tampilkanNotifikasi(title, message, type = 'info', delay = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.error("[UI] Toast container #toastContainer tidak ditemukan!");
        alert(`${title}: ${message}`); // Fallback
        return;
    }
    if (typeof bootstrap === 'undefined' || typeof bootstrap.Toast === 'undefined') {
        console.error("[UI] Bootstrap Toast is not available.");
        alert(`${title}: ${message}`); // Fallback
        return;
    }
    const icons = { success: 'check-circle', info: 'info-circle', warning: 'exclamation-triangle', danger: 'times-circle' };
    const bgClass = `bg-${type}`; // Bootstrap class for background color
    const iconClass = `fas fa-${icons[type] || 'info-circle'}`; // Font Awesome icon
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${delay}">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="${iconClass} me-2"></i>
                    <strong>${title}:</strong> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>`;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    if (!toastElement) {
         console.error(`[UI] Gagal membuat elemen toast dengan ID: ${toastId}`);
         return;
    }
    const toast = new bootstrap.Toast(toastElement, { delay: delay });
    toastElement.addEventListener('hidden.bs.toast', function () {
        // console.log(`[UI] Toast ${toastId} ditutup dan dihapus.`);
        toastElement.remove(); // Hapus elemen dari DOM setelah toast hilang
    });
    // console.log(`[UI] Menampilkan toast ${toastId} (${type}): ${title}`);
    toast.show();
}

/**
 * Mengubah tampilan form dan tombol saat masuk/keluar mode edit.
 */
function setEditMode(isEditing, index = null) {
    const form = document.getElementById("formPengaduan");
    const cardHeader = document.querySelector("#inputContent .card-header");
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (!form || !cardHeader || !submitBtn || !resetBtn) {
        console.error("[UI] Elemen form, header, atau tombol untuk setEditMode tidak ditemukan.");
        return;
    }

    if (isEditing && index !== null) {
        // console.log(`[UI] Masuk mode edit untuk index: ${index}`);
        form.dataset.editIndex = index; // Simpan index yang diedit
        cardHeader.innerHTML = '<i class="fas fa-edit me-2"></i> Edit Data Pengaduan';
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Data';
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-warning', 'text-white'); // Ubah warna tombol
        resetBtn.innerHTML = '<i class="fas fa-times me-2"></i>Batal Edit';
        resetBtn.classList.remove('btn-outline-secondary');
        resetBtn.classList.add('btn-secondary');
    } else {
        // console.log("[UI] Keluar dari mode edit atau reset form.");
        form.reset(); // Reset semua field form
        delete form.dataset.editIndex; // Hapus index edit
        form.classList.remove('was-validated'); // Hapus status validasi Bootstrap

        // Set tanggal ke hari ini
        const tanggalInput = document.getElementById('tanggal');
        if(tanggalInput) {
            try { tanggalInput.value = new Date().toISOString().split('T')[0]; }
            catch(e) { console.error("[UI] Gagal set tanggal default:", e); }
        }
        // Generate No Referensi baru (jika perlu)
        if (typeof generateNoRef === 'function') generateNoRef();
        else console.warn("[UI] Fungsi generateNoRef tidak ditemukan saat reset.");

        // Reset dropdown wilayah
        if (typeof populateKabupatenDropdown === 'function' && typeof updateKecamatanDropdown === 'function') {
            document.getElementById('kabupaten').value = ""; // Reset pilihan kabupaten
            updateKecamatanDropdown(); // Ini akan mereset kecamatan dan desa
        } else {
             console.warn("[UI] Fungsi populateKabupatenDropdown atau updateKecamatanDropdown tidak ditemukan saat reset.");
        }

        // Reset tampilan nama file
        const fileSpans = document.querySelectorAll('.file-name-display');
        fileSpans.forEach(span => span.textContent = '');

        // Kembalikan teks dan style tombol ke default
        cardHeader.innerHTML = '<i class="fas fa-file-alt me-2"></i> Form Pengaduan Baru';
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Simpan';
        submitBtn.classList.remove('btn-warning', 'text-white');
        submitBtn.classList.add('btn-primary');
        resetBtn.innerHTML = '<i class="fas fa-undo me-2"></i>Reset';
        resetBtn.classList.remove('btn-secondary');
        resetBtn.classList.add('btn-outline-secondary');
    }
}

/**
 * Menambahkan tombol logout ke header di index.html.
 */
function addLogoutButton() {
    const logoutButtonContainer = document.getElementById('logoutButtonContainer');
    if (logoutButtonContainer) {
        logoutButtonContainer.innerHTML = `
            <button class="btn btn-outline-danger btn-sm" id="logoutButton">
                <i class="fas fa-sign-out-alt me-1"></i>Logout
            </button>
        `;
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            if (typeof handleLogout === 'function') { // handleLogout dari auth.js
                logoutButton.removeEventListener('click', handleLogout); // Hapus listener lama jika ada
                logoutButton.addEventListener('click', handleLogout);
                // console.log("[UI] Tombol logout ditambahkan dengan event listener.");
            } else {
                console.error("[UI] Fungsi handleLogout (dari auth.js) tidak ditemukan. Tombol logout tidak akan berfungsi.");
                logoutButton.disabled = true;
                logoutButton.title = "Fungsi logout tidak tersedia";
            }
        }
    } else console.warn("[UI] Container tombol logout #logoutButtonContainer tidak ditemukan.");
}

/**
 * Membuat badge peran pengguna.
 */
function createRoleBadge(role) {
    const safeRole = role || 'Tidak Diketahui';
    const roleClass = safeRole.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'default';
    return `<span class="badge bg-${roleClass} role-${roleClass} rounded-pill">${safeRole}</span>`;
}

/**
 * Menampilkan informasi pengguna di header.
 */
function displayUserInfo() {
    const userInfoDiv = document.getElementById('userInfo');
    if (userInfoDiv) {
        const loggedInUsername = sessionStorage.getItem('loggedInUsername');
        const userRole = sessionStorage.getItem('userRole');
        userInfoDiv.innerHTML = ''; // Kosongkan dulu
        userInfoDiv.style.display = 'flex';
        userInfoDiv.style.alignItems = 'flex-start'; // Align items to the start for better vertical alignment

        if (loggedInUsername && userRole) {
            const userIcon = document.createElement('i');
            userIcon.className = 'fas fa-user-circle me-2';
            userIcon.style.fontSize = '2.0em'; // Ukuran ikon
            userIcon.style.color = 'var(--primary-color, #1e8449)';
            userIcon.style.flexShrink = '0'; // Agar ikon tidak mengecil
            userIcon.style.marginTop = '0.15rem'; // Sesuaikan posisi vertikal ikon

            const nameRoleContainer = document.createElement('div');
            nameRoleContainer.style.display = 'flex';
            nameRoleContainer.style.flexDirection = 'column';
            nameRoleContainer.style.lineHeight = '1.5'; // Sesuaikan line height
            nameRoleContainer.style.textAlign = 'right';


            const userNameSpan = document.createElement('span');
            userNameSpan.className = 'user-name fw-bold';
            userNameSpan.textContent = loggedInUsername;
            userNameSpan.style.fontSize = '1.0em'; // Ukuran font nama

            const userRoleSpan = document.createElement('span');
            userRoleSpan.innerHTML = createRoleBadge(userRole); // Buat badge peran
            const badgeElement = userRoleSpan.querySelector('.badge');
            if (badgeElement) { // Style badge agar lebih pas
                 badgeElement.style.fontSize = '0.75em';
                 badgeElement.style.padding = '0.25em 0.6em';
                 badgeElement.style.marginTop = '0.2rem';
                 badgeElement.style.display = 'inline-block';
                 badgeElement.style.fontWeight = '500';
            }

            nameRoleContainer.appendChild(userNameSpan);
            nameRoleContainer.appendChild(userRoleSpan);
            userInfoDiv.appendChild(userIcon);
            userInfoDiv.appendChild(nameRoleContainer);
            // console.log(`[UI] Info user ditampilkan: ${loggedInUsername} (${userRole})`);
        } else console.warn("[UI] Info user (username/role) tidak ditemukan di sessionStorage.");
    } else console.warn("[UI] Container info user #userInfo tidak ditemukan.");
}

/**
 * Menampilkan nama file yang dipilih.
 */
function displayFileName(inputId, spanId) {
    const input = document.getElementById(inputId);
    const span = document.getElementById(spanId);
    if (!input || !span) {
        console.warn(`[UI:displayFileName] Input #${inputId} atau Span #${spanId} tidak ditemukan.`);
        return;
    }
    if (input.files && input.files.length > 0) {
        span.textContent = `File: ${input.files[0].name}`;
        // console.log(`[UI:displayFileName] File dipilih untuk #${inputId}: ${input.files[0].name}`);
    } else {
        span.textContent = ''; // Kosongkan jika tidak ada file
        // console.log(`[UI:displayFileName] Tidak ada file dipilih untuk #${inputId}.`);
    }
}

/**
 * Menampilkan sub-pane di #prosesContent (misalnya, Data Tabel, Form Evaluasi).
 * @param {string} targetSubPaneSelector Selector untuk sub-pane yang akan ditampilkan (e.g., "#data-table").
 */
function showProsesSubPane(targetSubPaneSelector) {
    const subContentContainer = document.getElementById('prosesSubContentContainer');
    if (!subContentContainer) {
        console.error("[UI] Container #prosesSubContentContainer tidak ditemukan untuk showProsesSubPane.");
        return;
    }
    const subContents = subContentContainer.querySelectorAll('.proses-sub-content');
    if (!subContents.length) {
        console.warn("[UI] Tidak ada sub-konten .proses-sub-content yang ditemukan di #prosesSubContentContainer.");
        return;
    }

    console.log(`[UI] Memproses showProsesSubPane untuk target: ${targetSubPaneSelector}`);
    let subPaneToShow = null;
    subContents.forEach(pane => {
        // Pastikan ID pane tidak diawali '#' saat membandingkan dengan targetSubPaneSelector yang sudah memiliki '#'
        if (`#${pane.id}` === targetSubPaneSelector) {
            pane.classList.add('active');
            subPaneToShow = pane;
            console.log(`[UI] Sub-pane '${pane.id}' diaktifkan.`);
        } else {
            pane.classList.remove('active');
        }
    });

    if (subPaneToShow) {
        const paneId = subPaneToShow.id;
        console.log(`[UI] Sub-pane '${paneId}' aktif. Memanggil fungsi terkait...`);
        // Panggil fungsi pemuatan data atau inisialisasi spesifik untuk sub-pane yang aktif
        if (paneId === 'data-table' && typeof displayGrievanceData === 'function') {
            console.log("[UI] Memuat data tabel pengaduan...");
            displayGrievanceData();
        } else if (paneId === 'riwayat-proses' && typeof displayProcessHistory === 'function') {
            console.log("[UI] Memuat riwayat proses...");
            displayProcessHistory();
        } else if (['form-evaluasi', 'surat-tanggapan', 'form-banding'].includes(paneId)) {
            console.log(`[UI] Menginisialisasi form proses: ${paneId}`);
            if (typeof populateProcessDropdowns === 'function') {
                populateProcessDropdowns();
            }
            // Jika Anda ingin memilih ID terakhir secara otomatis saat form ini ditampilkan:
            // if(typeof selectLastIdInProcessForms === 'function') selectLastIdInProcessForms();
        }
    } else {
        console.warn(`[UI] Sub-pane dengan selector '${targetSubPaneSelector}' tidak ditemukan di showProsesSubPane.`);
        // Jika tidak ada sub-pane yang cocok, mungkin sembunyikan semua atau tampilkan pesan default
        subContents.forEach(pane => pane.classList.remove('active'));
        // Opsional: tampilkan pesan bahwa tidak ada sub-konten yang dipilih/ditemukan
        // const container = document.getElementById('prosesSubContentContainer');
        // if (container) container.innerHTML = '<p class="text-center text-muted p-3">Pilih item dari menu Proses Pengaduan.</p>';
    }
}


/**
 * Mengatur navigasi utama aplikasi (Form Input, Proses Pengaduan, Dashboard, User Management).
 */
function setupMainNavigation() {
    const mainNavLinks = document.querySelectorAll('.main-dropdown-nav .nav-link[data-target-section], .main-dropdown-nav .dropdown-item[data-target-section]');
    const sections = document.querySelectorAll('.section-content');
    const mainNavItemsAndToggles = document.querySelectorAll('.main-dropdown-nav .nav-item > .nav-link, .main-dropdown-nav .nav-item > .dropdown-toggle');

    if (!mainNavLinks.length || !sections.length) {
        console.warn("[UI] Link navigasi utama atau section konten tidak ditemukan untuk setupMainNavigation.");
        return;
    }

    mainNavLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetSectionId = this.dataset.targetSection; // e.g., "#inputContent"
            const subTargetId = this.dataset.subTarget;       // e.g., "#data-table"

            console.log(`[UI] Link navigasi diklik. Target Section: ${targetSectionId}, Sub-Target: ${subTargetId || 'N/A'}`);

            // 1. Style link navigasi utama yang aktif
            mainNavItemsAndToggles.forEach(item => item.classList.remove('active-section'));
            if (this.classList.contains('dropdown-item')) { // Jika item di dalam dropdown (misal, di "Proses Pengaduan")
                const parentToggle = this.closest('.nav-item.dropdown')?.querySelector('.dropdown-toggle');
                if (parentToggle) parentToggle.classList.add('active-section');
            } else { // Jika link navigasi utama langsung atau toggle dropdown itu sendiri
                this.classList.add('active-section');
            }

            // 2. Aktifkan section konten utama yang sesuai
            sections.forEach(section => {
                if (`#${section.id}` === targetSectionId) {
                    section.classList.add('active');
                    console.log(`[UI] Section '${section.id}' diaktifkan.`);

                    // Panggil fungsi inisialisasi/update spesifik untuk section yang aktif
                    if (section.id === 'prosesContent') {
                        const defaultProsesSubTarget = '#data-table'; // Default jika subTargetId tidak ada
                        const targetSubPaneToShow = subTargetId || defaultProsesSubTarget;
                        console.log(`[UI] Mengaktifkan sub-pane untuk 'prosesContent': ${targetSubPaneToShow}`);
                        if (typeof showProsesSubPane === 'function') {
                            showProsesSubPane(targetSubPaneToShow);
                        } else {
                            console.error("[UI] Fungsi showProsesSubPane tidak ditemukan.");
                        }
                    } else if (section.id === 'dashboardContent' && typeof updateDashboard === 'function') {
                        updateDashboard();
                    } else if (section.id === 'userManagementContent' && typeof loadUserManagementTable === 'function') {
                        loadUserManagementTable();
                    } else if (section.id === 'inputContent') {
                        if (typeof generateNoRef === 'function' && !document.getElementById('noReferensi').value) {
                            generateNoRef();
                        }
                         if (typeof populateKabupatenDropdown === 'function') {
                            populateKabupatenDropdown();
                            const kabSelect = document.getElementById('kabupaten');
                            if(kabSelect && !kabSelect.value) {
                                if(typeof updateKecamatanDropdown === 'function') updateKecamatanDropdown();
                            }
                        }
                    }
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });

    // 3. Inisialisasi tampilan: Aktifkan section pertama yang diizinkan
    const userPermissions = JSON.parse(sessionStorage.getItem('userPermissions') || '[]');
    let firstPermittedLink = null;

    const permissionMap = {
        'inputContent': 'inputContent',
        'prosesContent': 'prosesContent',
        'dashboardContent': 'dashboardContent',
        'userManagementContent': 'userManagementContent'
    };

    // Prioritaskan 'inputContent' jika diizinkan
    const inputContentLink = Array.from(mainNavLinks).find(link => {
        const targetSectionId = link.dataset.targetSection.substring(1); // Hilangkan '#'
        return targetSectionId === 'inputContent' && userPermissions.includes(permissionMap['inputContent']);
    });

    if (inputContentLink) {
        firstPermittedLink = inputContentLink;
    } else { // Jika 'inputContent' tidak diizinkan, cari link pertama yang diizinkan sesuai urutan di HTML
        for (const link of mainNavLinks) {
            const sectionId = link.dataset.targetSection.substring(1);
            // Untuk 'prosesContent', kita perlu memastikan ada sub-item yang diizinkan juga,
            // atau setidaknya 'prosesContent' itu sendiri diizinkan.
            // Untuk kesederhanaan, jika 'prosesContent' diizinkan, kita akan mencoba mengaktifkan sub-item defaultnya.
            if (userPermissions.includes(permissionMap[sectionId])) {
                firstPermittedLink = link;
                // Jika ini adalah link ke 'prosesContent' tapi bukan sub-itemnya langsung (misalnya, toggle utama),
                // kita perlu mencari sub-item pertama yang diizinkan atau default.
                // Namun, `mainNavLinks` sudah berisi sub-item, jadi ini seharusnya sudah benar.
                break;
            }
        }
    }

    if (firstPermittedLink) {
        console.log(`[UI] Mengaktifkan link navigasi utama awal: ${firstPermittedLink.textContent.trim()}, Target: ${firstPermittedLink.dataset.targetSection}, SubTarget: ${firstPermittedLink.dataset.subTarget || 'N/A'}`);
        firstPermittedLink.click(); // Panggil event click untuk mengaktifkan section dan styling
    } else {
        console.warn("[UI] Tidak ada link navigasi utama yang diizinkan untuk aktivasi awal.");
        const mainContentArea = document.querySelector('.main-content-area');
        if(mainContentArea) mainContentArea.innerHTML = '<div class="alert alert-warning text-center p-4">Anda tidak memiliki izin untuk mengakses modul manapun. Silakan hubungi administrator.</div>';
    }
     console.log("[UI] setupMainNavigation selesai.");
}

// Fungsi setupProsesDropdownNavigation sudah tidak diperlukan lagi karena dropdown sekunder dihilangkan.
// Logika untuk menampilkan sub-pane kini ada di showProsesSubPane dan dipanggil dari setupMainNavigation.

console.log("ui.js loaded (revised for sub-navigation handling)");
