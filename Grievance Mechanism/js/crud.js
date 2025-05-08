﻿// js/crud.js

// --- Variabel Global untuk Paginasi ---
let currentPage = 1;
const rowsPerPage = 10; // Jumlah baris per halaman

// Pastikan file ini dimuat SETELAH file lain yang berisi fungsi helper
// ... (komentar lainnya tetap sama) ...

/**
 * Menghasilkan Nomor Referensi unik berdasarkan Kategori, Tanggal, dan nomor urut.
 * Format: [KODE_KATEGORI]-[YYYYMMDD]-[XXX] (XXX adalah nomor urut 3 digit)
 * Memperbarui nilai input #noReferensi.
 */
function generateNoRef() {
    const kategoriInput = document.getElementById("kategori");
    const tanggalInput = document.getElementById("tanggal");
    const noRefInput = document.getElementById("noReferensi");

    if (!kategoriInput || !tanggalInput || !noRefInput) {
        console.error("[CRUD:NoRef] Elemen form untuk generate No Ref tidak ditemukan.");
        return;
    }

    const kategoriValue = kategoriInput.value;
    const tanggalValue = tanggalInput.value;

    if (kategoriValue && tanggalValue) {
        try {
            const dateObj = new Date(tanggalValue);
            if (isNaN(dateObj.getTime())) {
                noRefInput.value = '';
                return;
            }

            const year = dateObj.getFullYear();
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const day = dateObj.getDate().toString().padStart(2, '0');
            const tanggalFormat = `${year}${month}${day}`;

            let prefix = kategoriValue.substring(0, 3).toUpperCase();
            prefix = prefix.replace(/[^A-Z]/g, 'X').padEnd(3, 'X');

            const dataPengaduan = typeof getDataFromStorage === 'function' ? getDataFromStorage(STORAGE_KEYS.grievances) : [];

            const relevantPengaduan = dataPengaduan.filter(item => {
                if (item.noReferensi) {
                    const parts = item.noReferensi.split('-');
                    return parts.length === 3 && parts[0] === prefix && parts[1] === tanggalFormat;
                }
                return false;
            });

            let nextSequence = 1;
            if (relevantPengaduan.length > 0) {
                const highestSequence = relevantPengaduan.reduce((maxSeq, item) => {
                    const parts = item.noReferensi.split('-');
                    const currentSeq = parseInt(parts[2], 10);
                    return !isNaN(currentSeq) && currentSeq > maxSeq ? currentSeq : maxSeq;
                }, 0);
                nextSequence = highestSequence + 1;
            }

            const sequenceFormatted = nextSequence.toString().padStart(3, '0');
            noRefInput.value = `${prefix}-${tanggalFormat}-${sequenceFormatted}`;

        } catch (e) {
            console.error("[CRUD:NoRef] Error formatting date or generating sequence for No Ref:", e);
            noRefInput.value = '';
            if (typeof tampilkanNotifikasi === 'function') {
                tampilkanNotifikasi('Error', 'Gagal membuat No Referensi.', 'danger');
            }
        }
    } else {
        noRefInput.value = '';
    }
}

/**
 * Mendapatkan nilai dari elemen form berdasarkan ID.
 * @param {string} id ID elemen form.
 * @returns {string} Nilai elemen atau string kosong jika elemen tidak ditemukan.
 */
function getFormValue(id) {
    const element = document.getElementById(id);
    return element ? (typeof element.value === 'string' ? element.value.trim() : element.value) : '';
}

/**
 * Mengumpulkan data dari form pengaduan utama.
 * @returns {object | null} Objek berisi data form, atau null jika form tidak ditemukan.
 */
function collectGrievanceFormData() {
     const form = document.getElementById("formPengaduan");
     if (!form) {
         console.error("[CRUD:Collect] Form #formPengaduan tidak ditemukan.");
         if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Error', 'Formulir pengaduan tidak ditemukan.', 'danger');
         }
         return null;
     }

     const formData = {
        noReferensi: getFormValue("noReferensi"),
        tanggal: getFormValue("tanggal"),
        kategori: getFormValue("kategori"),
        pelapor: getFormValue("pelapor"),
        kontak: getFormValue("kontak"),
        kabupaten: getFormValue("kabupaten"),
        kecamatan: getFormValue("kecamatan"),
        desa: getFormValue("desa"),
        aksi: getFormValue("aksi"),
        status: getFormValue("status") || 'On Progress',
        pic: getFormValue("pic"),
        prioritas: getFormValue("prioritas") || 'Medium Risk',
        deskripsi: getFormValue("deskripsi"),
        tenggat: getFormValue("tenggat") || null,
    };
    // console.log("[CRUD:Collect] Data form terkumpul:", formData); // Komentari jika terlalu berisik
    return formData;
}

