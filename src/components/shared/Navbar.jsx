import React, { useState, useEffect } from 'react';
import { Menu, X, Heart, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Menú móvil
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState(null); // Estado para acordeón móvil

  // Detectar scroll para cambiar el diseño (Transparente -> Blanco)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- MAPA DEL SITIO ---
  const menuItems = [
    { name: 'Inicio', href: '/' },
    { 
      name: 'Quiénes Somos', 
      href: '/quienes-somos',
      submenu: [
        { name: 'Qué hacemos', href: '/que-hacemos' },
        { name: 'Programas y proyectos', href: '/programas' },
        { name: 'Equipo', href: '/transparencia' },
      ]
    },
    {
        name: 'Noticias y Publicaciones', 
        href: '/noticias',
        submenu: [
            { name: 'Noticias', href: '/noticias#noticias' }, 
            { name: 'Publicaciones', href: '/publicaciones' },
            { name: 'Boletines Informativos', href: '/noticias#boletines' },
        ]
    },
    {
        name: 'Revista Cientifica Forama', 
        href: '/forama',
    },
    {
        name: 'Colabora', 
        href: '/como-apoyar',
        submenu: [
            { name: 'Donaciones', href: '/como-apoyar#donaciones' }, 
            { name: 'Alianzas Estratégicas', href: '/como-apoyar#alianzas' },
            { name: 'Voluntariado', href: '/como-apoyar#voluntariado' }
        ]
    },
    { name: 'Contacto', href: '/contacto' },
  ];

  // Clases dinámicas de estilo
const navBg = isScrolled 
    ? 'bg-white/95 backdrop-blur-md shadow-md py-2' // py-2 es un relleno pequeño y elegante
    : 'bg-transparent py-1';

  const textColor = isScrolled ? 'text-amazon-900' : 'text-white';
  
  // Ajustes para móviles (siempre oscuro si está abierto)
  const finalTextColor = isOpen ? 'text-amazon-900' : textColor;
  const burgerColor = isOpen ? 'text-amazon-800' : textColor;

  // Función para abrir/cerrar submenús en móvil
  const toggleMobileSubmenu = (index) => {
    setMobileSubmenu(mobileSubmenu === index ? null : index);
  };

  return (
    <nav className={`fixed w-full z-50 top-0 start-0 transition-all duration-300 ${navBg}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between">
          
         {/* 1. LOGOTIPO CON IMAGEN (Dinámico: Grande arriba, Compacto al bajar) */}
          <a href="/" className="flex items-center gap-2 group z-50 relative">
            <img 
              src="/imags/material_navbar/logo_FORAMA.png" 
              alt="FORAMA Logo" 
              className={`
                w-auto object-contain transition-all duration-500
                ${isScrolled 
                  ? 'h-16 md:h-20'  // AL BAJAR: Se hace más pequeño (barra delgada)
                  : 'h-20 md:h-28'  // ARRIBA: Se mantiene GIGANTE e impactante
                }
                ${isScrolled || isOpen 
                  ? '' // Fondo blanco: Logo verde normal
                  : 'brightness-0 invert drop-shadow-[0_0_8px_rgba(74,222,128,1)]' // Fondo oscuro: Logo blanco brillante
                }
              `}
            />
          </a>
          
          {/* 2. BOTONES DERECHA (Donar + Hamburguesa) */}
          <div className="flex lg:order-2 gap-2 z-50 relative">
            <a href="/como-apoyar" className={`
                hidden sm:flex items-center gap-2 font-bold rounded-full text-xs px-5 py-2 transition-all transform hover:scale-105 shadow-lg
                ${isScrolled 
                  ? 'bg-amazon-600 text-white hover:bg-amazon-700 shadow-amazon-600/20' 
                  : 'bg-white text-amazon-900 hover:bg-gray-100 shadow-black/20'}
            `}>
              <Heart size={16} className={isScrolled ? 'text-white' : 'text-red-500'} fill="currentColor" />
              <span>Donar</span>
            </a>
            
            <button 
              onClick={() => setIsOpen(!isOpen)}
              type="button" 
              className={`inline-flex items-center p-2 w-10 h-10 justify-center rounded-lg lg:hidden focus:outline-none transition-colors ${burgerColor}`}
            >
                {isOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* 3. MENÚ PRINCIPAL */}
          <div className={`items-center justify-between w-full lg:flex lg:w-auto lg:order-1 
              ${isOpen ? 'absolute top-0 left-0 w-full h-screen bg-white overflow-y-auto flex flex-col pt-24 pb-10 shadow-xl' : 'hidden'}
          `}>
            
            <ul className={`
                flex flex-col font-medium p-4 lg:p-0 mt-4 lg:space-x-1 rtl:space-x-reverse lg:flex-row lg:mt-0 lg:border-0 
                ${isOpen ? 'space-y-1 text-left w-full px-6' : 'text-[14px] xl:text-[15px]'} 
            `}>
              {menuItems.map((item, index) => (
                <li key={item.name} className="relative group">
                  
                  {/* --- SI TIENE SUBMENÚ --- */}
                  {item.submenu ? (
                    <>
                      <div className="flex items-center justify-between w-full lg:w-auto">
                           <a 
                            href={item.href}
                            className={`flex items-center gap-1 py-2 px-3 rounded lg:p-0 transition-colors font-semibold
                              ${isOpen ? 'text-amazon-900 text-lg w-full justify-between' : finalTextColor}
                              lg:hover:text-earth-400 lg:px-3 lg:py-2
                            `}
                            onClick={(e) => {
                                if(isOpen) {
                                    e.preventDefault();
                                    toggleMobileSubmenu(index);
                                }
                            }}
                          >
                            {item.name}
                            <ChevronDown 
                                size={14} 
                                className={`transition-transform duration-300 
                                    ${mobileSubmenu === index ? 'rotate-180' : ''} 
                                    lg:group-hover:rotate-180
                                `} 
                            />
                          </a>
                      </div>

                      <div className={`
                        lg:absolute lg:top-full lg:left-0 lg:mt-2 lg:w-60 lg:bg-white lg:rounded-xl lg:shadow-xl lg:border lg:border-gray-100 lg:py-2
                        lg:invisible lg:opacity-0 lg:translate-y-2 lg:group-hover:visible lg:group-hover:opacity-100 lg:group-hover:translate-y-0 lg:transition-all lg:duration-200
                        ${mobileSubmenu === index ? 'block bg-gray-50 rounded-xl mt-2 p-2 mb-4' : 'hidden lg:block'}
                      `}>
                          <div className="hidden lg:block absolute -top-1.5 left-6 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100"></div>
                          <ul className="relative z-10">
                            {item.submenu.map((subItem) => (
                              <li key={subItem.name}>
                                <a 
                                  href={subItem.href}
                                  className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-amazon-50 hover:text-amazon-700 transition-colors rounded-lg mx-1"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {subItem.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                      </div>
                    </>
                  ) : (
                    <a 
                      href={item.href} 
                      className={`block py-2 px-3 rounded lg:p-0 relative transition-colors font-semibold
                        ${isOpen ? 'text-amazon-900 text-lg border-b border-gray-100 pb-3 mb-2' : finalTextColor}
                        lg:hover:text-earth-400 lg:px-3 lg:py-2
                      `}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </a>
                  )}
                </li>
              ))}
              
              {isOpen && (
                 <li className="mt-8">
                    <a href="/como-apoyar" className="w-full bg-amazon-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-amazon-700">
                        <Heart size={20} fill="currentColor" /> APOYAR CAUSA
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