'use client'

import { useState, useEffect } from 'react'
import { TrashIcon, PencilSquareIcon, PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Sisa {
  id: number
  nama: string
  jumlah: number
  satuan: string
  kategori: string
}

interface StokAwal {
  id: number
  nama: string
  jumlah: number
  satuan: string
  kategori: string
}

export default function SisaPage() {
  const [dataSisa, setDataSisa] = useState<Sisa[]>([])
  const [stokAwal, setStokAwal] = useState<StokAwal[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Sisa | null>(null)
  const [formMode, setFormMode] = useState<'tambah' | 'ubah' | null>(null)

  const [formData, setFormData] = useState({
    nama: '',
    jumlah: '',
    satuan: '',
    kategori: '',
  })

  const [confirmDelete, setConfirmDelete] = useState<Sisa | null>(null)

  // FETCH DATA: sisa + stok_awal
  useEffect(() => {
    const fetchAll = async () => {
      const sisaRes = await fetch('/api/sisa')
      const sisaData = await sisaRes.json()

      const stokRes = await fetch('/api/stok_awal')
      const stokData = await stokRes.json()

      setDataSisa(sisaData)
      setStokAwal(stokData)
      setLoading(false)
    }

    fetchAll()
  }, [])

  // FILTER pencarian
  const filteredData = dataSisa.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  )

  // FILTER nama dropdown berdasarkan kategori
  const filteredNama = stokAwal.filter(
    (item) => item.kategori === formData.kategori
  )

  // SUBMIT TAMBAH / UBAH
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nama || !formData.jumlah || !formData.satuan || !formData.kategori) return

    const method = formMode === 'ubah' ? 'PUT' : 'POST'
    const url = formMode === 'ubah'
      ? `/api/sisa/${selected?.id}`
      : `/api/sisa`

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama: formData.nama,
        jumlah: parseFloat(formData.jumlah),
        satuan: formData.satuan,
        kategori: formData.kategori,
      }),
    })

    if (res.ok) {
      const updated = await res.json()

      if (formMode === 'ubah') {
        setDataSisa(prev => prev.map(i => (i.id === updated.id ? updated : i)))
      } else {
        setDataSisa(prev => [updated, ...prev])
      }

      setFormMode(null)
      setFormData({ nama: '', jumlah: '', satuan: '', kategori: '' })
      setSelected(null)
    }
  }

  // HAPUS
  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/sisa/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setDataSisa(prev => prev.filter(i => i.id !== id))
      setConfirmDelete(null)
    }
  }

  if (loading) return <p className="text-center p-6">Memuat data...</p>

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6 relative">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Data Sisa Bahan Warung Oyako</h1>

        <button
          onClick={() => {
            setFormMode(formMode === 'tambah' ? null : 'tambah')
            setFormData({ nama: '', jumlah: '', satuan: '', kategori: '' })
            setSelected(null)
          }}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
        >
          <PlusCircleIcon className="w-5 h-5" />
          Tambah
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Cari bahan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
        />
      </div>

      {/* FORM TAMBAH / UBAH */}
      {formMode && (
        <form onSubmit={handleSubmit} className="border p-4 rounded-lg bg-gray-50 mb-6">
          <h2 className="text-lg font-semibold mb-3">
            {formMode === 'tambah' ? 'Tambah Data' : 'Ubah Data'}
          </h2>

          <div className="grid grid-cols-2 gap-4">

            {/* DROPDOWN KATEGORI */}
            <select
              value={formData.kategori}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  kategori: e.target.value,
                  nama: '', // reset nama jika ganti kategori
                  satuan: '',
                })
              }
              className="border rounded p-2"
            >
              <option value="">Pilih kategori</option>
              <option value="BAHAN">Bahan</option>
              <option value="PRODUK">Produk</option>
            </select>

            {/* DROPDOWN NAMA SESUAI KATEGORI */}
            <select
              value={formData.nama}
              disabled={!formData.kategori}
              onChange={(e) => {
                const nama = e.target.value
                const found = stokAwal.find(i => i.nama === nama)

                setFormData({
                  ...formData,
                  nama,
                  satuan: found?.satuan || '',
                })
              }}
              className="border rounded p-2"
            >
              <option value="">Pilih nama...</option>

              {filteredNama.map((item) => (
                <option key={item.id} value={item.nama}>
                  {item.nama}
                </option>
              ))}
            </select>

            <input
              type="number"
              step="0.01"
              placeholder="Jumlah"
              value={formData.jumlah}
              onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
              className="border rounded p-2"
            />

            <input
              type="text"
              placeholder="Satuan"
              value={formData.satuan}
              onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
              className="border rounded p-2"
            />
          </div>

          <div className="flex justify-end mt-4 gap-3">
            <button
              type="button"
              onClick={() => {
                setFormMode(null)
                setSelected(null)
              }}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      )}

      {/* TABEL (tidak diubah) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">No</th>
              <th className="py-3 px-4">Nama Bahan</th>
              <th className="py-3 px-4">Jumlah</th>
              <th className="py-3 px-4">Satuan</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{index + 1}</td>

                  <td
                    onClick={() => setSelected(item)}
                    className="py-3 px-4 font-medium cursor-pointer hover:underline"
                  >
                    {item.nama}
                  </td>

                  <td className="py-3 px-4">{item.jumlah}</td>
                  <td className="py-3 px-4">{item.satuan}</td>
                  <td className="py-3 px-4">{item.kategori}</td>

                  <td className="py-3 px-4 flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setFormMode('ubah')
                        setSelected(item)
                        setFormData({
                          nama: item.nama,
                          jumlah: String(item.jumlah),
                          satuan: item.satuan,
                          kategori: item.kategori,
                        })
                      }}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setConfirmDelete(item)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500 italic">
                  Tidak ada data sisa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL VIEW */}
      {selected && !formMode && (
        <div className="absolute top-10 right-10 bg-white rounded-lg shadow-lg p-4 w-64">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">{selected.nama}</h2>
            <button onClick={() => setSelected(null)}>
              <XMarkIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <p><b>Jumlah:</b> {selected.jumlah}</p>
          <p><b>Satuan:</b> {selected.satuan}</p>
          <p><b>Kategori:</b> {selected.kategori}</p>
        </div>
      )}

      {/* POPUP HAPUS */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Yakin ingin menghapus <b>{confirmDelete.nama}</b>?
            </h3>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Batal
              </button>

              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
