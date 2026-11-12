// Script sederhana Chart.js untuk halaman Data & Fakta
document.addEventListener("DOMContentLoaded", function () {
    // 1. Cek apakah DATA_ENERGI tersedia
    if (typeof DATA_ENERGI === "undefined") {
        console.error("DATA_ENERGI belum dimuat!");
        return;
    }

    // 2. Ambil label kode pertanyaan (P01 - P10) dan nilainya
    const labels = DATA_ENERGI.per_butir.map(item => item.kode);
    const dataSkor = DATA_ENERGI.per_butir.map(item => item.rata_rata);

    // 3. Tampilkan Grafik Batang dengan Chart.js
    const ctx = document.getElementById("chartButir").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Rata-rata Skor (Skala 1 - 4)",
                data: dataSkor,
                backgroundColor: "#ffc107",
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 2.5,
                    max: 4.0,
                    ticks: { color: "#ffffff" },
                    grid: { color: "rgba(255, 255, 255, 0.1)" }
                },
                x: {
                    ticks: { color: "#ffffff" },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    labels: { color: "#ffffff" }
                }
            }
        }
    });
});
