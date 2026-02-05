import React, { useState, useEffect } from 'react';
import { Menu, X, Heart, ChevronDown, Globe } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Menú móvil
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState(null); // Estado para acordeón móvil
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false); // Estado para el menú de idiomas
  
  // Detectar scroll para cambiar el diseño (Transparente -> Blanco)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- FUNCIÓN DE TRADUCCIÓN SEGURA ---
  const changeLang = (langCode) => {
    if (typeof window.doGTranslate === 'function') {
      window.doGTranslate(`es|${langCode}`);
      setIsOpen(false); // Cierra menú móvil si está abierto
      setIsLangMenuOpen(false); // Cierra menú idiomas
    } else {
      console.warn("Google Translate script not loaded yet");
    }
  };

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
        href: '/revista',
    },
    { name: 'Contacto', href: '/contacto' },
  ];

  // Clases dinámicas de estilo
  const navBg = isScrolled 
    ? 'bg-white/95 backdrop-blur-md shadow-md py-2' 
    : 'bg-transparent py-1';

  const textColor = isScrolled ? 'text-amazon-900' : 'text-white';
  
  // Ajustes para móviles
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
          
          {/* 1. LOGOTIPO */}
          <a href="/" className="flex items-center gap-2 group z-50 relative">
            <img 
              src="/imags/material_navbar/logo_FORAMA.svg" 
              alt="FORAMA Logo" 
              className={`
                w-auto object-contain transition-all duration-500
                ${isScrolled 
                  ? 'h-16 md:h-20' 
                  : 'h-20 md:h-28' 
                }
                ${isScrolled || isOpen 
                  ? '' 
                  : 'brightness-0 invert drop-shadow-[0_0_8px_rgba(74,222,128,1)]' 
                }
              `}
            />
          </a>
          
          {/* 2. BOTONES DERECHA */}
          <div className="flex lg:order-2 gap-2 z-50 relative items-center">
            
            {/* --- BOTÓN DE IDIOMA (MODIFICADO PARA MÓVIL) --- */}
            <div className="relative h-full flex items-center">
                
                <button 
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className={`flex items-center gap-1 p-2 rounded-full transition-colors hover:bg-black/5 outline-none ${burgerColor}`}
                >
                    <Globe size={20} />
                    <ChevronDown 
                        size={14} 
                        className={`transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} 
                    />
                </button>

                {/* MENÚ DESPLEGABLE DE IDIOMAS */}
                <div className={`
                    absolute top-full right-0 pt-2 w-40 transition-all duration-300 ease-out
                    ${isLangMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}
                `}>
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-1.5">
                        
                        <button onClick={() => changeLang('es')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-amazon-50 hover:text-amazon-700 rounded-xl transition-colors font-bold group/item">
                            <span className="notranslate text-[10px] uppercase text-gray-400 font-extrabold w-5 group-hover/item:text-amazon-600">ES</span> 
                            Español
                        </button>
                        
                        <button onClick={() => changeLang('en')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-amazon-50 hover:text-amazon-700 rounded-xl transition-colors font-bold group/item">
                            <span className="notranslate text-[10px] uppercase text-gray-400 font-extrabold w-5 group-hover/item:text-amazon-600">US</span> 
                            English
                        </button>
                        
                        <button onClick={() => changeLang('pt')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-amazon-50 hover:text-amazon-700 rounded-xl transition-colors font-bold group/item">
                            <span className="notranslate text-[10px] uppercase text-gray-400 font-extrabold w-5 group-hover/item:text-amazon-600">BR</span> 
                            Português
                        </button>

                    </div>
                </div>
            </div>
            {/* --- FIN BOTÓN IDIOMA --- */}

            {/* Botón Donar (Versión Desktop - Oculto en móvil) */}
            <a href="/como-apoyar" className={`
                hidden sm:flex items-center gap-2 font-bold rounded-full text-xs px-5 py-2 transition-all transform hover:scale-105 shadow-lg
                ${isScrolled 
                  ? 'bg-amazon-600 text-white hover:bg-amazon-700 shadow-amazon-600/20' 
                  : 'bg-white text-amazon-900 hover:bg-gray-100 shadow-black/20'}
            `}>
              <Heart size={16} className={isScrolled ? 'text-white' : 'text-red-500'} fill="currentColor" />
              <span>Donar</span>
            </a>
            
            {/* Botón Hamburguesa */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              type="button" 
              className={`inline-flex items-center p-2 w-10 h-10 justify-center rounded-lg lg:hidden focus:outline-none transition-colors ${burgerColor}`}
            >
                {isOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* 3. MENÚ PRINCIPAL (MOBILE & DESKTOP) */}
          <div className={`items-center justify-between w-full lg:flex lg:w-auto lg:order-1 
              ${isOpen ? 'absolute top-0 left-0 w-full h-screen bg-white overflow-y-auto flex flex-col pt-24 pb-10 shadow-xl' : 'hidden'}
          `}>
            
            <ul className={`
                flex flex-col font-medium p-4 lg:p-0 mt-4 lg:space-x-1 rtl:space-x-reverse lg:flex-row lg:mt-0 lg:border-0 
                ${isOpen ? 'space-y-1 text-left w-full px-6' : 'text-[14px] xl:text-[15px]'} 
            `}>
              {menuItems.map((item, index) => (
                <li key={item.name} className="relative group">
                  
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
              
              {/* --- AQUÍ ESTÁ EL BOTÓN DONAR PARA MÓVIL QUE PEDISTE --- */}
              {isOpen && (
                  <li className="mt-6 px-4 pb-8 lg:hidden">
                    <a
                      href="/como-apoyar"
                      className="
                        group relative
                        w-full
                        inline-flex items-center justify-center gap-2
                        px-5 sm:px-6
                        py-4 sm:py-3
                        rounded-2xl
                        overflow-hidden
                        border border-white/10
                        bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-500
                        shadow-[0_12px_30px_rgba(16,185,129,0.22)]
                        transition-all duration-500 ease-out
                        hover:shadow-[0_18px_50px_rgba(16,185,129,0.35)]
                        hover:-translate-y-[1px] hover:scale-[1.02]
                        active:translate-y-0 active:scale-[0.98]
                      "
                      onClick={() => setIsOpen(false)}
                    >
                      {/* overlay */}
                      <span className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />

                      {/* glow blobs */}
                      <span className="
                        absolute -top-10 -right-12 h-28 w-28 rounded-full
                        bg-white/15 blur-2xl
                        transition-all duration-700 ease-out
                        group-hover:translate-x-[-10px] group-hover:translate-y-[10px] group-hover:bg-white/25
                      " />
                      <span className="
                        absolute -bottom-10 -left-12 h-28 w-28 rounded-full
                        bg-emerald-300/20 blur-2xl
                        transition-all duration-700 ease-out
                        group-hover:translate-x-[10px] group-hover:translate-y-[-10px] group-hover:bg-emerald-200/30
                      " />

                      {/* sheen sweep */}
                      <span className="
                        absolute inset-0
                        -translate-x-[130%] skew-x-[-18deg]
                        bg-gradient-to-r from-transparent via-white/25 to-transparent
                        transition-transform duration-700 ease-out
                        group-hover:translate-x-[130%]
                      " />

                      {/* inner ring */}
                      <span className="absolute inset-0 rounded-2xl ring-1 ring-white/15 group-hover:ring-white/25 transition duration-500" />

                      {/* content */}
                      <span className="relative z-10 inline-flex items-center gap-2">
                        <Heart
                          size={20}
                          className="
                            text-red-300
                            transition-all duration-500
                            group-hover:text-white group-hover:scale-110
                            motion-safe:animate-[pulse_1.6s_ease-in-out_infinite]
                          "
                          fill="currentColor"
                        />
                        <span className="
                          text-white font-extrabold uppercase
                          tracking-[0.14em]
                          text-sm
                        ">
                          Donar
                        </span>
                      </span>
                    </a>
                  </li>
                )}
                {/* --- FIN BOTÓN DONAR MÓVIL --- */}

            </ul>
          </div>

        </div>
      </div>
    </nav>
  );
};