// js/user_management.js

// Variabel `currentUsers`, `saveDataToStorage`, `STORAGE_KEYS`
// seharusnya sudah dimuat dari config.js
// Fungsi `tampilkanNotifikasi`, `createRoleBadge` (jika ada) dari ui.js

/**
 * Memuat dan menampilkan daftar pengguna dalam tabel manajemen pengguna.
 * Filter berdasarkan input pencarian.
 */
function loadUserManagementTable() {
    const userManagementTableBody = document.getElementById('tbodyUserManagement'); // ID tbody di index.html
    const searchUserInput = document.getElementById('searchUserInput');
    const addUserBtn = document.getElementById('addUserBtn'); // Tombol tambah di index.html

    if (!userManagementTableBody || !searchUserInput || !addUserBtn) {
        console.error("[UserMgmt] Elemen tabel, input cari, atau tombol tambah tidak ditemukan.");
        if(userManagementTableBody) userManagementTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error: Komponen UI tidak lengkap.</td></tr>';
        return;
    }

    userManagementTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span> Memuat...</td></tr>';
    const currentUserRole = sessionStorage.getItem('userRole');
    const allowedRoles = ["Administrator", "Liasion - Administrator"];
    if (!allowedRoles.includes(currentUserRole)) {
        userManagementTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Akses Ditolak: Anda tidak memiliki izin untuk mengelola pengguna.</td></tr>';
        console.warn("[UserMgmt] Akses ditolak: Peran pengguna", currentUserRole, "tidak diizinkan.");
        addUserBtn.style.display = 'none';
        searchUserInput.disabled = true;
        return;
    }

    addUserBtn.style.display = 'inline-block';
    searchUserInput.disabled = false;

    if (typeof currentUsers === 'undefined' || currentUsers === null) {
         console.error("[UserMgmt] Fatal: Objek 'currentUsers' tidak terdefinisi.");
         userManagementTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error: Data pengguna tidak dapat dimuat.</td></tr>';
         return;
    }

    const searchTerm = searchUserInput.value.toLowerCase();
    const usersArray = Object.keys(currentUsers)
        .map(username => ({
            username: username,
            role: currentUsers[username].role || 'N/A',
            permissions: currentUsers[username].permissions || []
        }))
        .filter(user =>
            user.username.toLowerCase().includes(searchTerm) ||
            user.role.toLowerCase().includes(searchTerm)
        );

    userManagementTableBody.innerHTML = '';

    if (usersArray.length === 0) {
        userManagementTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><i class="fas fa-users-slash me-2"></i> ${searchTerm ? 'Tidak ada pengguna yang cocok.' : 'Belum ada data pengguna.'}</td></tr>`;
        return;
    }

    const createRoleBadge = (role) => {
         const roleClass = role.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'default';
         // Menggunakan kelas CSS yang sudah ada di style.css atau variabel CSS
         // Contoh: .badge.bg-administrator, .badge.bg-supervisor, dll.
         // atau .badge.role-administrator
         return `<span class="badge bg-${roleClass} role-${roleClass}">${role}</span>`;
    };

     const displayPermissions = (permissions) => {
        if (!permissions || permissions.length === 0) return '<small class="text-muted">Tidak ada</small>';
        const friendlyNames = {
            inputTab: "Input",
            prosesTab: "Proses",
            dashboardTab: "Dashboard",
            userManagementTab: "User Mgmt"
        };
         return permissions.map(p => friendlyNames[p] || p).join(', ');
     };

    usersArray.forEach((user, index) => {
        const row = userManagementTableBody.insertRow();
        row.setAttribute('data-username', user.username);
        const actionButtons = `
            <button class="btn btn-sm btn-outline-warning edit-user-btn me-1"
                    data-bs-toggle="modal"
                    data-bs-target="#userModal"
                    data-username="${user.username}"
                    title="Edit Pengguna ${user.username}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-user-btn"
                    data-username="${user.username}"
                    title="Hapus Pengguna ${user.username}">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        row.innerHTML = `
            <td class="text-center">${index + 1}</td>
            <td>${user.username}</td>
            <td>${createRoleBadge(user.role)}</td>
            <td><small>${displayPermissions(user.permissions)}</small></td>
            <td class="text-center">${actionButtons}</td>
        `;
    });

    const newTbody = userManagementTableBody.cloneNode(true);
    userManagementTableBody.parentNode.replaceChild(newTbody, userManagementTableBody);
    newTbody.addEventListener('click', function(event) {
        if (event.target.closest('.delete-user-btn')) {
            handleDeleteUser(event.target.closest('.delete-user-btn'));
        }
    });
    console.log("[UserMgmt] Tabel manajemen pengguna dimuat ulang.");
}

