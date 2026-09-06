class MediaSlider {
    constructor(container) {
        this.container = container;
        this.slider = container.querySelector('.media-slider');
        this.images = container.querySelectorAll('img');
        this.currentIndex = 0;
        this.autoSlideTimer = null;
        this.autoSlideDelay = 5000; // 5 секунд на каждый слайд

        this.init();
    }

    init() {
        if (this.images.length <= 1) return;

        this.createIndicators();

        // Отслеживаем движение мыши
        this.container.addEventListener('mousemove', () => this.resetTimer());

        // Пауза при наведении на проект
        const projectItem = this.container.closest('.project-item');
        if (projectItem) {
            projectItem.addEventListener('mouseenter', () => this.pause());
            projectItem.addEventListener('mouseleave', () => this.resume());
        }

        // Запускаем автопрокрутку
        this.startAutoSlide();
    }

    createIndicators() {
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'media-indicators';

        this.images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'media-indicator' + (index === 0 ? ' active' : '');
            dot.addEventListener('click', () => this.goToSlide(index));
            indicatorsContainer.appendChild(dot);
        });

        this.container.appendChild(indicatorsContainer);
        this.indicators = indicatorsContainer.querySelectorAll('.media-indicator');
    }

    startAutoSlide() {
        this.autoSlideTimer = setInterval(() => {
            this.nextSlide();
        }, this.autoSlideDelay);
    }

    pause() {
        clearInterval(this.autoSlideTimer);
        this.container.classList.add('paused');
    }

    resume() {
        clearInterval(this.autoSlideTimer);
        this.startAutoSlide();
        this.container.classList.remove('paused');
    }

    resetTimer() {
        // Сбрасываем таймер при движении мыши
        clearInterval(this.autoSlideTimer);
        this.startAutoSlide();
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateSlider();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
        this.resetTimer(); // Сброс таймера при ручном переключении
    }

    updateSlider() {
        this.slider.style.transform = `translateX(-${this.currentIndex * 100}%)`;

        this.indicators.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.project-media').forEach(media => {
        new MediaSlider(media);
    });
});