/**
 * Menyimpan data pengaduan baru ke localStorage.
 */
function saveNewGrievance() {
    console.log("[CRUD:SaveNew] Mencoba menyimpan pengaduan baru...");
    const form = document.getElementById("formPengaduan");
    if (form && typeof form.checkValidity === 'function' && !form.checkValidity()) {
        form.classList.add('was-validated');
        if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Peringatan', 'Harap lengkapi semua field yang wajib diisi dengan benar.', 'warning', 7000);
        }
        console.warn("[CRUD:SaveNew] Validasi form Bootstrap gagal.");
        return;
    }

    const dataBaru = collectGrievanceFormData();
    if (!dataBaru) return;

    if (!dataBaru.noReferensi) {
        if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Peringatan', 'No Referensi belum tergenerate. Pastikan Kategori dan Tanggal sudah diisi.', 'warning', 7000);
        }
        console.warn("[CRUD:SaveNew] No Referensi kosong.");
        document.getElementById("kategori")?.focus();
        return;
    }

    if (typeof getDataFromStorage !== 'function' || typeof saveDataToStorage !== 'function' || typeof STORAGE_KEYS === 'undefined') {
        console.error("[CRUD:SaveNew] Fungsi storage atau STORAGE_KEYS tidak ditemukan.");
         if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Error Kritis', 'Fungsi penyimpanan tidak tersedia.', 'danger');
         }
        return;
    }

    const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances);

    if (dataPengaduan.some(item => item.noReferensi === dataBaru.noReferensi)) {
         console.warn(`[CRUD:SaveNew] Duplikasi No Referensi terdeteksi: ${dataBaru.noReferensi}. Generate ulang.`);
         if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Error', `No Referensi ${dataBaru.noReferensi} sudah ada. Mencoba generate ulang...`, 'danger', 5000);
         }
         generateNoRef();
         dataBaru.noReferensi = getFormValue("noReferensi");
         if (typeof tampilkanNotifikasi === 'function') {
             tampilkanNotifikasi('Info', `No Referensi baru telah digenerate (${dataBaru.noReferensi}). Silakan klik Simpan lagi.`, 'info', 7000);
         }
         return;
    }

    dataBaru.lastUpdated = new Date().toISOString();
    dataPengaduan.push(dataBaru);
    const suksesSimpan = saveDataToStorage(STORAGE_KEYS.grievances, dataPengaduan);

    if (suksesSimpan) {
         console.log("[CRUD:SaveNew] Data pengaduan baru berhasil disimpan:", dataBaru.noReferensi);
         if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Sukses', 'Data pengaduan baru berhasil disimpan!', 'success');
         }
         currentPage = 1; // Kembali ke halaman pertama setelah simpan

        try {
            if (typeof setEditMode === 'function') setEditMode(false);
            if (typeof displayGrievanceData === 'function') displayGrievanceData();
            if (typeof populateProcessDropdowns === 'function') populateProcessDropdowns();
            if (typeof selectLastIdInProcessForms === 'function') selectLastIdInProcessForms();
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof displayProcessHistory === 'function') displayProcessHistory();
        } catch (e) {
            console.error("[CRUD:SaveNew] Error saat memperbarui tampilan setelah simpan:", e);
             if (typeof tampilkanNotifikasi === 'function') {
                tampilkanNotifikasi('Peringatan', 'Data disimpan, tapi terjadi error saat memperbarui tampilan lain.', 'warning');
             }
        }
    } else {
         console.error("[CRUD:SaveNew] Gagal menyimpan data ke penyimpanan lokal.");
    }
}

/**
 * Memperbarui data pengaduan yang ada di localStorage.
 * @param {number} originalIndex Index asli data yang akan diperbarui di array localStorage.
 */
