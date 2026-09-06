// ============================================
// 1. ЛОГИКА ГАЛЕРЕИ (работает только на странице галереи)
// ============================================
const items = document.querySelectorAll('.grid-item');

items.forEach(item => {
    item.addEventListener('click', function() {
        items.forEach(otherItem => {
            if (otherItem !== this) {
                otherItem.classList.remove('active');
            }
        });
        this.classList.toggle('active');
    });
});

// ============================================
// 2. СИСТЕМА ЧАСТИЦ (работает только если есть canvas)
// ============================================
const canvas = document.getElementById('particles-canvas');

// КРИТИЧЕСКИ ВАЖНО: проверяем, существует ли canvas на странице
if (canvas) {
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ============================================
// 3. ЛОГИКА ГЛАВНОЙ СТРАНИЦЫ: РАСКРЫТИЕ БЛОКА
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const gdBlock = document.getElementById('gd-block');
    
    if (gdBlock) {
        console.log('✅ Блок gd-block найден, обработчик клика установлен');
        
        gdBlock.addEventListener('click', function(event) {
            // Если кликнули прямо по кнопке "Перейти в раздел", не мешаем переходу
            if (event.target.classList.contains('action-button')) {
                console.log('Клик по кнопке, переход по ссылке');
                return;
            }
            
            console.log('Клик по блоку, переключаем класс active');
            // Переключаем класс active, который запускает CSS-анимацию
            this.classList.toggle('active');
        });
    } else {
        console.log('⚠️ Блок gd-block не найден на этой странице');
    }
});

// ============================================
// 4. ЛОГИКА РАСКРЫТИЯ CV И CONTACT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const cvLink = document.getElementById('cv-link');
    const cvContent = document.getElementById('cv-content');
    const contactLink = document.getElementById('contact-link');
    const contactContent = document.getElementById('contact-content');
    
    if (cvLink && cvContent) {
        cvLink.addEventListener('click', function(event) {
            event.preventDefault();
            cvContent.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    if (contactLink && contactContent) {
        contactLink.addEventListener('click', function(event) {
            event.preventDefault();
            contactContent.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
});

// ============================================
// ОБЪЕДИНЁННЫЙ БЛОК CV: клик раскрывает, но ссылки и выделение работают
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const cvBlock = document.getElementById('cv-unified');
    
    if (cvBlock) {
        cvBlock.addEventListener('click', (e) => {
            // ✅ Если клик был по ссылке внутри блока — не раскрываем CV
            if (e.target.closest('a')) {
                return; // Ссылка обработается браузером самостоятельно
            }
            
            cvBlock.classList.toggle('active');
        });
    }
});

// ============================================
// МИНИ-ПЛЕЕРЫ ДЛЯ ПРЕВЬЮ ПРОЕКТОВ НА ГЛАВНОЙ
// ============================================
class MiniPlayer {
    constructor(element) {
        this.element = element;
        this.slidesContainer = element.querySelector('.mini-player-slides');
        this.zoneLeft = element.querySelector('.mini-player-zone-left');
        this.zoneRight = element.querySelector('.mini-player-zone-right');
        
        this.currentIndex = -1; // ✅ ИЗМЕНЕНО: начинаем с -1, чтобы первый вызов showSlide(0) сработал
        this.isTransitioning = false;
        
        // Парсим данные слайдов из data-атрибута
        try {
            this.slides = JSON.parse(element.dataset.slides);
        } catch (e) {
            console.error('MiniPlayer: не удалось распарсить data-slides', e);
            this.slides = [];
        }
        
        if (this.slides.length === 0) return;
        
        this.init();
    }
    
    init() {
        this.renderSlides();
        this.showSlide(0); // ✅ Теперь это сработает, потому что currentIndex === -1
        this.setupEvents();
    }
    
    renderSlides() {
        this.slidesContainer.innerHTML = '';
        this.slides.forEach((slide, index) => {
            const slideEl = document.createElement('div');
            slideEl.className = 'mini-player-slide';
            
            if (slide.type === 'image') {
                slideEl.innerHTML = `<img src="${slide.src}" alt="" loading="lazy">`;
            } else if (slide.type === 'video') {
                slideEl.innerHTML = `<video muted loop playsinline><source src="${slide.src}" type="video/mp4"></video>`;
            }
            
            this.slidesContainer.appendChild(slideEl);
        });
    }
    
    showSlide(index) {
        if (this.isTransitioning) return;
        if (index === this.currentIndex) return;
        if (index < 0 || index >= this.slides.length) return;
        
        this.isTransitioning = true;
        
        // Останавливаем текущее видео
        if (this.currentIndex >= 0) {
            const currentSlide = this.slidesContainer.children[this.currentIndex];
            if (currentSlide) {
                const video = currentSlide.querySelector('video');
                if (video) { video.pause(); video.currentTime = 0; }
                currentSlide.classList.remove('active');
            }
        }
        
        // Показываем новый слайд
        const newSlide = this.slidesContainer.children[index];
        if (newSlide) {
            newSlide.classList.add('active');
            const video = newSlide.querySelector('video');
            if (video) video.play().catch(() => {});
        }
        
        this.currentIndex = index;
        
        setTimeout(() => { this.isTransitioning = false; }, 400);
    }
    
    nextSlide() {
        const next = (this.currentIndex + 1) % this.slides.length;
        this.showSlide(next);
    }
    
    prevSlide() {
        const prev = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prev);
    }
    
    setupEvents() {
        // Клик по зонам (не всплывает до ссылки проекта)
        if (this.zoneLeft) {
            this.zoneLeft.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.prevSlide();
            });
        }
        if (this.zoneRight) {
            this.zoneRight.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextSlide();
            });
        }
        
        // Свайп на мобильных
        let touchStartX = 0;
        this.element.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.element.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                e.preventDefault();
                diff > 0 ? this.nextSlide() : this.prevSlide();
            }
        });
    }
}

// Инициализация всех мини-плееров на странице
document.addEventListener('DOMContentLoaded', () => {
    const miniPlayers = document.querySelectorAll('.mini-player');
    miniPlayers.forEach(player => new MiniPlayer(player));
});