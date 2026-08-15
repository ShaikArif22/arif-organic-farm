/**
 * ==========================================================================
 * ARIF ORGANIC FARM - MAIN JAVASCRIPT ENGINE
 * Pure Vanilla JavaScript implementation for multi-page interactivity.
 * Features: Mobile Nav, Sticky Header, Scroll Reveal, Stats Counter,
 * Cart Drawer & Badge, Product Filter & Search, Gallery Lightbox, Form Validation.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initStickyHeader();
  initBackToTop();
  initScrollReveal();
  initStatsCounters();
  initCartSystem();
  initProductFilterAndSearch();
  initGalleryLightbox();
  initContactFormValidation();
  initFaqAccordion();
});

/* ==========================================================================
   1. NAVIGATION & MOBILE MENU
   ========================================================================== */
function initNavigation() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Toggle mobile navigation menu
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = toggleBtn.classList.toggle('open');
      navMenu.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleBtn.classList.remove('open');
        navMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target) && navMenu.classList.contains('open')) {
        toggleBtn.classList.remove('open');
        navMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Active Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPath || (currentPath === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    } else if (linkHref !== currentPath) {
      link.classList.remove('active');
    }
  });
}

/* ==========================================================================
   2. STICKY HEADER & SCROLL BEHAVIOR
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   3. BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   4. SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (!revealElements.length) return;

  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   5. ANIMATED STATISTICS COUNTERS
   ========================================================================== */
function initStatsCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  let animated = false;
  const statsSection = document.querySelector('.stats-section');
  if (!statsSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
          const suffix = counter.getAttribute('data-suffix') || '';
          const duration = 2000; // 2 seconds
          const startTime = performance.now();

          const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOut * target);

            counter.textContent = currentVal.toLocaleString() + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              counter.textContent = target.toLocaleString() + suffix;
            }
          };

          requestAnimationFrame(updateCount);
        });
      }
    });
  }, { threshold: 0.25 });

  observer.observe(statsSection);
}

/* ==========================================================================
   6. SHOPPING CART SYSTEM & DRAWER
   ========================================================================== */
let cart = [];

function initCartSystem() {
  // Load existing cart from localStorage if available
  const savedCart = localStorage.getItem('arif_farm_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  }

  // Create Cart Drawer Markup dynamically if not already in HTML
  createCartDrawerMarkup();
  updateCartUI();

  // Attach event listeners for "Add to Cart" buttons
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (addBtn) {
      e.preventDefault();
      const productCard = addBtn.closest('.product-card') || addBtn.parentElement;
      const id = addBtn.getAttribute('data-id') || 'prod_' + Math.random().toString(36).substring(2, 7);
      const name = addBtn.getAttribute('data-name') || productCard.querySelector('.product-title')?.textContent.trim() || 'Organic Produce';
      const priceStr = addBtn.getAttribute('data-price') || productCard.querySelector('.product-price')?.textContent.replace(/[^0-9.]/g, '') || '120';
      const price = parseFloat(priceStr);
      const image = addBtn.getAttribute('data-img') || productCard.querySelector('.product-img-box img')?.getAttribute('src') || 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=300&q=80';
      const unit = addBtn.getAttribute('data-unit') || productCard.querySelector('.product-unit')?.textContent.trim() || '/ kg';

      addToCart({ id, name, price, image, unit });
    }
  });

  // Open/Close Cart Drawer Triggers
  const cartToggleBtns = document.querySelectorAll('.cart-toggle-btn');
  const drawerOverlay = document.querySelector('.cart-drawer-overlay');
  const drawer = document.querySelector('.cart-drawer');
  const closeCartBtn = document.querySelector('.cart-close-btn');

  cartToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  });

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', closeCartDrawer);
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeCartDrawer);
  }

  // Checkout button handler with premium Order Success modal
  document.addEventListener('click', (e) => {
    if (e.target.closest('.cart-checkout-btn')) {
      if (cart.length === 0) {
        showToast('Your cart is empty! Add some fresh farm produce first.');
        return;
      }
      const total = calculateCartTotal();
      const count = cart.reduce((a, b) => a + b.qty, 0);
      const orderId = 'AOF-' + Math.floor(10000 + Math.random() * 90000);
      
      // Clear cart
      cart = [];
      saveCart();
      updateCartUI();
      closeCartDrawer();
      
      // Show premium order confirmation modal
      showOrderSuccessModal(total, count, orderId);
    }
  });

  // Escape key closes cart and modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCartDrawer();
      closeOrderSuccessModal();
    }
  });
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id || item.name === product.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      unit: product.unit,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`🌿 Added "${product.name}" to your basket!`);
}

