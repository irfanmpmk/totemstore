import { useState } from 'react';
import ProductGrid from './components/Shop/ProductGrid';
import AddProduct from './components/Admin/AddProduct';
import ProductEditor from './components/Admin/ProductEditor'; // Imported the Item Updater Panel
import CartDrawer from './components/Shop/CartDrawer';
import AuthModal from './components/Common/AuthModal';
import CategoryBar from './components/Shop/CategoryBar'; // Imported Flipkart Category Row
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, ShieldAlert, LogOut, UserCheck, Search } from 'lucide-react';
import { logout } from './store/slices/authSlice'; 

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // High-Performance Filtering Context States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const { user, isAuthenticated } = useSelector((state) => state.auth); 
  
  const totalCartUnits = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Premium Minimalist Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-4 sm:px-8 py-4 flex justify-between items-center">
        <h1 
          className="text-lg font-black tracking-widest text-black uppercase cursor-pointer flex-shrink-0" 
          onClick={() => { setIsAdminView(false); setSelectedCategory('All'); setSearchQuery(''); }}
        >
          TOTEM<span className="text-neutral-400 font-light">STORE</span>
        </h1>

        {/* --- DYNAMIC GLOBAL INPUT FIELD LOOKUP CHANNEL --- */}
        {!isAdminView && (
          <div className="flex items-center relative max-w-sm w-full mx-4 sm:mx-8">
            <Search size={14} className="absolute left-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search drops (e.g., Keychain)..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-black placeholder:text-neutral-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
          {isAuthenticated && user?.is_admin && (
            <button 
              onClick={() => setIsAdminView(!isAdminView)}
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
            >
              <ShieldAlert size={14} />
              {isAdminView ? "Go To Shop" : "Inventory Admin"}
            </button>
          )}

          {isAuthenticated ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-neutral-700 tracking-tight">
              <UserCheck size={14} className="text-neutral-400" />
              Hi, {user.name.split(' ')[0]}
            </span>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
            >
              Sign In
            </button>
          )}

          {/* Shopping Cart Indicator */}
          <div 
            onClick={() => setIsCartOpen(true)}
            className="relative cursor-pointer p-1 text-neutral-800 hover:text-black transition-colors"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalCartUnits > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalCartUnits}
              </span>
            )}
          </div>

          {isAuthenticated && (
            <button onClick={() => dispatch(logout())} className="text-neutral-400 hover:text-red-500 p-1 transition-colors">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </nav>

      {/* Main Container Workspace */}
      <main className="flex-grow">
        {isAdminView && user?.is_admin ? (
          <div className="py-6 animate-fadeIn space-y-6">
            <AddProduct />
            <ProductEditor /> {/* Expose product row adjustments dynamically */}
          </div>
        ) : (
          <div className="animate-fadeIn">
            {/* 1. Flipkart Style Categorization Horizontal Track */}
            <CategoryBar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

            {/* Subtle Marketing Hero Banner */}
            <div className="text-center py-8 px-4 bg-white border-b border-neutral-100">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">New Season Drop</p>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Built for Performance.</h2>
            </div>

            {/* 2. Feed reactive state limits into our Product Grid filter layout */}
            <ProductGrid selectedCategory={selectedCategory} searchQuery={searchQuery} />
          </div>
        )}
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}