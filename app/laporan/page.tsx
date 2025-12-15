"use client";

import { useEffect, useState, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

interface LaporanHarian {
  id: number;
  nama: string;
  stokAwal: number;
  sisa: number;
  penggunaan: number;
  kategori: string;
  createdAt: string;
}

interface GroupedLaporan {
  tanggal: string;
  items: LaporanHarian[];
}

export default function LaporanPage() {
  const [laporan, setLaporan] = useState<GroupedLaporan[]>([]);
  const [filtered, setFiltered] = useState<GroupedLaporan[]>([]);
  const [selected, setSelected] = useState<GroupedLaporan | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // ===================== LOAD LAPORAN =====================
  useEffect(() => {
    fetch("/api/laporan-harian")
      .then((res) => res.json())
      .then((data: LaporanHarian[]) => {
        if (!data || !Array.isArray(data)) return;

        // Grup berdasarkan tanggal
        const group: Record<string, LaporanHarian[]> = {};

        data.forEach((item) => {
          const tgl = item.createdAt.split("T")[0];
          if (!group[tgl]) group[tgl] = [];
          group[tgl].push(item);
        });

        const grouped = Object.keys(group).map((tgl) => ({
          tanggal: tgl,
          items: group[tgl],
        }));

        setLaporan(grouped);
        setFiltered(grouped);
      })
      .catch((err) => console.error("Gagal load laporan:", err));
  }, []);

  // ===================== FILTER =====================
  const applyFilter = (hari: number | "all") => {
    if (hari === "all") return setFiltered(laporan);

    const today = new Date();
    const result = laporan.filter((lap) => {
      const [y, m, d] = lap.tanggal.split("-");
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      const diff = Math.floor((today.getTime() - date.getTime()) / 86400000);
      return diff <= hari;
    });

    setFiltered(result);
  };

  // ===================== DETAIL =====================
  const openDetail = (lap: GroupedLaporan) => {
    setSelected(lap);
  };

  // ===================== EXPORT PDF =====================
  const exportPDF = async () => {
    if (!tableRef.current || !chartRef.current) return;

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.setFontSize(16);
    pdf.text("Laporan Harian Warung Oyako", 14, 18);
    pdf.setFontSize(12);
    pdf.text(`Tanggal: ${selected?.tanggal}`, 14, 26);

    // PAGE 1
    const tableCanvas = await html2canvas(tableRef.current, { scale: 2 });
    const tableImg = tableCanvas.toDataURL("image/png");
    let imgHeight = (tableCanvas.height * 190) / tableCanvas.width;
    pdf.addImage(tableImg, "PNG", 10, 34, 190, imgHeight);

    // PAGE 2
    pdf.addPage();
    const chartCanvas = await html2canvas(chartRef.current, { scale: 2 });
    const chartImg = chartCanvas.toDataURL("image/png");
    imgHeight = (chartCanvas.height * 190) / chartCanvas.width;
    pdf.addImage(chartImg, "PNG", 10, 20, 190, imgHeight);

    pdf.save(`Laporan-${selected?.tanggal}.pdf`);
  };

  // ===================== CHART DATA =====================
  const chartData = selected
    ? {
        labels: selected.items.map((i) => i.nama),
        datasets: [
          {
            label: "Stok Awal",
            data: selected.items.map((i) => i.stokAwal),
            backgroundColor: "rgba(54, 162, 235, 0.8)",
          },
          {
            label: "Sisa",
            data: selected.items.map((i) => i.sisa),
            backgroundColor: "rgba(255, 206, 86, 0.8)",
          },
          {
            label: "Pemakaian",
            data: selected.items.map((i) => i.penggunaan),
            backgroundColor: "rgba(255, 99, 132, 0.8)",
          },
        ],
      }
    : {};

  const pieData = selected
    ? {
        labels: selected.items.map((i) => i.nama),
        datasets: [
          {
            label: "Persentase Pemakaian (%)",
            data: selected.items.map((i) =>
              i.stokAwal > 0
                ? Math.round((i.penggunaan / i.stokAwal) * 10000) / 100
                : 0
            ),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ],
          },
        ],
      }
    : {};

  // ===================== UI =====================
  return (
    <div className="max-w-6xl mx-auto bg-white p-6 shadow rounded-lg">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Laporan Harian</h1>

        <div className="flex gap-2">
          <button onClick={() => applyFilter("all")} className="px-3 py-2 bg-gray-300 rounded">
            Semua
          </button>
          <button onClick={() => applyFilter(3)} className="px-3 py-2 bg-gray-300 rounded">
            3 Hari
          </button>
          <button onClick={() => applyFilter(7)} className="px-3 py-2 bg-gray-300 rounded">
            7 Hari
          </button>
          <button onClick={() => applyFilter(14)} className="px-3 py-2 bg-gray-300 rounded">
            14 Hari
          </button>
        </div>
      </div>

      {/* TABLE LIST */}
      <table className="w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4">Tanggal</th>
            <th className="py-3 px-4">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((lap) => (
            <tr key={lap.tanggal} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{lap.tanggal}</td>
              <td className="py-3 px-4">
                <button
                  onClick={() => openDetail(lap)}
                  className="px-4 py-1 bg-blue-500 text-white rounded"
                >
                  Tampil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DETAIL POPUP */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[820px] shadow-lg max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              Detail Laporan — {selected.tanggal}
            </h2>

            {/* TABLE */}
            <div ref={tableRef} className="bg-white p-3">
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3">Nama</th>
                    <th className="py-2 px-3">Stok Awal</th>
                    <th className="py-2 px-3">Sisa</th>
                    <th className="py-2 px-3">Pemakaian</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((d) => (
                    <tr key={d.id} className="border-b">
                      <td className="py-2 px-3">{d.nama}</td>
                      <td className="py-2 px-3">{d.stokAwal}</td>
                      <td className="py-2 px-3">{d.sisa}</td>
                      <td className="py-2 px-3">{d.penggunaan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CHARTS */}
            <div ref={chartRef} className="bg-white mt-6 p-3">
              <h3 className="text-xl font-semibold mb-3">Grafik Stok & Pemakaian</h3>
              <Bar data={chartData} />

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Persentase Pemakaian</h3>
                <Pie data={pieData} />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={exportPDF} className="px-4 py-2 bg-green-600 text-white rounded">
                Export PDF
              </button>

              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-red-500 text-white rounded">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
