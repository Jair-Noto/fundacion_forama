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
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex((prevIndex) => (prevIndex + 1) % slides.length);
                setFade(true);
            }, 500);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const current = slides[index];

    return (
        <div className="flex flex-col items-center justify-center min-h-[250px] relative z-20">
            {/* ENVOLTORIO CON TRANSICIÓN */}
            <div 
                className={`transition-all duration-700 transform ${
                    fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
            >
                {current.url ? (
                    <a href={current.url} className="group cursor-pointer block text-center">
                        
                        {/* TÍTULO CON EFECTO AURORA */}
                        <h1 className="text-aurora-gradient text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight pb-2">
                            {current.titulo}
                        </h1>

                        {/* SUBTÍTULO */}
                        <span className="block mt-4 text-2xl md:text-4xl font-bold text-white group-hover:text-green-300 transition-colors drop-shadow-md">
                            {current.subtitulo}
                        </span>

                        {/* BOTÓN CTA - SIEMPRE VISIBLE */}
                        {/* Eliminé 'opacity-0' y 'group-hover:opacity-100' */}
                        <div className="mt-8 text-sm font-bold uppercase tracking-widest text-white bg-white/20 inline-block px-6 py-2.5 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/30 hover:scale-105 transition-all shadow-lg">
                            Ir a la página →
                        </div>
                    </a>
                ) : (
                    <div className="text-center">
                        <h1 className="text-aurora-gradient text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight pb-2">
                            {current.titulo}
                        </h1>
                        
                        <span className="block mt-4 text-2xl md:text-4xl font-bold text-white drop-shadow-md">
                            {current.subtitulo}
                        </span>
                    </div>
                )}
            </div>
            
            {/* INDICADORES */}
            <div className="flex gap-2 mt-10">
                {slides.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-2 rounded-full transition-all duration-500 shadow-sm ${
                            i === index ? 'w-8 bg-green-400' : 'w-2 bg-white/30 hover:bg-white/50'
                        }`}
                    ></div>
                ))}
            </div>
        </div>
    );
}