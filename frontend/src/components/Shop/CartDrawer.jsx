import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Plus, Minus, Trash2, Tag } from 'lucide-react';
import { addToCart, removeFromCart, clearCart } from '@/store/slices/cartSlice';
import { loadRazorpayScript } from '../../../utils/loadRazorpay';
import { totemApi } from '../../store/services/totemApi';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", 
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", 
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];


const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function CartDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const { user } = useSelector((state) => state.auth);

  // Structured Address State Hooks modeled after Flipkart's format
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    pincode: '',
    locality: '',
    streetAddress: '',
    cityTown: '',
    state: '',
    addressType: 'Home'
  });

  const [couponCode, setCouponCode] = useState('');

  // Prefill the Name field if the user is logged in; otherwise leaves it open for Guests
  useEffect(() => {
    if (user?.name) {
      setAddressForm((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  // Calculate order metrics
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Mandatory field validation rules
  const isFormValid = 
    addressForm.name.trim() &&
    addressForm.phone.trim().length >= 10 &&
    addressForm.pincode.trim() &&
    addressForm.locality.trim() &&
    addressForm.streetAddress.trim() &&
    addressForm.cityTown.trim() &&
    addressForm.state;

  const handleCheckout = async () => {
    try {
      // 1. Fire order payload to your Node backend query handler
      const response = await fetch(`${API_BASE}/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cartItems,
          customerName: addressForm.name,
          phone: addressForm.phone,
          pincode: addressForm.pincode,
          locality: addressForm.locality,
          streetAddress: addressForm.streetAddress,
          cityTown: addressForm.cityTown,
          state: addressForm.state,
          addressType: addressForm.addressType,
          userId: user?.id || null // Automatically handles Guest accounts when null
        }),
      });

      const orderData = await response.json();

      if (!orderData.success) {
        alert(orderData.error || 'Something went wrong creating the order.');
        return;
      }

      // 2. Process Sandbox Bypass condition directly
      if (orderData.isSandbox) {
        alert(`[Sandbox Mode] Totemstore Purchase Successful!\nOrder registered instantly in PostgreSQL database.\nStock levels decremented automated.`);
        dispatch(totemApi.util.invalidateTags(['Product']));
        dispatch(clearCart());
        onClose();
        return;
      }

      // 3. Otherwise, execute standard production script loading
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load.');
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TOTEMSTORE',
        description: 'Secure Order Payment',
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          alert(`Payment Successful! ID: ${response.razorpay_payment_id}`);
          // Invalidate cache for live payments too
          dispatch(totemApi.util.invalidateTags(['Product']));
          dispatch(clearCart());
          onClose();
        },
        prefill: { 
          name: addressForm.name, 
          contact: addressForm.phone,
          email: user?.email || 'guest@totemstore.com' 
        },
        theme: { color: '#000000' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initialize transaction sequence.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark background glass overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel Sliding Sheet */}
        <div className="w-screen max-w-lg bg-white flex flex-col shadow-2xl animate-slideLeft">
          {/* Header */}
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Your Bag ({cartItems.length})
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-black transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrolling Main Body Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
                  Your bag is completely empty
                </p>
                <p className="text-xs text-neutral-400">
                  Add custom drops from the store to get started.
                </p>
              </div>
            ) : (
              <>
                {/* Product List Grid */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b border-neutral-100 final:border-0 final:pb-0"
                    >
                      <div className="w-16 aspect-square bg-neutral-50 rounded-lg overflow-hidden border border-neutral-100 flex-shrink-0">
                        <img
                          src={item.media_urls?.[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between h-16">
                        <div>
                          <h4 className="text-xs font-semibold text-neutral-800 line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-xs font-mono font-bold text-neutral-900 mt-0.5">
                            ₹{item.price}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-neutral-200 rounded-md bg-neutral-50">
                            <button
                              onClick={() => dispatch(removeFromCart(item.id))}
                              className="p-1 text-neutral-500 hover:text-black transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="px-2 font-mono text-xs font-semibold text-neutral-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => dispatch(addToCart(item))}
                              className="p-1 text-neutral-500 hover:text-black transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          <button
                            onClick={() => dispatch(removeFromCart(item.id))}
                            className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-neutral-100" />

                {/* --- DISPLAY COUPON FIELD LAYOUT --- */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-1">
                    <Tag size={12} /> Have a Coupon Code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-grow px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Enter promo code..."
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button className="px-4 py-2 bg-neutral-100 text-neutral-800 text-[10px] font-bold uppercase rounded-lg hover:bg-neutral-200 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                <hr className="border-neutral-100" />

                {/* --- FLIPKART STRUCTURED ADDRESS FORM GRID --- */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Delivery Address Details
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black"
                      value={addressForm.name}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, name: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black font-mono"
                      value={addressForm.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Only allow numerical digits up to 10 characters long
                        if (
                          val === "" ||
                          (/^\d+$/.test(val) && val.length <= 10)
                        ) {
                          setAddressForm({ ...addressForm, phone: val });
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      maxLength={6} // Industry best practice: standard physical safety stop
                      placeholder="Pincode"
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black font-mono"
                      value={addressForm.pincode}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Senior Input Mask: Only allow numerical digits (\d) up to 6 characters long
                        if (
                          val === "" ||
                          (/^\d+$/.test(val) && val.length <= 6)
                        ) {
                          setAddressForm({ ...addressForm, pincode: val });
                        }
                      }}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Locality"
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black"
                      value={addressForm.locality}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          locality: e.target.value,
                        })
                      }
                    />
                  </div>

                  <textarea
                    rows="2"
                    required
                    placeholder="Address (Area and Street)"
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-black"
                    value={addressForm.streetAddress}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        streetAddress: e.target.value,
                      })
                    }
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="City/District/Town"
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black"
                      value={addressForm.cityTown}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          cityTown: e.target.value,
                        })
                      }
                    />
                    <select
                      required
                      className="w-full px-3 py-2.5 border border-neutral-200 bg-neutral-50 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black"
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          state: e.target.value,
                        })
                      }
                    >
                      <option value="">--Select State--</option>
                      {INDIAN_STATES.map((stateName) => (
                        <option key={stateName} value={stateName}>
                          {stateName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address Type Selectors */}
                  <div className="pt-1">
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                      Address Type
                    </label>
                    <div className="flex gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-neutral-700">
                        <input
                          type="radio"
                          name="addressType"
                          className="accent-black h-3.5 w-3.5"
                          checked={addressForm.addressType === "Home"}
                          onChange={() =>
                            setAddressForm({
                              ...addressForm,
                              addressType: "Home",
                            })
                          }
                        />
                        Home 
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-neutral-700">
                        <input
                          type="radio"
                          name="addressType"
                          className="accent-black h-3.5 w-3.5"
                          checked={addressForm.addressType === "Work"}
                          onChange={() =>
                            setAddressForm({
                              ...addressForm,
                              addressType: "Work",
                            })
                          }
                        />
                        Work 
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sticky Purchase Footer Summarizer */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-neutral-100 bg-neutral-50 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
                  Total Bill
                </span>
                <span className="text-lg font-mono font-black text-neutral-900">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!isFormValid}
                className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-900 transition-colors disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
              >
                Proceed to Secure Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

