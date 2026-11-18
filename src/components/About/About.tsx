import { Fragment } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import './About.scss'


import SectionLayout from '../Layouts/SectionLayout';
import MaskText from '../common/MaskText/MaskText';
import { useLanguage } from '../../i18n/LanguageContext';

function About() {
  const { t, lang } = useLanguage();
  const texts = t.about;
 
  gsap.registerPlugin(ScrollTrigger as gsap.GSAPConfig)
  useGSAP(()=>{
    const aboutSect = document.querySelector('.aboutSect');

    const aboutWrapper = aboutSect?.querySelector('.wrapper');
    const linesArr = aboutSect?.querySelectorAll('.line');
  
    
    linesArr?.forEach(line => {
      const lineTl = gsap.timeline({
        scrollTrigger: {
              trigger: aboutWrapper,
              start: 'center bottom',
              end: 'center center',
              scrub: 1,
            }
      })
        lineTl.from(line, {
          scale: 0,
          ease: 'ease-in'
        })
    })
  })
   
   
  return (
    <SectionLayout  bgClass='bg-slate-100'  className='z-0 aboutSect relative pc:pt-[300px] pt-[100px] text-black' >
        <div className='wrapper relative'>
          <div className='line'/>
          <div className='line'/>
          <div className='line'/>
          <div className='line'/>
          <div className='w-full'>
          </div>
          <img className='cornerFlower brightness-0 scale-x-[-1] absolute pc:left-[-20px] left-[-10px] pc:bottom-[-30px] bottom-[-12px] z-10 pc:w-[200px] w-[100px]' src='/flowers/corner-flower-decoration.svg' alt='flower' width='200' height='153'/>
          <h2>
          <MaskText seperate={true} heading={texts.title} className='pc:text-9xl text-3xl font-bold'/>
          </h2>
          <p className={'pc:text-8xl text-2xl  mt-7 ' + (lang === 'ja' ? '[word-break:keep-all] [overflow-wrap:anywhere]' : '')}>
            {texts.segments.map((seg, i) => (
              seg === 'br' ? <br key={i}/> : <Fragment key={i}>
              {lang === 'ja' && <wbr/>}
              {seg.bold
                ? <MaskText heading={seg.text} className='pc:text-8xl text-2xl font-semibold'/>
                : seg.text && <span className='opacity-40'>{seg.text}</span>}
              </Fragment>
            ))}
          </p>
        </div>
    </SectionLayout>
  );
}

export default About;
