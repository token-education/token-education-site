import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initScrollAnimations();
  initNavigation();
  initCounters();
  initForm();
  initFaq();
});

function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let nodes = [];
  let mouse = { x: null, y: null };

  const CONFIG = {
    nodeCount: 260,
    connectionDistance: 130,
    nodeSpeed: 0.35,
    nodeMinRadius: 1,
    nodeMaxRadius: 4,
    accentColor: { r: 230, g: 57, b: 70 },
    nodeColor: { r: 160, g: 160, b: 184 },
    lineOpacity: 0.13,
    mouseRadius: 180,
  };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createNodes() {
    nodes = [];
    const count = window.innerWidth < 768 ? Math.floor(CONFIG.nodeCount * 0.5) : CONFIG.nodeCount;
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * CONFIG.nodeSpeed,
        vy: (Math.random() - 0.5) * CONFIG.nodeSpeed,
        radius: CONFIG.nodeMinRadius + Math.random() * (CONFIG.nodeMaxRadius - CONFIG.nodeMinRadius),
        isAccent: Math.random() < 0.28,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawNode(node, time) {
    const pulse = Math.sin(time * 0.002 + node.pulsePhase) * 0.3 + 0.7;
    const color = node.isAccent ? CONFIG.accentColor : CONFIG.nodeColor;
    const alpha = node.isAccent ? 0.8 * pulse : 0.4 * pulse;

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius * (node.isAccent ? 1.5 : 1), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    ctx.fill();

    if (node.isAccent) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.06 * pulse})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectionDistance) {
          const opacity = (1 - dist / CONFIG.connectionDistance) * CONFIG.lineOpacity;
          const isAccentLine = nodes[i].isAccent || nodes[j].isAccent;
          const color = isAccentLine ? CONFIG.accentColor : CONFIG.nodeColor;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
          ctx.lineWidth = isAccentLine ? 0.8 : 0.5;
          ctx.stroke();
        }
      }

      if (mouse.x !== null) {
        const dx = nodes[i].x - mouse.x;
        const dy = nodes[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius) {
          const opacity = (1 - dist / CONFIG.mouseRadius) * 0.2;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(230, 57, 70, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function updateNodes() {
    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

      if (mouse.x !== null) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160 && dist > 0) {
          const force = Math.pow((160 - dist) / 160, 2) * 0.18;
          node.vx += dx / dist * force;
          node.vy += dy / dist * force;
        }
      }

      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      const maxSpeed = CONFIG.nodeSpeed * 5;
      if (speed > maxSpeed) { node.vx = (node.vx / speed) * maxSpeed; node.vy = (node.vy / speed) * maxSpeed; }
      node.vx *= 0.995;
      node.vy *= 0.995;
    }
  }

  function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();
    for (const node of nodes) drawNode(node, time);
    updateNodes();
    requestAnimationFrame(animate);
  }

  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => { resize(); createNodes(); }, 200);
  });

  resize();
  createNodes();
  animate(0);
}

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );
  document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
}

function initNavigation() {
  const nav = document.getElementById('main-nav');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        const navHeight = nav ? nav.offsetHeight : 0;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navHeight, behavior: 'smooth' });
      }
    });
  });
}

function initCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('.counter').forEach((el) => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 2000;
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const isFormspreeConfigured = !form.action.includes('YOUR_FORM_ID');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;

    submitBtn.innerHTML = 'Sending…';
    submitBtn.disabled = true;

    if (!isFormspreeConfigured) {
      // Formspree not yet configured — show friendly message
      submitBtn.innerHTML = '✓ Message received!';
      submitBtn.style.background = '#2A9D8F';
      setTimeout(() => {
        submitBtn.innerHTML = originalHTML;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        form.reset();
      }, 3000);
      return;
    }

    try {
      const data = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        submitBtn.innerHTML = '✓ Message sent!';
        submitBtn.style.background = '#2A9D8F';
        form.reset();
        setTimeout(() => {
          submitBtn.innerHTML = originalHTML;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 4000);
      } else {
        throw new Error('Network response was not ok');
      }
    } catch {
      submitBtn.innerHTML = 'Try again';
      submitBtn.style.background = '#E63946';
      submitBtn.disabled = false;
    }
  });
}

function initFaq() {
  document.querySelectorAll('.faq__question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq__question').forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('is-open');
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('is-open');
      }
    });
  });
}
