import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-surface mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-serif font-bold tracking-tight mb-6 block text-white">
              FurniHub.
            </Link>
            <p className="text-sm text-surface-2/70 mb-6 leading-relaxed">
              Curating luxury-refined furniture for the modern home. A premium marketplace connecting you with the world's best artisans.
            </p>
          </div>
          
          <div>
            <h4 className="font-serif font-semibold text-white mb-6">Shop</h4>
            <ul className="space-y-4 text-sm text-surface-2/70">
              <li><Link to="/products" className="hover:text-accent transition-colors">All Products</Link></li>
              <li><Link to="/category/sofa" className="hover:text-accent transition-colors">Sofas & Sectionals</Link></li>
              <li><Link to="/category/bed" className="hover:text-accent transition-colors">Beds & Mattresses</Link></li>
              <li><Link to="/category/dining-table" className="hover:text-accent transition-colors">Dining</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-white mb-6">About</h4>
            <ul className="space-y-4 text-sm text-surface-2/70">
              <li><Link to="/about" className="hover:text-accent transition-colors">Our Story</Link></li>
              <li><Link to="/vendor/register" className="hover:text-accent transition-colors">Sell with Us</Link></li>
              <li><Link to="/blog" className="hover:text-accent transition-colors">Journal</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-white mb-6">Newsletter</h4>
            <p className="text-sm text-surface-2/70 mb-4">Subscribe for exclusive early access and interior design tips.</p>
            <form className="flex border-b border-surface-2/30 pb-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-surface-2/50 flex-grow"
              />
              <button type="submit" className="text-sm font-medium text-accent hover:text-white transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-surface-2/20 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-surface-2/50">
          <p>&copy; {new Date().getFullYear()} FurniHub. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
