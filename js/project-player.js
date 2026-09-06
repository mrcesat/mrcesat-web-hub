// ============================================
// УНИВЕРСАЛЬНЫЙ ПЛЕЕР
// ============================================

class ProjectPlayer {
    constructor(slider, playerId, autoplay = false) {
        console.log(`[ProjectPlayer] Создание плеера ${playerId}, autoplay=${autoplay}`);

        this.slider = slider;
        this.playerId = playerId;
        this.slides = slider.querySelectorAll('.media-slide');
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.isAnimating = false;
        this.autoplayInterval = null;
        this.autoplayDelay = 8000; // 4 секунды между слайдами

        // Ищем зоны клика ДВУМЯ способами:
        // 1. По data-player-id (для index-v4-1)
        // 2. По id (для страницы проекта)
        this.zonePrev = document.querySelector(`.player-zone-left[data-player-id="${playerId}"]`)
                     || document.getElementById('zone-prev');

        this.zoneNext = document.querySelector(`.player-zone-right[data-player-id="${playerId}"]`)
                     || document.getElementById('zone-next');

        this.init();

        // Запускаем автоплей если нужно
        if (autoplay) {
            this.startAutoplay();
        }
    }

    init() {
        if (this.totalSlides === 0) {
            console.warn(`Плеер ${this.playerId}: нет слайдов`);
            return;
        }

        // Активируем первый слайд
        if (this.slides[0]) {
            this.slides[0].classList.add('active');
        }

        // Навешиваем обработчики только если зоны найдены
        if (this.zonePrev) {
            this.zonePrev.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.prevSlide();
                this.resetAutoplay();
            });
            console.log(`zone-prev найден для ${this.playerId}`);
        } else {
            console.warn(`zone-prev НЕ найден для ${this.playerId}`);
        }

        if (this.zoneNext) {
            this.zoneNext.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextSlide();
                this.resetAutoplay();
            });
            console.log(`zone-next найден для ${this.playerId}`);
        } else {
            console.warn(`zone-next НЕ найден для ${this.playerId}`);
        }

        // Клавиатура
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
                this.resetAutoplay();
            }
            if (e.key === 'ArrowRight') {
                this.nextSlide();
                this.resetAutoplay();
            }
        });

        // Пауза при наведении
        this.slider.addEventListener('mouseenter', () => this.pauseAutoplay());
        this.slider.addEventListener('mouseleave', () => this.resumeAutoplay());

        console.log(`Плеер ${this.playerId} инициализирован: ${this.totalSlides} слайдов`);
    }

    // Методы автоплея
    startAutoplay() {
        // Запускаем автоплей, если слайдов больше 1 (то есть 2 и более)
        if (this.totalSlides < 2) {
            console.log(`Автоплей пропущен для ${this.playerId}: только ${this.totalSlides} слайд(ов)`);
            return;
        }

        // ✅ Добавляем случайную задержку перед первым запуском (0-3 секунды)
        const randomStartDelay = Math.random() * 3000;

        setTimeout(() => {
            this.autoplayInterval = setInterval(() => {
                this.nextSlide();
            }, this.autoplayDelay);

            console.log(`✅ Автоплей запущен для ${this.playerId} (${this.totalSlides} слайдов, задержка ${Math.round(randomStartDelay)}ms)`);
        }, randomStartDelay);
    }

    pauseAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    resumeAutoplay() {
        if (!this.autoplayInterval && this.totalSlides > 1) {
            this.startAutoplay();
        }
    }

    resetAutoplay() {
        this.pauseAutoplay();
        this.resumeAutoplay();
    }

    nextSlide() {
        if (this.isAnimating || this.totalSlides <= 1) return;
        this.isAnimating = true;

        const nextIndex = (this.currentIndex + 1) % this.totalSlides;
        this.transitionTo(nextIndex, 'next');
    }

    prevSlide() {
        if (this.isAnimating || this.totalSlides <= 1) return;
        this.isAnimating = true;

        const prevIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.transitionTo(prevIndex, 'prev');
    }

    transitionTo(newIndex, direction) {
        const currentSlide = this.slides[this.currentIndex];
        const nextSlide = this.slides[newIndex];

        const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
        const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';

        nextSlide.classList.add(inClass);
        nextSlide.style.opacity = '0';
        nextSlide.style.visibility = 'visible';

        void nextSlide.offsetWidth; // Reflow

        currentSlide.classList.remove('active');
        currentSlide.classList.add(outClass);

        setTimeout(() => {
            nextSlide.classList.remove(inClass);
            nextSlide.classList.add('active');
            nextSlide.style.opacity = '1';
        }, 50);

        this.currentIndex = newIndex;

        setTimeout(() => {
            currentSlide.classList.remove(outClass);
            currentSlide.style.opacity = '0';
            currentSlide.style.visibility = 'hidden';
            this.isAnimating = false;
        }, 500);
    }    // ← Здесь больше ничего нет!
}

