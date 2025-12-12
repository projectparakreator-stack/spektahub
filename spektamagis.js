// Website Analytics Tracking System
const analytics = {
    // Initialize analytics data
    init: function() {
        // Check if visitor ID exists in cookies
        let visitorId = this.getCookie('visitor_id');
        let isNewVisitor = false;
        
        // If no visitor ID, create one
        if (!visitorId) {
            visitorId = this.generateVisitorId();
            this.setCookie('visitor_id', visitorId, 365);
            isNewVisitor = true;
        }
        
        // Get or create analytics data from localStorage
        let analyticsData = localStorage.getItem('spektamagis_analytics');
        if (!analyticsData) {
            analyticsData = {
                totalVisits: 0,
                uniqueVisitors: 0,
                returningVisitors: 0,
                pageViews: {},
                visitHistory: [],
                sessionStart: new Date().toISOString()
            };
        } else {
            analyticsData = JSON.parse(analyticsData);
        }
        
        // Update visit data
        analyticsData.totalVisits++;
        
        if (isNewVisitor) {
            analyticsData.uniqueVisitors++;
        } else {
            analyticsData.returningVisitors++;
        }
        
        // Track current page view
        const currentPage = window.location.hash || '#ticket';
        if (!analyticsData.pageViews[currentPage]) {
            analyticsData.pageViews[currentPage] = 0;
        }
        analyticsData.pageViews[currentPage]++;
        
        // Add to visit history
        analyticsData.visitHistory.push({
            date: new Date().toLocaleDateString('id-ID'),
            time: new Date().toLocaleTimeString('id-ID'),
            isNewVisitor: isNewVisitor,
            page: currentPage,
            sessionId: visitorId
        });
        
        // Keep only last 100 visits to avoid storage issues
        if (analyticsData.visitHistory.length > 100) {
            analyticsData.visitHistory = analyticsData.visitHistory.slice(-100);
        }
        
        // Save updated data
        localStorage.setItem('spektamagis_analytics', JSON.stringify(analyticsData));
        
        // Update visitor counter display
        this.updateVisitorCounter(analyticsData.totalVisits);
        
        // Track page views on navigation
        this.trackPageViews();
        
        // Track session time
        this.trackSessionTime();
        
        return analyticsData;
    },
    
    // Generate a unique visitor ID
    generateVisitorId: function() {
        return 'visitor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },
    
    // Cookie helper functions
    setCookie: function(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    },
    
    getCookie: function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    // Update visitor counter display
    updateVisitorCounter: function(totalVisits) {
        const counter = document.getElementById('visitor-count');
        if (counter) {
            counter.textContent = totalVisits.toLocaleString('id-ID');
        }
    },
    
    // Track page views when user navigates
    trackPageViews: function() {
        const sections = document.querySelectorAll('section[id]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = '#' + entry.target.id;
                    this.trackPageView(sectionId);
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    },
    
    // Track individual page view
    trackPageView: function(page) {
        let analyticsData = localStorage.getItem('spektamagis_analytics');
        if (analyticsData) {
            analyticsData = JSON.parse(analyticsData);
            
            if (!analyticsData.pageViews[page]) {
                analyticsData.pageViews[page] = 0;
            }
            analyticsData.pageViews[page]++;
            
            localStorage.setItem('spektamagis_analytics', JSON.stringify(analyticsData));
        }
    },
    
    // Track session time
    trackSessionTime: function() {
        const sessionStart = new Date();
        
        window.addEventListener('beforeunload', () => {
            const sessionEnd = new Date();
            const sessionDuration = Math.floor((sessionEnd - sessionStart) / 1000); // in seconds
            
            let analyticsData = localStorage.getItem('spektamagis_analytics');
            if (analyticsData) {
                analyticsData = JSON.parse(analyticsData);
                
                // Update the last visit with session duration
                if (analyticsData.visitHistory.length > 0) {
                    analyticsData.visitHistory[analyticsData.visitHistory.length - 1].sessionDuration = sessionDuration;
                }
                
                localStorage.setItem('spektamagis_analytics', JSON.stringify(analyticsData));
            }
        });
    },
    
    // Get analytics data for dashboard
    getAnalyticsData: function() {
        const analyticsData = localStorage.getItem('spektamagis_analytics');
        if (!analyticsData) {
            return null;
        }
        
        const data = JSON.parse(analyticsData);
        
        // Calculate average session time
        let totalSessionTime = 0;
        let sessionsWithDuration = 0;
        
        data.visitHistory.forEach(visit => {
            if (visit.sessionDuration) {
                totalSessionTime += visit.sessionDuration;
                sessionsWithDuration++;
            }
        });
        
        const avgSessionTime = sessionsWithDuration > 0 ? Math.floor(totalSessionTime / sessionsWithDuration) : 0;
        
        // Format average session time
        let formattedTime = '';
        if (avgSessionTime < 60) {
            formattedTime = avgSessionTime + 's';
        } else if (avgSessionTime < 3600) {
            formattedTime = Math.floor(avgSessionTime / 60) + 'm ' + (avgSessionTime % 60) + 's';
        } else {
            const hours = Math.floor(avgSessionTime / 3600);
            const minutes = Math.floor((avgSessionTime % 3600) / 60);
            formattedTime = hours + 'j ' + minutes + 'm';
        }
        
        return {
            ...data,
            avgSessionTime: formattedTime,
            avgSessionTimeSeconds: avgSessionTime
        };
    },
    
    // Export analytics data
    exportData: function() {
        const data = this.getAnalyticsData();
        if (!data) return;
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'spektamagis_analytics_' + new Date().toISOString().slice(0, 10) + '.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    },
    
    // Reset analytics data
    resetData: function() {
        if (confirm('Apakah Anda yakin ingin mereset semua data analitik? Tindakan ini tidak dapat dibatalkan.')) {
            localStorage.removeItem('spektamagis_analytics');
            this.setCookie('visitor_id', '', -1); // Delete visitor cookie
            location.reload();
        }
    }
};

// Script untuk Countdown Timer
const countDownDate = new Date("Feb 6, 2026 19:00:00").getTime();

const countdownFunction = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById("days").innerText = days.toString().padStart(2, '0');
    document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
    
    if (distance < 0) {
        clearInterval(countdownFunction);
        document.getElementById("countdown").innerHTML = "EVENT SUDAH DIMULAI!";
    }
}, 1000);

// Script untuk Slideshow Gallery
let slideIndex = 1;
showSlide(slideIndex);

function changeSlide(n) {
    showSlide(slideIndex += n);
}

function currentSlide(n) {
    showSlide(slideIndex = n);
}

function showSlide(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}

// Script untuk Merchandise Slider & Shopping Cart
document.addEventListener('DOMContentLoaded', function () {
    const merchWrapper = document.querySelector('.merch-slider-wrapper');
    const prevBtn = document.getElementById('merchPrevBtn');
    const nextBtn = document.getElementById('merchNextBtn');
    
    function scrollSlider(direction) {
        const scrollAmount = merchWrapper.clientWidth;
        if (direction === 'next') {
            merchWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else {
            merchWrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    }

    prevBtn.addEventListener('click', () => scrollSlider('prev'));
    nextBtn.addEventListener('click', () => scrollSlider('next'));
});

// Shopping Cart Functionality
let cart = [];

function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${productName} ditambahkan ke keranjang!`);
}

function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCart();
}

function updateQuantity(productName, change) {
    const item = cart.find(item => item.name === productName);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productName);
        } else {
            updateCart();
        }
    }
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    cartItems.innerHTML = '';
    
    let totalItems = 0;
    let totalPrice = 0;
    
    cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Rp ${item.price.toLocaleString('id-ID')}</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateQuantity('${item.name}', -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity('${item.name}', 1)">+</button>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.name}')">&times;</button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    
    localStorage.setItem('spektamagisCart', JSON.stringify(cart));
}

function openCart() {
    document.getElementById('cart-modal').style.display = 'block';
}

function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Keranjang belanja Anda kosong!');
        return;
    }
    
    let message = 'Halo, saya ingin memesan merchandise Spektamagis:\n\n';
    let totalPrice = 0;
    
    cart.forEach(item => {
        message += `${item.name} x ${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
        totalPrice += item.price * item.quantity;
    });
    
    message += `\nTotal: Rp ${totalPrice.toLocaleString('id-ID')}`;
    
    const phoneNumber = '+62-813-1608-8558';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

window.addEventListener('load', function() {
    const savedCart = localStorage.getItem('spektamagisCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
    
    // Initialize analytics
    analytics.init();
});

window.onclick = function(event) {
    const cartModal = document.getElementById('cart-modal');
    if (event.target === cartModal) {
        closeCart();
    }
}

// Script untuk Theme Toggle
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle-checkbox');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        if (currentTheme === 'dark') {
            themeToggle.checked = true;
        }
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.checked = true;
        }
    }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
});

