/* ==========================================================================
   L'ÉTOILE DORÉE — main.js v2
   ========================================================================== */

/* ── 1. PRELOADER ─────────────────────────────────────────────────────────── */
(function initPreloader() {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  window.addEventListener('load', () => {
    setTimeout(() => pre.classList.add('hidden'), 900);
  });
  // Fallback: hide after 3s regardless
  setTimeout(() => pre && pre.classList.add('hidden'), 3000);
})();

/* ── 2. NAVBAR ────────────────────────────────────────────────────────────── */
(function initNavbar() {
  const header   = document.getElementById('siteHeader');
  const hamburger = document.getElementById('hamburger');
  const overlay  = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!header) return;

  // Sticky shrink — only affects hero (light-nav pages are always solid)
  window.addEventListener('scroll', () => {
    if (!header.classList.contains('light-nav')) {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }
    // back-to-top
    const btn = document.getElementById('backTop');
    if (btn) btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      overlay.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close on mobile link click
    mobileLinks.forEach(l => l.addEventListener('click', () => {
      hamburger.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }));
    // Close on overlay bg click
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        hamburger.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        hamburger.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
})();

/* ── 3. SPA NAVIGATION ────────────────────────────────────────────────────── */
(function initNavigation() {
  const views   = document.querySelectorAll('.page-view');
  const navLinks = document.querySelectorAll('[data-target]');

  // Pages with light cream bg — navbar must be permanently solid + espresso text
  const LIGHT_PAGES = ['menu-page','gallery-page','about-page','contact-page','reservation-page'];

  function applyNavState(targetId) {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    if (LIGHT_PAGES.includes(targetId)) {
      header.classList.add('light-nav');
    } else {
      header.classList.remove('light-nav');
      // Back on hero — only keep .scrolled if user actually scrolled
      if (window.scrollY < 60) header.classList.remove('scrolled');
    }
  }

  function showPage(targetId) {
    views.forEach(v => v.classList.toggle('active-view', v.id === targetId));
    // Update active state on ALL nav triggers (links + buttons)
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.target === targetId));
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Reset scroll progress bar
    const bar = document.getElementById('scrollProgress');
    if (bar) bar.style.width = '0%';
    // Apply correct navbar appearance for this page type
    applyNavState(targetId);
    // Trigger scroll-reveal for the new page
    setTimeout(runReveals, 80);
    // Keep URL in sync
    history.replaceState(null, '', '#' + targetId);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.dataset.target;
      if (target) showPage(target);
    });
  });

  // Handle deep-link on load
  const hash = location.hash.replace('#', '');
  const validIds = Array.from(views).map(v => v.id);
  showPage(validIds.includes(hash) ? hash : 'home-page');
})();

/* ── 4. SCROLL PROGRESS ──────────────────────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  }, { passive: true });
})();

/* ── 5. REVEAL ANIMATIONS (IntersectionObserver) ─────────────────────────── */
function runReveals() {
  const els = document.querySelectorAll('[data-reveal]:not(.revealed)');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = el.dataset.delay || 0;
      setTimeout(() => el.classList.add('revealed'), +delay);
      obs.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}
document.addEventListener('DOMContentLoaded', runReveals);

/* ── 6. COUNTERS (about page, runs once) ─────────────────────────────────── */
(function initCounters() {
  let ran = false;
  function animateCounters() {
    if (ran) return;
    ran = true;
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = +el.dataset.count;
      const duration = 1800;
      const step = 16;
      const steps = duration / step;
      const inc = target / steps;
      let cur = 0;
      const t = setInterval(() => {
        cur += inc;
        if (cur >= target) { cur = target; clearInterval(t); }
        el.textContent = Math.round(cur) + (el.dataset.suffix || '');
      }, step);
    });
  }
  // Observe the about section
  const aboutSection = document.getElementById('about-page');
  if (!aboutSection) return;
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animateCounters(); io.disconnect(); }
  }, { threshold: 0.1 });
  io.observe(aboutSection);
})();

/* ── 7. MENU FILTER ──────────────────────────────────────────────────────── */
(function initMenuFilter() {
  const filters = document.querySelectorAll('.filter-btn');
  const cards   = document.querySelectorAll('.dish-card');
  if (!filters.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.category === cat;
        if (match) {
          card.style.display = '';
          requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = ''; });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { if (card.style.opacity === '0') card.style.display = 'none'; }, 350);
        }
      });
    });
  });
})();

/* ── 8. GALLERY LIGHTBOX ─────────────────────────────────────────────────── */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightboxImg');
  const lbClose  = document.getElementById('lightboxClose');
  const lbPrev   = document.getElementById('lightboxPrev');
  const lbNext   = document.getElementById('lightboxNext');
  if (!lightbox || !lbImg) return;

  const galleryItems = () => [...document.querySelectorAll('.gallery-item[data-src]')];
  let currentIndex = 0;

  function openLightbox(src, index) {
    currentIndex = index;
    lbImg.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 400);
  }
  function navigate(dir) {
    const items = galleryItems();
    currentIndex = (currentIndex + dir + items.length) % items.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = items[currentIndex].dataset.src;
      lbImg.style.opacity = '1';
    }, 200);
  }

  document.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item[data-src]');
    if (item) {
      const items = galleryItems();
      openLightbox(item.dataset.src, items.indexOf(item));
    }
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)  lbPrev.addEventListener('click', () => navigate(-1));
  if (lbNext)  lbNext.addEventListener('click', () => navigate(1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   navigate(-1);
    if (e.key === 'ArrowRight')  navigate(1);
  });

  lbImg.style.transition = 'opacity .2s';
})();

/* ── 9. RESERVATION FORM ─────────────────────────────────────────────────── */
(function initReservation() {
  const form = document.getElementById('reservationForm');
  if (!form) return;

  // Set min date to today
  const dateInput = document.getElementById('resDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-gold-full');
    const orig = btn.textContent;
    btn.textContent = 'Request Received — We\'ll Be in Touch';
    btn.style.background = '#2d5a27';
    btn.style.color = '#a8d4a3';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
      form.reset();
      if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    }, 4000);
  });
})();

/* ── 10. BACK TO TOP ─────────────────────────────────────────────────────── */
(function initBackTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── 11. NEWSLETTER ──────────────────────────────────────────────────────── */
(function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.newsletter-btn');
    btn.textContent = '✓';
    btn.style.background = '#2d5a27';
    setTimeout(() => {
      btn.textContent = '→';
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
})();

/* ── 12. STATS TICKER DUPLICATE ──────────────────────────────────────────── */
(function initTicker() {
  const track = document.querySelector('.stats-track');
  if (!track) return;
  // Clone for seamless loop
  const clone = track.cloneNode(true);
  track.parentNode.appendChild(clone);
})();

/* ── 13. PARALLAX HERO (subtle) ──────────────────────────────────────────── */
(function initParallax() {
  const heroBg = document.querySelector('.hero-fallback-img');
  if (!heroBg) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      heroBg.style.transform = `translateY(${y * 0.25}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();
