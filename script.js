document.addEventListener('DOMContentLoaded', function() {
    const card = document.getElementById('birthdayCard');
    const giftsContainer = document.getElementById('giftsContainer');
    const dots = document.querySelectorAll('.slider-dot');
    const giftImages = document.querySelectorAll('.gift-image');
    const modal = document.getElementById('giftModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const closeModal = document.querySelector('.close-modal');
    const audio = document.getElementById('birthdayAudio');
    const canvas = document.getElementById('fireworksCanvas');
    const introOverlay = document.getElementById('introOverlay');
    const cardContainer = document.getElementById('cardContainer');
    const ctx = canvas.getContext('2d');
    
    let currentSlide = 0;
    const totalSlides = document.querySelectorAll('.gift').length;
    let isCardOpen = false;

    // Ajustar el tamaño del canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Fuegos artificiales
    function launchFireworks() {
        const duration = 5 * 1000; // 5 segundos
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
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
        // Animar el mensaje hacia arriba
        const introMessage = introOverlay.querySelector('.intro-message');
        introMessage.classList.add('exit');
        
        // Ocultar overlay y mostrar tarjeta después de la animación
        setTimeout(() => {
            introOverlay.classList.add('hidden');
            cardContainer.classList.remove('hidden');
            canvas.classList.remove('hidden');
            
            // Iniciar fuegos artificiales
            launchFireworks();
            
            //Iniciar audio antes de tiempo
            audio.currentTime = 2

            // Reproducir audio
            audio.play().catch(error => {
                console.log('No se pudo reproducir el audio:', error);
            });

            // Iniciar fundido en el segundo 33 (35000ms - 2000ms)
            setTimeout(() => {
                const fadeDuration = 2000; // 2 segundos de fundido
                const fadeInterval = 50; // Actualizar cada 50ms
                const volumeStep = audio.volume / (fadeDuration / fadeInterval);

                const fadeOut = setInterval(() => {
                    if (audio.volume > 0) {
                        audio.volume = Math.max(0, audio.volume - volumeStep);
                    } else {
                        audio.pause();
                        audio.currentTime = 0; // Reinicia el audio
                        audio.volume = 1; // Restaura el volumen
                        clearInterval(fadeOut);
                    }
                }, fadeInterval);
            }, 33000); // Inicia el fundido en el segundo 33
        }, 500); // Esperar a que termine la animación (0.5s)
    });

    // Abrir/cerrar tarjeta
    card.addEventListener('click', function() {
        card.classList.toggle('is-open');
        isCardOpen = !isCardOpen;
        if (isCardOpen) {
            launchConfetti();
        }
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
    
    // Configurar eventos para los puntos de navegación
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            const slideIndex = parseInt(this.getAttribute('data-slide'));
            goToSlide(slideIndex);
        });
    });
    
    // Configurar eventos para los regalos
    giftImages.forEach(gift => {
        gift.addEventListener('click', function() {
            const giftNumber = this.getAttribute('data-gift');
            showGiftMessage(giftNumber);
        });
    });
    
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
        modal.style.fontWeight = 'bold';
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