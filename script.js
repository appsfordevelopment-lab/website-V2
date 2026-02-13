/* ===========================
   TYME BOXED — Main JavaScript
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== Navbar scroll effect =====
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // ===== Mobile menu toggle =====
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }


  // ===== Scroll Reveal — Mave-style (subtle, slow) =====
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }


  // ===== FAQ Accordion =====
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const inner = item.querySelector('.faq-answer-inner');

    if (question && answer && inner) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all
        faqItems.forEach(i => {
          i.classList.remove('open');
          const a = i.querySelector('.faq-answer');
          if (a) a.style.maxHeight = '0';
          const q = i.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });

        // Open clicked if it was closed
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = inner.scrollHeight + 'px';
          question.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });


  // ===== Smooth scroll for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  // ===== Science Page — Sticky Sidebar Scroll Tracking =====
  const scienceSidebar = document.getElementById('scienceSidebar');
  if (scienceSidebar) {
    const sidebarLinks = scienceSidebar.querySelectorAll('a[data-target]');
    const scienceSections = [];

    sidebarLinks.forEach(link => {
      const section = document.getElementById(link.dataset.target);
      if (section) scienceSections.push({ link, section });
    });

    const updateActiveSection = () => {
      const scrollY = window.scrollY + 200;

      let activeSection = scienceSections[0];
      scienceSections.forEach(item => {
        if (scrollY >= item.section.offsetTop) {
          activeSection = item;
        }
      });

      sidebarLinks.forEach(l => l.classList.remove('active'));
      if (activeSection) activeSection.link.classList.add('active');
    };

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    updateActiveSection();

    // Smooth scroll for sidebar links
    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(link.dataset.target);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }


  // ===== Quiz Page — Scoring & Step Management =====
  const quizSlides = document.querySelectorAll('.quiz-slide');
  const quizResult = document.getElementById('quizResult');
  const quizTransition = document.getElementById('quizTransition');
  const progressFill = document.getElementById('quizProgressFill');
  const progressText = document.getElementById('quizProgressText');
  const totalSteps = 4;

  if (quizSlides.length > 0) {
    let currentStep = 1;
    let answeredSteps = new Set();
    let totalScore = 0;

    // Scoring tiers
    const scoreTiers = {
      high: { mood: '+77%', focus: '+75%', sleep: '+70%', productivity: '+63%', label: 'High PFC Fatigue', subtext: 'Based on your answers, your Prefrontal Cortex is in a high-reactive state — constantly overloaded by micro-decisions and dopamine-driven interruptions. Tyme Boxed was built for exactly this.' },
      moderate: { mood: '+45%', focus: '+50%', sleep: '+40%', productivity: '+35%', label: 'Moderate PFC Fatigue', subtext: 'Your focus patterns show moderate digital fatigue. You\'re aware of the problem — and that awareness is the first step. Tyme Boxed can help you turn that awareness into lasting change.' },
      low: { mood: '+15%', focus: '+20%', sleep: '+15%', productivity: '+15%', label: 'Mild PFC Fatigue', subtext: 'You\'re doing better than most, but even mild digital friction adds up over time. Tyme Boxed can help protect the focus you already have and reclaim the pockets of time you didn\'t know you were losing.' }
    };

    // Option selection
    document.querySelectorAll('.quiz-options').forEach(optionsGroup => {
      const options = optionsGroup.querySelectorAll('.quiz-option');
      const isMulti = optionsGroup.dataset.multi === 'true';

      options.forEach(option => {
        option.addEventListener('click', () => {
          if (isMulti) {
            option.classList.toggle('selected');
          } else {
            options.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
          }

          // Enable/disable next button
          const slide = option.closest('.quiz-slide');
          const stepNum = parseInt(slide.dataset.step);
          const nextBtn = document.getElementById(`quizNext${stepNum}`);
          const hasSelection = slide.querySelectorAll('.quiz-option.selected').length > 0;

          if (nextBtn) {
            nextBtn.classList.toggle('enabled', hasSelection);
          }
        });
      });
    });

    // Next button handlers
    for (let i = 1; i <= totalSteps; i++) {
      const btn = document.getElementById(`quizNext${i}`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (!btn.classList.contains('enabled')) return;

          // Collect points from selected options in this step
          const step = document.getElementById(`quizStep${i}`);
          const selectedOptions = step.querySelectorAll('.quiz-option.selected');
          selectedOptions.forEach(opt => {
            const points = parseInt(opt.dataset.points) || 0;
            totalScore += points;
          });

          answeredSteps.add(i);

          if (i < totalSteps) {
            goToStep(i + 1);
          } else {
            showTransition();
          }
        });
      }
    }

    function goToStep(stepNum) {
      currentStep = stepNum;

      // Hide all slides
      quizSlides.forEach(s => s.classList.remove('active'));

      // Show target slide
      const targetSlide = document.getElementById(`quizStep${stepNum}`);
      if (targetSlide) {
        targetSlide.classList.add('active');
      }

      updateProgress();
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }

    function showTransition() {
      // Hide all slides and progress
      quizSlides.forEach(s => s.classList.remove('active'));
      const progress = document.getElementById('quizProgress');
      if (progress) progress.style.display = 'none';

      // Show science transition
      if (quizTransition) {
        quizTransition.classList.add('active');
      }

      // After loading animation, show results
      setTimeout(() => {
        if (quizTransition) quizTransition.classList.remove('active');
        quizTransition.style.display = 'none';
        showResult();
      }, 2800);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showResult() {
      // Determine tier
      let tier;
      if (totalScore > 40) tier = scoreTiers.high;
      else if (totalScore >= 20) tier = scoreTiers.moderate;
      else tier = scoreTiers.low;

      // Inject stats
      const moodEl = document.querySelector('[data-stat="mood"]');
      const focusEl = document.querySelector('[data-stat="focus"]');
      const sleepEl = document.querySelector('[data-stat="sleep"]');
      const prodEl = document.querySelector('[data-stat="productivity"]');
      if (moodEl) moodEl.textContent = tier.mood;
      if (focusEl) focusEl.textContent = tier.focus;
      if (sleepEl) sleepEl.textContent = tier.sleep;
      if (prodEl) prodEl.textContent = tier.productivity;

      // Update headline and subtext
      const resultLabel = document.getElementById('resultLabel');
      const resultSubtext = document.getElementById('resultSubtext');
      if (resultLabel) resultLabel.textContent = tier.label;
      if (resultSubtext) resultSubtext.textContent = tier.subtext;

      // Show result
      if (quizResult) {
        quizResult.classList.add('active');
        // Widen container for split layout
        const container = document.querySelector('.quiz-container');
        if (container) container.classList.add('results-active');
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateProgress() {
      const answered = answeredSteps.size;
      const pct = (answered / totalSteps) * 100;

      if (progressFill) progressFill.style.width = pct + '%';
      if (progressText) progressText.textContent = `${answered}/${totalSteps} questions answered`;
    }

    // Email submit handler
    const emailSubmit = document.getElementById('quizEmailSubmit');
    const emailInput = document.getElementById('quizEmail');
    if (emailSubmit && emailInput) {
      emailSubmit.addEventListener('click', () => {
        const email = emailInput.value.trim();
        if (email && email.includes('@')) {
          emailSubmit.textContent = '✓ You\'re on the list!';
          emailSubmit.style.background = '#4A9E6E';
          emailSubmit.style.color = '#fff';
          emailSubmit.disabled = true;
          emailInput.disabled = true;
        } else {
          emailInput.style.borderColor = '#C45C5C';
          emailInput.placeholder = 'Please enter a valid email';
        }
      });
    }

    // Re-take quiz handler
    const retakeBtn = document.getElementById('quizRetake');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        // Reset state
        totalScore = 0;
        currentStep = 1;
        answeredSteps.clear();

        // Deselect all options and disable all next buttons
        document.querySelectorAll('.quiz-option.selected').forEach(o => o.classList.remove('selected'));
        for (let i = 1; i <= totalSteps; i++) {
          const btn = document.getElementById(`quizNext${i}`);
          if (btn) btn.classList.remove('enabled');
        }

        // Reset email form
        if (emailInput) {
          emailInput.value = '';
          emailInput.disabled = false;
          emailInput.style.borderColor = '';
          emailInput.placeholder = 'Your email address';
        }
        if (emailSubmit) {
          emailSubmit.textContent = 'Get Early Access';
          emailSubmit.style.background = '';
          emailSubmit.style.color = '';
          emailSubmit.disabled = false;
        }

        // Hide result, show progress and first step
        if (quizResult) quizResult.classList.remove('active');
        // Reset container width
        const container = document.querySelector('.quiz-container');
        if (container) container.classList.remove('results-active');
        if (quizTransition) {
          quizTransition.classList.remove('active');
          quizTransition.style.display = '';
        }
        const progress = document.getElementById('quizProgress');
        if (progress) progress.style.display = '';
        if (progressFill) progressFill.style.width = '0%';
        if (progressText) progressText.textContent = `0/${totalSteps} questions answered`;

        // Show step 1
        quizSlides.forEach(s => s.classList.remove('active'));
        const step1 = document.getElementById('quizStep1');
        if (step1) step1.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

});