function updateGrievance(originalIndex) {
    console.log(`[CRUD:Update] Mencoba update pengaduan index asli: ${originalIndex}`);
    const form = document.getElementById("formPengaduan");
    if (form && typeof form.checkValidity === 'function' && !form.checkValidity()) {
        form.classList.add('was-validated');
        if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Peringatan', 'Harap lengkapi semua field yang wajib diisi dengan benar.', 'warning', 7000);
        }
        console.warn("[CRUD:Update] Validasi form Bootstrap gagal.");
        return;
    }

    const dataUpdate = collectGrievanceFormData();
    if (!dataUpdate) return;

    if (!dataUpdate.noReferensi) {
        if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Peringatan', 'No Referensi tidak boleh kosong saat update.', 'warning', 7000);
        }
        console.warn("[CRUD:Update] No Referensi kosong saat update.");
        return;
    }

    if (typeof getDataFromStorage !== 'function' || typeof saveDataToStorage !== 'function' || typeof STORAGE_KEYS === 'undefined') {
        console.error("[CRUD:Update] Fungsi storage atau STORAGE_KEYS tidak ditemukan.");
         if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Error Kritis', 'Fungsi penyimpanan tidak tersedia.', 'danger');
         }
        return;
    }

    const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances);
    const noRefToUpdate = dataUpdate.noReferensi;

    if (originalIndex < 0 || originalIndex >= dataPengaduan.length) {
         console.error(`[CRUD:Update] Gagal update. Index asli (${originalIndex}) tidak valid.`);
         if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Error', `Gagal memperbarui data. Index tidak valid.`, 'danger');
         }
         if (typeof setEditMode === 'function') setEditMode(false);
         return;
    }

    if (dataPengaduan[originalIndex].noReferensi !== noRefToUpdate) {
         console.error(`[CRUD:Update] KRITIS: No Referensi di form (${noRefToUpdate}) berbeda dengan data asli (${dataPengaduan[originalIndex].noReferensi}) pada index ${originalIndex}. Update dibatalkan.`);
         if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Error', `Terjadi ketidaksesuaian data (No Ref). Update dibatalkan.`, 'danger');
         }
          if (typeof setEditMode === 'function') setEditMode(false);
         return;
    }

    dataPengaduan[originalIndex] = {
        ...dataPengaduan[originalIndex],
        ...dataUpdate,
        lastUpdated: new Date().toISOString()
    };

    const suksesUpdate = saveDataToStorage(STORAGE_KEYS.grievances, dataPengaduan);

    if (suksesUpdate) {
         console.log("[CRUD:Update] Data pengaduan berhasil diperbarui:", noRefToUpdate);
         if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Sukses', 'Data pengaduan berhasil diperbarui!', 'success');
         }
         currentPage = 1; // Kembali ke halaman pertama setelah update

         try {
             if (typeof setEditMode === 'function') setEditMode(false);
             if (typeof displayGrievanceData === 'function') displayGrievanceData();
             if (typeof populateProcessDropdowns === 'function') populateProcessDropdowns();
             if (typeof updateDashboard === 'function') updateDashboard();
             if (typeof displayProcessHistory === 'function') displayProcessHistory();
         } catch (e) {
             console.error("[CRUD:Update] Error saat memperbarui tampilan setelah update:", e);
             if (typeof tampilkanNotifikasi === 'function') {
                 tampilkanNotifikasi('Peringatan', 'Data diperbarui, tapi terjadi error saat memperbarui tampilan lain.', 'warning');
             }
         }
    } else {
         console.error("[CRUD:Update] Gagal memperbarui data di penyimpanan lokal.");
    }
}

/**
 * Menghapus data pengaduan dari localStorage berdasarkan index asli.
 * Juga menghapus data terkait (evaluasi, tanggapan, banding).
 * @param {number} originalIndex Index asli data di localStorage.
 */
