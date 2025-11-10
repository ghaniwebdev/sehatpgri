const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxFwJo0NgeDlRv0C8hz3LJGQP1hx-XrTWH5Ln7ATklUQAnOhNFJRoG0RUDwlwvueDBDGA/exec";

const form = document.getElementById("formPendaftaran");
const merah = document.getElementById("status-merah");
const hijau = document.getElementById("status-hijau");
const nikError = document.getElementById('nik-error');
const nikSuccess = document.getElementById('nik-success');
const loading = document.getElementById('loading');
const nikInput = document.getElementById('nik');

nikInput.addEventListener('input', async function() {
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

form.addEventListener("submit", async (e) => {
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

  const nomorPendaftaran = "PGRI-"+Date.now().toString().slice(-6);
  data.nomor_pendaftaran = nomorPendaftaran;
  data.timestampe = new Date().toISOString();

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers:{
        'Content-Type':'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      alert(`✅ Pendaftaran berhasil dikirim! Nomor Pendaftaran Anda: ${nomorPendaftaran}`);
      form.reset();
    } else {
      throw new Error(result.message || 'Terjadi kesalahan saat mendaftar.');
    }
  } catch (error) {
    if (error.message.includes('NIK sudah terdaftar')) {
      nikError.textContent = error.message;
      nikError.style.display = 'block';
    } else {
      alert('❌ Terjadi kesalahan: '+error.message);
    }
  } finally {
    loading.classList.add('hidden');
    submitBtn.disabled = false;
  }
  // const data = {
  //   nik: document.getElementById("nik").value,
  //   nama: document.getElementById("nama").value,
  //   pekerjaan: document.getElementById("kategori").value,
  //   instansi: document.getElementById("instansi").value,
  //   telepon: document.getElementById("telepon").value,
  //   alamat: document.getElementById("alamat").value,
  // };

  // merah.classList.add("hidden");
  // hijau.classList.remove("hidden");

  // try {
  //   const res = await fetch(SCRIPT_URL, {
  //     method: "POST",
  //     mode: "no-cors",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(data),
  //   });

  //   alert("✅ Pendaftaran berhasil dikirim!");
  //   form.reset();
  // } catch (err) {
  //   alert("❌ Gagal mengirim data. Coba lagi nanti.");
  //   console.error(err);
  // }

  // setTimeout(() => {
  //   hijau.classList.add("hidden");
  //   merah.classList.remove("hidden");
  // }, 3000);
});

nikInput.addEventListener('keypress', function(e) {
  const char = String.fromCharCode(e.keyCode);
  if (!/^\d$/.test(char)) {
    e.preventDefault();
  }
});