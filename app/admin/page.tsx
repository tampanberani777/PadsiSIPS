"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
}

export default function AdminPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([
    { id: 'P1', name: 'Headset Gaming 1x', price: 400000, image: '/products/headset 1.jpg', description: 'Headset gaming berkualitas' },
    { id: 'P2', name: 'Headset Gaming 2y', price: 500000, image: '/products/headset 2.jpg', description: 'Headset dengan suara jernih' },
    { id: 'P3', name: 'Headset Wireless 2r', price: 1100000, image: '/products/headset 3.jpg', description: 'Headset wireless dengan baterai tahan lama' },
    { id: 'P4', name: 'Xbox Series X 1TB', price: 7000000, image: '/products/xbox x.jpg', description: 'Konsol next-gen dengan penyimpanan besar' },
    { id: 'P5', name: 'Sony Playstation 5', price: 8500000, image: '/products/ps5.jpg', description: 'Konsol PS5 dengan performa tinggi' },
    { id: 'P6', name: 'Xbox Series S 512GB', price: 5700000, image: '/products/xbox s.jpg', description: 'Xbox ringkas untuk gaming' },
    { id: 'P7', name: 'Virtual Reality', price: 5000000, image: '/products/vr.jpg', description: 'Headset VR immersive dan tajam' },
    { id: 'P8', name: 'Nitendo Switch', price: 4000000, image: '/products/nitendo.jpg', description: 'Konsol portable dari Nintendo' },
    { id: 'P9', name: 'Controller PS5', price: 550000, image: '/products/controller 1.jpg', description: 'Controller original PS5' },
    { id: 'P10', name: 'Controller PS4', price: 480000, image: '/products/controller 2.jpg', description: 'Controller PS4 ergonomis' },
    { id: 'P11', name: 'Keyboard Blue Switch', price: 300000, image: '/products/keyboard1.jpg', description: 'Keyboard tactile dan clicky' },
    { id: 'P12', name: 'Keyboard Red Switch', price: 224000, image: '/products/keyboard 2.jpg', description: 'Keyboard linear dan smooth' },
    { id: 'P13', name: 'Mouse Wireless Lgi', price: 1100000, image: '/products/mouse 1.jpg', description: 'Mouse wireless presisi tinggi' },
    { id: 'P14', name: 'Mouse', price: 100000, image: '/products/mouse 2.jpg', description: 'Mouse basic untuk kebutuhan harian' },
    { id: 'P15', name: 'Mouse Wireless', price: 300000, image: '/products/mouse 3.jpg', description: 'Mouse wireless hemat baterai' },
  ])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddProduct = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleUpdateProduct = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleSubmitProduct = (newProduct: Product) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? newProduct : p))
      )
    } else {
      setProducts((prev) => [...prev, newProduct])
    }
    setModalOpen(false)
  }

  const handleDeleteProduct = (id: string) => {
    const confirmDelete = confirm('Yakin hapus produk ini?')
    if (confirmDelete) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleShowDetail = (product: Product) => {
    alert(
      `Detail Produk:\n\nNama: ${product.name}\nHarga: Rp ${product.price.toLocaleString('id-ID')}\nDeskripsi: ${product.description}`
    )
  }

  const handleSaveData = () => {
    try {
      localStorage.setItem('products', JSON.stringify(products))
      alert('Data berhasil disimpan!')
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Terjadi kesalahan saat menyimpan data.')
    }
  }

  const handleBackToMain = () => {
    router.push('/')
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <input
          type="text"
          placeholder="Cari produk..."
          className="w-full md:w-1/2 bg-gray-800 border border-gray-700 p-2 rounded text-gray-100"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={handleAddProduct}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
        >
          Tambah Produk
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-200">
          <thead className="bg-gray-700 text-gray-100">
            <tr>
              <th className="px-4 py-2">ID Barang</th>
              <th className="px-4 py-2">Nama Barang</th>
              <th className="px-4 py-2">Harga</th>
              <th className="px-4 py-2">Gambar</th>
              <th className="px-4 py-2">Pilihan</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-gray-700">
                <td className="px-4 py-2">{product.id}</td>
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">
                  Rp {product.price.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleShowDetail(product)}
                    className="bg-cyan-600 hover:bg-cyan-700 px-2 py-1 rounded"
                  >
                    Tampil
                  </button>
                  <button
                    onClick={() => handleUpdateProduct(product)}
                    className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-2 text-center text-gray-400">
                  Tidak ada produk ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleSaveData}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
        >
          Simpan Data
        </button>
        <button
          onClick={handleBackToMain}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
        >
          Kembali ke Halaman Utama
        </button>
      </div>

      {modalOpen && (
        <ProductModal
          editingProduct={editingProduct}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitProduct}
        />
      )}
    </div>
  )
}

function ProductModal({
  editingProduct,
  onClose,
  onSubmit,
}: {
  editingProduct: Product | null
  onClose: () => void
  onSubmit: (newProduct: Product) => void
}) {
  const [id, setId] = useState(editingProduct?.id || '')
  const [name, setName] = useState(editingProduct?.name || '')
  const [price, setPrice] = useState(editingProduct?.price || 0)
  const [image, setImage] = useState(editingProduct?.image || '')
  const [description, setDescription] = useState(editingProduct?.description || '')

  const handleSave = () => {
    if (!id || !name) {
      alert('ID dan Nama wajib diisi.')
      return
    }
    const newProduct: Product = {
      id,
      name,
      price,
      image,
      description,
    }
    onSubmit(newProduct)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 p-6 rounded w-full max-w-md text-gray-100">
        <h2 className="text-xl font-bold mb-4">
          {editingProduct ? 'Update Produk' : 'Tambah Produk'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">ID Barang</label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Nama Barang</label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Harga</label>
            <input
              type="number"
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block mb-1">Sumber Gambar</label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Deskripsi</label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}
