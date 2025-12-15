document.addEventListener('DOMContentLoaded', function() {

    // --- DATA & KONFIGURASI ---
    const merchData = [
        {
            name: 'Gelang Spektamagis',
            price: 20000,
            image: 'https://z-cdn-media.chatglm.cn/files/b22daeb8-2465-468c-9b99-9bc846041bcf_Gelang%20karet%202.jpg?auth_key=1792131314-e6d07734e9a841dc904d03b79401da8e-0-c6589909e3e45ab97876e1f1e76ca40d'
        },
        {
            name: 'Lanyard & Kartu',
            price: 20000,
            image: 'https://z-cdn-media.chatglm.cn/files/73f4c093-b01a-4678-883c-c81e441f0aea_lanyard%202.jpg?auth_key=1792131314-10915567183341c0a30838b390a491ff-0-7e905ad49529d500474ca2bf40729143'
        },
        {
            name: 'Kaos Oversize',
            price: 200000,
            image: 'https://z-cdn-media.chatglm.cn/files/e17811cc-26bb-4c20-9992-5ef2ea40774e_Oversize%202.jpg?auth_key=1792131314-80a894c337e743c6890ba33c4c0e1e92-0-80de4a9ebca63d8472fea4fa8b1c6bc3'
        },
        {
            name: 'Tote Bag',
            price: 100000,
            image: 'https://z-cdn-media.chatglm.cn/files/c99f9f11-c11f-4c64-8389-978d145c91e9_Tote%20bag%202.jpg?auth_key=1792131314-74974f83ea3a4eb8a97dccf84e1b0028-0-2345b149a403ef5db6bd01b23041bc94'
        }
    ];

    const galleryData = [
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback1.jpg', caption: 'Energi Kerumunan di Spektamagis Vol. 1' },
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback2.jpg', caption: 'Energi Kerumunan di Spektamagis Vol. 1' },
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback3.jpg', caption: 'Penampilan Memukau di Panggung Spektamagis' },
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback4.jpg', caption: 'Penampilan Memukau di Panggung Spektamagis' },
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback5.jpg', caption: 'Penampilan Memukau di Panggung Spektamagis' },
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback6.jpg', caption: 'Energi Kerumunan di Spektamagis Vol. 1' },
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback7.jpg', caption: 'Penampilan Memukau di Panggung Spektamagis' },
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback8.jpg', caption: 'Penampilan Memukau di Panggung Spektamagis' },
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback9.jpg', caption: 'Penampilan Memukau di Panggung Spektamagis' },
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback10.jpg', caption: 'Energi Kerumunan di Spektamagis Vol. 1' },
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback11.jpg', caption: 'Penampilan Memukau di Panggung Spektamagis' },
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback12.jpg', caption: 'Penampilan Memukau di Panggung Spektamagis' },
        { src: 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/throwback13.jpg', caption: 'Intim Panggung dan Performa Penuh Energi' }
    ];

    const locationPhotoUrl = 'https://raw.githubusercontent.com/projectparakreator-stack/spektahub/main/kalawa.jpg'; // Contoh URL gambar

    // --- ELEMEN DOM ---
    const body = document.body;
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const closeMobileNavBtn = document.getElementById('close-mobile-nav');
    const aboutToggleBtn = document.getElementById('aboutToggleBtn');
    const aboutSection = document.getElementById('about');
    const aboutToggleText = document.getElementById('aboutToggleText');
    const countdownElements = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };
    const locationPhotoContainer = document.getElementById('location-photo-container');
    const slidesWrapper = document.getElementById('slides-wrapper');
    const dotContainer = document.getElementById('dot-container');
    const merchSliderWrapper = document.getElementById('merch-slider-wrapper');
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountElement = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const notification = document.getElementById('notification');
    const visitorCounter = document.getElementById('visitor-counter');
    const visitorCountElement = document.getElementById('visitor-count');
    const analyticsDashboard = document.getElementById('analytics-dashboard');
    const closeAnalyticsBtn = document.getElementById('close-analytics');
    const exportAnalyticsBtn = document.getElementById('export-analytics');
    const resetAnalyticsBtn = document.getElementById('reset-analytics');

    // --- STATE MANAJEMEN ---
    let cart = JSON.parse(localStorage.getItem('spektamagisCart')) || [];
    let slideIndex = 1;
    const eventDate = new Date('2026-02-06T09:00:00').getTime();

    // --- INISIALISASI ---
    function init() {
        setupEventListeners();
        loadTheme();
        renderMerchandise();
        renderGallery();
        updateCartUI();
        startCountdown();
        loadLocationPhoto();
        updateAnalytics();
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        // Theme Toggle
        themeToggleCheckbox.addEventListener('change', toggleTheme);

        // Mobile Navigation
        mobileNavToggle.addEventListener('click', openMobileNav);
        closeMobileNavBtn.addEventListener('click', closeMobileNav);
        mobileNavOverlay.addEventListener('click', closeMobileNav);

        // Smooth Scrolling for Navigation Links
        document.querySelectorAll('nav a, .mobile-nav-links a').forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });

        // About Section Toggle
        aboutToggleBtn.addEventListener('click', toggleAboutSection);

        // Cart
        cartIcon.addEventListener('click', openCart);
        closeCartBtn.addEventListener('click', closeCart);
        checkoutBtn.addEventListener('click', handleCheckout);

        // Analytics
        visitorCounter.addEventListener('click', openAnalytics);
        closeAnalyticsBtn.addEventListener('click', closeAnalytics);
        exportAnalyticsBtn.addEventListener('click', exportAnalyticsData);
        resetAnalyticsBtn.addEventListener('click', resetAnalyticsData);
    }

    // --- FUNGSI-FUNGSI UTAMA ---

    // Theme Management
    function loadTheme() {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'light') {
            body.setAttribute('data-theme', 'light');
            themeToggleCheckbox.checked = true;
        }
    }

    function toggleTheme() {
        if (themeToggleCheckbox.checked) {
            body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
        }
    }

    // Mobile Navigation
    function openMobileNav() {
        mobileNav.classList.add('active');
        mobileNavOverlay.classList.add('active');
    }

    function closeMobileNav() {
        mobileNav.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
    }

    function handleNavLinkClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
            closeMobileNav(); // Close mobile nav if open
        }
    }

    // About Section
    function toggleAboutSection() {
        aboutSection.classList.toggle('show');
        aboutToggleBtn.classList.toggle('show-less');
        aboutToggleText.textContent = aboutSection.classList.contains('show') ? 'Sembunyikan About' : 'Tampilkan About';
    }

    // Countdown Timer
    function startCountdown() {
        const countdownInterval = setInterval(function() {
            const now = new Date().getTime();
            const distance = eventDate - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                Object.values(countdownElements).forEach(el => el.innerText = '00');
                return;
            }

            countdownElements.days.innerText = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
            countdownElements.hours.innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            countdownElements.minutes.innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            countdownElements.seconds.innerText = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
        }, 1000);
    }

    // Location Photo
    function loadLocationPhoto() {
        locationPhotoContainer.innerHTML = `<div class="location-photo-loading"><i class="fas fa-spinner fa-spin"></i> <span>Memuat foto...</span></div>`;
        
        const img = new Image();
        img.src = locationPhotoUrl;
        img.className = 'location-photo';
        img.alt = 'Lokasi Event';

        img.onload = () => {
            locationPhotoContainer.innerHTML = '';
            locationPhotoContainer.appendChild(img);
        };

        img.onerror = () => {
            locationPhotoContainer.innerHTML = `
                <div class="location-photo-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Gagal memuat foto lokasi.</p>
                    <button onclick="loadLocationPhoto()">Coba Lagi</button>
                </div>
            `;
        };
    }

    // Gallery
    function renderGallery() {
        slidesWrapper.innerHTML = '';
        dotContainer.innerHTML = '';
        
        galleryData.forEach((item, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.style.display = index === 0 ? 'block' : 'none';
            slide.innerHTML = `<img src="${item.src}" alt="${item.caption}"><p class="throwback-caption">${item.caption}</p>`;
            slidesWrapper.appendChild(slide);

            // Create dot
            const dot = document.createElement('span');
            dot.className = 'dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => currentSlide(index + 1));
            dotContainer.appendChild(dot);
        });

        // Add event listeners to prev/next buttons
        document.getElementById('prev-slide').addEventListener('click', () => changeSlide(-1));
        document.getElementById('next-slide').addEventListener('click', () => changeSlide(1));
    }

    function changeSlide(n) {
        showSlide(slideIndex += n);
    }

    function currentSlide(n) {
        showSlide(slideIndex = n);
    }

    function showSlide(n) {
        const slides = document.getElementsByClassName('slide');
        const dots = document.getElementsByClassName('dot');
        
        if (n > slides.length) { slideIndex = 1 }
        if (n < 1) { slideIndex = slides.length }

        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = 'none';
        }
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.remove('active');
        }

        slides[slideIndex - 1].style.display = 'block';
        dots[slideIndex - 1].classList.add('active');
    }

    // Merchandise
    function renderMerchandise() {
        merchSliderWrapper.innerHTML = '';
        merchData.forEach(item => {
            const merchItem = document.createElement('div');
            merchItem.className = 'merch-item-wrapper';
            merchItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="merch-item">
                <p>${item.name}</p>
                <p class="merch-price">Rp ${item.price.toLocaleString('id-ID')}</p>
                <a href="#" class="add-to-cart-btn" data-name="${item.name}" data-price="${item.price}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </a>
            `;
            merchSliderWrapper.appendChild(merchItem);
        });

        // Add event listeners to all new "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const name = btn.dataset.name;
                const price = parseInt(btn.dataset.price);
                addToCart(name, price);
            });
        });

        // Merch Slider Controls
        document.getElementById('merchPrevBtn').addEventListener('click', () => {
            merchSliderWrapper.scrollBy({ left: -220, behavior: 'smooth' });
        });
        document.getElementById('merchNextBtn').addEventListener('click', () => {
            merchSliderWrapper.scrollBy({ left: 220, behavior: 'smooth' });
        });
    }

    // Shopping Cart
    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        saveCart();
        updateCartUI();
        showNotification(`${name} ditambahkan ke keranjang!`);
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
    }

    function changeQuantity(index, change) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            removeFromCart(index);
        } else {
            saveCart();
            updateCartUI();
        }
    }

    function saveCart() {
        localStorage.setItem('spektamagisCart', JSON.stringify(cart));
    }

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Keranjang Anda kosong.</p>';
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                itemCount += item.quantity;

                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button onclick="changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${index})">&times;</button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
        }

        cartCountElement.innerText = itemCount;
        cartTotalElement.innerText = `Rp ${total.toLocaleString('id-ID')}`;
    }

    function openCart() {
        cartModal.style.display = 'block';
    }

    function closeCart() {
        cartModal.style.display = 'none';
    }

    function handleCheckout() {
        if (cart.length === 0) {
            alert('Keranjang Anda kosong!');
            return;
        }
        // Di sini Anda bisa mengintegrasikan dengan gateway pembayaran
        const orderDetails = cart.map(item => `${item.name} (x${item.quantity})`).join('\n');
        alert(`Terima kasih telah melakukan pemesanan!\n\nPesanan Anda:\n${orderDetails}\n\nTotal: ${cartTotalElement.innerText}\n\n(Fitur checkout ini adalah simulasi)`);
        cart = [];
        saveCart();
        updateCartUI();
        closeCart();
    }

    // Notification
    function showNotification(message) {
        notification.innerText = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Analytics (Simulasi dengan localStorage) - VERSI PERBAIKI
function updateAnalytics() {
    let storedAnalytics = localStorage.getItem('spektamagisAnalytics');
    let analytics;

    if (storedAnalytics) {
        analytics = JSON.parse(storedAnalytics);
        // --- PERBAIKAN: Konversi Array kembali menjadi Set ---
        if (Array.isArray(analytics.uniqueVisitors)) {
            analytics.uniqueVisitors = new Set(analytics.uniqueVisitors);
        } else {
            analytics.uniqueVisitors = new Set();
        }
    } else {
        // Struktur default untuk kunjungan pertama
        analytics = {
            totalVisits: 0,
            uniqueVisitors: new Set(),
            pageViews: {},
            sessionStart: Date.now()
        };
    }

    // Sekarang kita bisa menggunakan .add() dengan aman
    analytics.totalVisits++;
    analytics.uniqueVisitors.add('visitor-id'); // Simulasi ID unik
    const currentPage = window.location.pathname;
    analytics.pageViews[currentPage] = (analytics.pageViews[currentPage] || 0) + 1;

    // --- PERBAIKAN: Konversi Set menjadi Array sebelum disimpan ---
    let analyticsToSave = {
        ...analytics,
        uniqueVisitors: Array.from(analytics.uniqueVisitors)
    };

    localStorage.setItem('spektamagisAnalytics', JSON.stringify(analyticsToSave));

    // Update visitor counter di UI
    visitorCountElement.innerText = analytics.uniqueVisitors.size;
}

    function openAnalytics() {
        analyticsDashboard.style.display = 'block';
        const analytics = JSON.parse(localStorage.getItem('spektamagisAnalytics')) || {};
        
        document.getElementById('total-visits').innerText = analytics.totalVisits || 0;
        // --- PERBAIKAN: Gunakan .length karena uniqueVisitors sekarang adalah Array ---
document.getElementById('unique-visitors').innerText = analytics.uniqueVisitors ? analytics.uniqueVisitors.length : 0;
        // Populate page stats table
        const pageStatsBody = document.getElementById('page-stats');
        pageStatsBody.innerHTML = '';
        if (analytics.pageViews) {
            for (const page in analytics.pageViews) {
                const row = pageStatsBody.insertRow();
                row.insertCell(0).textContent = page;
                row.insertCell(1).textContent = analytics.pageViews[page];
                row.insertCell(2).textContent = ((analytics.pageViews[page] / analytics.totalVisits) * 100).toFixed(2) + '%';
            }
        }
    }

    function closeAnalytics() {
        analyticsDashboard.style.display = 'none';
    }

    function exportAnalyticsData() {
        const analytics = JSON.parse(localStorage.getItem('spektamagisAnalytics')) || {};
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analytics, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "spektamagis_analytics.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showNotification('Data analytics telah diekspor!');
    }

    function resetAnalyticsData() {
        if (confirm('Apakah Anda yakin ingin mereset semua data analytics?')) {
            localStorage.removeItem('spektamagisAnalytics');
            showNotification('Data analytics telah direset!');
            closeAnalytics();
        }
    }

    // --- JALANKAN INISIALISASI ---
    init();

});