// Функция инициализации всех плееров (для списка проектов)
function initAllPlayers(autoplay = false) {
    console.log(` initAllPlayers вызвана с autoplay=${autoplay}`);

    const sliders = document.querySelectorAll('.media-slider[data-player-id]');
    console.log(` Найдено слайдеров: ${sliders.length}`);

    sliders.forEach((slider, index) => {
        const playerId = slider.dataset.playerId;
        const slidesCount = slider.querySelectorAll('.media-slide').length;
        console.log(` Плеер ${index} (${playerId}): ${slidesCount} слайдов`);

        new ProjectPlayer(slider, playerId, autoplay);
    });

    console.log(`✅ Инициализировано ${sliders.length} плееров`);
}

// Автоинициализация для страниц с одним плеером (project-view)
document.addEventListener('DOMContentLoaded', () => {
    const singleSlider = document.querySelector('.media-slider:not([data-player-id])');
    if (singleSlider) {
        console.log('Найден одиночный слайдер, инициализируем...');
        window.projectPlayer = new ProjectPlayer(singleSlider, 'main-player', true);
    }
});

// ============================================
// GRID MODE — КЛИК ДЛЯ ПОЛНОГО ПРОСМОТРА
// ============================================

function initGridMode() {
    const gridPlayer = document.querySelector('.project-media-player.media-fit-grid');
    if (!gridPlayer) {
        console.log('Grid mode: плеер не найден');
        return;
    }

    console.log('Grid mode: инициализация...');

    const slides = gridPlayer.querySelectorAll('.media-slide');
    const zonePrev = gridPlayer.querySelector('.player-zone-left');
    const zoneNext = gridPlayer.querySelector('.player-zone-right');
    let currentIndex = 0;
    let isSingleView = false;

    if (slides.length === 0) {
        console.log('Grid mode: слайды не найдены');
        return;
    }

    console.log(`Grid mode: найдено ${slides.length} слайдов`);

    // Клик по слайду
    slides.forEach((slide, index) => {
        slide.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`Grid mode: клик по слайду ${index}`);

            if (isSingleView) {
                // Если уже в полном просмотре — закрываем
                showGridView();
            } else {
                // Иначе — открываем этот слайд
                currentIndex = index;
                showSingleView(index);
            }
        });
    });

    // Показ одного слайда
    function showSingleView(index) {
        console.log(`Grid mode: показ слайда ${index}`);
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        gridPlayer.classList.add('single-view');
        isSingleView = true;
    }

    // Возврат к сетке
    function showGridView() {
        console.log('Grid mode: возврат к сетке');
        gridPlayer.classList.remove('single-view');
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        isSingleView = false;
    }

    // Навигация в полном просмотре
    if (zonePrev) {
        zonePrev.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isSingleView) {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                showSingleView(currentIndex);
            }
        });
    }

    if (zoneNext) {
        zoneNext.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isSingleView) {
                currentIndex = (currentIndex + 1) % slides.length;
                showSingleView(currentIndex);
            }
        });
    }

    // Клавиатура
    document.addEventListener('keydown', (e) => {
        if (!isSingleView) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            showGridView();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            showSingleView(currentIndex);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            currentIndex = (currentIndex + 1) % slides.length;
            showSingleView(currentIndex);
        }
    });

    console.log('Grid mode: инициализация завершена');
}

// Вызываем после полной загрузки
window.addEventListener('load', () => {
    setTimeout(initGridMode, 500);
});