function deleteGrievance(originalIndex) {
    console.log(`[CRUD:Delete] Mencoba hapus pengaduan index asli: ${originalIndex}`);
    if (typeof getDataFromStorage !== 'function' || typeof saveDataToStorage !== 'function' || typeof deleteRelatedData !== 'function' || typeof STORAGE_KEYS === 'undefined') {
        console.error("[CRUD:Delete] Fungsi storage/deleteRelatedData atau STORAGE_KEYS tidak ditemukan.");
         if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Error Kritis', 'Fungsi penghapusan tidak tersedia.', 'danger');
         }
        return;
    }

    const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances);

    if (originalIndex < 0 || originalIndex >= dataPengaduan.length) {
        console.error(`[CRUD:Delete] Gagal hapus. Index asli (${originalIndex}) tidak valid.`);
         if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Error', 'Gagal menghapus data. Index tidak valid.', 'danger');
         }
         return;
    }

    const itemToDelete = dataPengaduan[originalIndex];
    const noRefToDelete = itemToDelete.noReferensi;

    const confirmModalElement = document.getElementById('confirmDeleteModal');
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal && confirmModalElement) {
        const confirmModal = bootstrap.Modal.getOrCreateInstance(confirmModalElement);
        const modalBody = confirmModalElement.querySelector('.modal-body');
        const confirmBtn = document.getElementById('confirmDeleteBtn');

        if (modalBody) modalBody.textContent = `Apakah Anda yakin ingin menghapus pengaduan No. Ref: ${noRefToDelete}? Tindakan ini akan menghapus juga riwayat proses terkait dan TIDAK DAPAT DIURUNGKAN.`;

        if (confirmBtn) {
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

            newConfirmBtn.onclick = () => {
                console.log(`[CRUD:Delete] Konfirmasi hapus (modal) untuk ${noRefToDelete} diterima.`);
                confirmModal.hide();
                proceedWithDeletion(originalIndex, noRefToDelete);
            };
        } else {
             console.error("[CRUD:Delete] Tombol konfirmasi (#confirmDeleteBtn) tidak ditemukan di modal.");
             if (confirm(`(Tombol modal error) Hapus ${noRefToDelete}?`)) {
                 proceedWithDeletion(originalIndex, noRefToDelete);
             }
        }
        confirmModal.show();
    } else {
        if (confirm(`Apakah Anda yakin ingin menghapus pengaduan No. Ref: ${noRefToDelete}? \n\nTindakan ini akan menghapus juga riwayat proses terkait dan TIDAK DAPAT DIURUNGKAN.`)) {
            console.log(`[CRUD:Delete] Konfirmasi hapus (confirm) untuk ${noRefToDelete} diterima.`);
            proceedWithDeletion(originalIndex, noRefToDelete);
        } else {
             console.log(`[CRUD:Delete] Penghapusan ${noRefToDelete} dibatalkan oleh pengguna.`);
        }
    }
}

/**
 * Melanjutkan proses penghapusan setelah dikonfirmasi.
 * @param {number} originalIndex Index asli data yang akan dihapus.
 * @param {string} noRefToDelete No Referensi yang akan dihapus.
 */
function proceedWithDeletion(originalIndex, noRefToDelete) {
     console.log(`[CRUD:ProceedDelete] Melanjutkan penghapusan untuk index ${originalIndex}, NoRef: ${noRefToDelete}`);
     const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances);

     if (originalIndex < 0 || originalIndex >= dataPengaduan.length || dataPengaduan[originalIndex].noReferensi !== noRefToDelete) {
         console.error(`[CRUD:ProceedDelete] Index (${originalIndex}) atau NoRef (${noRefToDelete}) tidak cocok dengan data saat ini. Penghapusan dibatalkan.`);
         if (typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', 'Gagal menghapus data karena ketidaksesuaian.', 'danger');
         return;
     }

     dataPengaduan.splice(originalIndex, 1);
     const suksesHapusUtama = saveDataToStorage(STORAGE_KEYS.grievances, dataPengaduan);

     if (suksesHapusUtama) {
         console.log(`[CRUD:ProceedDelete] Data utama ${noRefToDelete} berhasil dihapus dari storage.`);
         try {
             console.log(`[CRUD:ProceedDelete] Menghapus data terkait untuk ${noRefToDelete}...`);
             deleteRelatedData(STORAGE_KEYS.evaluations, noRefToDelete);
             deleteRelatedData(STORAGE_KEYS.responses, noRefToDelete);
             deleteRelatedData(STORAGE_KEYS.appeals, noRefToDelete);
             console.log(`[CRUD:ProceedDelete] Data terkait untuk ${noRefToDelete} selesai dihapus.`);
         } catch(e) {
             console.error("[CRUD:ProceedDelete] Error saat menghapus data terkait:", e);
              if (typeof tampilkanNotifikasi === 'function') {
                 tampilkanNotifikasi('Peringatan', 'Data utama dihapus, tapi mungkin ada error saat menghapus riwayat terkait.', 'warning');
              }
         }

          if (typeof tampilkanNotifikasi === 'function') {
             tampilkanNotifikasi('Sukses', `Data pengaduan ${noRefToDelete} dan riwayat proses terkait berhasil dihapus.`, 'success');
          }
          currentPage = 1; // Kembali ke halaman pertama setelah hapus

         try {
             if (typeof displayGrievanceData === 'function') displayGrievanceData();
             if (typeof populateProcessDropdowns === 'function') populateProcessDropdowns();
             if (typeof updateDashboard === 'function') updateDashboard();
             if (typeof displayProcessHistory === 'function') displayProcessHistory();
         } catch (e) {
              console.error("[CRUD:ProceedDelete] Error saat memperbarui tampilan setelah hapus:", e);
              if (typeof tampilkanNotifikasi === 'function') {
                  tampilkanNotifikasi('Peringatan', 'Data dihapus, tapi terjadi error saat update tampilan.', 'warning');
              }
         }
     } else {
          console.error(`[CRUD:ProceedDelete] Gagal menghapus data utama ${noRefToDelete} dari penyimpanan lokal.`);
     }
}


