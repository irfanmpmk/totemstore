import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { X, Lock, Mail, User } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const dispatch = useDispatch();
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Signup modes
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Determine the precise endpoint dynamically
    const endpoint = isSignUp ? 'register' : 'login';

    try {
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || data.error || 'Authentication sequence failed.');
        setLoading(false);
        return;
      }

      // Commit the token and user data to Redux slice and LocalStorage
      dispatch(setCredentials({ user: data.user, token: data.token }));
      
      alert(isSignUp ? 'Account created successfully!' : `Welcome back, ${data.user.name}!`);
      onClose(); // Close modal upon verification match
    } catch (error) {
      console.error('Auth Request Fault:', error);
      alert('Network failure connecting to authentication servers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Dimmed glass background overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Auth Card Dialog Sheet */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-100 p-8 z-10 animate-scaleUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors">
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-black tracking-widest text-black uppercase">
            TOTEM<span className="text-neutral-400 font-light">STORE</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-semibold">
            {isSignUp ? 'Create secure portal credentials' : 'Sign in to your member profile'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Secure Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-900 transition-colors disabled:bg-neutral-200"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Register Account' : 'Sign In To Profile'}
          </button>
        </form>

        {/* Switch state option link footer */}
        <div className="mt-6 text-center text-xs text-neutral-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setFormData({ name: '', email: '', password: '' }); }}
            className="text-black font-bold underline ml-1 hover:text-neutral-700 transition-colors"
          >
            {isSignUp ? 'Log In' : 'Sign Up Free'}
          </button>
        </div>
      </div>
    </div>
  );
}