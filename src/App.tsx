import './App.scss';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import Projects from './components/Projects/Projects';
import Skills from './components/Skills/Skills';
import PageLayout from './components/Layouts/PageLayout';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';



/** 言語切替時に key で作り直し、GSAP のアニメーションを新しいテキストに結び直す */
function Content() {
  const { lang } = useLanguage();
  return (
    <PageLayout>
        <Header/>
        <div key={lang}>
          <Hero/>
          <About/>
          <Skills/>
          <Projects/>
          <Footer/>
        </div>
    </PageLayout>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Content/>
    </LanguageProvider>
  );
}

export default App;
