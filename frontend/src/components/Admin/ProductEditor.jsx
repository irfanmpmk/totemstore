import React, { useState } from "react";
import { useGetProductsQuery } from "@/store/services/totemApi";
import { Edit3, Check, X } from "lucide-react";

export default function ProductEditor() {
  const { data: response, refetch } = useGetProductsQuery();
  const products = response?.products || [];
  const [editingId, setEditingId] = useState(null);

  // Notice: media_input is managed here as a clean text string for user input comfort
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    stock_quantity: "",
    category: "Electronics",
    mediaInput: "",
  });

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      title: p.title,
      description: p.description,
      price: p.price,
      stock_quantity: p.stock_quantity,
      category: p.category || "Electronics",
      // Safely turn array records back into an editable string separated by commas
      mediaInput: Array.isArray(p.media_urls) ? p.media_urls.join(", ") : "",
    });
  };

  const handleUpdateSubmit = async (id) => {
    // Structural Conversion: package input texts back into strict database arrays
    const payload = {
        title: editForm.title,
        description: editForm.description,
      price: parseFloat(editForm.price),
      stock_quantity: parseInt(editForm.stock_quantity, 10) || 0,
      category: editForm.category,
      media_urls: editForm.mediaInput
        ? editForm.mediaInput
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean)
        : [],
    };

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert("Product profile synchronized successfully.");
        setEditingId(null);
        refetch();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to finalize edits.");
      }
    } catch (err) {
      console.error(err);
      alert("Network exception communicating updates.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl border border-neutral-100 shadow-sm mt-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4">
        Modify Store Inventory Tracks
      </h3>
      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex flex-col p-4 bg-neutral-50 rounded-lg border border-neutral-200/60 text-xs gap-3"
          >
            {editingId === p.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                      Product Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                      Product Description
                    </label>
                    <textarea
                      rows="2"
                      className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black text-xs"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                      Price (INR)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded font-mono"
                      value={editForm.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                          setEditForm({ ...editForm, price: val });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded font-mono"
                      value={editForm.stock_quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d+$/.test(val)) {
                          setEditForm({ ...editForm, stock_quantity: val });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                      Category
                    </label>
                    <select
                      className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded text-[11px]"
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                      }
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Furniture">Furniture</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                    Media URLs (Comma separated links)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black font-mono text-neutral-600 text-xs"
                    placeholder="https://images.com/pic1.jpg, https://videos.com/clip1.mp4"
                    value={editForm.mediaInput}
                    onChange={(e) =>
                      setEditForm({ ...editForm, mediaInput: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => handleUpdateSubmit(p.id)}
                    className="px-3 py-1.5 bg-black text-white rounded flex items-center gap-1 font-semibold hover:bg-neutral-900 transition-colors"
                  >
                    <Check size={14} /> Save Drop
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 bg-neutral-200 text-neutral-700 rounded flex items-center gap-1 font-semibold hover:bg-neutral-300 transition-colors"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
                <div>
                  <span className="font-bold text-neutral-900">{p.title}</span>
                  <span className="ml-2 bg-neutral-200/70 text-neutral-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold">
                    {p.category || "Electronics"}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <span>
                    Price: <strong className="font-mono">₹{p.price}</strong>
                  </span>
                  <span>
                    Stock:{" "}
                    <strong className="font-mono">
                      {p.stock_quantity} units
                    </strong>
                  </span>
                  <button
                    onClick={() => startEdit(p)}
                    className="text-neutral-500 hover:text-black p-1 hover:bg-neutral-200 rounded transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
