"use client";

import { useEffect, useState } from "react";

export default function StokAwalPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/stok_awal")
      .then((r) => r.json())
      .then((d) => setData(d));
  }, []);

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 shadow rounded">

      <h1 className="text-3xl font-bold mb-6">Daftar Stok Awal</h1>

      <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="py-3 px-4">Nama</th>
            <th className="py-3 px-4">Jumlah</th>
            <th className="py-3 px-4">Satuan</th>
            <th className="py-3 px-4">Kategori</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item: any) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{item.nama}</td>
              <td className="py-3 px-4">{item.jumlah}</td>
              <td className="py-3 px-4">{item.satuan}</td>
              <td className="py-3 px-4">{item.kategori}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
