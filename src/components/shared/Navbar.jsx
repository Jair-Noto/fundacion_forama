import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Menu, X, Heart, ChevronDown, Globe } from 'lucide-react';

const MENU_ITEMS = [
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

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: 'ES' },
  { code: 'en', label: 'English', flag: 'US' },
  { code: 'pt', label: 'Português', flag: 'BR' },
];

// ✅ Componente de menú de idiomas CON TEXTO "Traducir"
const LanguageMenu = React.memo(({ isOpen, onToggle, onChangeLang, burgerColor }) => {
  return (
    <div className="relative h-full flex items-center">
      <button 
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors hover:bg-black/5 outline-none ${burgerColor}`}
        aria-label="Cambiar idioma"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe size={18} aria-hidden="true" />
        {/* ✅ Texto "Traducir" visible */}
        <span className="hidden sm:inline text-sm font-semibold">
          Traducir
        </span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div className={`
        absolute top-full right-0 pt-2 w-40 transition-all duration-300 ease-out z-50
        ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}
      `}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-1.5">
          {LANGUAGES.map((lang) => (
            <button 
              key={lang.code}
              onClick={() => onChangeLang(lang.code)} 
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-amazon-50 hover:text-amazon-700 rounded-xl transition-colors font-bold group/item"
              aria-label={`Cambiar a ${lang.label}`}
            >
              <span className="notranslate text-[10px] uppercase text-gray-400 font-extrabold w-5 group-hover/item:text-amazon-600">
                {lang.flag}
              </span> 
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

LanguageMenu.displayName = 'LanguageMenu';

const MenuItem = React.memo(({ 
  item, 
  index, 
  isOpen, 
  finalTextColor, 
  mobileSubmenu,
  onToggleMobileSubmenu,
  onCloseMenu 
}) => {
  const hasSubmenu = Boolean(item.submenu);

  if (hasSubmenu) {
    return (
      <li className="relative group">
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
                onToggleMobileSubmenu(index);
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
              aria-hidden="true"
            />
          </a>
        </div>

        <div className={`
          lg:absolute lg:top-full lg:left-0 lg:mt-2 lg:w-60 lg:bg-white lg:rounded-xl lg:shadow-xl lg:border lg:border-gray-100 lg:py-2
          lg:invisible lg:opacity-0 lg:translate-y-2 lg:group-hover:visible lg:group-hover:opacity-100 lg:group-hover:translate-y-0 lg:transition-all lg:duration-200
          ${mobileSubmenu === index ? 'block bg-gray-50 rounded-xl mt-2 p-2 mb-4' : 'hidden lg:block'}
        `}>
          <div className="hidden lg:block absolute -top-1.5 left-6 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100" aria-hidden="true"></div>
          <ul className="relative z-10">
            {item.submenu.map((subItem) => (
              <li key={subItem.name}>
                <a 
                  href={subItem.href}
                  className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-amazon-50 hover:text-amazon-700 transition-colors rounded-lg mx-1"
                  onClick={onCloseMenu}
                >
                  {subItem.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </li>
    );
  }

  return (
    <li>
      <a 
        href={item.href} 
        className={`block py-2 px-3 rounded lg:p-0 relative transition-colors font-semibold
          ${isOpen ? 'text-amazon-900 text-lg border-b border-gray-100 pb-3 mb-2' : finalTextColor}
          lg:hover:text-earth-400 lg:px-3 lg:py-2
        `}
        onClick={onCloseMenu}
      >
        {item.name}
      </a>
    </li>
  );
});

MenuItem.displayName = 'MenuItem';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  // ✅ SEGURIDAD: Detectar y prevenir XSS en parámetros URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const suspiciousParams = ['<script', 'javascript:', 'onerror=', 'onclick='];
    
    for (const [key, value] of urlParams.entries()) {
      const lowerValue = value.toLowerCase();
      if (suspiciousParams.some(param => lowerValue.includes(param))) {
        console.warn('🚨 Posible ataque XSS detectado en URL');
        window.location.href = '/';
        return;
      }
    }
  }, []);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const changeLang = useCallback((langCode) => {
    const validLangCodes = LANGUAGES.map(l => l.code);
    
    if (!validLangCodes.includes(langCode)) {
      console.warn('🚨 Código de idioma inválido detectado');
      return;
    }

    if (typeof window.doGTranslate === 'function') {
      window.doGTranslate(`es|${langCode}`);
      setIsOpen(false);
      setIsLangMenuOpen(false);
    } else {
      console.warn("Google Translate script not loaded yet");
    }
  }, []);

  const toggleMobileSubmenu = useCallback((index) => {
    setMobileSubmenu(prev => prev === index ? null : index);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleLangMenu = useCallback(() => {
    setIsLangMenuOpen(prev => !prev);
  }, []);

  const toggleMainMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const navStyles = useMemo(() => ({
    navBg: isScrolled 
      ? 'bg-white/95 backdrop-blur-md shadow-md py-2' 
      : 'bg-transparent py-1',
    textColor: isScrolled ? 'text-amazon-900' : 'text-white',
  }), [isScrolled]);

  const finalTextColor = isOpen ? 'text-amazon-900' : navStyles.textColor;
  const burgerColor = isOpen ? 'text-amazon-800' : navStyles.textColor;

  const logoStyles = useMemo(() => {
    const baseClasses = 'w-auto object-contain transition-all duration-500';
    const sizeClasses = isScrolled ? 'h-16 md:h-20' : 'h-20 md:h-28';
    const filterClasses = (isScrolled || isOpen) 
      ? '' 
      : 'brightness-0 invert drop-shadow-[0_0_8px_rgba(74,222,128,1)]';
    
    return `${baseClasses} ${sizeClasses} ${filterClasses}`;
  }, [isScrolled, isOpen]);

  return (
    <nav 
      className={`fixed w-full z-50 top-0 start-0 transition-all duration-300 ${navStyles.navBg}`}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between">
          
          {/* LOGOTIPO */}
          <a 
            href="/" 
            className="flex items-center gap-2 group z-50 relative"
            aria-label="FORAMA - Ir al inicio"
          >
            <img 
              src="/imags/material_navbar/logo_FORAMA.svg" 
              alt="FORAMA Logo" 
              className={logoStyles}
              loading="eager"
              width="120"
              height="80"
            />
          </a>
          
          {/* BOTONES DERECHA */}
          <div className="flex lg:order-2 gap-2 z-50 relative items-center">
            
            {/* Menú de Idioma con texto "Traducir" */}
            <LanguageMenu 
              isOpen={isLangMenuOpen}
              onToggle={toggleLangMenu}
              onChangeLang={changeLang}
              burgerColor={burgerColor}
            />

            {/* Botón Donar Desktop */}
            <a 
              href="/como-apoyar" 
              className={`
                hidden sm:flex items-center gap-2 font-bold rounded-full text-xs px-5 py-2 transition-all transform hover:scale-105 shadow-lg
                ${isScrolled 
                  ? 'bg-amazon-600 text-white hover:bg-amazon-700 shadow-amazon-600/20' 
                  : 'bg-white text-amazon-900 hover:bg-gray-100 shadow-black/20'}
              `}
              aria-label="Hacer una donación"
            >
              <Heart 
                size={16} 
                className={isScrolled ? 'text-white' : 'text-red-500'} 
                fill="currentColor"
                aria-hidden="true"
              />
              <span>Donar</span>
            </a>
            
            {/* Botón Hamburguesa */}
            <button 
              onClick={toggleMainMenu}
              type="button" 
              className={`inline-flex items-center p-2 w-10 h-10 justify-center rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-amazon-500 transition-colors ${burgerColor}`}
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>

          {/* MENÚ PRINCIPAL */}
          <div 
            id="mobile-menu"
            className={`items-center justify-between w-full lg:flex lg:w-auto lg:order-1 
              ${isOpen ? 'absolute top-0 left-0 w-full h-screen bg-white overflow-y-auto flex flex-col pt-24 pb-10 shadow-xl' : 'hidden'}
            `}
          >
            <ul className={`
              flex flex-col font-medium p-4 lg:p-0 mt-4 lg:space-x-1 rtl:space-x-reverse lg:flex-row lg:mt-0 lg:border-0 
              ${isOpen ? 'space-y-1 text-left w-full px-6' : 'text-[14px] xl:text-[15px]'} 
            `}>
              {MENU_ITEMS.map((item, index) => (
                <MenuItem
                  key={item.name}
                  item={item}
                  index={index}
                  isOpen={isOpen}
                  finalTextColor={finalTextColor}
                  mobileSubmenu={mobileSubmenu}
                  onToggleMobileSubmenu={toggleMobileSubmenu}
                  onCloseMenu={closeMenu}
                />
              ))}
              
              {/* Botón Donar Móvil */}
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
                      focus:outline-none focus:ring-2 focus:ring-emerald-400
                    "
                    onClick={closeMenu}
                    aria-label="Hacer una donación"
                  >
                    <span className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" aria-hidden="true" />
                    <span className="
                      absolute -top-10 -right-12 h-28 w-28 rounded-full
                      bg-white/15 blur-2xl
                      transition-all duration-700 ease-out
                      group-hover:translate-x-[-10px] group-hover:translate-y-[10px] group-hover:bg-white/25
                    " aria-hidden="true" />
                    <span className="
                      absolute -bottom-10 -left-12 h-28 w-28 rounded-full
                      bg-emerald-300/20 blur-2xl
                      transition-all duration-700 ease-out
                      group-hover:translate-x-[10px] group-hover:translate-y-[-10px] group-hover:bg-emerald-200/30
                    " aria-hidden="true" />
                    <span className="
                      absolute inset-0
                      -translate-x-[130%] skew-x-[-18deg]
                      bg-gradient-to-r from-transparent via-white/25 to-transparent
                      transition-transform duration-700 ease-out
                      group-hover:translate-x-[130%]
                    " aria-hidden="true" />
                    <span className="absolute inset-0 rounded-2xl ring-1 ring-white/15 group-hover:ring-white/25 transition duration-500" aria-hidden="true" />
                    <span className="relative z-10 inline-flex items-center gap-2">
                      <Heart
                        size={20}
                        className="
                          text-red-300
                          transition-all duration-500
                          group-hover:text-white group-hover:scale-110
                        "
                        fill="currentColor"
                        aria-hidden="true"
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
            </ul>
          </div>

        </div>
      </div>
    </nav>
  );
}