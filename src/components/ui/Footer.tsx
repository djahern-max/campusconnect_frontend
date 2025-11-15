import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CampusConnect</h3>
            <p className="text-gray-400 text-sm">
              Empowering students to find their perfect college match.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Students</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/institutions" className="text-gray-400 hover:text-white transition">Browse Institutions</Link></li>
              <li><Link href="/scholarships" className="text-gray-400 hover:text-white transition">Find Scholarships</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Institutions</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/admin/login" className="text-gray-400 hover:text-white transition">Admin Login</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 CampusConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
