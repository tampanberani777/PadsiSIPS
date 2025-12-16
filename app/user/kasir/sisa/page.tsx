'use client';

import { useState, useEffect } from "react";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
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

export default function SisaPageKasir() {
  const [dataSisa, setDataSisa] = useState<Sisa[]>([]);
  const [stokAwal, setStokAwal] = useState<StokAwal[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Sisa | null>(null);
  const [formMode, setFormMode] = useState<"tambah" | "ubah" | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Sisa | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    nama: "",
    jumlah: "",
    satuan: "",
    kategori: "",
  });

  useEffect(() => {
    const load = async () => {
      const sisa = await (await fetch("/api/sisa")).json();
      const stok = await (await fetch("/api/stok_awal")).json();
      setDataSisa(sisa);
      setStokAwal(stok);
      setLoading(false);
      setFlash(null);
    };
    load();
  }, []);

  const filteredData = dataSisa.filter((i) =>
    i.nama.toLowerCase().includes(search.toLowerCase())
  );

  const filteredNama = stokAwal.filter((i) => i.kategori === formData.kategori);
  const kategoriOptions = Array.from(new Set(stokAwal.map((i) => i.kategori)));

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

    if (!res.ok) {
      const msg = await res.json().catch(() => null);
      setFlash({
        type: "error",
        message: msg?.error || "Gagal menyimpan data, coba lagi.",
      });
      return;
    }

    const updated = await res.json();

    if (formMode === "ubah") {
      setDataSisa((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i))
      );
    } else {
      setDataSisa((prev) => [updated, ...prev]);
    }

    setFlash({
      type: "success",
      message: formMode === "ubah" ? "Data berhasil diperbarui." : "Data baru tersimpan.",
    });

    setFormMode(null);
    setSelected(null);
    setFormData({ nama: "", jumlah: "", satuan: "", kategori: "" });
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/sisa/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDataSisa((p) => p.filter((i) => i.id !== id));
      setConfirmDelete(null);
      setFlash({ type: "success", message: "Data berhasil dihapus." });
    } else {
      setFlash({ type: "error", message: "Gagal menghapus data, coba lagi." });
    }
  };

  const handleFileSelect = (e: any) => {
    const selectedFiles = [...e.target.files].filter((f: File) =>
      f.name.endsWith(".csv")
    );

    const existingNames = new Set(files.map((f) => f.name));
    const unique = selectedFiles.filter((f) => !existingNames.has(f.name));
    setFiles((prev) => [...prev, ...unique]);
  };

  const uploadCSV = async () => {
    if (files.length === 0) {
      setFlash({ type: "error", message: "Pilih file CSV terlebih dahulu." });
      return;
    }

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    const res = await fetch("/api/test-upload", { method: "POST", body: fd });
    const result = await res.json();
    setUploadResult(result);

    if (res.ok && result?.savedRows > 0) {
      setFlash({
        type: "success",
        message: result.message || "Upload berhasil disimpan.",
      });
      setShowUpload(false);
      setFiles([]);
    } else {
      setFlash({
        type: "error",
        message: result.message || "Upload gagal. Cek format atau duplikasi.",
      });
    }
  };

  if (loading) return <p className="text-center p-6">Memuat...</p>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6 relative">
      {flash && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            flash.type === "success"
              ? "bg-amber-50 text-amber-900 border border-amber-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {flash.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Sisa Bahan</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-[#1f1b17] text-white px-4 py-2 rounded-lg"
          >
            <ArrowUpTrayIcon className="w-5" />
            Upload CSV
          </button>

          <button
            onClick={() => {
              setFormMode("tambah");
              setFormData({ nama: "", jumlah: "", satuan: "", kategori: "" });
              setSelected(null);
            }}
            className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-lg"
          >
            <PlusCircleIcon className="w-5" />
            Tambah
          </button>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Cari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-64"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4">Nama</th>
              <th className="py-3 px-4 text-right">Jumlah</th>
              <th className="py-3 px-4 text-center">Satuan</th>
              <th className="py-3 px-4 text-center">Kategori</th>
              <th className="py-3 px-4 text-center w-32">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 text-center">{idx + 1}</td>

                <td
                  className="py-3 px-4 cursor-pointer hover:underline"
                  onClick={() => setSelected(item)}
                >
                  {item.nama}
                </td>

                <td className="py-3 px-4 text-right">{item.jumlah}</td>
                <td className="py-3 px-4 text-center">{item.satuan}</td>
                <td className="py-3 px-4 text-center">{item.kategori}</td>

                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-3">
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
                      className="text-amber-600 hover:text-amber-700"
                    >
                      <PencilSquareIcon className="w-5" />
                    </button>

                    <button
                      onClick={() => setConfirmDelete(item)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <TrashIcon className="w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-[380px]">
            <h3 className="text-lg font-semibold mb-3">Hapus data?</h3>
            <p className="text-sm text-gray-700 mb-5">
              Data sisa <span className="font-semibold">{confirmDelete.nama}</span> akan dihapus dari database.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded border"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

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
              className="w-full bg-[#1f1b17] text-white py-2 rounded"
            >
              Upload
            </button>

            {uploadResult && (
              <div className="bg-gray-50 border border-gray-200 p-3 mt-3 rounded text-sm space-y-1">
                <div className="font-semibold">{uploadResult.message}</div>
                <div>Total file: {uploadResult.totalFiles}</div>
                <div>Tersimpan: {uploadResult.savedRows}</div>
                {(uploadResult.skippedInvalid > 0 || uploadResult.skippedDuplicate > 0) && (
                  <div className="text-gray-600">
                    Lewati tidak valid: {uploadResult.skippedInvalid ?? 0}, duplikat: {uploadResult.skippedDuplicate ?? 0}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {formMode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[420px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold capitalize">{formMode} data sisa</h2>
              <button
                onClick={() => {
                  setFormMode(null);
                  setSelected(null);
                }}
              >
                <XMarkIcon className="w-6" />
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm mb-1">Kategori</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      kategori: e.target.value,
                      nama: "",
                      satuan: "",
                    }))
                  }
                  required
                >
                  <option value="">Pilih kategori</option>
                  {kategoriOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Nama</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.nama}
                  onChange={(e) => {
                    const namaBaru = e.target.value;
                    const stok = stokAwal.find(
                      (i) => i.nama === namaBaru && i.kategori === formData.kategori
                    );
                    setFormData((p) => ({
                      ...p,
                      nama: namaBaru,
                      satuan: stok?.satuan ?? p.satuan,
                    }));
                  }}
                  disabled={!formData.kategori}
                  required
                >
                  <option value="">
                    {formData.kategori ? "Pilih nama" : "Pilih kategori dulu"}
                  </option>
                  {filteredNama.map((i) => (
                    <option key={i.id} value={i.nama}>
                      {i.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Jumlah</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={formData.jumlah}
                  onChange={(e) => setFormData((p) => ({ ...p, jumlah: e.target.value }))}
                  min={0}
                  step="any"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Satuan</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={formData.satuan}
                  onChange={(e) => setFormData((p) => ({ ...p, satuan: e.target.value }))}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormMode(null);
                    setSelected(null);
                  }}
                  className="px-4 py-2 rounded border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#1f1b17] text-white hover:bg-black"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