/**
 * Fungsi helper untuk menghapus data terkait berdasarkan noReferensi dari storage key tertentu.
 * @param {string} storageKey Kunci localStorage (e.g., STORAGE_KEYS.evaluations).
 * @param {string} noRefToDelete No Referensi yang akan dihapus.
 */
function deleteRelatedData(storageKey, noRefToDelete) {
    if (typeof getDataFromStorage !== 'function' || typeof saveDataToStorage !== 'function') {
        console.error(`[CRUD:DeleteRelated] Fungsi storage tidak tersedia saat mencoba menghapus dari ${storageKey}`);
        return;
    }
    let relatedList = getDataFromStorage(storageKey);
    if (!Array.isArray(relatedList)) {
        console.warn(`[CRUD:DeleteRelated] Data dari ${storageKey} bukan array, tidak dapat memfilter.`);
        return;
    }
    const initialLength = relatedList.length;
    relatedList = relatedList.filter(item => item && item.id !== noRefToDelete);
    const finalLength = relatedList.length;

    if (finalLength < initialLength) {
        const success = saveDataToStorage(storageKey, relatedList);
        if (success) {
            console.log(`[CRUD:DeleteRelated] ${initialLength - finalLength} data terkait untuk ${noRefToDelete} dihapus dari ${storageKey}`);
        } else {
             console.error(`[CRUD:DeleteRelated] Gagal menyimpan perubahan ke ${storageKey} setelah menghapus data terkait untuk ${noRefToDelete}.`);
        }
    }
}


/**
 * Mengisi form input utama dengan data yang dipilih untuk diedit.
 * @param {number} originalIndex Index asli data di localStorage.
 */
