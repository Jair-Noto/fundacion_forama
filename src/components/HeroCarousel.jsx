import React, { useState, useEffect } from 'react';

const slides = [
    { titulo: "Fundación Flora Amazónica", subtitulo: "(FORAMA)", url: null },
    { titulo: "Conoce nuestra historia", subtitulo: "Quiénes Somos", url: "/quienes-somos" },
    { titulo: "Acción integral", subtitulo: "Qué Hacemos", url: "/que-hacemos" },
    { titulo: "Impacto real", subtitulo: "Programas y Proyectos", url: "/programas" },
    { titulo: "Cuentas claras", subtitulo: "Transparencia", url: "/transparencia" },
    { titulo: "Súmate a la causa", subtitulo: "Cómo Apoyar", url: "/como-apoyar" },
    { titulo: "Mantente informado", subtitulo: "Noticias y Publicaciones", url: "/noticias" },
    { titulo: "Hablemos", subtitulo: "Contacto", url: "/contacto" }
];

export default function HeroCarousel() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        // 1. Lógica del Carrusel (Cambio de slides)
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, 4500); 

        // =========================================================
        // 2. PARCHE DE TRADUCCIÓN PARA REACT
        // =========================================================
        // Esto soluciona que el carrusel vuelva a español al regresar al Home.
        try {
            const savedLang = localStorage.getItem('forama_lang');
            
            // Si el usuario quiere Inglés o Portugués...
            if (savedLang && savedLang !== 'es') {
                // Esperamos un poquito (300ms) a que React termine de "pintar" el texto en Español
                setTimeout(() => {
                    const teCombo = document.querySelector('.goog-te-combo');
                    if (teCombo) {
                        // Le gritamos a Google: "¡Traduce esto otra vez!"
                        teCombo.value = savedLang;
                        teCombo.dispatchEvent(new Event('change'));
                    }
                }, 300);
            }
        } catch (e) { console.error(e); }

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[250px] relative z-20 w-full">
            
            {/* CONTENEDOR DE SLIDES (Todos existen, solo 1 es visible) */}
            <div className="relative w-full h-[250px] flex items-center justify-center">
                {slides.map((slide, i) => (
                    <div 
                        key={i}
                        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 transform ${
                            i === index 
                                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                                : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                        }`}
                    >
                        {slide.url ? (
                            <a href={slide.url} className="group cursor-pointer block text-center">
                                {/* TÍTULO */}
                                <h1 className="text-aurora-gradient text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight pb-2">
                                    {slide.titulo}
                                </h1>
                                {/* SUBTÍTULO */}
                                <span className="block mt-4 text-2xl md:text-4xl font-bold text-white group-hover:text-green-300 transition-colors drop-shadow-md">
                                    {slide.subtitulo}
                                </span>
                                {/* BOTÓN */}
                                <div className="mt-8 text-sm font-bold uppercase tracking-widest text-white bg-white/20 inline-block px-6 py-2.5 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/30 hover:scale-105 transition-all shadow-lg">
                                    Ir a la página →
                                </div>
                            </a>
                        ) : (
                            <div className="text-center">
                                <h1 className="text-aurora-gradient text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight pb-2">
                                    {slide.titulo}
                                </h1>
                                <span className="block mt-4 text-2xl md:text-4xl font-bold text-white drop-shadow-md">
                                    {slide.subtitulo}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {/* INDICADORES */}
            <div className="flex gap-2 mt-8 z-30">
                {slides.map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => setIndex(i)}
                        className={`h-2 rounded-full transition-all duration-500 shadow-sm ${
                            i === index ? 'w-8 bg-green-400' : 'w-2 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Ir al slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}