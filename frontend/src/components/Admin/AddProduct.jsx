import { useState } from 'react';
import { useAddProductMutation } from "@/store/services/totemApi";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock_quantity: '',
    mediaInput: ''
  });
  
  const [addProduct, { isLoading }] = useAddProductMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Strict transformations
    const payload = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
      media_urls: formData.mediaInput ? formData.mediaInput.split(',').map(url => url.trim()).filter(Boolean) : []
    };

    try {
      await addProduct(payload).unwrap();
      alert('Product saved and published successfully!');
      setFormData({ title: '', description: '', price: '', stock_quantity: '', mediaInput: '' });
    } catch (err) {
      console.error('API Error during product provisioning:', err);
      alert(err.data?.error || 'Failed to save product listings.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 bg-white shadow-sm border border-neutral-200/60 rounded-xl my-6">
      <h2 className="text-lg font-bold text-neutral-900 mb-6 tracking-tight">
        Totemstore Admin Panel • Product Manager
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
            Product Title
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm transition-shadow"
            placeholder="e.g., Heavyweight Boxy Fit Tee"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
            Description & Marketing Copy
          </label>
          <textarea
            rows="4"
            required
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm transition-shadow"
            placeholder="Describe materials, build, dimensions, and sizing..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
              Price (INR)
            </label>
            <input
              type="text" // Use text to control the regex filter safely
              required
              placeholder="e.g., 1999.00"
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black font-mono"
              value={formData.price}
              onChange={(e) => {
                const val = e.target.value;
                // Only allow numbers with up to two optional decimal places
                if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                  setFormData({ ...formData, price: val });
                }
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
              Stock Volume
            </label>
            <input
              type="text"
              required
              placeholder="e.g., 50"
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black font-mono"
              value={formData.stock_quantity} // Match whatever state key name you used
              onChange={(e) => {
                const val = e.target.value;
                // Only allow pure whole integer digits
                if (val === "" || /^\d+$/.test(val)) {
                  setFormData({ ...formData, stock_quantity: val });
                }
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
            Media URLs (Comma separated links)
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-sm font-mono text-neutral-600 transition-shadow"
            placeholder="https://images.com/pic1.jpg, https://videos.com/clip1.mp4"
            value={formData.mediaInput}
            onChange={(e) =>
              setFormData({ ...formData, mediaInput: e.target.value })
            }
          />
          <p className="text-[10px] text-neutral-400 mt-1">
            Provide external image asset links or content video clips.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-900 transition-colors disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          {isLoading ? "Uploading data structure..." : "Publish to Totemstore"}
        </button>
      </form>
    </div>
  );
}