// Script untuk About Toggle
function toggleAbout() {
    const aboutSection = document.getElementById('about');
    const toggleBtn = document.getElementById('aboutToggleBtn');
    const toggleText = document.getElementById('aboutToggleText');
    
    if (aboutSection.classList.contains('show')) {
        aboutSection.classList.remove('show');
        toggleBtn.classList.remove('show-less');
        toggleText.textContent = 'Tampilkan About';
    } else {
        aboutSection.classList.add('show');
        toggleBtn.classList.add('show-less');
        toggleText.textContent = 'Sembunyikan About';
    }
}

// Script untuk Navigasi yang Diperbaiki
function navigateToSection(sectionId, event) {
    // Mencegah perilaku default anchor link
    event.preventDefault();
    
    // Close mobile navigation if open
    closeMobileNav();
    
    // Hapus semua kelas active dari navigasi
    const navLinks = document.querySelectorAll('nav a, .mobile-nav-links a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Tambahkan kelas active ke link yang diklik
    event.target.classList.add('active');
    
    // Jika yang diklik adalah About, pastikan panel About selalu ditampilkan
    if (sectionId === 'about') {
        const aboutSection = document.getElementById('about');
        const toggleBtn = document.getElementById('aboutToggleBtn');
        const toggleText = document.getElementById('aboutToggleText');
        
        // Selalu tampilkan About saat diklik dari navigasi
        if (!aboutSection.classList.contains('show')) {
            aboutSection.classList.add('show');
            toggleBtn.classList.add('show-less');
            toggleText.textContent = 'Sembunyikan About';
        }
    }
    
    // Scroll ke section yang dituju
    const section = document.getElementById(sectionId);
    if (section) {
        // Hitung posisi scroll yang tepat dengan memperhitungkan offset dari header
        const headerHeight = document.querySelector('header').offsetHeight;
        const navHeight = document.querySelector('nav').offsetHeight || 0;
        const sectionTop = section.offsetTop - headerHeight - navHeight;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// Fungsi untuk memperbarui navigasi aktif saat scroll
function updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section.panel');
    const navLinks = document.querySelectorAll('nav a, .mobile-nav-links a');
    
    let currentSection = '';
    const headerHeight = document.querySelector('header').offsetHeight;
    const navHeight = document.querySelector('nav').offsetHeight || 0;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - navHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Event listener untuk scroll
window.addEventListener('scroll', updateActiveNavOnScroll);

// Inisialisasi navigasi aktif saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    updateActiveNavOnScroll();
});

// Mobile Navigation Functions
function openMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-nav-overlay');
    
    mobileNav.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent body scroll when nav is open
}

function closeMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-nav-overlay');
    
    mobileNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore body scroll
}

// Event listeners for mobile navigation
document.addEventListener('DOMContentLoaded', function() {
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const closeMobileNavBtn = document.getElementById('close-mobile-nav');
    const overlay = document.getElementById('mobile-nav-overlay');
    
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', openMobileNav);
    }
    
    if (closeMobileNavBtn) {
        closeMobileNavBtn.addEventListener('click', closeMobileNav);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMobileNav);
    }
    
    // Close mobile nav when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileNav();
        }
    });
});

// Analytics Dashboard Functions
function openAnalytics() {
    const dashboard = document.getElementById('analytics-dashboard');
    dashboard.style.display = 'block';
    
    // Populate analytics data
    const data = analytics.getAnalyticsData();
    if (data) {
        document.getElementById('total-visits').textContent = data.totalVisits.toLocaleString('id-ID');
        document.getElementById('unique-visitors').textContent = data.uniqueVisitors.toLocaleString('id-ID');
        document.getElementById('returning-visitors').textContent = data.returningVisitors.toLocaleString('id-ID');
        document.getElementById('avg-session-time').textContent = data.avgSessionTime;
        
        // Populate page statistics
        const pageStats = document.getElementById('page-stats');
        pageStats.innerHTML = '';
        
        // Sort pages by views
        const sortedPages = Object.entries(data.pageViews).sort((a, b) => b[1] - a[1]);
        
        sortedPages.forEach(([page, views]) => {
            const percentage = ((views / data.totalVisits) * 100).toFixed(1);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${page}</td>
                <td>${views}</td>
                <td>${percentage}%</td>
            `;
            pageStats.appendChild(row);
        });
        
        // Populate visit history (show last 10)
        const visitHistory = document.getElementById('visit-history');
        visitHistory.innerHTML = '';
        
        const recentVisits = data.visitHistory.slice(-10).reverse();
        
        recentVisits.forEach(visit => {
            const row = document.createElement('tr');
            const visitType = visit.isNewVisitor ? 'Pengunjung Baru' : 'Pengunjung Kembali';
            const sessionTime = visit.sessionDuration ? 
                (visit.sessionDuration < 60 ? `${visit.sessionDuration}s` : 
                 `${Math.floor(visit.sessionDuration / 60)}m ${visit.sessionDuration % 60}s`) : 'N/A';
            
            row.innerHTML = `
                <td>${visit.date}</td>
                <td>${visit.time}</td>
                <td>${visitType}</td>
                <td>${sessionTime}</td>
            `;
            visitHistory.appendChild(row);
        });
    }
}

function closeAnalytics() {
    document.getElementById('analytics-dashboard').style.display = 'none';
}

function exportAnalytics() {
    analytics.exportData();
    showNotification('Data analitik berhasil diekspor!');
}

function resetAnalytics() {
    analytics.resetData();
}

// Keyboard shortcut to open analytics (Ctrl+Shift+A)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        openAnalytics();
    }
});

// Enhanced Image Loading for Kalawa Photo
function loadKalawaPhoto() {
    const container = document.getElementById('location-photo-container');
    const githubUrl = 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/kalawa.jpg';
    const fallbackUrl = 'https://picsum.photos/seed/kalawa/600/400.jpg';
    
    const img = new Image();
    
    img.onload = function() {
        container.innerHTML = `
            <img src="${githubUrl}" alt="Foto Kalawa Convention Hall" class="location-photo">
        `;
    };
    
    img.onerror = function() {
        container.innerHTML = `
            <div class="location-photo-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p><strong>Gagal memuat foto dari GitHub</strong></p>
                <p>Menggunakan foto cadangan...</p>
                <button onclick="loadFallbackPhoto()">Muat Foto Cadangan</button>
            </div>
        `;
    };
    
    img.src = githubUrl;
}

function loadFallbackPhoto() {
    const container = document.getElementById('location-photo-container');
    const fallbackUrl = 'https://picsum.photos/seed/kalawa/600/400.jpg';
    
    container.innerHTML = `
        <img src="${fallbackUrl}" alt="Foto Kalawa Convention Hall" class="location-photo">
    `;
}

// Initialize Kalawa photo loading when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure page is fully loaded
    setTimeout(loadKalawaPhoto, 500);
});

// Handle orientation change for mobile devices
window.addEventListener('orientationchange', function() {
    // Small delay to allow browser to complete orientation change
    setTimeout(function() {
        // Recalculate layout after orientation change
        updateActiveNavOnScroll();
        
        // Adjust slideshow if needed
        if (window.innerWidth < 768) {
            showSlide(slideIndex);
        }
    }, 200);
});

// Handle window resize
window.addEventListener('resize', function() {
    // Debounce resize event
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(function() {
        updateActiveNavOnScroll();
        
        // Adjust slideshow if needed
        if (window.innerWidth < 768) {
            showSlide(slideIndex);
        }
    }, 250);
});

// Mobile Touch Events Optimization
document.addEventListener('DOMContentLoaded', function() {
    // Add touch event listeners for better mobile interaction
    addTouchListeners();
});

function addTouchListeners() {
    // Slideshow touch events
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    // Touch events for slideshow
    let touchStartX = 0;
    let touchEndX = 0;
    
    const slideshowContainer = document.querySelector('.slideshow-container');
    
    slideshowContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    slideshowContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                changeSlide(-1); // Swipe left, show previous slide
            } else {
                changeSlide(1);  // Swipe right, show next slide
            }
        }
    }
    
    // Touch events for merch slider
    const merchWrapper = document.querySelector('.merch-slider-wrapper');
    
    let merchStartX = 0;
    let merchEndX = 0;
    
    merchWrapper.addEventListener('touchstart', function(e) {
        merchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    merchWrapper.addEventListener('touchmove', function(e) {
        merchEndX = e.touches[0].clientX;
        handleMerchScroll();
    }, { passive: true });
    
    merchWrapper.addEventListener('touchend', function(e) {
        merchEndX = e.changedTouches[0].clientX;
        handleMerchScroll();
    }, { passive: true });
    
    function handleMerchScroll() {
        const diff = merchStartX - merchEndX;
        const scrollAmount = merchWrapper.clientWidth;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                merchWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            } else {
                merchWrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        }
    }
    
    // Touch events for buttons
    const buttons = document.querySelectorAll('button, .add-to-cart-btn, .cta-button, .checkout-btn, .about-toggle-btn, .analytics-btn');
    
    buttons.forEach(button => {
        // Add touch events
        button.addEventListener('touchstart', function(e) {
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s';
        }, { passive: true });
        
        button.addEventListener('touchend', function(e) {
            // Remove visual feedback
            this.style.transform = 'scale(1)';
        }, { passive: true });
        
        // Handle both click and touch events
        button.addEventListener('click', function(e) {
            // Prevent default if touch event
            if (e.type === 'click' && e.detail === 0) {
                return;
            }
            
            // Get the original onclick function
            const originalOnClick = this.getAttribute('onclick');
            if (originalOnClick) {
                eval(originalOnClick);
            }
        });
        
        button.addEventListener('touchend', function(e) {
            // Trigger click event after touch ends
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                detail: 1 // Mark as touch event
            });
            this.dispatchEvent(clickEvent);
        });
    });
    
    // Touch events for navigation links
    const navLinks = document.querySelectorAll('nav a, .mobile-nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('touchstart', function(e) {
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s';
        }, { passive: true });
        
        link.addEventListener('touchend', function(e) {
            // Remove visual feedback
            this.style.transform = 'scale(1)';
        }, { passive: true });
        
        // Handle both click and touch events
        link.addEventListener('click', function(e) {
            // Prevent default if touch event
            if (e.type === 'click' && e.detail === 0) {
                return;
            }
            
            // Get the original onclick function
            const originalOnClick = this.getAttribute('onclick');
            if (originalOnClick) {
                eval(originalOnClick);
            }
        });
        
        link.addEventListener('touchend', function(e) {
            // Trigger click event after touch ends
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                detail: 1 // Mark as touch event
            });
            this.dispatchEvent(clickEvent);
        });
    });
}

// Fix for iOS Safari (Safari has issues with touch events)
document.addEventListener('DOMContentLoaded', function() {
    // Fix for iOS Safari
    if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
        document.addEventListener('touchstart', function() {}, { passive: false });
    }
});
// Website Analytics Tracking System
const analytics = {
    // Initialize analytics data
    init: function() {
        // Check if visitor ID exists in cookies
        let visitorId = this.getCookie('visitor_id');
        let isNewVisitor = false;
        
        // If no visitor ID, create one
        if (!visitorId) {
            visitorId = this.generateVisitorId();
            this.setCookie('visitor_id', visitorId, 365);
            isNewVisitor = true;
        }
        
        // Get or create analytics data from localStorage
        let analyticsData = localStorage.getItem('spektamagis_analytics');
        if (!analyticsData) {
            analyticsData = {
                totalVisits: 0,
                uniqueVisitors: 0,
                returningVisitors: 0,
                pageViews: {},
                visitHistory: [],
                sessionStart: new Date().toISOString()
            };
        } else {
            analyticsData = JSON.parse(analyticsData);
        }
        
        // Update visit data
        analyticsData.totalVisits++;
        
        if (isNewVisitor) {
            analyticsData.uniqueVisitors++;
        } else {
            analyticsData.returningVisitors++;
        }
        
        // Track current page view
        const currentPage = window.location.hash || '#ticket';
        if (!analyticsData.pageViews[currentPage]) {
            analyticsData.pageViews[currentPage] = 0;
        }
        analyticsData.pageViews[currentPage]++;
        
        // Add to visit history
        analyticsData.visitHistory.push({
            date: new Date().toLocaleDateString('id-ID'),
            time: new Date().toLocaleTimeString('id-ID'),
            isNewVisitor: isNewVisitor,
            page: currentPage,
            sessionId: visitorId
        });
        
        // Keep only last 100 visits to avoid storage issues
        if (analyticsData.visitHistory.length > 100) {
            analyticsData.visitHistory = analyticsData.visitHistory.slice(-100);
        }
        
        // Save updated data
        localStorage.setItem('spektamagis_analytics', JSON.stringify(analyticsData));
        
        // Update visitor counter display
        this.updateVisitorCounter(analyticsData.totalVisits);
        
        // Track page views on navigation
        this.trackPageViews();
        
        // Track session time
        this.trackSessionTime();
        
        return analyticsData;
    },
    
    // Generate a unique visitor ID
    generateVisitorId: function() {
        return 'visitor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },
    
    // Cookie helper functions
    setCookie: function(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    },
    
    getCookie: function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    // Update visitor counter display
    updateVisitorCounter: function(totalVisits) {
        const counter = document.getElementById('visitor-count');
        if (counter) {
            counter.textContent = totalVisits.toLocaleString('id-ID');
        }
    },
    
    // Track page views when user navigates
    trackPageViews: function() {
        const sections = document.querySelectorAll('section[id]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = '#' + entry.target.id;
                    this.trackPageView(sectionId);
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    },
    
    // Track individual page view
    trackPageView: function(page) {
        let analyticsData = localStorage.getItem('spektamagis_analytics');
        if (analyticsData) {
            analyticsData = JSON.parse(analyticsData);
            
            if (!analyticsData.pageViews[page]) {
                analyticsData.pageViews[page] = 0;
            }
            analyticsData.pageViews[page]++;
            
            localStorage.setItem('spektamagis_analytics', JSON.stringify(analyticsData));
        }
    },
    
    // Track session time
    trackSessionTime: function() {
        const sessionStart = new Date();
        
        window.addEventListener('beforeunload', () => {
            const sessionEnd = new Date();
            const sessionDuration = Math.floor((sessionEnd - sessionStart) / 1000); // in seconds
            
            let analyticsData = localStorage.getItem('spektamagis_analytics');
            if (analyticsData) {
                analyticsData = JSON.parse(analyticsData);
                
                // Update the last visit with session duration
                if (analyticsData.visitHistory.length > 0) {
                    analyticsData.visitHistory[analyticsData.visitHistory.length - 1].sessionDuration = sessionDuration;
                }
                
                localStorage.setItem('spektamagis_analytics', JSON.stringify(analyticsData));
            }
        });
    },
    
    // Get analytics data for dashboard
    getAnalyticsData: function() {
        const analyticsData = localStorage.getItem('spektamagis_analytics');
        if (!analyticsData) {
            return null;
        }
        
        const data = JSON.parse(analyticsData);
        
        // Calculate average session time
        let totalSessionTime = 0;
        let sessionsWithDuration = 0;
        
        data.visitHistory.forEach(visit => {
            if (visit.sessionDuration) {
                totalSessionTime += visit.sessionDuration;
                sessionsWithDuration++;
            }
        });
        
        const avgSessionTime = sessionsWithDuration > 0 ? Math.floor(totalSessionTime / sessionsWithDuration) : 0;
        
        // Format average session time
        let formattedTime = '';
        if (avgSessionTime < 60) {
            formattedTime = avgSessionTime + 's';
        } else if (avgSessionTime < 3600) {
            formattedTime = Math.floor(avgSessionTime / 60) + 'm ' + (avgSessionTime % 60) + 's';
        } else {
            const hours = Math.floor(avgSessionTime / 3600);
            const minutes = Math.floor((avgSessionTime % 3600) / 60);
            formattedTime = hours + 'j ' + minutes + 'm';
        }
        
        return {
            ...data,
            avgSessionTime: formattedTime,
            avgSessionTimeSeconds: avgSessionTime
        };
    },
    
    // Export analytics data
    exportData: function() {
        const data = this.getAnalyticsData();
        if (!data) return;
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'spektamagis_analytics_' + new Date().toISOString().slice(0, 10) + '.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    },
    
    // Reset analytics data
    resetData: function() {
        if (confirm('Apakah Anda yakin ingin mereset semua data analitik? Tindakan ini tidak dapat dibatalkan.')) {
            localStorage.removeItem('spektamagis_analytics');
            this.setCookie('visitor_id', '', -1); // Delete visitor cookie
            location.reload();
        }
    }
};

// Script untuk Countdown Timer
const countDownDate = new Date("Feb 6, 2026 19:00:00").getTime();

const countdownFunction = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById("days").innerText = days.toString().padStart(2, '0');
    document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
    
    if (distance < 0) {
        clearInterval(countdownFunction);
        document.getElementById("countdown").innerHTML = "EVENT SUDAH DIMULAI!";
    }
}, 1000);

// Script untuk Slideshow Gallery
let slideIndex = 1;
showSlide(slideIndex);

function changeSlide(n) {
    showSlide(slideIndex += n);
}

function currentSlide(n) {
    showSlide(slideIndex = n);
}

function showSlide(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}

// Script untuk Merchandise Slider & Shopping Cart
document.addEventListener('DOMContentLoaded', function () {
    const merchWrapper = document.querySelector('.merch-slider-wrapper');
    const prevBtn = document.getElementById('merchPrevBtn');
    const nextBtn = document.getElementById('merchNextBtn');
    
    function scrollSlider(direction) {
        const scrollAmount = merchWrapper.clientWidth;
        if (direction === 'next') {
            merchWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else {
            merchWrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    }

    prevBtn.addEventListener('click', () => scrollSlider('prev'));
    nextBtn.addEventListener('click', () => scrollSlider('next'));
});

// Shopping Cart Functionality
let cart = [];

function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${productName} ditambahkan ke keranjang!`);
}

function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCart();
}

function updateQuantity(productName, change) {
    const item = cart.find(item => item.name === productName);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productName);
        } else {
            updateCart();
        }
    }
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    cartItems.innerHTML = '';
    
    let totalItems = 0;
    let totalPrice = 0;
    
    cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Rp ${item.price.toLocaleString('id-ID')}</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateQuantity('${item.name}', -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity('${item.name}', 1)">+</button>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.name}')">&times;</button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    
    localStorage.setItem('spektamagisCart', JSON.stringify(cart));
}

