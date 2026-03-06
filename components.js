/* =============================================
   RIOMAR CORDAS – Shared Components
   Header & Footer injection
   ============================================= */

(function () {
  function init() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const navLinks = [
      { href: 'index.html', label: 'Home', id: 'nav-home' },
      { href: 'sobre.html', label: 'Sobre nós', id: 'nav-sobre' },
      { href: 'produtos.html', label: 'Produtos', id: 'nav-produtos', hasDropdown: true },
      { href: 'catalogo.html', label: 'Catálogo Virtual', id: 'nav-catalogo' },
      { href: 'cotacao.html', label: 'Cotação', id: 'nav-cotacao', isCotacao: true },
      { href: 'representantes.html', label: 'Representantes', id: 'nav-reps' },
      { href: 'trabalhe.html', label: 'Trabalhe Conosco', id: 'nav-trabalhe' },
      { href: 'contatos.html', label: 'Contatos', id: 'nav-contatos', isCta: true },
    ];

    const dropdownItems = [
      { href: 'expositores.html', label: 'Expositores', img: 'images/menu-thumbs/thumb-expositores.jpg' },
      { href: 'produto-tropical.html', label: 'Tropical', img: 'images/menu-thumbs/thumb-tropical.jpg' },
      { href: 'produto-meadas.html', label: 'Meadas', img: 'images/menu-thumbs/thumb-meadas.jpg' },
      { href: 'produto-torcida-branca.html', label: 'Torcida Branca', img: 'images/menu-thumbs/thumb-torcida-branca.jpg' },
      { href: 'produto-pe-azul.html', label: 'PE Azul', img: 'images/menu-thumbs/thumb-pe-azul.jpg' },
      { href: 'produto-pp-sinalizacao.html', label: 'PP Sinalização', img: 'images/menu-thumbs/thumb-pp-sinaliza--o.jpg' },
      { href: 'produto-trancada.html', label: 'Trançada', img: 'images/menu-thumbs/thumb-tran-ada.jpg' },
      { href: 'produto-trancada-branca.html', label: 'Trançada Branca', img: 'images/menu-thumbs/thumb-tran-ada-branca.jpg' },
      { href: 'produto-trancada-carga.html', label: 'Trançada Carga', img: 'images/menu-thumbs/thumb-tran-ada-carga.jpg' },
      { href: 'produto-trancada-chata.html', label: 'Trançada Chata', img: 'images/menu-thumbs/thumb-tran-ada-chata.jpg' },
      { href: 'produto-trancada-per.html', label: 'Trançada PER', img: 'images/menu-thumbs/thumb-tran-ada-per.jpg' },
      { href: 'produto-trancada-pet.html', label: 'Trançada PET', img: 'images/menu-thumbs/thumb-trancada-pet.jpg' },
      { href: 'distribuicao.html', label: 'Distribuição', img: 'images/menu-thumbs/thumb-distribuicao.jpg' },
    ];

    function isActive(href) {
      const page = href.split('#')[0];
      return page === currentPage || (currentPage === '' && page === 'index.html');
    }

    function buildNavItems() {
      return navLinks.map(link => {
        const active = isActive(link.href) ? ' active' : '';
        if (link.hasDropdown) {
          const items = dropdownItems.map(d =>
            `<a href="${d.href}" class="nav__dropdown-item">
               <span>${d.label}</span>
             </a>`
          ).join('');
          return `
          <div class="nav__dropdown" id="${link.id}">
            <button class="nav__link nav__link--dropdown${active}">
              ${link.label}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="nav__dropdown-menu">${items}</div>
          </div>`;
        }
        if (link.isCta) {
          return `<a href="${link.href}" class="nav__link nav__link--cta${active}" id="${link.id}">${link.label}</a>`;
        }
        if (link.isCotacao) {
          const count = (() => { try { const c = JSON.parse(localStorage.getItem('riomar_cotacao') || '[]'); return c.reduce((s, i) => s + (i.qty || 1), 0); } catch { return 0; } })();
          const badge = count > 0 ? `<span class="nav__cotacao-badge">${count}</span>` : '';
          return `<a href="${link.href}" class="nav__link nav__link--cotacao${active}" id="${link.id}" style="position:relative;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
            ${link.label}${badge}
          </a>`;
        }
        if (link.id === 'nav-home') return ''; // hide Home from desktop nav
        return `<a href="${link.href}" class="nav__link${active}" id="${link.id}">${link.label}</a>`;
      }).join('');
    }

    function buildMobileLinks() {
      return navLinks.map(link =>
        `<a href="${link.href}" class="mobile-nav__link${isActive(link.href) ? ' active' : ''}">${link.label}</a>`
      ).join('');
    }

    // ── INJECT TOPBAR + HEADER ────────────────────
    const headerHTML = `
  <div class="topbar" id="topbar">
    <div class="topbar__inner">
      <span class="topbar__phone">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>
        TELEVENDAS: <a href="tel:08007260909">0800-726-0909</a>
      </span>
      <a href="#" class="topbar__btn" id="btn-area-restrita">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Área Restrita
      </a>
    </div>
  </div>

  <header class="header" id="header">
    <div class="header__inner container">
      <a href="index.html" class="logo" id="logo-link">
        <img src="images/logo.png" alt="Riomar Cordas" class="logo__img">
      </a>
      <nav class="nav" id="nav">${buildNavItems()}</nav>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <div class="mobile-nav" id="mobile-nav">${buildMobileLinks()}</div>
  `;

    // ── INJECT FOOTER ─────────────────────────────
    const footerHTML = `
  <footer class="footer" id="footer">
    <div class="footer__top">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <a href="index.html" class="logo">
              <img src="images/logo.png" alt="Riomar Cordas" class="logo__img logo__img--footer">
            </a>
            <p>A Riomar vem constantemente ampliando sua participação no mercado nacional. Desde 1960, oferecemos cordas com alta qualidade e resistência.</p>
            <div class="footer__social">
              <a href="https://api.whatsapp.com/send?phone=554721039000" target="_blank" rel="noopener" class="footer__social-link" title="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
            </div>
          </div>
          <div class="footer__nav">
            <h4>Institucional</h4>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="sobre.html">Sobre nós</a></li>
              <li><a href="catalogo.html">Catálogo Virtual</a></li>
              <li><a href="representantes.html">Representantes</a></li>
              <li><a href="trabalhe.html">Trabalhe Conosco</a></li>
              <li><a href="#">Denúncias</a></li>
              <li><a href="contatos.html">Contatos</a></li>
            </ul>
          </div>
          <div class="footer__products">
            <h4>Produtos</h4>
            <ul>
              <li><a href="expositores.html">Expositores</a></li>
              <li><a href="produto-tropical.html">Tropical</a></li>
              <li><a href="produto-meadas.html">Meadas</a></li>
              <li><a href="produto-torcida-branca.html">Torcida Branca</a></li>
              <li><a href="produto-pe-azul.html">PE Azul</a></li>
              <li><a href="produto-pp-sinalizacao.html">PP Sinalização</a></li>
              <li><a href="produto-trancada.html">Trançada</a></li>
              <li><a href="produto-trancada-branca.html">Trançada Branca</a></li>
              <li><a href="produto-trancada-carga.html">Trançada Carga</a></li>
              <li><a href="produto-trancada-chata.html">Trançada Chata</a></li>
              <li><a href="produto-trancada-per.html">Trançada PER</a></li>
              <li><a href="produto-trancada-pet.html">Trançada PET</a></li>
              <li><a href="distribuicao.html">Distribuição</a></li>
            </ul>
          </div>
          <div class="footer__contact">
            <h4>Contato</h4>
            <p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>
              0800-726-0909
            </p>
            <p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              contato@riomarcordas.com.br
            </p>
            <p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Itajaí – Santa Catarina, Brasil
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <div class="container">
        <p>© 2025 Riomar Cordas. Todos os direitos reservados. | <a href="#">Denúncias</a> | <a href="#">Política de Privacidade</a></p>
        <button class="back-top" id="back-top" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="Voltar ao topo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
      </div>
    </div>
  </footer>

  <a href="https://api.whatsapp.com/send?phone=554721039000&text=Ol%C3%A1%2C%20estou%20entrando%20em%20contato%20atrav%C3%A9s%20do%20site%20www.riomarcordas.com.br." class="whatsapp-float" id="whatsapp-float" target="_blank" rel="noopener">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
    <span>Como podemos ajudar?</span>
  </a>
  `;

    // Insert header before body content
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    // Run after DOM injection
    requestAnimationFrame(() => {
      // Header scroll
      const header = document.getElementById('header');
      window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
      }, { passive: true });

      // Hamburger
      const hamburger = document.getElementById('hamburger');
      const mobileNav = document.getElementById('mobile-nav');
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileNav.classList.toggle('open');
      });
      mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('open');
          mobileNav.classList.remove('open');
        });
      });

      // ── DROPDOWN COM DELAY DE SAÍDA ───────────────
      // Garante que o menu não feche ao descer o mouse
      document.querySelectorAll('.nav__dropdown').forEach(dd => {
        let leaveTimer;

        const open = () => { clearTimeout(leaveTimer); dd.classList.add('open'); };
        const close = () => { leaveTimer = setTimeout(() => dd.classList.remove('open'), 150); };

        dd.addEventListener('mouseenter', open);
        dd.addEventListener('mouseleave', close);

        // Se o mouse entrar no menu-filho, cancela o fechar
        const menu = dd.querySelector('.nav__dropdown-menu');
        if (menu) {
          menu.addEventListener('mouseenter', () => clearTimeout(leaveTimer));
          menu.addEventListener('mouseleave', close);
        }
      });

      // Back to top
      const backTop = document.getElementById('back-top');
      if (backTop) {
        window.addEventListener('scroll', () => {
          backTop.style.opacity = window.scrollY > 400 ? '1' : '0.3';
        }, { passive: true });
      }

      // Animate on scroll
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    });
  } // end init()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