/**
 * Menangani penambahan pengguna baru dari data form modal.
 * @param {string[]} checkedPermissions Array berisi value permission yang dipilih.
 */
function handleAddUser(checkedPermissions) {
    const usernameInput = document.getElementById('formUsername');
    const passwordInput = document.getElementById('formPassword');
    const roleSelect = document.getElementById('formUserRole');
    const userModalElement = document.getElementById('userModal');

    if (!usernameInput || !passwordInput || !roleSelect || !userModalElement) {
        console.error("[UserMgmt:Add] Elemen form modal tidak ditemukan.");
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', 'Gagal menambahkan pengguna: komponen form hilang.', 'danger');
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value;

    if (!username || !password || !role) {
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Peringatan', 'Nama pengguna, password, dan peran wajib diisi.', 'warning');
        console.warn("[UserMgmt:Add] Validasi dasar gagal di handleAddUser (username, password, atau role kosong).");
        return;
    }
     if (checkedPermissions.length === 0) {
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Peringatan', 'Pilih setidaknya satu otoritas tab.', 'warning');
        console.warn("[UserMgmt:Add] Validasi gagal: Tidak ada izin yang dipilih.");
        return;
    }

    if (currentUsers.hasOwnProperty(username)) {
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Gagal', `Username '${username}' sudah terdaftar.`, 'danger');
        usernameInput.classList.add('is-invalid');
        let feedback = usernameInput.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = `Username '${username}' sudah terdaftar.`;
            feedback.style.display = 'block';
        }
        return;
    } else {
         usernameInput.classList.remove('is-invalid');
         let feedback = usernameInput.parentNode.querySelector('.invalid-feedback');
         if (feedback) {
             feedback.textContent = 'Nama pengguna tidak boleh kosong.';
         }
    }

    currentUsers[username] = {
        password: password,
        role: role,
        permissions: checkedPermissions
    };

    const saveSuccess = saveDataToStorage(STORAGE_KEYS.users, currentUsers);

    if (saveSuccess) {
        console.log(`[UserMgmt:Add] Pengguna baru ditambahkan: ${username}, Role: ${role}, Izin: [${checkedPermissions.join(', ')}]`);
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Sukses', `Pengguna '${username}' berhasil ditambahkan.`, 'success');
        loadUserManagementTable();
        const userModal = bootstrap.Modal.getInstance(userModalElement);
        if (userModal) {
            userModal.hide();
        }
    } else {
        console.error("[UserMgmt:Add] Gagal menyimpan data pengguna baru ke localStorage.");
        delete currentUsers[username]; // Rollback
    }
}

/**
 * Menangani pembaruan data pengguna dari form modal.
 * @param {string[]} checkedPermissions Array berisi value permission yang dipilih.
 */