function editGrievance(originalIndex) {
    console.log(`[CRUD:Edit] Memulai edit untuk index asli: ${originalIndex}`);
    if (typeof getDataFromStorage !== 'function' || typeof setEditMode !== 'function' ||
        typeof updateKecamatanDropdown !== 'function' || typeof updateDesaDropdown !== 'function' ||
        typeof STORAGE_KEYS === 'undefined' || typeof tampilkanNotifikasi !== 'function')
    {
         console.error("[CRUD:Edit] Fungsi storage/UI helper atau STORAGE_KEYS tidak ditemukan.");
         tampilkanNotifikasi('Error Kritis', 'Fungsi untuk mode edit tidak tersedia.', 'danger');
         return;
    }

    const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances);
    if (originalIndex < 0 || originalIndex >= dataPengaduan.length) {
         console.error(`[CRUD:Edit] Gagal edit. Index asli (${originalIndex}) tidak valid.`);
         tampilkanNotifikasi('Error', 'Data tidak ditemukan untuk diedit.', 'danger');
         return;
    }
    const item = dataPengaduan[originalIndex];
    console.log("[CRUD:Edit] Data yang akan diedit:", item);

    // --- PERBAIKAN: Pindah Section ---
    const inputSection = document.getElementById('inputContent');
    const inputNavLink = document.querySelector('.main-dropdown-nav a[data-target-section="#inputContent"]');

    if (!inputNavLink) {
        console.error("[CRUD:Edit] Link navigasi untuk #inputContent tidak ditemukan! Tidak bisa pindah otomatis.");
        tampilkanNotifikasi('Error', 'Komponen navigasi tidak ditemukan untuk pindah ke form input.', 'warning');
    } else {
        const isInputSectionActive = inputSection && inputSection.classList.contains('active');
        console.log(`[CRUD:Edit] Section input aktif? ${isInputSectionActive}`);
        if (!isInputSectionActive) {
            console.log("[CRUD:Edit] Memanggil click() pada link navigasi input...");
            inputNavLink.click();
        } else {
            console.log("[CRUD:Edit] Section input sudah aktif, tidak perlu memanggil click().");
        }
    }
    // --- AKHIR PERBAIKAN PINDAH SECTION ---


    // Fungsi helper untuk set nilai form
    const setFormValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || '';
        } else {
            console.warn(`[CRUD:Edit:Set] Elemen form dengan ID "${id}" tidak ditemukan.`);
        }
    };

    // Isi semua field form utama
    setFormValue("noReferensi", item.noReferensi);
    setFormValue("tanggal", item.tanggal);
    setFormValue("kategori", item.kategori);
    setFormValue("pelapor", item.pelapor);
    setFormValue("kontak", item.kontak);
    setFormValue("aksi", item.aksi);
    setFormValue("status", item.status);
    setFormValue("pic", item.pic);
    setFormValue("prioritas", item.prioritas);
    setFormValue("deskripsi", item.deskripsi);
    setFormValue("tenggat", item.tenggat);

    // --- PERBAIKAN LOGIKA DROPDOWN WILAYAH ---
    console.log("[CRUD:Edit] Mengatur dropdown wilayah...");
    const kabupatenSelect = document.getElementById('kabupaten');
    const kecamatanSelect = document.getElementById('kecamatan');
    const desaSelect = document.getElementById('desa');

    if (kabupatenSelect && kecamatanSelect && desaSelect) {
        setFormValue("kabupaten", item.kabupaten);
        updateKecamatanDropdown();

        requestAnimationFrame(() => {
            if (item.kecamatan && Array.from(kecamatanSelect.options).some(opt => opt.value === item.kecamatan)) {
                setFormValue("kecamatan", item.kecamatan);
                 console.log("[CRUD:Edit] Kecamatan di-set. Memanggil updateDesaDropdown...");
                 updateDesaDropdown();

                 requestAnimationFrame(() => {
                    if (item.desa && Array.from(desaSelect.options).some(opt => opt.value === item.desa)) {
                         setFormValue("desa", item.desa);
                         console.log("[CRUD:Edit] Desa di-set.");
                    } else {
                         console.warn(`[CRUD:Edit] Desa "${item.desa}" tidak ditemukan di opsi dropdown setelah update.`);
                         desaSelect.value = "";
                    }
                 });

            } else {
                console.warn(`[CRUD:Edit] Kecamatan "${item.kecamatan}" tidak ditemukan di opsi dropdown setelah update.`);
                kecamatanSelect.value = "";
                desaSelect.innerHTML = '<option value="">-- Pilih Desa --</option>';
                desaSelect.disabled = true;
            }
        });

    } else {
         console.error("[CRUD:Edit] Dropdown wilayah (kabupaten/kecamatan/desa) tidak ditemukan.");
    }
    // --- AKHIR PERBAIKAN DROPDOWN ---

    // Masuk ke mode edit
    setEditMode(true, originalIndex);

    // Fokus ke field pertama yang bisa diedit dan scroll ke atas
    setTimeout(() => {
        document.getElementById('pelapor')?.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log("[CRUD:Edit] Form diisi, mode edit aktif, fokus & scroll diterapkan.");
    }, 100);

}


/**
 * Menampilkan data pengaduan di tabel dengan paginasi.
 */
