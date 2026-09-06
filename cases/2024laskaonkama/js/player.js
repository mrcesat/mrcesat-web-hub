// ============================================
// ПЛЕЕР ПРОЕКТА — изображения и видео
// ============================================

// ДАННЫЕ СЛАЙДОВ — редактируйте этот массив для каждого проекта
const slides = [
    { type: 'image', src: 'media/laska2024_(7).jpg', alt: 'Slide 1' },
    { type: 'image', src: 'media/laska2024_(1).jpg', alt: 'Slide 1' },
    { type: 'image', src: 'media/laska2024_(2).jpg', alt: 'Slide 2' },
    { type: 'image', src: 'media/laska2024_(3).jpg', alt: 'Slide 3' },
    { type: 'image', src: 'media/laska2024_(4).jpg', alt: 'Slide 4' },
    { type: 'image', src: 'media/laska2024_(5).jpg', alt: 'Slide 5' },
    { type: 'image', src: 'media/laska2024_(5).png', alt: 'Slide 6' },
    { type: 'image', src: 'media/laska2024_(6).png', alt: 'Slide 8' },
    { type: 'image', src: 'media/laska2024_(8).jpg', alt: 'Slide 9' },
    { type: 'image', src: 'media/laska2024_(6).jpg', alt: 'Slide 10' },
    // Добавьте столько слайдов, сколько нужно
];

class ProjectPlayer {
    constructor(slidesData) {
        this.slides = slidesData;
        this.currentIndex = 0;
        this.isTransitioning = false;
        
        this.container = document.getElementById('player');
        this.slidesContainer = document.getElementById('player-slides');
        this.dotsContainer = document.getElementById('player-dots'); // Может быть null
        this.currentSlideEl = document.getElementById('current-slide');
        this.totalSlidesEl = document.getElementById('total-slides');
        
        if (!this.slidesContainer || !this.totalSlidesEl) {
            console.error('Player: не найдены критические элементы');
            return;
        }
        
        this.init();
    }

    init() {
        if (!this.slides || this.slides.length === 0) {
            this.totalSlidesEl.textContent = '0';
            return;
        }
        
        this.totalSlidesEl.textContent = this.slides.length;
        this.renderSlides();
        this.renderDots();
        this.showSlide(0);
        this.setupEventListeners();
    }

    renderSlides() {
        this.slidesContainer.innerHTML = '';
        this.slides.forEach((slide, index) => {
            const slideEl = document.createElement('div');
            slideEl.className = 'player-slide';
            slideEl.dataset.index = index;
            
            if (slide.type === 'image') {
                slideEl.innerHTML = `<img src="${slide.src}" alt="${slide.alt || ''}" loading="lazy">`;
            } else if (slide.type === 'video') {
                slideEl.innerHTML = `<video muted loop playsinline ${slide.poster ? `poster="${slide.poster}"` : ''}>
                    <source src="${slide.src}" type="video/mp4"></video>`;
            }
            this.slidesContainer.appendChild(slideEl);
        });
    }

    renderDots() {
        // Если точек нет в HTML, просто выходим без ошибки
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = '';
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'player-dot';
            dot.dataset.index = index;
            this.dotsContainer.appendChild(dot);
        });
    }

    showSlide(index) {
        if (this.isTransitioning) return;
        if (index < 0 || index >= this.slides.length) return;
        if (index === this.currentIndex && this.slidesContainer.children[index]?.classList.contains('active')) return;
        
        this.isTransitioning = true;
        
        const currentSlide = this.slidesContainer.children[this.currentIndex];
        if (currentSlide) {
            const video = currentSlide.querySelector('video');
            if (video) { video.pause(); video.currentTime = 0; }
            currentSlide.classList.remove('active');
        }
        
        const newSlide = this.slidesContainer.children[index];
        if (newSlide) {
            newSlide.classList.add('active');
            const video = newSlide.querySelector('video');
            if (video) video.play().catch(() => {});
        }
        
        this.currentIndex = index;
        this.currentSlideEl.textContent = index + 1;
        
        // Безопасное обновление точек
        if (this.dotsContainer) {
            const dots = this.dotsContainer.querySelectorAll('.player-dot');
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        }
        
        setTimeout(() => { this.isTransitioning = false; }, 500);
    }

    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }

    setupEventListeners() {
        document.getElementById('zone-left')?.addEventListener('click', () => this.prevSlide());
        document.getElementById('zone-right')?.addEventListener('click', () => this.nextSlide());
        
        // Безопасное добавление клика по точкам (только если они есть)
        if (this.dotsContainer) {
            this.dotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('player-dot')) {
                    this.showSlide(parseInt(e.target.dataset.index));
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            else if (e.key === 'ArrowRight') this.nextSlide();
        });
        
        let touchStartX = 0;
        this.container?.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        this.container?.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? this.nextSlide() : this.prevSlide();
            }
        }, { passive: true });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProjectPlayer(slides);
});