function handleUpdateUser(checkedPermissions) {
    const usernameInput = document.getElementById('formUsername');
    const passwordInput = document.getElementById('formPassword');
    const roleSelect = document.getElementById('formUserRole');
    const userModalElement = document.getElementById('userModal');
    const editUsernameInput = document.getElementById('editUsername');

    if (!usernameInput || !passwordInput || !roleSelect || !userModalElement || !editUsernameInput) {
        console.error("[UserMgmt:Update] Elemen form modal tidak ditemukan.");
         if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', 'Gagal memperbarui pengguna: komponen form hilang.', 'danger');
        return;
    }

    const username = editUsernameInput.value;
    const newPassword = passwordInput.value;
    const newRole = roleSelect.value;

    if (!currentUsers.hasOwnProperty(username)) {
        console.error(`[UserMgmt:Update] Pengguna '${username}' yang akan diedit tidak ditemukan.`);
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', `Pengguna '${username}' tidak ditemukan.`, 'danger');
        return;
    }

    if (!newRole) {
         if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Peringatan', 'Peran wajib diisi.', 'warning');
         console.warn("[UserMgmt:Update] Validasi gagal: Peran kosong.");
         return;
    }
    if (checkedPermissions.length === 0) {
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Peringatan', 'Pilih setidaknya satu otoritas tab.', 'warning');
        console.warn("[UserMgmt:Update] Validasi gagal: Tidak ada izin yang dipilih.");
        return;
    }

    const oldUserData = { ...currentUsers[username] };
    currentUsers[username].role = newRole;
    currentUsers[username].permissions = checkedPermissions;
    if (newPassword) {
        currentUsers[username].password = newPassword;
        console.log(`[UserMgmt:Update] Password untuk '${username}' diperbarui.`);
    } else {
         console.log(`[UserMgmt:Update] Password untuk '${username}' tidak diubah.`);
    }

    const saveSuccess = saveDataToStorage(STORAGE_KEYS.users, currentUsers);

    if (saveSuccess) {
        console.log(`[UserMgmt:Update] Pengguna '${username}' diperbarui. Role: ${newRole}, Izin: [${checkedPermissions.join(', ')}]`);
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Sukses', `Pengguna '${username}' berhasil diperbarui.`, 'success');
        loadUserManagementTable();
        const userModal = bootstrap.Modal.getInstance(userModalElement);
        if (userModal) {
            userModal.hide();
        }
    } else {
        console.error("[UserMgmt:Update] Gagal menyimpan pembaruan data pengguna ke localStorage.");
        currentUsers[username] = oldUserData; // Rollback
        console.log(`[UserMgmt:Update] Perubahan untuk '${username}' dibatalkan karena gagal simpan.`);
    }
}

/**
 * Menangani penghapusan pengguna menggunakan modal Bootstrap kustom.
 * @param {HTMLButtonElement} button Tombol hapus yang diklik.
 */