function displayGrievanceData() {
    const tbody = document.getElementById("tbodyData");
    const searchInput = document.getElementById("searchInput");
    const filterStatusSelect = document.getElementById("filterStatus");

    if (!tbody) {
        console.error("[CRUD:Display] Elemen tbody #tbodyData tidak ditemukan.");
        return;
    }
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filterStatus = filterStatusSelect ? filterStatusSelect.value : 'all';

    if (typeof getDataFromStorage !== 'function' || typeof createBadge !== 'function' || typeof STORAGE_KEYS === 'undefined') {
        console.error("[CRUD:Display] Fungsi getDataFromStorage/createBadge atau STORAGE_KEYS tidak ditemukan.");
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Error: Fungsi penting tidak ditemukan.</td></tr>`;
        return;
    }

    const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances);
    tbody.innerHTML = ""; // Kosongkan tabel sebelum mengisi

    // Filter data
    const filteredData = dataPengaduan.filter(item => {
        if (typeof item !== 'object' || item === null) return false;
        const checkMatch = (fieldValue) => fieldValue && typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(searchTerm);
        const matchesSearch = !searchTerm || (
            checkMatch(item.noReferensi) || checkMatch(item.pelapor) || checkMatch(item.kategori) ||
            checkMatch(item.desa) || checkMatch(item.kecamatan) || checkMatch(item.kabupaten) ||
            checkMatch(item.pic) || checkMatch(item.deskripsi)
        );
        const matchesStatus = filterStatus === 'all' || (item.status && item.status === filterStatus);
        return matchesSearch && matchesStatus;
    });

    // Hitung total halaman
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    // Pastikan currentPage valid
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    // Hitung index awal dan akhir untuk slice data
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    console.log(`[CRUD:Display] Halaman: ${currentPage}/${totalPages}. Menampilkan ${paginatedData.length} dari ${filteredData.length} data (total: ${dataPengaduan.length}).`);

    if (paginatedData.length === 0) {
        const colCount = document.querySelectorAll("#tabelData thead th").length || 9;
        const message = filteredData.length > 0 ? `Tidak ada data di halaman ${currentPage}.` : (searchTerm || filterStatus !== 'all' ? 'Tidak ada data yang cocok dengan filter.' : 'Belum ada data pengaduan.');
        tbody.innerHTML = `<tr><td colspan="${colCount}" class="text-center py-4 text-muted"><i class="fas fa-folder-open me-2"></i> ${message}</td></tr>`;
    } else {
        paginatedData.forEach((item, index) => { // index di sini adalah index dalam paginatedData
            const originalIndex = dataPengaduan.findIndex(originalItem => originalItem && originalItem.noReferensi === item.noReferensi);
            if (originalIndex === -1) {
                console.warn(`[CRUD:Display] Item dengan No Ref ${item.noReferensi} tidak ditemukan di data asli.`);
                return;
            }

            const row = tbody.insertRow();
            row.setAttribute('data-original-index', originalIndex);

            const formatTanggal = (tgl) => {
                if (!tgl) return "-";
                try {
                    const date = new Date(tgl);
                    return !isNaN(date.getTime()) ? date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : tgl;
                } catch (e) { return tgl; }
            };

            const statusBadge = typeof createBadge === 'function' ? createBadge('status', item.status || 'N/A') : (item.status || 'N/A');
            const priorityBadge = typeof createBadge === 'function' ? createBadge('priority', item.prioritas || 'N/A') : (item.prioritas || 'N/A');

            const showDetailFunc = typeof showDetailModal === 'function' ? `showDetailModal(${originalIndex})` : '';
            const editFunc = typeof editGrievance === 'function' ? `editGrievance(${originalIndex})` : '';
            const deleteFunc = typeof deleteGrievance === 'function' ? `deleteGrievance(${originalIndex})` : '';

            // --- PERUBAHAN TATA LETAK TOMBOL AKSI ---
            const actionButtons = `
                <div class="d-flex justify-content-center align-items-center mb-1">
                    ${showDetailFunc ? `<button class="btn btn-sm btn-outline-info me-1" onclick="${showDetailFunc}" title="Lihat Detail"><i class="fas fa-eye"></i></button>` : ''}
                    ${editFunc ? `<button class="btn btn-sm btn-outline-warning" onclick="${editFunc}" title="Edit Data"><i class="fas fa-edit"></i></button>` : ''}
                </div>
                <div class="d-flex justify-content-center">
                    ${deleteFunc ? `<button class="btn btn-sm btn-outline-danger" onclick="${deleteFunc}" title="Hapus Data"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            `;
            // --- AKHIR PERUBAHAN TATA LETAK ---

            // Isi sel
            row.insertCell().outerHTML = `<td class="text-center align-middle">${startIndex + index + 1}</td>`; // Nomor urut global
            row.insertCell().textContent = item.noReferensi || '-';
            row.insertCell().textContent = formatTanggal(item.tanggal);
            row.insertCell().textContent = item.kategori || '-';
            row.insertCell().textContent = item.pelapor || '-';
            row.insertCell().innerHTML = `<td class="text-center align-middle">${statusBadge}</td>`;
            row.insertCell().textContent = item.pic || '-';
            row.insertCell().innerHTML = `<td class="text-center align-middle">${priorityBadge}</td>`;
            row.insertCell().innerHTML = `<td class="text-center align-middle">${actionButtons}</td>`; // Masukkan HTML tombol
        });
    }

    // Render kontrol paginasi
    renderPaginationControls(currentPage, totalPages);
}