function openCart() {
    document.getElementById('cart-modal').style.display = 'block';
}

function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Keranjang belanja Anda kosong!');
        return;
    }
    
    let message = 'Halo, saya ingin memesan merchandise Spektamagis:\n\n';
    let totalPrice = 0;
    
    cart.forEach(item => {
        message += `${item.name} x ${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
        totalPrice += item.price * item.quantity;
    });
    
    message += `\nTotal: Rp ${totalPrice.toLocaleString('id-ID')}`;
    
    const phoneNumber = '+62-813-1608-8558';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

window.addEventListener('load', function() {
    const savedCart = localStorage.getItem('spektamagisCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
    
    // Initialize analytics
    analytics.init();
});

window.onclick = function(event) {
    const cartModal = document.getElementById('cart-modal');
    if (event.target === cartModal) {
        closeCart();
    }
}

// Script untuk Theme Toggle
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle-checkbox');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        if (currentTheme === 'dark') {
            themeToggle.checked = true;
        }
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.checked = true;
        }
    }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
});

// Script untuk About Toggle
function toggleAbout() {
    const aboutSection = document.getElementById('about');
    const toggleBtn = document.getElementById('aboutToggleBtn');
    const toggleText = document.getElementById('aboutToggleText');
    
    if (aboutSection.classList.contains('show')) {
        aboutSection.classList.remove('show');
        toggleBtn.classList.remove('show-less');
        toggleText.textContent = 'Tampilkan About';
    } else {
        aboutSection.classList.add('show');
        toggleBtn.classList.add('show-less');
        toggleText.textContent = 'Sembunyikan About';
    }
}

// Script untuk Navigasi yang Diperbaiki
function navigateToSection(sectionId, event) {
    // Mencegah perilaku default anchor link
    event.preventDefault();
    
    // Close mobile navigation if open
    closeMobileNav();
    
    // Hapus semua kelas active dari navigasi
    const navLinks = document.querySelectorAll('nav a, .mobile-nav-links a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Tambahkan kelas active ke link yang diklik
    event.target.classList.add('active');
    
    // Jika yang diklik adalah About, pastikan panel About selalu ditampilkan
    if (sectionId === 'about') {
        const aboutSection = document.getElementById('about');
        const toggleBtn = document.getElementById('aboutToggleBtn');
        const toggleText = document.getElementById('aboutToggleText');
        
        // Selalu tampilkan About saat diklik dari navigasi
        if (!aboutSection.classList.contains('show')) {
            aboutSection.classList.add('show');
            toggleBtn.classList.add('show-less');
            toggleText.textContent = 'Sembunyikan About';
        }
    }
    
    // Scroll ke section yang dituju
    const section = document.getElementById(sectionId);
    if (section) {
        // Hitung posisi scroll yang tepat dengan memperhitungkan offset dari header
        const headerHeight = document.querySelector('header').offsetHeight;
        const navHeight = document.querySelector('nav').offsetHeight || 0;
        const sectionTop = section.offsetTop - headerHeight - navHeight;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// Fungsi untuk memperbarui navigasi aktif saat scroll
function updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section.panel');
    const navLinks = document.querySelectorAll('nav a, .mobile-nav-links a');
    
    let currentSection = '';
    const headerHeight = document.querySelector('header').offsetHeight;
    const navHeight = document.querySelector('nav').offsetHeight || 0;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - navHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    }
}

// Event listener untuk scroll
window.addEventListener('scroll', updateActiveNavOnScroll);

// Inisialisasi navigasi aktif saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    updateActiveNavOnScroll();
});

// Mobile Navigation Functions
function openMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-nav-overlay');
    
    mobileNav.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent body scroll when nav is open
}

function closeMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-nav-overlay');
    
    mobileNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore body scroll
}

// Event listeners for mobile navigation
document.addEventListener('DOMContentLoaded', function() {
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const closeMobileNavBtn = document.getElementById('close-mobile-nav');
    const overlay = document.getElementById('mobile-nav-overlay');
    
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', openMobileNav);
    }
    
    if (closeMobileNavBtn) {
        closeMobileNavBtn.addEventListener('click', closeMobileNav);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMobileNav);
    }
    
    // Close mobile nav when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileNav();
        }
    });
});

// Analytics Dashboard Functions
function openAnalytics() {
    const dashboard = document.getElementById('analytics-dashboard');
    dashboard.style.display = 'block';
    
    // Populate analytics data
    const data = analytics.getAnalyticsData();
    if (data) {
        document.getElementById('total-visits').textContent = data.totalVisits.toLocaleString('id-ID');
        document.getElementById('unique-visitors').textContent = data.uniqueVisitors.toLocaleString('id-ID');
        document.getElementById('returning-visitors').textContent = data.returningVisitors.toLocaleString('id-ID');
        document.getElementById('avg-session-time').textContent = data.avgSessionTime;
        
        // Populate page statistics
        const pageStats = document.getElementById('page-stats');
        pageStats.innerHTML = '';
        
        // Sort pages by views
        const sortedPages = Object.entries(data.pageViews).sort((a, b) => b[1] - a[1]);
        
        sortedPages.forEach(([page, views]) => {
            const percentage = ((views / data.totalVisits) * 100).toFixed(1);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${page}</td>
                <td>${views}</td>
                <td>${percentage}%</td>
            `;
            pageStats.appendChild(row);
        });
        
        // Populate visit history (show last 10)
        const visitHistory = document.getElementById('visit-history');
        visitHistory.innerHTML = '';
        
        const recentVisits = data.visitHistory.slice(-10).reverse();
        
        recentVisits.forEach(visit => {
            const row = document.createElement('tr');
            const visitType = visit.isNewVisitor ? 'Pengunjung Baru' : 'Pengunjung Kembali';
            const sessionTime = visit.sessionDuration ? 
                (visit.sessionDuration < 60 ? `${visit.sessionDuration}s` : 
                 `${Math.floor(visit.sessionDuration / 60)}m ${visit.sessionDuration % 60}s`) : 'N/A';
            
            row.innerHTML = `
                <td>${visit.date}</td>
                <td>${visit.time}</td>
                <td>${visitType}</td>
                <td>${sessionTime}</td>
            `;
            visitHistory.appendChild(row);
        });
    }
}

