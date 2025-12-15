"use client";

import { useState, useEffect } from "react";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  XMarkIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";

interface Sisa {
  id: number;
  nama: string;
  jumlah: number;
  satuan: string;
  kategori: string;
}

interface StokAwal {
  id: number;
  nama: string;
  jumlah: number;
  satuan: string;
  kategori: string;
}

export default function SisaPage() {
  const [dataSisa, setDataSisa] = useState<Sisa[]>([]);
  const [stokAwal, setStokAwal] = useState<StokAwal[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Sisa | null>(null);
  const [formMode, setFormMode] = useState<"tambah" | "ubah" | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Sisa | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    nama: "",
    jumlah: "",
    satuan: "",
    kategori: "",
  });

  // ================================
  // LOAD DATA
  // ================================
  useEffect(() => {
    const load = async () => {
      const sisa = await (await fetch("/api/sisa")).json();
      const stok = await (await fetch("/api/stok_awal")).json();
      setDataSisa(sisa);
      setStokAwal(stok);
      setLoading(false);
    };
    load();
  }, []);

  const filteredData = dataSisa.filter((i) =>
    i.nama.toLowerCase().includes(search.toLowerCase())
  );

  const filteredNama = stokAwal.filter(
    (i) => i.kategori === formData.kategori
  );

  // ================================
  // SUBMIT FORM
  // ================================
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const method = formMode === "ubah" ? "PUT" : "POST";
    const url =
      formMode === "ubah"
        ? `/api/sisa/${selected?.id}`
        : `/api/sisa`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: formData.nama,
        jumlah: parseFloat(formData.jumlah),
        satuan: formData.satuan,
        kategori: formData.kategori,
      }),
    });

    if (res.ok) {
      const updated = await res.json();

      if (formMode === "ubah") {
        setDataSisa((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
        );
      } else {
        setDataSisa((prev) => [updated, ...prev]);
      }

      setFormMode(null);
      setSelected(null);
      setFormData({ nama: "", jumlah: "", satuan: "", kategori: "" });
    }
  };

  // ================================
  // DELETE
  // ================================
  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/sisa/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDataSisa((p) => p.filter((i) => i.id !== id));
      setConfirmDelete(null);
    }
  };

  // ================================
  // RESET HARIAN
  // ================================
  const resetHarian = async () => {
    const res = await fetch("/api/reset-harian", { method: "POST" });
    const data = await res.json();

    alert("Reset harian tersimpan!");

    // reload sisa terbaru
    const sisaBaru = await (await fetch("/api/sisa")).json();
    setDataSisa(sisaBaru);
  };

  // ================================
  // CSV UPLOAD
  // ================================
  const handleFileSelect = (e: any) => {
    const selectedFiles = [...e.target.files].filter((f: File) =>
      f.name.endsWith(".csv")
    );
    setFiles(selectedFiles);
  };

  const uploadCSV = async () => {
    if (files.length === 0) return alert("Pilih file CSV dulu");

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    const res = await fetch("/api/test-upload", { method: "POST", body: fd });
    const result = await res.json();
    setUploadResult(result);
  };

  if (loading) return <p className="text-center p-6">Memuat...</p>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6 relative">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Sisa Bahan</h1>

        <div className="flex gap-3">
          {/* RESET HARIAN */}
          <button
            onClick={resetHarian}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Reset Harian
          </button>

          {/* UPLOAD CSV */}
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            <ArrowUpTrayIcon className="w-5" />
            Upload CSV
          </button>

          {/* TAMBAH */}
          <button
            onClick={() => {
              setFormMode("tambah");
              setFormData({ nama: "", jumlah: "", satuan: "", kategori: "" });
              setSelected(null);
            }}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            <PlusCircleIcon className="w-5" />
            Tambah
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Cari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-64"
        />
      </div>

      {/* TABEL */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-3">No</th>
            <th className="py-2 px-3">Nama</th>
            <th className="py-2 px-3">Jumlah</th>
            <th className="py-2 px-3">Satuan</th>
            <th className="py-2 px-3">Kategori</th>
            <th className="py-2 px-3 text-center">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((item, idx) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-3">{idx + 1}</td>

              <td
                className="py-2 px-3 cursor-pointer hover:underline"
                onClick={() => setSelected(item)}
              >
                {item.nama}
              </td>

              <td className="py-2 px-3">{item.jumlah}</td>
              <td className="py-2 px-3">{item.satuan}</td>
              <td className="py-2 px-3">{item.kategori}</td>

              <td className="py-2 px-3 flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setFormMode("ubah");
                    setSelected(item);
                    setFormData({
                      nama: item.nama,
                      jumlah: String(item.jumlah),
                      satuan: item.satuan,
                      kategori: item.kategori,
                    });
                  }}
                  className="text-yellow-500"
                >
                  <PencilSquareIcon className="w-5" />
                </button>

                <button
                  onClick={() => setConfirmDelete(item)}
                  className="text-red-500"
                >
                  <TrashIcon className="w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* POPUP UPLOAD CSV */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg w-[450px] shadow-lg">
            <div className="flex justify-between mb-3">
              <h2 className="font-bold text-xl">Upload CSV</h2>
              <button onClick={() => setShowUpload(false)}>
                <XMarkIcon className="w-6" />
              </button>
            </div>

            <input
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileSelect}
              className="border p-3 w-full rounded mb-3"
            />

            <button
              onClick={uploadCSV}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Upload
            </button>

            {uploadResult && (
              <pre className="bg-gray-100 p-3 mt-3 rounded">
                {JSON.stringify(uploadResult, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
  