let dataMahasiswa = [];
let jurusanChartInstance = null;

const form = document.getElementById('form');
const dataTable = document.getElementById('dataTable');
const searchInput = document.getElementById('searchInput');
const editIndexInput = document.getElementById('editIndex');
const btnSubmit = document.getElementById('btnSubmit');

// Fungsi Waktu Real-time
function updateClock() {
  const now = new Date();
  
  // Format Tanggal (Contoh: Senin, 10 Oktober 2024)
  const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = now.toLocaleDateString('id-ID', optionsDate);
  
  // Format Jam (Contoh: 14:05:30)
  const timeString = now.toLocaleTimeString('id-ID');
  
  document.getElementById('realtimeClock').innerHTML = `📅 ${dateString} &nbsp;|&nbsp; 🕒 <b>${timeString} WIB</b>`;
}
// Jalankan jam setiap detik
setInterval(updateClock, 1000);
updateClock(); // Panggil sekali di awal agar tidak delay 1 detik

function initChart() {
  const ctx = document.getElementById('jurusanChart').getContext('2d');
  jurusanChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ['#0984e3', '#6c5ce7', '#00b894', '#fdcb6e', '#e17055'],
        borderWidth: 0
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function updateDashboard() {
  const kataKunci = searchInput.value.toLowerCase();
  
  const filteredData = dataMahasiswa.filter(mhs => 
    mhs.nama.toLowerCase().includes(kataKunci) || mhs.nim.includes(kataKunci)
  );

  dataTable.innerHTML = '';
  filteredData.forEach((mhs, index) => {
    const realIndex = dataMahasiswa.indexOf(mhs); 
    
    // Logika Warna Badge Status
    let statusClass = '';
    if (mhs.status === 'Hadir') statusClass = 'badge-success';
    else if (mhs.status === 'Telat Masuk') statusClass = 'badge-warning';
    else if (mhs.status === 'Izin') statusClass = 'badge-info';
    else if (mhs.status === 'Sakit') statusClass = 'badge-danger';

    dataTable.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td style="font-weight: 500;">
          ${mhs.nama}<br>
          <small style="color: #636e72; font-weight: normal;">${mhs.alamat}</small>
        </td>
        <td>${mhs.nim}</td>
        <td><span class="badge badge-primary">${mhs.jurusan}</span></td>
        <td style="font-weight: 600;">${mhs.waktu}</td>
        <td><span class="badge ${statusClass}">${mhs.status}</span></td>
        <td>
          <button class="btn btn-edit" onclick="editData(${realIndex})">✏️</button>
          <button class="btn btn-delete" onclick="hapusData(${realIndex})">🗑️</button>
        </td>
      </tr>
    `;
  });

  document.getElementById('totalMhs').innerText = dataMahasiswa.length;
  const jurusanUnik = [...new Set(dataMahasiswa.map(mhs => mhs.jurusan))];
  document.getElementById('totalJurusan').innerText = jurusanUnik.length;

  const hitungJurusan = {};
  dataMahasiswa.forEach(mhs => {
    hitungJurusan[mhs.jurusan] = (hitungJurusan[mhs.jurusan] || 0) + 1;
  });
  
  jurusanChartInstance.data.labels = Object.keys(hitungJurusan);
  jurusanChartInstance.data.datasets[0].data = Object.values(hitungJurusan);
  jurusanChartInstance.update();
}

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const nama = document.getElementById('nama').value;
  const nim = document.getElementById('nim').value;
  const jurusan = document.getElementById('jurusan').value;
  const waktu = document.getElementById('waktu').value;
  const status = document.getElementById('status').value;
  const alamat = document.getElementById('alamat').value;
  const editIndex = parseInt(editIndexInput.value);

  if (editIndex === -1) {
    dataMahasiswa.push({ nama, nim, jurusan, waktu, status, alamat });
    Swal.fire({
      title: 'Berhasil!', text: 'Data presensi berhasil ditambahkan.', icon: 'success', confirmButtonColor: '#0984e3'
    });
  } else {
    dataMahasiswa[editIndex] = { nama, nim, jurusan, waktu, status, alamat };
    editIndexInput.value = '-1';
    btnSubmit.innerText = 'Simpan Data';
    Swal.fire({
      title: 'Diperbarui!', text: 'Data presensi berhasil diubah.', icon: 'success', confirmButtonColor: '#0984e3'
    });
  }

  form.reset();
  document.getElementById('waktu').value = '08:00'; 
  updateDashboard();
});

window.editData = (index) => {
  const mhs = dataMahasiswa[index];
  document.getElementById('nama').value = mhs.nama;
  document.getElementById('nim').value = mhs.nim;
  document.getElementById('jurusan').value = mhs.jurusan;
  document.getElementById('waktu').value = mhs.waktu;
  document.getElementById('status').value = mhs.status;
  document.getElementById('alamat').value = mhs.alamat;
  
  editIndexInput.value = index;
  btnSubmit.innerText = 'Update Data';
};

window.hapusData = (index) => {
  Swal.fire({
    title: 'Yakin Hapus Data?', text: "Data yang dihapus tidak bisa dikembalikan!", icon: 'warning',
    showCancelButton: true, confirmButtonColor: '#d63031', cancelButtonColor: '#636e72', confirmButtonText: 'Ya, Hapus!'
  }).then((result) => {
    if (result.isConfirmed) {
      dataMahasiswa.splice(index, 1);
      updateDashboard();
      Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
    }
  });
};

searchInput.addEventListener('input', updateDashboard);

window.exportToExcel = () => {
  if(dataMahasiswa.length === 0) {
    Swal.fire('Kosong!', 'Belum ada data untuk diexport.', 'info');
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(dataMahasiswa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Kehadiran");
  XLSX.writeFile(workbook, "Data_Kehadiran_Mahasiswa.xlsx");
};

initChart();
updateDashboard();