function closeAnalytics() {
    document.getElementById('analytics-dashboard').style.display = 'none';
}

function exportAnalytics() {
    analytics.exportData();
    showNotification('Data analitik berhasil diekspor!');
}

function resetAnalytics() {
    analytics.resetData();
}

// Keyboard shortcut to open analytics (Ctrl+Shift+A)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        openAnalytics();
    }
});

// Enhanced Image Loading for Kalawa Photo
function loadKalawaPhoto() {
    const container = document.getElementById('location-photo-container');
    const githubUrl = 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/kalawa.jpg';
    const fallbackUrl = 'https://picsum.photos/seed/kalawa/600/400.jpg';
    
    const img = new Image();
    
    img.onload = function() {
        container.innerHTML = `
            <img src="${githubUrl}" alt="Foto Kalawa Convention Hall" class="location-photo">
        `;
    };
    
    img.onerror = function() {
        container.innerHTML = `
            <div class="location-photo-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p><strong>Gagal memuat foto dari GitHub</strong></p>
                <p>Menggunakan foto cadangan...</p>
                <button onclick="loadFallbackPhoto()">Muat Foto Cadangan</button>
            </div>
        `;
    };
    
    img.src = githubUrl;
}

function loadFallbackPhoto() {
    const container = document.getElementById('location-photo-container');
    const fallbackUrl = 'https://picsum.photos/seed/kalawa/600/400.jpg';
    
    container.innerHTML = `
        <img src="${fallbackUrl}" alt="Foto Kalawa Convention Hall" class="location-photo">
    `;
}

