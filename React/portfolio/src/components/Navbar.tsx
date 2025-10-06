import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">Ibrac-02</Link>
        <div className="flex items-center gap-4 text-sm">
          <NavLink to="/" className={({isActive})=> isActive? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}>Home</NavLink>
          <NavLink to="/projects" className={({isActive})=> isActive? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}>Projects</NavLink>
          <NavLink to="/blog" className={({isActive})=> isActive? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}>Blog</NavLink>
          <NavLink to="/contact" className={({isActive})=> isActive? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}>Contact</NavLink>
        </div>
      </nav>
    </header>
  );
}
