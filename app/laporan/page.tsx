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

interface LaporanItem {
  id: number;
  nama: string;
  stokAwal: number;
  sisa: number;
  penggunaan: number;
  kategori: string;
  createdAt: string;
}

export default function LaporanPage() {
  const [tanggalList, setTanggalList] = useState<string[]>([]);
  const [selectedTanggal, setSelectedTanggal] = useState<string | null>(null);
  const [detail, setDetail] = useState<LaporanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // =====================
  // LOAD LIST TANGGAL
  // =====================
  useEffect(() => {
    fetch("/api/laporan-harian")
      .then((res) => res.json())
      .then((data) => {
        const seen = new Set<string>();
        const tgls = data.reduce((arr: string[], i: any) => {
          const tgl = (i?.createdAt ?? "").toString().split("T")[0];
          if (tgl && !seen.has(tgl)) {
            seen.add(tgl);
            arr.push(tgl);
          }
          return arr;
        }, []);

        setTanggalList(tgls);
        setLoading(false);
      })
      .catch((err) => console.error("Gagal load tanggal:", err));
  }, []);

  // =====================
  // LOAD DETAIL LAPORAN
  // =====================
  const openDetail = async (tgl: string) => {
    setSelectedTanggal(tgl);
    setPopup(true);

    const res = await fetch(`/api/laporan-harian/${tgl}`);
    const data = await res.json();

    setDetail(data);
  };

  // =====================
  // EXPORT PDF
  // =====================
  const exportPDF = async () => {
    if (!tableRef.current || !chartRef.current) return;

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.setFontSize(16);
    pdf.text("Laporan Harian Warung Oyako", 14, 18);
    pdf.setFontSize(12);
    pdf.text(`Tanggal: ${selectedTanggal}`, 14, 26);

    // PAGE 1 - TABLE
    const tCanvas = await html2canvas(tableRef.current, { scale: 2 });
    const tImg = tCanvas.toDataURL("image/png");
    let imgHeight = (tCanvas.height * 190) / tCanvas.width;
    pdf.addImage(tImg, "PNG", 10, 34, 190, imgHeight);

    // PAGE 2 - CHART
    pdf.addPage();
    const cCanvas = await html2canvas(chartRef.current, { scale: 2 });
    const cImg = cCanvas.toDataURL("image/png");
    imgHeight = (cCanvas.height * 190) / cCanvas.width;
    pdf.addImage(cImg, "PNG", 10, 20, 190, imgHeight);

    pdf.save(`Laporan-${selectedTanggal}.pdf`);
  };

  // =====================
  // CHART DATA
  // =====================
  const chartData = {
    labels: detail.map((i) => i.nama),
    datasets: [
      {
        label: "Stok Awal",
        data: detail.map((i) => i.stokAwal),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
      },
      {
        label: "Sisa",
        data: detail.map((i) => i.sisa),
        backgroundColor: "rgba(255, 206, 86, 0.8)",
      },
      {
        label: "Pemakaian",
        data: detail.map((i) => i.penggunaan),
        backgroundColor: "rgba(255, 99, 132, 0.8)",
      },
    ],
  };

  const pieData = {
    labels: detail.map((i) => i.nama),
    datasets: [
      {
        label: "Persentase Pemakaian (%)",
        data: detail.map((i) =>
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
  };

  // =====================
  // UI
  // =====================
  if (loading) return <p className="p-6 text-center">Memuat...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Laporan Harian</h1>

      {/* TABEL LIST TANGGAL */}
      <table className="w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4">Tanggal</th>
            <th className="py-3 px-4">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {tanggalList.map((tgl, idx) => (
            <tr key={`${tgl}-${idx}`} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{tgl}</td>
              <td className="py-3 px-4">
                <button
                  onClick={() => openDetail(tgl)}
                  className="px-4 py-1 bg-blue-600 text-white rounded"
                >
                  Tampil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* POPUP DETAIL */}
      {popup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[820px] max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              Detail Laporan — {selectedTanggal}
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
                  {detail.map((d) => (
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
            <div ref={chartRef} className="mt-6 p-3">
              <h3 className="text-xl font-semibold mb-3">Grafik Stok & Pemakaian</h3>
              <Bar data={chartData} />

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Persentase Pemakaian</h3>
                <Pie data={pieData} />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={exportPDF}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Export PDF
              </button>

              <button
                onClick={() => setPopup(false)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
