document.addEventListener('DOMContentLoaded', function() {
    const card = document.getElementById('birthdayCard');
    const giftsContainer = document.getElementById('giftsContainer');
    const dots = document.querySelectorAll('.slider-dot');
    const giftImages = document.querySelectorAll('.gift-image');
    const modal = document.getElementById('giftModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const closeModal = document.querySelector('.close-modal');
    const birthdayAudio = document.getElementById('birthdayAudio');
    const secondAudio = document.getElementById('secondAudio');
    const canvas = document.getElementById('fireworksCanvas');
    const introOverlay = document.getElementById('introOverlay');
    const cardContainer = document.getElementById('cardContainer');
    const arrowButton = document.getElementById('arrowButton');
    const ctx = canvas.getContext('2d');
    
    let currentSlide = 0;
    const totalSlides = document.querySelectorAll('.gift').length;
    let isCardOpen = false;
    let isContraportada = false;
    const openedGifts = new Set(); // Rastrear regalos abiertos

    // Ajustar el tamaño del canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Fuegos artificiales (versión original, 30 segundos)
    function launchFireworks() {
        console.log('Iniciando fuegos artificiales'); // Depuración
        const duration = 30 * 1000; // 30 segundos
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                console.log('Fuegos artificiales terminados'); // Depuración
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            }));
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            }));
        }, 250);
    }

    // Confeti al abrir la tarjeta
    function launchConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff758c', '#76d7c4', '#f39c12', '#ffffff']
        });
    }

    // Manejar clic en el overlay inicial
    introOverlay.addEventListener('click', function() {
        const startTime = Date.now(); // Registrar tiempo del clic
        // Animar el mensaje hacia arriba
        const introMessage = introOverlay.querySelector('.intro-message');
        introMessage.classList.add('exit');
        
        // Ocultar overlay y mostrar tarjeta después de la animación (0.5s)
        setTimeout(() => {
            introOverlay.classList.add('hidden');
            cardContainer.classList.remove('hidden');
            canvas.classList.remove('hidden');
            
            // Deshabilitar interacción con la tarjeta inicialmente
            card.style.pointerEvents = 'none';
            
            // Iniciar fuegos artificiales
            launchFireworks();
            
            // Iniciar primera canción en el segundo 3 (3,000ms desde el clic)
            setTimeout(() => {
                birthdayAudio.play().catch(error => {
                    console.log('No se pudo reproducir la primera canción:', error);
                });
                console.log('Primera canción iniciada'); // Depuración
            }, 3000 - (Date.now() - startTime)); // Ajustar al segundo 3 exacto
            
            // Iniciar fade-out en el segundo 28 (28,000ms desde el clic)
            setTimeout(() => {
                console.log('Iniciando fade-out'); // Depuración
                const fadeDuration = 2000; // 2 segundos
                const fadeInterval = 50; // Actualizar cada 50ms
                const volumeStep = birthdayAudio.volume / (fadeDuration / fadeInterval);

                const fadeOut = setInterval(() => {
                    if (birthdayAudio.volume > 0) {
                        birthdayAudio.volume = Math.max(0, birthdayAudio.volume - volumeStep);
                    } else {
                        birthdayAudio.pause();
                        birthdayAudio.currentTime = 0; // Reiniciar
                        birthdayAudio.volume = 1; // Restaurar volumen
                        clearInterval(fadeOut);
                        console.log('Fade-out terminado, iniciando segunda canción'); // Depuración
                        // Iniciar segunda canción
                        secondAudio.play().catch(error => {
                            console.log('No se pudo reproducir la segunda canción:', error);
                        });
                        // Habilitar tarjeta
                        card.style.pointerEvents = 'auto';
                        console.log('Tarjeta habilitada'); // Depuración
                    }
                }, fadeInterval);
            }, 28000 - (Date.now() - startTime)); // Ajustar al segundo 28 exacto
        }, 500); // Esperar animación (0.5s)
    });

    // Abrir/cerrar tarjeta
    card.addEventListener('click', function(event) {
        // Evitar clics si está en contraportada
        if (isContraportada) return;
        
        // Toggle is-open solo si el clic no es en un elemento interactivo
        if (!event.target.closest('.gift-image, .slider-dot, .arrow-button')) {
            card.classList.toggle('is-open');
            isCardOpen = !isCardOpen;
            if (isCardOpen) {
                launchConfetti();
            }
        }
    });

    // Configurar eventos para los regalos
    giftImages.forEach(gift => {
        // Agregar elementos dinámicos para la tapa y el lazo
        const lid = document.createElement('div');
        lid.classList.add('lid');
        const bow = document.createElement('div');
        bow.classList.add('bow');
        gift.appendChild(lid);
        gift.appendChild(bow);

        gift.addEventListener('click', function(event) {
            event.stopPropagation(); // Evitar que el clic propague a la tarjeta
            console.log('Clic en regalo:', this.getAttribute('data-gift')); // Depuración
            const giftNumber = this.getAttribute('data-gift');
            
            // Marcar como abierto (visualmente)
            if (!this.classList.contains('opened')) {
                this.classList.add('opened');
                showGiftMessage(giftNumber);
                
                // Agregar regalo al conjunto de abiertos
                openedGifts.add(giftNumber);
                
                // Mostrar botón si se han abierto los tres regalos
                if (openedGifts.size === 3) {
                    arrowButton.classList.remove('hidden');
                }
            }
        });
    });

    // Configurar eventos para los puntos de navegación
    dots.forEach(dot => {
        dot.addEventListener('click', function(event) {
            event.stopPropagation(); // Evitar que el clic propague a la tarjeta
            const slideIndex = parseInt(this.getAttribute('data-slide'));
            goToSlide(slideIndex);
        });
    });

    // Manejar clic en el botón de flecha
    arrowButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Evitar que el clic propague a la tarjeta
        console.log('Clic en botón de flecha, clases actuales:', card.classList); // Depuración
        // Limpiar clases previas
        card.classList.remove('is-open');
        // Forzar transición a contraportada
        setTimeout(() => {
            card.classList.add('is-contraportada');
            console.log('Clases después de 100ms:', card.classList); // Depuración
            isContraportada = true;
            // Deshabilitar interacción
            card.style.cursor = 'default';
            card.style.pointerEvents = 'none';
        }, 100); // Retraso para asegurar renderización
    });

    // Deslizador de regalos
    function goToSlide(index) {
        if (index < 0 || index >= totalSlides) return;
        
        currentSlide = index;
        giftsContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Actualizar puntos de navegación
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }
    
    // Mostrar mensaje del regalo
    function showGiftMessage(giftNumber) {
        let title, message;
        
        switch(giftNumber) {
            case '1':
                title = "Regalo de Amor";
                message = "Este regalo simboliza todo el cariño que te tenemos. ¡Que tengas un día maravilloso!";
                break;
            case '2':
                title = "Regalo de Prosperidad";
                message = "Que este nuevo año de vida te traiga éxito y prosperidad en todo lo que emprendas.";
                break;
            case '3':
                title = "Regalo de Salud";
                message = "Te deseamos mucha salud y energía para disfrutar de este y muchos cumpleaños más.";
                break;
            default:
                title = "Feliz Cumpleaños";
                message = "¡Que tengas un día increíble!";
        }
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = 'flex';
    }
    
    // Cerrar modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Inicializar deslizador
    goToSlide(0);
    
    // Agregar soporte para deslizar con el dedo en móviles
    let touchStartX = 0;
    let touchEndX = 0;
    
    giftsContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    giftsContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            // Deslizamiento a la izquierda
            goToSlide(currentSlide + 1);
        } else if (touchEndX > touchStartX + 50) {
            // Deslizamiento a la derecha
            goToSlide(currentSlide - 1);
        }
    }
});