/**
 * Merender kontrol paginasi Bootstrap.
 * @param {number} currentPage Halaman saat ini.
 * @param {number} totalPages Jumlah total halaman.
 */
function renderPaginationControls(currentPage, totalPages) {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
        console.error("[CRUD:Pagination] Kontainer paginasi #paginationContainer tidak ditemukan.");
        return;
    }
    paginationContainer.innerHTML = ''; // Kosongkan kontainer

    if (totalPages <= 1) return; // Tidak perlu paginasi jika hanya 1 halaman atau kurang

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Navigasi Tabel Pengaduan');
    const ul = document.createElement('ul');
    ul.className = 'pagination pagination-sm'; // Ukuran kecil

    // Tombol Previous
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.innerHTML = '&laquo;'; // Atau 'Previous'
    prevLink.onclick = (e) => { e.preventDefault(); if (currentPage > 1) handlePageClick(currentPage - 1); };
    prevLi.appendChild(prevLink);
    ul.appendChild(prevLi);

    // Tombol Nomor Halaman (buat logika untuk menampilkan beberapa nomor saja jika halaman banyak)
    // Contoh sederhana: tampilkan semua nomor
    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.onclick = (e) => { e.preventDefault(); handlePageClick(i); };
        pageLi.appendChild(pageLink);
        ul.appendChild(pageLi);
    }

    // Tombol Next
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.innerHTML = '&raquo;'; // Atau 'Next'
    nextLink.onclick = (e) => { e.preventDefault(); if (currentPage < totalPages) handlePageClick(currentPage + 1); };
    nextLi.appendChild(nextLink);
    ul.appendChild(nextLi);

    nav.appendChild(ul);
    paginationContainer.appendChild(nav);
}

/**
 * Menangani klik pada nomor halaman paginasi.
 * @param {number} pageNumber Nomor halaman yang diklik.
 */
function handlePageClick(pageNumber) {
    console.log(`[CRUD:Pagination] Pindah ke halaman: ${pageNumber}`);
    currentPage = pageNumber;
    displayGrievanceData(); // Tampilkan ulang data untuk halaman baru
    // Scroll ke atas tabel (opsional)
    document.getElementById('tabelData')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/**
 * Mereset filter pencarian dan status, lalu menampilkan ulang data dari halaman 1.
 */
function resetTableFilters() {
    console.log("[CRUD:ResetFilter] Mereset filter tabel...");
    const searchInput = document.getElementById("searchInput");
    const filterStatusSelect = document.getElementById("filterStatus");
    if (searchInput) searchInput.value = '';
    if (filterStatusSelect) filterStatusSelect.value = 'all';

    currentPage = 1; // Kembali ke halaman pertama saat filter direset

    if (typeof displayGrievanceData === 'function') {
        displayGrievanceData();
        console.log("[CRUD:ResetFilter] Filter direset dan tabel dimuat ulang dari halaman 1.");
    } else {
        console.error("[CRUD:ResetFilter] Fungsi displayGrievanceData tidak ditemukan.");
    }
}


console.log("crud.js loaded (with pagination and action button layout)");
