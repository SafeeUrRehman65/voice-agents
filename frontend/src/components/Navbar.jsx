const NavBar = () => {
  return (
    <nav className="nav-bar w-full flex justify-center py-5 fixed backdrop-blur-xs border-b border-b-white/10 bg-black/50">
      <ul className="flex gap-x-5">
        <a className="poppins-light tracking-tight cursor-pointer rounded-lg text-md text-white/60 hover:text-white">
          Home
        </a>
        <a className="poppins-light tracking-tight cursor-pointer rounded-lg text-md text-white/60 hover:text-white">
          Products
        </a>
        <a className="poppins-light tracking-tight cursor-pointer rounded-lg text-md text-white/60 hover:text-white">
          Services
        </a>
        <a className="poppins-light tracking-tight cursor-pointer rounded-lg text-md text-white/60 hover:text-white">
          Use Cases
        </a>
      </ul>
    </nav>
  );
};

export default NavBar;
