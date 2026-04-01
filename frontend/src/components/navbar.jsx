import logo from '../assets/RWUonly_white.svg';

export default function Navbar() {
  return (
    <nav className="bg-primary-container text-secondary-container p-4 border-b-4 border-[#001a30] flex items-center justify-between">
      
      <div className="flex-1 flex justify-start">
        <img src={logo} alt="Logo" className="h-8 w-auto" />
      </div>

      <h1 className="text-2xl font-bold uppercase tracking-tight whitespace-nowrap">
        Class Planner
      </h1>

      <div className="flex-1" />
      
    </nav>
  );
}