// Initialize Kalawa photo loading when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure page is fully loaded
    setTimeout(loadKalawaPhoto, 500);
});

// Handle orientation change for mobile devices
window.addEventListener('orientationchange', function() {
    // Small delay to allow browser to complete orientation change
    setTimeout(function() {
        // Recalculate layout after orientation change
        updateActiveNavOnScroll();
        
        // Adjust slideshow if needed
        if (window.innerWidth < 768) {
            showSlide(slideIndex);
        }
    }, 200);
});

// Handle window resize
window.addEventListener('resize', function() {
    // Debounce resize event
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(function() {
        updateActiveNavOnScroll();
        
        // Adjust slideshow if needed
        if (window.innerWidth < 768) {
            showSlide(slideIndex);
        }
    }, 250);
});

// Mobile Touch Events Optimization
document.addEventListener('DOMContentLoaded', function() {
    // Add touch event listeners for better mobile interaction
    addTouchListeners();
});

function addTouchListeners() {
    // Touch events for slideshow
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    // Touch events for slideshow
    let touchStartX = 0;
    let touchEndX = 0;
    
    const slideshowContainer = document.querySelector('.slideshow-container');
    
    slideshowContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    slideshowContainer.addEventListener('touchmove', function(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, { passive: true });
    
    slideshowContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                changeSlide(-1); // Swipe left, show previous slide
            } else {
                changeSlide(1); // Swipe right, show next slide
            }
        }
    }
    
    // Touch events for merch slider
    const merchWrapper = document.querySelector('.merch-slider-wrapper');
    
    let merchStartX = 0;
    let merchEndX = 0;
    
    merchWrapper.addEventListener('touchstart', function(e) {
        merchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    merchWrapper.addEventListener('touchmove', function(e) {
        merchEndX = e.changedTouches[0].clientX;
        handleMerchScroll();
    }, { passive: true });
    
    merchWrapper.addEventListener('touchend', function(e) {
        merchEndX = e.changedTouches[0].clientX;
        handleMerchScroll();
    }, { passive: true });
    
    function handleMerchScroll() {
        const diff = merchStartX - merchEndX;
        const scrollAmount = merchWrapper.clientWidth;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                merchWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            } else {
                merchWrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        }
    }
    
    // Touch events for buttons
    const buttons = document.querySelectorAll('button, .add-to-cart-btn, .cta-button, .checkout-btn, .about-toggle-btn, .analytics-btn, .mobile-nav-toggle, 
    .close-mobile-nav, .close-analytics, .close-cart);
    
    buttons.forEach(button => {
        // Add touch events
        button.addEventListener('touchstart', function(e) {
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s';
        }, { passive: true });
        
        button.addEventListener('touchend', function(e) {
            // Remove visual feedback
            this.style.transform = 'scale(1)';
        }, { passive: true });
        
        // Handle both click and touch events
        button.addEventListener('click', function(e) {
            // Prevent default if touch event
            if (e.type === 'click' && e.detail === 0) {
                return;
            }
            
            // Get original onclick function
            const originalOnClick = this.getAttribute('onclick');
            if (originalOnClick) {
                eval(originalOnClick);
            }
        });
        
        button.addEventListener('touchend', function(e) {
            // Trigger click event after touch ends
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                detail: 1 // Mark as touch event
            });
            this.dispatchEvent(clickEvent);
        });
    });
    
    // Touch events for navigation links
    const navLinks = document.querySelectorAll('nav a, .mobile-nav-links a');
    
    navLinks.forEach(link => {
        // Add touch events
        link.addEventListener('touchstart', function() {
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s';
        }, { passive: true });
        
        link.addEventListener('touchend', function() {
            // Remove visual feedback
            this.style.transform = 'scale(1)';
        }, { passive: true });
        
        // Handle both click and touch events
        link.addEventListener('click', function(e) {
            // Prevent default if touch event
            if (e.type === 'click' && e.detail === 0) {
                return;
            }
            
            // Get original onclick function
            const originalOnClick = this.getAttribute('onclick');
            if (originalOnClick) {
                eval(originalOnClick);
            }
        });
        
        link.addEventListener('touchend', function(e) {
            // Trigger click event after touch ends
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                detail: 1 // Mark as touch event
            });
            this.dispatchEvent(clickEvent);
        });
    });
}