function handleDeleteUser(button) {
    const usernameToDelete = button.dataset.username;
    if (!usernameToDelete) {
        console.error("[UserMgmt:Delete] Atribut data-username tidak ditemukan pada tombol hapus.");
        return;
    }

    const loggedInUsername = sessionStorage.getItem('loggedInUsername');
    if (usernameToDelete === loggedInUsername) {
        if (typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Peringatan', 'Anda tidak dapat menghapus akun Anda sendiri.', 'warning');
        return;
    }

    // Dapatkan elemen modal dan tombol konfirmasi dari HTML
    const confirmModalElement = document.getElementById('confirmDeleteUserModal');
    const confirmModalMessage = document.getElementById('confirmDeleteUserMessage');
    const confirmDeleteBtn = document.getElementById('confirmDeleteUserBtn');

    if (!confirmModalElement || !confirmModalMessage || !confirmDeleteBtn) {
        console.error("[UserMgmt:Delete] Elemen modal konfirmasi kustom tidak ditemukan. Menggunakan confirm() bawaan.");
        // Fallback ke confirm() bawaan jika modal kustom tidak ada
        if (confirm(`Apakah Anda yakin ingin menghapus pengguna '${usernameToDelete}'? Tindakan ini tidak dapat diurungkan.`)) {
            proceedWithDeletion(usernameToDelete);
        } else {
            console.log(`[UserMgmt:Delete] Penghapusan pengguna '${usernameToDelete}' dibatalkan oleh pengguna (confirm bawaan).`);
        }
        return;
    }

    // Atur pesan di modal
    confirmModalMessage.textContent = `Apakah Anda yakin ingin menghapus pengguna '${usernameToDelete}'? Tindakan ini tidak dapat diurungkan.`;

    // Buat instance modal Bootstrap
    const confirmModal = new bootstrap.Modal(confirmModalElement);

    // Fungsi yang akan dijalankan jika pengguna mengklik "Ya, Hapus"
    const onConfirm = () => {
        console.log(`[UserMgmt:Delete] Konfirmasi hapus untuk '${usernameToDelete}' diterima (modal kustom).`);
        proceedWithDeletion(usernameToDelete);
        confirmModal.hide(); // Sembunyikan modal setelah aksi
        // Hapus event listener agar tidak menumpuk jika fungsi dipanggil lagi
        confirmDeleteBtn.removeEventListener('click', onConfirm);
    };

    // Tambahkan event listener ke tombol konfirmasi di modal
    // Hapus listener lama dulu untuk mencegah duplikasi jika tombol diklik berkali-kali
    confirmDeleteBtn.removeEventListener('click', onConfirm); // Hapus listener lama (jika ada)
    confirmDeleteBtn.addEventListener('click', onConfirm, { once: true }); // { once: true } juga bisa digunakan jika hanya sekali

    // Tampilkan modal konfirmasi
    confirmModal.show();
}

/**
 * Melanjutkan proses penghapusan setelah dikonfirmasi.
 * @param {string} usernameToDelete Nama pengguna yang akan dihapus.
 */
function proceedWithDeletion(usernameToDelete) {
    if (currentUsers.hasOwnProperty(usernameToDelete)) {
        const oldUsersObject = { ...currentUsers }; // Salin untuk rollback
        delete currentUsers[usernameToDelete];
        const saveSuccess = saveDataToStorage(STORAGE_KEYS.users, currentUsers);

        if (saveSuccess) {
            console.log(`[UserMgmt:DeleteLogic] Pengguna '${usernameToDelete}' berhasil dihapus dari sistem.`);
            if (typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Sukses', `Pengguna '${usernameToDelete}' berhasil dihapus.`, 'success');
            loadUserManagementTable(); // Muat ulang tabel untuk mencerminkan perubahan
        } else {
            console.error("[UserMgmt:DeleteLogic] Gagal menyimpan perubahan setelah menghapus pengguna ke localStorage.");
            currentUsers = oldUsersObject; // Rollback perubahan di memori
            if (typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', `Gagal menghapus pengguna '${usernameToDelete}' dari penyimpanan.`, 'danger');
            console.log(`[UserMgmt:DeleteLogic] Penghapusan '${usernameToDelete}' dibatalkan karena gagal simpan.`);
        }
    } else {
        console.warn(`[UserMgmt:DeleteLogic] Pengguna '${usernameToDelete}' tidak ditemukan saat mencoba melanjutkan penghapusan.`);
        if (typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Gagal', `Pengguna '${usernameToDelete}' tidak ditemukan.`, 'warning');
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const searchUserInput = document.getElementById('searchUserInput');
    if (searchUserInput) {
        searchUserInput.addEventListener('input', () => {
             clearTimeout(searchUserInput.timer);
             searchUserInput.timer = setTimeout(() => {
                 console.log("[UserMgmt] Input pencarian berubah, memuat ulang tabel...");
                 loadUserManagementTable();
             }, 300);
        });
         console.log("[UserMgmt] Event listener 'input' untuk pencarian pengguna ditambahkan.");
    }

    const userModalElement = document.getElementById('userModal');
    const userForm = document.getElementById('userForm');
    const modalTitle = document.getElementById('userModalLabel');
    const formUsernameInput = document.getElementById('formUsername');
    const formPasswordInput = document.getElementById('formPassword');
    const passwordHelpBlock = document.getElementById('passwordHelpBlock');
    const formModeInput = document.getElementById('formMode');
    const editUsernameInput = document.getElementById('editUsername');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const permissionCheckboxes = document.querySelectorAll('#formTabPermissions input[type="checkbox"]');
    const permissionError = document.getElementById('permissionError');
    const permissionContainer = document.getElementById('formTabPermissions');

    permissionCheckboxes.forEach(cb => {
        if (cb.hasAttribute('required')) {
            cb.removeAttribute('required');
            console.log(`[UserMgmt] Atribut 'required' dihapus dari checkbox izin: ${cb.id}`);
        }
    });

    function validatePermissions() {
        const isAtLeastOneChecked = Array.from(permissionCheckboxes).some(cb => cb.checked);
        if (!isAtLeastOneChecked) {
            permissionError.style.display = 'block';
            permissionContainer.classList.add('is-invalid');
        } else {
            permissionError.style.display = 'none';
            permissionContainer.classList.remove('is-invalid');
        }
        return isAtLeastOneChecked;
    }

    permissionCheckboxes.forEach(cb => {
        cb.addEventListener('change', validatePermissions);
    });

    if (userModalElement) {
        userModalElement.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            userForm.reset();
            userForm.classList.remove('was-validated');
            permissionContainer.classList.remove('is-invalid');
            permissionError.style.display = 'none';
            formUsernameInput.removeAttribute('readonly');
            formUsernameInput.classList.remove('is-invalid');
            let feedback = formUsernameInput.parentNode.querySelector('.invalid-feedback');
            if (feedback) feedback.textContent = 'Nama pengguna tidak boleh kosong.';

            if (button && button.classList.contains('edit-user-btn')) {
                const username = button.dataset.username;
                modalTitle.innerHTML = `<i class="fas fa-user-edit me-2"></i>Edit Pengguna: ${username}`;
                saveUserBtn.innerHTML = `<i class="fas fa-save me-1"></i> Simpan Perubahan`;
                formModeInput.value = 'edit';
                editUsernameInput.value = username;
                formUsernameInput.value = username;
                formUsernameInput.setAttribute('readonly', 'readonly');
                formPasswordInput.removeAttribute('required');
                passwordHelpBlock.textContent = 'Biarkan kosong jika tidak ingin mengubah password.';

                if (typeof currentUsers !== 'undefined' && currentUsers && currentUsers[username]) {
                    const userToEdit = currentUsers[username];
                    document.getElementById('formUserRole').value = userToEdit.role;
                    const userPermissions = userToEdit.permissions || [];
                    permissionCheckboxes.forEach(cb => {
                        cb.checked = userPermissions.includes(cb.value);
                    });
                } else {
                    console.error("[UserMgmt:Modal] Data pengguna untuk diedit tidak ditemukan:", username);
                    const modalInstance = bootstrap.Modal.getInstance(userModalElement);
                    if (modalInstance) modalInstance.hide();
                    if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', 'Gagal memuat data pengguna untuk diedit.', 'danger');
                }
            } else {
                modalTitle.innerHTML = `<i class="fas fa-user-plus me-2"></i>Tambah Pengguna Baru`;
                saveUserBtn.innerHTML = `<i class="fas fa-save me-1"></i> Simpan Pengguna`;
                formModeInput.value = 'add';
                editUsernameInput.value = '';
                formPasswordInput.setAttribute('required', 'required');
                passwordHelpBlock.textContent = 'Password wajib diisi untuk pengguna baru.';
                permissionCheckboxes.forEach(cb => cb.checked = false);
            }
            validatePermissions();
        });
    }

    if (userForm) {
        userForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();

            const otherFieldsValid = userForm.checkValidity();
            const permissionsAreValid = validatePermissions();

            userForm.classList.add('was-validated');

            if (!otherFieldsValid || !permissionsAreValid) {
                console.log("[UserMgmt:Modal] Form submit dihentikan karena validasi gagal.");
                const firstInvalidBasicField = userForm.querySelector(':invalid:not(input[type="checkbox"])');
                if (firstInvalidBasicField) {
                    firstInvalidBasicField.focus();
                } else if (!permissionsAreValid) {
                    permissionContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            const checkedPermissions = Array.from(permissionCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
            const mode = formModeInput.value;

            if (mode === 'add') {
                handleAddUser(checkedPermissions);
            } else if (mode === 'edit') {
                handleUpdateUser(checkedPermissions);
            }
        });
    }
});

console.log("user_management.js loaded (with permission validation fix and HTML attribute override)");
