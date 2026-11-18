import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import './Skills.scss'

import SectionLayout from '../Layouts/SectionLayout';
import MaskText from '../common/MaskText/MaskText';
import { useLanguage } from '../../i18n/LanguageContext';

const content = {
    groups: [
        {
            key: 'frontend',
            items: ['HTML', 'CSS', 'Sass', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Astro']
        },
        {
            key: 'backend',
            items: ['Node.js']
        },
        {
            key: 'database',
            items: ['PostgreSQL', 'MongoDB']
        },
        {
            key: 'tools',
            items: ['Docker', 'Claude Code']
        }
    ]
}

/** スキル一覧セクション。カテゴリごとにスキルをチップ表示する */
function Skills() {
  const { t } = useLanguage();

  gsap.registerPlugin(ScrollTrigger as gsap.GSAPConfig)
  useGSAP(()=>{
    const skillsSect = document.querySelector('.skillsSect');
    const skillsWrapper = skillsSect?.querySelector('.wrapper');
    const linesArr = skillsSect?.querySelectorAll('.line');

    linesArr?.forEach(line => {
      const lineTl = gsap.timeline({
        scrollTrigger: {
              trigger: skillsWrapper,
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
    <SectionLayout bgClass='bg-[#273036]' className='z-0 skillsSect relative pc:pt-[300px] pt-[100px] text-white'>
        <div className='wrapper relative'>
          <div className='line'/>
          <div className='line'/>
          <div className='line'/>
          <div className='line'/>
          <img className='skillsFlower skillsFlower--corner absolute pointer-events-none pc:right-[-20px] right-[-10px] pc:bottom-[-30px] bottom-[-12px] z-10 pc:w-[200px] w-[100px]' src='/flowers/corner-flower-decoration.svg' alt='' aria-hidden='true' width='200' height='153'/>
          <h2>
            <MaskText seperate heading={t.skills.title} className='pc:text-8xl text-2xl font-bold'/>
          </h2>
          <div className='skillsList pc:mt-20 mt-10'>
            {content.groups.map((group) => (
              <div key={group.key} className='skillsRow pc:grid pc:grid-cols-[220px_1fr] pc:gap-8 py-6'>
                <h3 className='pc:text-xl text-sm tracking-widest uppercase opacity-60 mb-3 pc:mb-0 pc:pt-3'>{t.skills.groups[group.key as keyof typeof t.skills.groups]}</h3>
                <ul className='flex flex-wrap pc:gap-3 gap-2'>
                  {group.items.map((item) => (
                    <li key={item} className='skillChip pc:text-2xl text-sm pc:px-6 px-4 pc:py-2 py-1.5 rounded-full'>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
    </SectionLayout>
  );
}

export default Skills;