function updateCartQty(index, delta) {
  if (cart[index]) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
  }
}

function removeCartItem(index) {
  if (cart[index]) {
    const removedName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showToast(`Removed "${removedName}" from cart.`);
  }
}

function saveCart() {
  localStorage.setItem('arif_farm_cart', JSON.stringify(cart));
}

function calculateCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  
  // Update badge count in header
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.textContent = totalCount;
    b.style.display = totalCount > 0 ? 'flex' : 'none';
  });

  // Render items list inside Cart Drawer
  const itemsContainer = document.querySelector('.cart-items-list');
  const subtotalEl = document.querySelector('.cart-subtotal-val');
  
  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">🧺</div>
          <h4>Your basket is empty</h4>
          <p>Explore our fresh organic harvest and add nutritious vegetables and fruits!</p>
          <a href="products.html" class="btn btn-primary btn-sm" style="margin-top: 1rem;">Browse Products</a>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
          <div class="cart-item-img">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">₹${item.price} <span style="font-size:0.75rem; color:#888;">${item.unit}</span></div>
          </div>
          <div class="cart-item-actions">
            <button class="qty-btn" onclick="updateCartQty(${idx}, -1)" title="Decrease">-</button>
            <span class="qty-count">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty(${idx}, 1)" title="Increase">+</button>
            <span class="cart-remove-item" onclick="removeCartItem(${idx})" title="Remove">✕</span>
          </div>
        </div>
      `).join('');
    }
  }

  if (subtotalEl) {
    subtotalEl.textContent = `₹${calculateCartTotal().toLocaleString()}`;
  }
}

function openCartDrawer() {
  const overlay = document.querySelector('.cart-drawer-overlay');
  const drawer = document.querySelector('.cart-drawer');
  if (overlay && drawer) {
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const overlay = document.querySelector('.cart-drawer-overlay');
  const drawer = document.querySelector('.cart-drawer');
  if (overlay && drawer) {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function createCartDrawerMarkup() {
  if (document.querySelector('.cart-drawer')) return;

  const drawerHTML = `
    <div class="cart-drawer-overlay"></div>
    <div class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cartDrawerHeading">
      <div class="cart-drawer-header">
        <h3 id="cartDrawerHeading" class="cart-drawer-title">
          <span>🌿</span> Your Farm Basket
        </h3>
        <button class="cart-close-btn" aria-label="Close cart">&times;</button>
      </div>
      <div class="cart-items-list">
        <!-- Rendered dynamically -->
      </div>
      <div class="cart-drawer-footer">
        <div class="cart-subtotal-row">
          <span>Subtotal:</span>
          <span class="cart-subtotal-val">₹0</span>
        </div>
        <button class="btn btn-primary cart-checkout-btn">
          <span>Proceed to Checkout</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', drawerHTML);
}

// Global scope bindings for inline onclick attributes
window.updateCartQty = updateCartQty;
window.removeCartItem = removeCartItem;
window.closeOrderSuccessModal = closeOrderSuccessModal;

/* ==========================================================================
   6.5 ORDER SUCCESS MODAL
   ========================================================================== */
