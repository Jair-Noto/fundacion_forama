import React, { useState, useEffect } from 'react';
import { Menu, X, Heart } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detectar scroll para cambiar el diseño
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // TU NUEVO MAPA DEL SITIO
  const menuItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Quiénes somos', href: '/quienes-somos' },
    { name: 'Qué hacemos', href: '/que-hacemos' }, // Nuevo
    { name: 'Programas y proyectos', href: '/programas' },
    { name: 'Transparencia', href: '/transparencia' },
    { name: 'Cómo apoyar', href: '/como-apoyar' },
    { name: 'Noticias y publicaciones', href: '/noticias' }, // Nuevo
    { name: 'Contacto', href: '/contacto' },
  ];

  // Clases dinámicas
  const navBg = isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4';
  const textColor = isScrolled ? 'text-amazon-900' : 'text-white';
  const logoColor = isScrolled ? 'text-amazon-800' : 'text-white';
  // Ajuste para móviles: si el menú está abierto, el logo debe ser oscuro para verse sobre el fondo blanco
  const finalLogoColor = isOpen ? 'text-amazon-800' : logoColor; 
  const burgerColor = isOpen ? 'text-amazon-800' : textColor;

  return (
    <nav className={`fixed w-full z-50 top-0 start-0 transition-all duration-300 ${navBg}`}>
      {/* Usamos max-w-[1400px] para dar más ancho y que quepan todos los items */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between">
          
          {/* 1. LOGOTIPO */}
          <a href="/" className="flex items-center gap-1 group z-50 relative">
            <span className={`self-center text-xl md:text-2xl font-extrabold tracking-tighter transition-colors ${finalLogoColor}`}>
              FORAMA<span className="text-earth-500"></span>
            </span>
          </a>

          {/* 2. BOTÓN DONAR + HAMBURGUESA */}
          <div className="flex lg:order-2 gap-2 z-50 relative">
            <a href="/como-apoyar" className={`
                hidden sm:flex items-center gap-2 font-bold rounded-full text-xs px-5 py-2 transition-all transform hover:scale-105 shadow-lg
                ${isScrolled 
                    ? 'bg-amazon-600 text-white hover:bg-amazon-700 shadow-amazon-600/20' 
                    : 'bg-white text-amazon-900 hover:bg-gray-100 shadow-black/20'}
            `}>
              <Heart size={16} className={isScrolled ? 'text-white' : 'text-red-500'} fill={isScrolled ? "currentColor" : "currentColor"} />
              <span>Donar</span>
            </a>
            
            {/* Botón Hamburguesa (Móvil) */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              type="button" 
              className={`inline-flex items-center p-2 w-10 h-10 justify-center rounded-lg lg:hidden focus:outline-none transition-colors ${burgerColor}`}
            >
                {isOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* 3. ENLACES DEL MENÚ */}
          <div className={`items-center justify-between w-full lg:flex lg:w-auto lg:order-1 
              ${isOpen ? 'absolute top-0 left-0 w-full h-screen bg-white flex flex-col justify-center items-center shadow-xl' : 'hidden'}
          `}>
            
            <ul className={`
                flex flex-col font-medium p-4 lg:p-0 mt-4 lg:space-x-4 rtl:space-x-reverse lg:flex-row lg:mt-0 lg:border-0 
                ${isOpen ? 'space-y-6 text-center text-xl' : 'text-[13px] xl:text-[15px]'} 
            `}>
              {menuItems.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href} 
                    className={`block py-2 px-3 rounded lg:p-0 relative group transition-colors 
                        ${isOpen ? 'text-gray-800 font-bold' : textColor}
                        hover:text-amazon-500
                    `}
                    onClick={() => setIsOpen(false)} // Cierra el menú al hacer clic en móvil
                  >
                    {item.name}
                    {/* Línea animada al pasar el mouse (solo desktop) */}
                    <span className={`hidden lg:block absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isScrolled ? 'bg-amazon-600' : 'bg-white'}`}></span>
                  </a>
                </li>
              ))}
              
              {/* Botón Donar extra para móvil (cuando el menú está abierto) */}
              {isOpen && (
                 <li className="mt-4">
                    <a href="/como-apoyar" className="bg-amazon-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2">
                        <Heart size={20} fill="currentColor" /> Donar
                    </a>
                 </li>
              )}
            </ul>
          </div>

        </div>
      </div>
    </nav>
  );
};