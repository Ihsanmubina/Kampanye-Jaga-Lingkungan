// Script Interaktif Kampanye Hemat Energi SMK Wikrama Bogor
document.addEventListener("DOMContentLoaded", function () {
    initChart();
    initHabitTracker();
});

// ================= 1. INISIALISASI CHART.JS =================
function initChart() {
    const canvas = document.getElementById("chartButir");
    if (!canvas) return;

    if (typeof DATA_ENERGI === "undefined" || !DATA_ENERGI.per_butir) {
        console.warn("DATA_ENERGI belum dimuat.");
        return;
    }

    const butirData = DATA_ENERGI.per_butir;
    const labels = butirData.map(item => item.kode);
    const dataSkor = butirData.map(item => item.rata_rata);

    // Bedakan warna untuk butir fokus (P04 & P09: skor terendah 3.22)
    const backgroundColors = butirData.map(item => {
        return (item.kode === "P04" || item.kode === "P09") ? "#f97316" : "#f59e0b";
    });

    const hoverColors = butirData.map(item => {
        return (item.kode === "P04" || item.kode === "P09") ? "#ea580c" : "#fbbf24";
    });

    const ctx = canvas.getContext("2d");
    const chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Skor Rata-rata (Skala 1 - 4)",
                data: dataSkor,
                backgroundColor: backgroundColors,
                hoverBackgroundColor: hoverColors,
                borderRadius: 6,
                maxBarThickness: 42
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 400,
                easing: "easeOutQuart"
            },
            scales: {
                y: {
                    min: 2.5,
                    max: 4.0,
                    ticks: {
                        color: "#94a3b8",
                        font: { family: "system-ui, sans-serif", size: 12 }
                    },
                    grid: {
                        color: "rgba(238, 240, 245, 0.08)"
                    }
                },
                x: {
                    ticks: {
                        color: "#eef0f5",
                        font: { family: "system-ui, sans-serif", size: 12, weight: "500" }
                    },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    display: false // Menggunakan header & insight box agar lebih rapi
                },
                tooltip: {
                    backgroundColor: "#181c26",
                    titleColor: "#eef0f5",
                    bodyColor: "#cbd5e1",
                    borderColor: "rgba(238, 240, 245, 0.12)",
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                        title: function (context) {
                            const item = butirData[context[0].dataIndex];
                            return `${item.kode}: ${item.label}`;
                        },
                        label: function (context) {
                            const item = butirData[context.dataIndex];
                            const status = (item.kode === "P04" || item.kode === "P09")
                                ? " (Fokus Perbaikan)"
                                : "";
                            return `Skor: ${item.rata_rata} / 4.00${status}`;
                        },
                        afterLabel: function (context) {
                            const item = butirData[context.dataIndex];
                            return `\nPertanyaan:\n"${item.pertanyaan}"`;
                        }
                    }
                }
            }
        }
    });

    // Kontrol Filter Tab (Semua vs Fokus Prioritas)
    const btnAll = document.getElementById("btnFilterAll");
    const btnFocus = document.getElementById("btnFilterFocus");

    if (btnAll && btnFocus) {
        btnAll.addEventListener("click", function () {
            btnAll.classList.add("active");
            btnFocus.classList.remove("active");

            chartInstance.data.datasets[0].backgroundColor = backgroundColors;
            chartInstance.data.datasets[0].hoverBackgroundColor = hoverColors;
            chartInstance.update();
        });

        btnFocus.addEventListener("click", function () {
            btnFocus.classList.add("active");
            btnAll.classList.remove("active");

            // Sorot hanya P04 dan P09, redam butir lainnya
            const dimmedBg = butirData.map(item => {
                return (item.kode === "P04" || item.kode === "P09")
                    ? "#f97316"
                    : "rgba(245, 158, 11, 0.2)";
            });

            chartInstance.data.datasets[0].backgroundColor = dimmedBg;
            chartInstance.data.datasets[0].hoverBackgroundColor = dimmedBg;
            chartInstance.update();
        });
    }
}

// ================= 2. HABIT TRACKER / KOMITMEN HARIAN =================
function initHabitTracker() {
    const list = document.getElementById("trackerList");
    const countEl = document.getElementById("trackerCount");
    const feedbackEl = document.getElementById("trackerFeedback");
    const badgeEl = document.getElementById("trackerBadge");
    if (!list || !countEl || !feedbackEl) return;

    const STORAGE_KEY = "wikrama_energy_commitment_today";
    const checkboxes = list.querySelectorAll('input[type="checkbox"]');

    // Baca status tersimpan dari localStorage
    let savedState = {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) savedState = JSON.parse(raw);
    } catch (e) {
        savedState = {};
    }

    checkboxes.forEach(cb => {
        const id = cb.dataset.id;
        if (savedState[id]) {
            cb.checked = true;
            cb.closest(".tracker-item")?.classList.add("checked");
        }

        cb.addEventListener("change", function () {
            if (cb.checked) {
                cb.closest(".tracker-item")?.classList.add("checked");
            } else {
                cb.closest(".tracker-item")?.classList.remove("checked");
            }
            updateTracker();
        });
    });

    function updateTracker() {
        let completed = 0;
        const newState = {};

        checkboxes.forEach(cb => {
            const id = cb.dataset.id;
            newState[id] = cb.checked;
            if (cb.checked) completed++;
        });

        countEl.textContent = completed;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        } catch (e) {
            // Abaikan jika storage dinonaktifkan
        }

        if (completed === 0) {
            feedbackEl.textContent = "Pilih komitmen harianmu untuk berkontribusi menjaga energi sekolah.";
            badgeEl?.classList.remove("all-done");
        } else if (completed < 4) {
            feedbackEl.textContent = `Bagus! ${completed} kebiasaan telah kamu lakukan hari ini. Lanjutkan kebiasaan baik lainnya.`;
            badgeEl?.classList.remove("all-done");
        } else {
            feedbackEl.textContent = "Luar biasa! Seluruh 4 aksi hemat energi telah kamu penuhi hari ini. Kamu teladan sekolah hijau!";
            badgeEl?.classList.add("all-done");
        }
    }

    // Hitung di awal
    updateTracker();
}