function showOrderSuccessModal(total, count, orderId) {
  let modal = document.querySelector('.order-modal-backdrop');
  if (!modal) {
    const modalHTML = `
      <div class="order-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="orderModalTitle">
        <div class="order-modal-card">
          <button class="order-modal-close-icon" onclick="closeOrderSuccessModal()" aria-label="Close">&times;</button>
          
          <div class="order-modal-icon">✓</div>
          
          <h2 id="orderModalTitle" class="order-modal-title">Order Placed Successfully!</h2>
          <p class="order-modal-subtitle">
            Thank you for supporting <strong>Arif Organic Farm</strong>. Your chemical-free morning harvest has been reserved.
          </p>
          
          <div class="order-summary-box">
            <div class="order-summary-row">
              <span class="label">Order Reference:</span>
              <span class="val order-modal-id">#${orderId}</span>
            </div>
            <div class="order-summary-row">
              <span class="label">Items Reserved:</span>
              <span class="val order-modal-count">${count} Produce Pack(s)</span>
            </div>
            <div class="order-summary-row">
              <span class="label">Total Amount Paid:</span>
              <span class="val order-modal-total" style="color: #1b4d2e; font-size: 1.15rem;">₹${total.toLocaleString()}</span>
            </div>
            <div class="order-summary-row" style="border-top: 1px dashed #d1fae5; padding-top: 0.5rem; margin-top: 0.2rem;">
              <span class="label">Estimated Delivery:</span>
              <span class="val" style="color: #d97706;">🌅 Tomorrow 6:00 AM – 9:00 AM</span>
            </div>
          </div>
          
          <button class="btn btn-primary order-modal-btn" onclick="closeOrderSuccessModal()">
            <span>Continue Shopping</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.querySelector('.order-modal-backdrop');

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeOrderSuccessModal();
      }
    });
  } else {
    modal.querySelector('.order-modal-id').textContent = '#' + orderId;
    modal.querySelector('.order-modal-count').textContent = count + ' Produce Pack(s)';
    modal.querySelector('.order-modal-total').textContent = '₹' + total.toLocaleString();
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOrderSuccessModal() {
  const modal = document.querySelector('.order-modal-backdrop');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   7. TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">✓</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOutRight 0.3s ease forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3200);
}

/* ==========================================================================
   8. PRODUCT FILTER & SEARCH ENGINE
   ========================================================================== */
function initProductFilterAndSearch() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.querySelector('#productSearch');
  const productCards = document.querySelectorAll('.products-grid .product-card');

  if (!productCards.length) return;

  let activeCategory = 'all';
  let searchQuery = '';

  function filterProducts() {
    let visibleCount = 0;

    productCards.forEach(card => {
      const category = card.getAttribute('data-category') || 'all';
      const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.product-desc')?.textContent.toLowerCase() || '';

      const matchesCat = (activeCategory === 'all' || category === activeCategory);
      const matchesSearch = (!searchQuery || title.includes(searchQuery) || desc.includes(searchQuery));

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Handle "no items found" message
    let noMatchMsg = document.querySelector('.no-products-msg');
    const grid = document.querySelector('.products-grid');

    if (visibleCount === 0) {
      if (!noMatchMsg && grid) {
        noMatchMsg = document.createElement('div');
        noMatchMsg.className = 'no-products-msg';
        noMatchMsg.style.gridColumn = '1 / -1';
        noMatchMsg.style.textAlign = 'center';
        noMatchMsg.style.padding = '3rem 1rem';
        noMatchMsg.innerHTML = `
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🌱</div>
          <h3>No matching organic produce found</h3>
          <p>Try searching for other fruits, vegetables, or clear your filters.</p>
        `;
        grid.appendChild(noMatchMsg);
      }
    } else if (noMatchMsg) {
      noMatchMsg.remove();
    }
  }

  // Category Tab Click
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      filterProducts();
    });
  });

  // Live Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterProducts();
    });
  }
}

/* ==========================================================================
   9. GALLERY LIGHTBOX & CATEGORY FILTER
   ========================================================================== */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  // Build Lightbox modal DOM if not present
  if (!document.querySelector('.lightbox-modal')) {
    const modalHTML = `
      <div class="lightbox-modal" role="dialog" aria-modal="true">
        <button class="lightbox-close-btn" title="Close (Esc)">&times;</button>
        <button class="lightbox-nav-btn lightbox-prev" title="Previous Image">&#10094;</button>
        <button class="lightbox-nav-btn lightbox-next" title="Next Image">&#10095;</button>
        <div class="lightbox-content">
          <img class="lightbox-img" src="" alt="Enlarged Farm Image">
          <div class="lightbox-caption"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  const modal = document.querySelector('.lightbox-modal');
  const modalImg = modal.querySelector('.lightbox-img');
  const modalCaption = modal.querySelector('.lightbox-caption');
  const closeBtn = modal.querySelector('.lightbox-close-btn');
  const prevBtn = modal.querySelector('.lightbox-prev');
  const nextBtn = modal.querySelector('.lightbox-next');

  let currentIdx = 0;
  const visibleImages = [];

  function updateVisibleList() {
    visibleImages.length = 0;
    galleryItems.forEach(item => {
      if (item.style.display !== 'none') {
        visibleImages.push(item);
      }
    });
  }

  function showLightbox(index) {
    updateVisibleList();
    if (index < 0) index = visibleImages.length - 1;
    if (index >= visibleImages.length) index = 0;
    currentIdx = index;

    const targetItem = visibleImages[currentIdx];
    if (!targetItem) return;

    const imgEl = targetItem.querySelector('img');
    const titleEl = targetItem.querySelector('.gallery-overlay-title');
    const catEl = targetItem.querySelector('.gallery-overlay-cat');

    const imgSrc = targetItem.getAttribute('data-full-img') || imgEl.src;
    const title = titleEl ? titleEl.textContent : imgEl.alt;
    const cat = catEl ? ` — ${catEl.textContent}` : '';

    modalImg.src = imgSrc;
    modalCaption.textContent = `${title}${cat}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      updateVisibleList();
      const idx = visibleImages.indexOf(item);
      showLightbox(idx >= 0 ? idx : 0);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => showLightbox(currentIdx - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showLightbox(currentIdx + 1));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightbox(currentIdx - 1);
    if (e.key === 'ArrowRight') showLightbox(currentIdx + 1);
  });

  // Gallery Category Filter Tabs
  const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
  if (galleryFilterBtns.length) {
    galleryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        galleryFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterVal = btn.getAttribute('data-filter') || 'all';

        galleryItems.forEach(item => {
          const itemCat = item.getAttribute('data-category') || 'all';
          if (filterVal === 'all' || itemCat === filterVal) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
}

/* ==========================================================================
   10. CONTACT FORM VALIDATION
   ========================================================================== */
function initContactFormValidation() {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  const nameInput = form.querySelector('#contactName');
  const emailInput = form.querySelector('#contactEmail');
  const phoneInput = form.querySelector('#contactPhone');
  const subjectInput = form.querySelector('#contactSubject');
  const messageInput = form.querySelector('#contactMessage');
  const successBanner = document.querySelector('.form-success-banner');

  const setError = (input, message) => {
    input.classList.add('is-invalid');
    const errorEl = document.querySelector(`#${input.id}Error`) || input.parentElement.querySelector('.form-error');
    if (errorEl) errorEl.textContent = message;
  };

  const clearError = (input) => {
    input.classList.remove('is-invalid');
    const errorEl = document.querySelector(`#${input.id}Error`) || input.parentElement.querySelector('.form-error');
    if (errorEl) errorEl.textContent = '';
  };

  // Realtime input listeners to clear errors on typing
  [nameInput, emailInput, phoneInput, subjectInput, messageInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => clearError(inp));
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
      setError(nameInput, 'Please enter your full name (at least 3 characters).');
      isValid = false;
    } else {
      clearError(nameInput);
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      setError(emailInput, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearError(emailInput);
    }

    // Validate Phone (optional but if filled, must be 10 digits)
    if (phoneInput && phoneInput.value.trim()) {
      const cleanPhone = phoneInput.value.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10) {
        setError(phoneInput, 'Please enter a valid 10-digit mobile number.');
        isValid = false;
      } else {
        clearError(phoneInput);
      }
    }

    // Validate Subject
    if (subjectInput && !subjectInput.value.trim()) {
      setError(subjectInput, 'Please select or enter a message subject.');
      isValid = false;
    } else if (subjectInput) {
      clearError(subjectInput);
    }

    // Validate Message
    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      setError(messageInput, 'Please provide more details in your message (min 10 characters).');
      isValid = false;
    } else {
      clearError(messageInput);
    }

    if (isValid) {
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Submitting...</span>`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();

        if (successBanner) {
          successBanner.classList.add('active');
          successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            successBanner.classList.remove('active');
          }, 6000);
        } else {
          showToast('🌱 Message sent successfully! Our farm team will respond within 24 hours.');
        }
      }, 1000);
    }
  });
}

/* ==========================================================================
   11. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other accordion items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });

        // Toggle current
        if (!isActive) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  });
}
