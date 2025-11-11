const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxFwJo0NgeDlRv0C8hz3LJGQP1hx-XrTWH5Ln7ATklUQAnOhNFJRoG0RUDwlwvueDBDGA/exec";

const form = document.getElementById("formPendaftaran");
const nikError = document.getElementById('nik-error');
const nikSuccess = document.getElementById('nik-success');
const loading = document.getElementById('loading');
const nikInput = document.getElementById('nik');
const btnPendaftaran = document.getElementById('btnPendaftaran');
const btnCekNik = document.getElementById('btnCekNik');
const formPendaftaran = document.getElementById('formRegistrasi');
const formCekNik = document.getElementById('formCekNik');
const btnSearch = document.getElementById('btn-search');
const resultArea = document.getElementById('result');
const searchNik = document.getElementById('search-nik');

nikInput.addEventListener('input', async function () {
  const nik = this.value.trim();

  nikError.style.display = 'none';
  nikSuccess.style.display = 'none';

  if (nik.length === 16 && /^\d+$/.test(nik)) {
    loading.classList.remove('hidden');
    submitBtn.disabled = true;

    try {
      const response = await fetch(`${SCRIPT_URL}?action=check_nik&nik=${nik}`);
      const result = await response.json();

      loading.classList.add('hidden');

      if (result.exists) {
        nikError.textContent = 'NIK sudah terdaftar!';
        nikError.style.display = 'block';
        submitBtn.disabled = true;
      } else {
        nikSuccess.textContent = 'NIK tersedia';
        nikSuccess.style.display = 'block';
        submitBtn.disabled = false;
      }
    } catch (error) {
      loading.classList.add('hidden');
      console.error('Error checking NIK:', error);
      submitBtn.disabled = false;
    }
  } else if (nik.length === 0 || nik.length < 16) {
    nikError.textContent = 'NIK harus terdiri dari 16 digit angka.';
    nikError.style.display = 'block';
    submitBtn.disabled = true;
  } else {
    submitBtn.disabled = false;
  }
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const nik = nikInput.value.trim();
  if (nik.length !== 16 || !/^\d+$/.test(nik)) {
    nikError.textContent = 'NIK harus terdiri dari 16 digit angka.';
    nikError.style.display = 'block';
    return;
  }

  loading.classList.remove('hidden');
  submitBtn.disabled = true;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  const nomorPendaftaran = "PGRI-" + Date.now().toString().slice(-6);
  data.nomor_pendaftaran = nomorPendaftaran;
  data.timestamp = new Date().toISOString();

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (result.success) {
      form.reset();
      alert(`✅ Pendaftaran berhasil dikirim! Nomor Pendaftaran Anda: ${nomorPendaftaran}`);
    } else {
      throw new Error(result.message || 'Terjadi kesalahan saat mendaftar.');
    }
  } catch (error) {
    if (error.message.includes('NIK sudah terdaftar')) {
      nikError.textContent = error.message;
      nikError.style.display = 'block';
    } else {
      alert('❌ Terjadi kesalahan: ' + error.message);
    }
  } finally {
    loading.classList.add('hidden');
    submitBtn.disabled = false;
  }
});

nikInput.addEventListener('keypress', function (e) {
  const char = String.fromCharCode(e.keyCode);
  if (!/^\d$/.test(char)) {
    e.preventDefault();
  }
});

function setActiveTab(tab) {
  if (tab === "pendaftaran") {
    btnPendaftaran.classList.add("bg-green-600", "text-white");
    btnPendaftaran.classList.remove("bg-white", "text-green-700", "border", "border-green-600");

    btnCekNik.classList.add("bg-white", "text-green-700", "border", "border-green-600");
    btnCekNik.classList.remove("bg-green-600", "text-white");

    formPendaftaran.classList.remove("hidden");
    formCekNik.classList.add("hidden");
  } else {
    btnCekNik.classList.add("bg-green-600", "text-white");
    btnCekNik.classList.remove("bg-white", "text-green-700", "border", "border-green-600");

    btnPendaftaran.classList.add("bg-white", "text-green-700", "border", "border-green-600");
    btnPendaftaran.classList.remove("bg-green-600", "text-white");

    formCekNik.classList.remove("hidden");
    formPendaftaran.classList.add("hidden");
  }
}

btnPendaftaran.addEventListener("click", () => setActiveTab("pendaftaran"));
btnCekNik.addEventListener("click", () => setActiveTab("cek-nik"));

setActiveTab("pendaftaran");

// Cegah format ilmiah
searchNik.addEventListener("input", e => {
  e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 16);
});

btnSearch.addEventListener("click", async () => {
  const nik = searchNik.value.trim();
  if (nik.length !== 16) {
    result.innerHTML = `<p class="text-red-500 font-medium">⚠️ NIK harus 16 digit angka.</p>`;
    return;
  }

  result.innerHTML = `<div class="flex justify-center items-center">
        <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-600 mr-2"></div> Memeriksa data...
      </div>`;

  try {
    const res = await fetch(`${SCRIPT_URL}?action=check_by_nik&nik=${nik}`);
    console.log(res);
    const data = await res.json();
    console.log(data);

    if (data && data.exists) {
      const d = data.data;
      result.innerHTML = `
            <div class="mt-4 bg-green-50 border border-green-200 rounded-lg p-5 text-left shadow">
              <h3 class="text-lg font-semibold text-green-700 mb-2 text-center">✅ Data Ditemukan</h3>
              <div class="space-y-1 text-sm">
                <p><b>Nama:</b> ${d.nama}</p>
                <p><b>Kategori:</b> ${d.kategori}</p>
                <p><b>Instansi:</b> ${d.instansi}</p>
                <p><b>Telepon:</b> ${d.telepon}</p>
                <p><b>Alamat:</b> ${d.alamat}</p>
                <p><b>Nomor Pendaftaran:</b> <span class="font-semibold">${d.nomor_pendaftaran}</span></p>
              </div>
            </div>`;
    } else {
      result.innerHTML = `<p class="text-red-500 font-medium mt-3">❌ NIK tidak ditemukan dalam database.</p>`;
    }
  } catch (err) {
    result.innerHTML = `<p class="text-red-500 font-medium">Terjadi kesalahan koneksi.</p>`;
    console.error(err);
  }
});

// Enhanced sticky effect dengan shadow pada scroll
document.addEventListener('DOMContentLoaded', function () {
  const stickyNav = document.getElementById('stickyNav');
  const mainContent = document.querySelector('.main-content');

  // Untuk mobile: tambahkan padding ke main content
  if (window.innerWidth <= 768) {
    const navHeight = stickyNav.offsetHeight;
    if (mainContent) {
      mainContent.style.paddingTop = navHeight + 'px';
    }
  }

  // Shadow effect pada scroll
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      stickyNav.classList.add('scrolled');
    } else {
      stickyNav.classList.remove('scrolled');
    }
  });

  // Handle resize
  window.addEventListener('resize', function () {
    if (window.innerWidth <= 768) {
      const navHeight = stickyNav.offsetHeight;
      if (mainContent) {
        mainContent.style.paddingTop = navHeight + 'px';
      }
    } else {
      if (mainContent) {
        mainContent.style.paddingTop = '0';
      }
    }
  });
});