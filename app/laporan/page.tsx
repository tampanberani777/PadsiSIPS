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

const usagePercent = (item: LaporanItem) =>
  item.stokAwal > 0 ? Math.round((item.penggunaan / item.stokAwal) * 10000) / 100 : 0;

const FILTER_OPTIONS = [3, 7, 14, 30];

export default function LaporanPage() {
  const [tanggalList, setTanggalList] = useState<string[]>([]);
  const [selectedTanggal, setSelectedTanggal] = useState<string | null>(null);
  const [detail, setDetail] = useState<LaporanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(false);
  const [filterDays, setFilterDays] = useState<number>(7);
  const [printMessage, setPrintMessage] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!printMessage) return;
    const timer = setTimeout(() => setPrintMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [printMessage]);

  const openDetail = async (tgl: string) => {
    setSelectedTanggal(tgl);
    setPopup(true);
    const res = await fetch(`/api/laporan-harian/${tgl}`);
    const data = await res.json();
    setDetail(data);
  };

  const exportPDF = async () => {
    if (!tableRef.current || !chartRef.current) return;

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.setFontSize(16);
    pdf.text("Laporan Harian Warung Oyako", 14, 18);
    pdf.setFontSize(12);
    pdf.text(`Tanggal: ${selectedTanggal}`, 14, 26);

    const tCanvas = await html2canvas(tableRef.current, { scale: 2 });
    const tImg = tCanvas.toDataURL("image/png");
    let imgHeight = (tCanvas.height * 190) / tCanvas.width;
    pdf.addImage(tImg, "PNG", 10, 34, 190, imgHeight);

    pdf.addPage();
    const cCanvas = await html2canvas(chartRef.current, { scale: 2 });
    const cImg = cCanvas.toDataURL("image/png");
    imgHeight = (cCanvas.height * 190) / cCanvas.width;
    pdf.addImage(cImg, "PNG", 10, 20, 190, imgHeight);

    pdf.save(`Laporan-${selectedTanggal}.pdf`);
    const tanggalLabel = selectedTanggal ?? "tanggal tidak diketahui";
    setPrintMessage(`Laporan ${tanggalLabel} berhasil dicetak`);
  };

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
        data: detail.map((i) => usagePercent(i)),
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

  if (loading) return <p className="p-6 text-center">Memuat...</p>;

  const filteredTanggalList = tanggalList.filter((tgl) => {
    const date = new Date(`${tgl}T00:00:00`);
    if (Number.isNaN(date.getTime())) return false;

    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= filterDays - 1;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Laporan Harian</h1>

      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="filterRange" className="text-sm font-medium text-gray-700">
          Rentang:
        </label>
        <select
          id="filterRange"
          value={filterDays}
          onChange={(e) => setFilterDays(Number(e.target.value))}
          className="rounded border px-3 py-2 text-sm"
        >
          {FILTER_OPTIONS.map((day) => (
            <option key={day} value={day}>
              {day} hari terakhir
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="py-3 px-4 w-2/3">Tanggal</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTanggalList.map((tgl, idx) => (
              <tr key={`${tgl}-${idx}`} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{tgl}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => openDetail(tgl)}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Tampil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {popup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[840px] max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Detail Laporan — {selectedTanggal}</h2>

            {printMessage && (
              <div className="mb-4 rounded bg-green-100 px-3 py-2 text-sm text-green-800">
                {printMessage}
              </div>
            )}

            <div ref={tableRef} className="bg-white p-3">
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3">Nama</th>
                      <th className="py-2 px-3 text-right">Stok Awal</th>
                      <th className="py-2 px-3 text-right">Sisa</th>
                      <th className="py-2 px-3 text-right">Pemakaian</th>
                      <th className="py-2 px-3 text-right">% Terpakai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.map((d) => (
                      <tr key={d.id} className="border-t">
                        <td className="py-2 px-3">{d.nama}</td>
                        <td className="py-2 px-3 text-right">{d.stokAwal}</td>
                        <td className="py-2 px-3 text-right">{d.sisa}</td>
                        <td className="py-2 px-3 text-right">{d.penggunaan}</td>
                        <td className="py-2 px-3 text-right">{usagePercent(d)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
