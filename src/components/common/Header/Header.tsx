import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';

function Header() {
    const { lang, setLang, t } = useLanguage();
    const [rotation, setRotation] = useState(0);
    const flowerRef = useRef<HTMLImageElement>(null)
    const navRef = useRef<HTMLDivElement>(null)
    const [scrollTop, setScrollTop] = useState(0);
    
    gsap.registerPlugin(ScrollTrigger as gsap.GSAPConfig)
    useEffect(() => {
        const onScroll = (e : any)=> {
          setScrollTop(e.target.documentElement.scrollTop);
        };

        window.addEventListener("scroll", onScroll);
        setRotation(scrollTop%360);
        return () => window.removeEventListener("scroll", onScroll);
      }, [scrollTop]);


  return (
   <nav ref={navRef} className='nav w-screen fixed left-0 top-0 z-50 pc:h-[70px] h-[50px] pc:pl-5 pl-3 duration-300 mix-blend-difference '>
    <h1 className='nav__logo italic text-white flex gap-4 items-center h-full'>
    <img ref={flowerRef} style={{ transform: `rotate(${rotation}deg)` }} id='mainflower' className='flower pc:w-10 w-8' src='/flowers/flower-with-6-petals.svg' alt='flower' width='57' height='57'/>
        K.O
    </h1>
    <div role='group' aria-label={t.nav.switchLabel} className='absolute right-3 pc:right-5 top-0 h-full flex items-center gap-2 text-white pc:text-base text-sm tracking-widest'>
      {(['en', 'ja'] as const).map((l, i) => (
        <span key={l} className='flex items-center gap-2'>
          {i > 0 && <span aria-hidden='true' className='opacity-40'>/</span>}
          <button type='button' lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}
            className={'uppercase duration-300 hover:opacity-100 ' + (lang === l ? 'opacity-100 underline underline-offset-4' : 'opacity-50')}>
            {l}
          </button>
        </span>
      ))}
    </div>
   </nav>
  );
}

export default Header;
