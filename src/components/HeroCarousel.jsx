import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ✅ OPTIMIZACIÓN 1: Datos estáticos fuera del componente
// Evita recrear el array en cada render
const SLIDES = [
  { id: 'home', titulo: "Fundación Flora Amazónica", subtitulo: "(FORAMA)", url: null },
  { id: 'quienes', titulo: "Conoce nuestra historia", subtitulo: "Quiénes Somos", url: "/quienes-somos" },
  { id: 'que', titulo: "Acción integral", subtitulo: "Qué Hacemos", url: "/que-hacemos" },
  { id: 'programas', titulo: "Impacto real", subtitulo: "Programas y Proyectos", url: "/programas" },
  { id: 'transparencia', titulo: "Nuestro equipo", subtitulo: "Organigrama institucional", url: "/equipo" },
  { id: 'apoyar', titulo: "Súmate a la causa", subtitulo: "Cómo Apoyar", url: "/como-apoyar" },
  { id: 'noticias', titulo: "Mantente informado", subtitulo: "Noticias y Publicaciones", url: "/noticias" },
  { id: 'contacto', titulo: "Hablemos", subtitulo: "Contacto", url: "/contacto" }
];

// ✅ OPTIMIZACIÓN 2: Constantes de configuración
const CAROUSEL_INTERVAL = 4500;
const TRANSLATION_DELAY = 300;

// ✅ OPTIMIZACIÓN 3: Componente separado para cada slide
// Permite mejor memoización y reduce re-renders
const Slide = React.memo(({ slide, isActive }) => {
  // ✅ OPTIMIZACIÓN 4: Clases calculadas con useMemo
  const slideClasses = useMemo(() => {
    return `absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 transform ${
      isActive 
        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
        : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
    }`;
  }, [isActive]);

  if (slide.url) {
    return (
      <div className={slideClasses}>
        <a 
          href={slide.url} 
          className="group cursor-pointer block text-center"
          aria-label={`Ir a ${slide.subtitulo}`}
        >
          {/* TÍTULO */}
          <h1 className="text-aurora-gradient text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight pb-2">
            {slide.titulo}
          </h1>
          
          {/* SUBTÍTULO */}
          <span className="block mt-4 text-2xl md:text-4xl font-bold text-white group-hover:text-green-300 transition-colors drop-shadow-md">
            {slide.subtitulo}
          </span>
          
          {/* BOTÓN */}
          <div className="mt-8 text-sm font-bold uppercase tracking-widest text-white bg-white/20 inline-block px-6 py-2.5 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/30 hover:scale-105 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400">
            Ir a la página →
          </div>
        </a>
      </div>
    );
  }

  return (
    <div className={slideClasses}>
      <div className="text-center">
        <h1 className="text-aurora-gradient text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight pb-2">
          {slide.titulo}
        </h1>
        <span className="block mt-4 text-2xl md:text-4xl font-bold text-white drop-shadow-md">
          {slide.subtitulo}
        </span>
      </div>
    </div>
  );
});

Slide.displayName = 'Slide';

// ✅ OPTIMIZACIÓN 5: Componente separado para indicadores
const CarouselIndicators = React.memo(({ count, activeIndex, onSelectSlide }) => {
  return (
    <div className="flex gap-2 mt-8 z-30" role="tablist" aria-label="Slides del carrusel">
      {Array.from({ length: count }, (_, i) => (
        <button 
          key={i} 
          onClick={() => onSelectSlide(i)}
          className={`h-2 rounded-full transition-all duration-500 shadow-sm ${
            i === activeIndex ? 'w-8 bg-green-400' : 'w-2 bg-white/30 hover:bg-white/50'
          }`}
          aria-label={`Ir al slide ${i + 1}`}
          aria-selected={i === activeIndex}
          role="tab"
        />
      ))}
    </div>
  );
});

CarouselIndicators.displayName = 'CarouselIndicators';

// ✅ OPTIMIZACIÓN 6: Custom hook para manejar la lógica de traducción
function useTranslationFix() {
  useEffect(() => {
    // ✅ OPTIMIZACIÓN 7: Usar try-catch más específico
    const savedLang = localStorage.getItem('forama_lang');
    
    if (savedLang && savedLang !== 'es') {
      const timeoutId = setTimeout(() => {
        const teCombo = document.querySelector('.goog-te-combo');
        if (teCombo) {
          teCombo.value = savedLang;
          teCombo.dispatchEvent(new Event('change'));
        }
      }, TRANSLATION_DELAY);

      return () => clearTimeout(timeoutId);
    }
  }, []);
}

// ✅ OPTIMIZACIÓN 8: Custom hook para el carrusel automático
function useAutoCarousel(totalSlides, interval = CAROUSEL_INTERVAL) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, interval);

    return () => clearInterval(intervalId);
  }, [totalSlides, interval]);

  // ✅ OPTIMIZACIÓN 9: useCallback para evitar recrear la función
  const goToSlide = useCallback((slideIndex) => {
    setIndex(slideIndex);
  }, []);

  return [index, goToSlide];
}

// ✅ OPTIMIZACIÓN 10: Componente principal simplificado
export default function HeroCarousel() {
  const [currentIndex, goToSlide] = useAutoCarousel(SLIDES.length);
  useTranslationFix();

  return (
    <section 
      className="flex flex-col items-center justify-center min-h-[250px] relative z-20 w-full"
      aria-label="Carrusel de presentación"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* CONTENEDOR DE SLIDES */}
      <div className="relative w-full h-[250px] flex items-center justify-center">
        {SLIDES.map((slide, i) => (
          <Slide 
            key={slide.id}
            slide={slide}
            isActive={i === currentIndex}
          />
        ))}
      </div>
      
      {/* INDICADORES */}
      <CarouselIndicators 
        count={SLIDES.length}
        activeIndex={currentIndex}
        onSelectSlide={goToSlide}
      />
    </section>
  );
}