// Fix for iOS Safari (Safari has issues with touch events)
document.addEventListener('DOMContentLoaded', function() {
    // Fix for iOS Safari
    if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
        document.addEventListener('touchstart', function() {
            // Fix for iOS Safari
        }, { passive: false });
    }
});

// Fix for iOS Safari scrolling issues
body {
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    overflow-x: hidden;
}

// Fix for iOS Safari z-index issues
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}

// Fix for iOS Safari animation performance
@media (hover: none) and (pointer: coarse) {
    /* Disable animations on touch devices for better performance */
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Fix for iOS Safari select dropdown issues */
select {
    -webkit-appearance: none;
    appearance: none;
    background-color: var(--panel-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 5px;
    padding: 10px;
    font-family: var(--font-body);
}

/* Fix for iOS input issues */
input[type="text"], input[type="number"], input[type="email"], 
input[type="password"], textarea {
    -webkit-appearance: none;
    appearance: none;
    background-color: var(--panel-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 5px;
    padding: 10px;
    font-family: var(--font-body);
}

/* Fix for iOS Safari link issues */
a {
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
}

/* Fix for iOS button issues */
button, .add-to-cart-btn, .cta-button, 
.checkout-btn, .about-toggle-btn, .analytics-btn, .mobile-nav-toggle,
.close-mobile-nav, .close-analytics, .close-cart {
    -webkit-appearance: none;
    appearance: none;
    -webkit-user-select: none;
    user-select: none;
}

/* Fix for iOS cursor issues */
button, .add-to-cart-btn, .cta-button, 
.checkout-btn, .about-toggle-btn, .analytics-btn, .mobile-nav-toggle,
.close-mobile-nav, .close-analytics, .close-cart {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

/* Fix for iOS scrolling issues */
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-overflow-scrolling: touch;
    overflow-x: hidden;
}

/* Fix for iOS z-index issues */
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}

/* Fix for iOS Safari blur issues */
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
}

/* Fix for iOS Safari filter issues */
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
}

/* Fix for iOS transform issues */
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}

/* Fix for iOS transition issues */
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-transition: transform 0.3s ease;
    transition: transform 0.3s ease;
}

/* Fix for iOS filter issues */
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-filter: blur(10px);
    filter: blur(10px);
}

/* Fix for iOS will-change */
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-backdrop-filter: blur(10px);
    filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

/* Fix for iOS backdrop-filter */
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
}

/* Fix for iOS z-index */
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    z-index: 1002;
}

/* Fix for iOS scrolling performance */
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
    overflow-x: hidden;
}

/* Fix for iOS Safari text selection */
.mobile-nav, .mobile-nav-overlay, .cart-modal, .analytics-dashboard {
    -webkit-user-select: none;
    user-select: none;
}

