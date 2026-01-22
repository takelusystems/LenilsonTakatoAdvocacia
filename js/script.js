
// Ocultar página do histórico do navegador
window.history.replaceState(null, '', window.location.href);

// Lazy loading para imagens
if ('IntersectionObserver' in window) {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });
  images.forEach(img => imageObserver.observe(img));
}

// Menu mobile responsivo
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('header nav');
  const navLinks = document.querySelectorAll('header nav a');
  
  // Abrir/fechar menu ao clicar no hamburger
  menuToggle.addEventListener('click', function() {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('active');
  });
  
  // Fechar menu ao clicar em um link e ocultar do histórico
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      menuToggle.classList.remove('active');
      nav.classList.remove('active');
      
      // Ocultar página do histórico do navegador
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        e.preventDefault();
        // Carregar a página com fetch e atualizar o DOM
        fetch(href)
          .then(response => response.text())
          .then(html => {
            document.documentElement.innerHTML = html;
            // Substituir no histórico em vez de adicionar
            window.history.replaceState(null, '', href);
            // Reinicializar scripts após carregar nova página
            location.reload();
          })
          .catch(error => {
            console.error('Erro ao carregar página:', error);
            window.location.href = href;
          });
      }
    });
  });

  // Melhorar performance do scroll
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        // Adicione efeitos de scroll aqui se necessário
        ticking = false;
      });
      ticking = true;
    }
  });

  // Marcar página ativa no menu
  const currentPage = window.location.pathname.split('/').pop().replace('.php', '') || 'index';
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href').replace('.php', '').replace('.html', '');
    if (linkHref.includes(currentPage) || (currentPage === '' && linkHref.includes('index'))) {
      link.classList.add('active');
    }
  });
});

// Smooth scroll para links âncora
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Validação básica de formulário (se houver)
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return true;
  
  const inputs = form.querySelectorAll('input[required], textarea[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      isValid = false;
    } else {
      input.classList.remove('error');
    }
  });
  
  return isValid;
}

// Preload de recursos críticos
function preloadResources() {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = 'img/logo-main.png';
  document.head.appendChild(link);
}

// Executar preload quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preloadResources);
} else {
  preloadResources();
}

// Service Worker para cache (opcional, melhor performance offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(
      function(registration) {
        console.log('ServiceWorker registered:', registration);
      },
      function(error) {
        console.log('ServiceWorker registration failed:', error);
      }
    );
  });
}

// Analitics e rastreamento (exemplo - adicione seu código)
function trackPageView(page) {
  if (window.gtag) {
    gtag('config', 'GA_MEASUREMENT_ID', {
      'page_path': page
    });
  }
}

// Detectar modo escuro do navegador
function setupDarkMode() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
  }
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (e.matches) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  });
}

// Inicializar ao carregar
setupDarkMode();

// Otimizar performance de animações
document.addEventListener('DOMContentLoaded', function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });
});

// Tentar extrair imagem OG das notícias (com fallback local se CORS bloquear)
function fetchOgImage(url) {
  return fetch(url, { mode: 'cors' })
    .then(resp => resp.text())
    .then(html => {
      const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]+name=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      if (ogMatch && ogMatch[1]) {
        let imgUrl = ogMatch[1];
        if (imgUrl.startsWith('//')) imgUrl = window.location.protocol + imgUrl;
        return imgUrl;
      }
      // fallback: try twitter:image
      const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
      return twMatch && twMatch[1] ? twMatch[1] : null;
    });
}

function setupNewsImages() {
  const items = document.querySelectorAll('.news-item');
  items.forEach(item => {
    const source = item.dataset.source;
    const img = item.querySelector('img.news-image');
    if (!source || !img) return;

    // Tenta buscar OG image; se falhar (CORS), mantém imagem local
    fetchOgImage(source).then(url => {
      if (url) img.src = url;
    }).catch(() => {
      // falha esperada por CORS; manter fallback local
    });
  });
}

document.addEventListener('DOMContentLoaded', setupNewsImages);
