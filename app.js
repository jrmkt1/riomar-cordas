/* =============================================
   RIOMAR CORDAS – app.js
   Page-specific behaviors (hero slider, counters)
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── POSICIONAMENTO PRECISO (hero tabs + whatsapp bottom) ──
  let whatsappBottomSet = false; // garante que só calcula 1x

  function positionHeroElements() {
    const hero = document.querySelector('.hero');
    const tabs = document.querySelector('.hero__tabs');
    const whatsapp = document.getElementById('whatsapp-float');

    // ── Hero tabs: topo alinhado ao topo do título ativo ────────────
    if (hero && tabs) {
      const activeSlide = hero.querySelector('.hero__slide.active') || hero.querySelector('.hero__slide');
      const title = activeSlide?.querySelector('.hero__title');
      if (title) {
        const heroRect = hero.getBoundingClientRect();
        const titleRect = title.getBoundingClientRect();
        tabs.style.top = Math.max(0, titleRect.top - heroRect.top) + 'px';
      }
    }

    // ── WhatsApp bottom: calcula UMA VEZ quando hero está no topo ───
    // right é gerenciado pelo CSS (fórmula do container), nunca pelo JS
    if (whatsapp && hero && window.innerWidth >= 768 && !whatsappBottomSet) {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY < 50) {                       // só quando perto do topo
        const actions = hero.querySelector('.hero__actions');
        if (actions) {
          const actionsRect = actions.getBoundingClientRect();
          const bottomOffset = window.innerHeight - actionsRect.bottom;
          if (bottomOffset > 0 && bottomOffset < window.innerHeight * 0.8) {
            whatsapp.style.bottom = bottomOffset + 'px';
            whatsappBottomSet = true;           // trava: nunca mais recalcula
          }
        }
      }
    }
  }

  // Calcula na carga inicial com delay para fontes/layout prontos
  setTimeout(positionHeroElements, 200);

  // Recalcula no resize (reseta o lock para readaptar proporcional)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    whatsappBottomSet = false; // permite recalcular na nova largura
    resizeTimer = setTimeout(positionHeroElements, 120);
  }, { passive: true });

  // ── HERO SLIDER (index only) ──────────────────
  const slides = document.querySelectorAll('.hero__slide');
  const dots = document.querySelectorAll('.hero__dot');

  if (slides.length > 0) {
    let current = 0;
    let timer;

    const goTo = (idx) => {
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');

      // Re-trigger animations
      slides[current].querySelectorAll('.hero__tag, .hero__title, .hero__desc, .hero__actions').forEach(el => {
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = '';
      });

      // Reposiciona tabs e WhatsApp após animação do título
      setTimeout(positionHeroElements, 750);
    };

    const restart = () => { clearInterval(timer); timer = setInterval(() => goTo(current + 1), 5500); };

    dots.forEach(dot => {
      dot.addEventListener('click', () => { goTo(+dot.dataset.slide); restart(); });
    });

    restart();
  }

  // ── ANIMATED COUNTERS ─────────────────────────
  const counterEls = document.querySelectorAll('.stat-card__number[data-target]');

  const animateCounter = (el) => {
    const target = +el.dataset.target;
    const step = target / (2000 / 16);
    let current = 0;
    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString('pt-BR');
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counterEls.length) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => counterObs.observe(el));
  }

  // ── SCROLL ANIMATIONS (all pages) ─────────────
  const scrollObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${(i % 4) * 0.1}s`;
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(
    '.animate-on-scroll, .feature-card, .product-card, .stat-card, .info-card, .timeline__item'
  ).forEach(el => {
    el.classList.add('animate-on-scroll');
    scrollObs.observe(el);
  });

  // ── PRODUCT PAGE QUICK-NAV ACTIVE ─────────────
  const quickNav = document.getElementById('quick-nav');
  if (quickNav) {
    const sections = document.querySelectorAll('.product-detail-card[id]');
    const navLinks = quickNav.querySelectorAll('a');

    const secObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => secObs.observe(s));
  }

  console.log('🪢 Riomar Cordas carregado com sucesso!');
});
