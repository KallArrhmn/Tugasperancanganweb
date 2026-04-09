const $ = id => document.getElementById(id);
    let dataMahasiswa = JSON.parse(localStorage.getItem('mhs_data')) || [];
    let chartInstance = null; // Menyimpan instance chart

    // Render Awal
    window.onload = () => updateUI();

    const updateUI = (filter = "") => {
      renderTable(filter);
      updateStatsAndChart();
      localStorage.setItem('mhs_data', JSON.stringify(dataMahasiswa));
    };

    const updateStatsAndChart = () => {
      // 1. Update Angka Statistik
      $('totalMhs').innerText = dataMahasiswa.length;
      
      // Mengelompokkan data berdasarkan jurusan
      const jurusanCount = {};
      dataMahasiswa.forEach(m => {
        const j = m.jurusan.toUpperCase();
        jurusanCount[j] = (jurusanCount[j] || 0) + 1;
      });

      const labelJurusan = Object.keys(jurusanCount);
      const dataJurusan = Object.values(jurusanCount);
      
      $('totalJurusan').innerText = labelJurusan.length;

      // 2. Render Chart.js
      const ctx = $('jurusanChart').getContext('2d');
      
      // Hancurkan chart lama jika ada agar tidak tumpang tindih
      if(chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labelJurusan,
          datasets: [{
            label: 'Jumlah Mahasiswa',
            data: dataJurusan,
            backgroundColor: 'rgba(102, 126, 234, 0.7)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      });
    };

    const renderTable = (filterText = "") => {
      const filtered = dataMahasiswa.filter(m => 
        m.nama.toLowerCase().includes(filterText.toLowerCase()) || 
        m.nim.includes(filterText)
      );

      if (filtered.length === 0) {
        $('dataTable').innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999;">Tidak ada data ditemukan</td></tr>`;
        return;
      }

      $('dataTable').innerHTML = filtered.map((m, i) => {
        const realIdx = dataMahasiswa.indexOf(m);
        return `
        <tr class="fade-in-row">
          <td>${realIdx + 1}</td>
          <td>
            <div style="font-weight: 600;">${m.nama}</div>
            <div style="font-size: 11px; color: #636e72;">NIM: ${m.nim}</div>
          </td>
          <td><span class="badge-jurusan">${m.jurusan.toUpperCase()}</span></td>
          <td style="color: #636e72;">${m.alamat}</td>
          <td class="action-btns">
            <button class="btn btn-sm edit" onclick="editData(${realIdx})">Edit</button>
            <button class="btn btn-sm delete" onclick="deleteData(${realIdx})">Hapus</button>
          </td>
        </tr>`;
      }).join('');
    };

    // Export ke Excel
    function exportToExcel() {
      if(dataMahasiswa.length === 0) return Swal.fire('Ops!', 'Data masih kosong', 'warning');
      const ws = XLSX.utils.json_to_sheet(dataMahasiswa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Mahasiswa");
      XLSX.writeFile(wb, "Data_Mahasiswa_Global.xlsx");
    }

    $('form').onsubmit = e => {
      e.preventDefault();
      const mhs = {
        nama: $('nama').value,
        nim: $('nim').value,
        jurusan: $('jurusan').value,
        alamat: $('alamat').value
      };
      const index = $('editIndex').value;

      if (index === "") {
        dataMahasiswa.push(mhs);
        Swal.fire({ title: 'Berhasil!', text: 'Data mahasiswa ditambahkan', icon: 'success', timer: 1500, showConfirmButton: false });
      } else {
        dataMahasiswa[index] = mhs;
        $('editIndex').value = "";
        $('btnSubmit').innerText = "Simpan Data";
        Swal.fire({ title: 'Terupdate!', text: 'Data berhasil diperbarui', icon: 'success', timer: 1500, showConfirmButton: false });
      }

      $('form').reset();
      updateUI($('searchInput').value);
    };

    const editData = i => {
      const m = dataMahasiswa[i];
      $('nama').value = m.nama;
      $('nim').value = m.nim;
      $('jurusan').value = m.jurusan;
      $('alamat').value = m.alamat;
      $('editIndex').value = i;
      $('btnSubmit').innerText = "Update Data Mahasiswa";
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteData = i => {
      Swal.fire({
        title: 'Apakah anda yakin?',
        text: "Data yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff7675',
        cancelButtonColor: '#636e72',
        confirmButtonText: 'Ya, Hapus!'
      }).then((result) => {
        if (result.isConfirmed) {
          dataMahasiswa.splice(i, 1);
          updateUI($('searchInput').value);
          Swal.fire({ title: 'Terhapus!', text: 'Data telah dihapus.', icon: 'success', timer: 1500, showConfirmButton: false });
        }
      });
    };

    $('searchInput').oninput = (e) => renderTable(e.target.value);