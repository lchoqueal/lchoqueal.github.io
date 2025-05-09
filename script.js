document.addEventListener('DOMContentLoaded', function() {
    const card = document.getElementById('birthdayCard');
    const giftsContainer = document.getElementById('giftsContainer');
    const dots = document.querySelectorAll('.slider-dot');
    const giftImages = document.querySelectorAll('.gift-image');
    const modal = document.getElementById('giftModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalGiftImage = document.getElementById('modalGiftImage');
    const closeModal = document.querySelector('.close-modal');
    const birthdayAudio = document.getElementById('birthdayAudio');
    const secondAudio = document.getElementById('secondAudio');
    const canvas = document.getElementById('fireworksCanvas');
    const introOverlay = document.getElementById('introOverlay');
    const cardContainer = document.getElementById('cardContainer');
    const arrowButton = document.getElementById('arrowButton');
    const frontMessage = document.getElementById('frontMessage');
    const touchInstruction = document.getElementById('touchInstruction');
    const frontImage = document.querySelector('.front-image');
    const cakeImage = document.querySelector('.cake-image');
    const finalImage = document.querySelector('.final-image');
    const ctx = canvas.getContext('2d');
    
    let currentSlide = 0;
    const totalSlides = document.querySelectorAll('.gift').length;
    let isCardOpen = false;
    let isFinalMessage = false;
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
            
            // Mostrar imágenes iniciales
            frontImage.classList.remove('hidden');
            cakeImage.classList.remove('hidden');
            console.log('Imágenes iniciales (hoja1.webp, cake.gif) mostradas'); // Depuración
            console.log('Posición de frontMessage:', frontMessage.getBoundingClientRect()); // Depuración
            
            // Deshabilitar interacción con la tarjeta inicialmente
            card.style.pointerEvents = 'none';
            
            // Forzar carga de audio
            birthdayAudio.load();
            
            // Iniciar primera canción desde el segundo 3 de su duración
            console.log('Iniciando primera canción desde segundo 3'); // Depuración
            birthdayAudio.currentTime = 3; // Comenzar en el segundo 3
            birthdayAudio.play().catch(error => {
                console.log('No se pudo reproducir la primera canción:', error);
            });
            
            // Iniciar fuegos artificiales 1 segundo después
            setTimeout(() => {
                console.log('Iniciando fuegos artificiales (1s después de canción)'); // Depuración
                launchFireworks();
            }, 1000); // 1s después del audio
            
            // Monitorear tiempo del audio para fade-out y segunda canción
            const checkAudioTime = setInterval(() => {
                if (birthdayAudio.currentTime >= 28) {
                    console.log('Iniciando fade-out (segundo 28 de audio)'); // Depuración
                    clearInterval(checkAudioTime);
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
                            console.log('Fade-out terminado, iniciando segunda canción (segundo 30 de audio)'); // Depuración
                            // Iniciar segunda canción
                            secondAudio.play().catch(error => {
                                console.log('No se pudo reproducir la segunda canción:', error);
                            });
                            // Habilitar tarjeta y mostrar instrucción
                            card.style.pointerEvents = 'auto';
                            touchInstruction.classList.add('visible');
                            console.log('Tarjeta habilitada, instrucción (Toca para abrir) mostrada'); // Depuración
                        }
                    }, fadeInterval);
                }
            }, 100); // Verificar cada 100ms
        }, 500); // Esperar animación (0.5s)
    });

    // Abrir/cerrar tarjeta
    card.addEventListener('click', function(event) {
        // Evitar clics si está en mensaje final
        if (isFinalMessage) return;
        
        // Toggle is-open solo si el clic no es en un elemento interactivo
        if (!event.target.closest('.gift-image, .slider-dot, .arrow-button')) {
            card.classList.toggle('is-open');
            isCardOpen = !isCardOpen;
            if (isCardOpen) {
                launchConfetti();
                console.log('Tarjeta abierta, clases:', card.classList); // Depuración
                console.log('Transform card-front:', getComputedStyle(document.querySelector('.card-front')).transform); // Depuración
                console.log('Transform card-back:', getComputedStyle(document.querySelector('.card-back')).transform); // Depuración
            } else {
                console.log('Tarjeta cerrada, clases:', card.classList); // Depuración
                console.log('Transform card-front:', getComputedStyle(document.querySelector('.card-front')).transform); // Depuración
                console.log('Transform card-back:', getComputedStyle(document.querySelector('.card-back')).transform); // Depuración
            }
        }
    });

    // Configurar eventos para los regalos
    giftImages.forEach(gift => {
        gift.addEventListener('click', function(event) {
            event.stopPropagation(); // Evitar que el clic propague a la tarjeta
            const giftNumber = this.getAttribute('data-gift');
            console.log('Clic en regalo:', giftNumber, 'Clases:', this.classList); // Depuración
            
            // Marcar como abierto (visualmente)
            if (!this.classList.contains('opened')) {
                setTimeout(() => {
                    this.classList.add('opened');
                    console.log('Regalo abierto, clases:', this.classList); // Depuración
                    showGiftMessage(giftNumber);
                    
                    // Agregar regalo al conjunto de abiertos
                    openedGifts.add(giftNumber);
                    
                    // Mostrar botón si se han abierto los tres regalos
                    if (openedGifts.size === 3) {
                        arrowButton.classList.remove('hidden');
                        console.log('Botón de flecha mostrado'); // Depuración
                    }
                }, 100); // Retraso para asegurar renderización
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
        console.log('Transform card-front antes:', getComputedStyle(document.querySelector('.card-front')).transform); // Depuración
        console.log('Transform card-back antes:', getComputedStyle(document.querySelector('.card-back')).transform); // Depuración
        // Cerrar tarjeta y actualizar mensaje
        setTimeout(() => {
            card.classList.remove('is-open');
            isCardOpen = false;
            isFinalMessage = true;
            // Actualizar mensaje en card-front
            frontMessage.textContent = 'Pásala muy bonito en tu día especial :D';
            frontMessage.style.fontSize = '1.8rem';
            // Ocultar instrucción e imágenes iniciales
            touchInstruction.style.display = 'none';
            frontImage.classList.add('hidden');
            cakeImage.classList.add('hidden');
            // Mostrar imagen final
            finalImage.classList.remove('hidden');
            // Deshabilitar interacción
            card.style.cursor = 'default';
            card.style.pointerEvents = 'none';
            console.log('Tarjeta cerrada, mensaje actualizado:', frontMessage.textContent); // Depuración
            console.log('Instrucción oculta, imágenes iniciales (hoja1.webp, cake.gif) ocultas, imagen final (picture.png) mostrada'); // Depuración
            console.log('Posición de frontMessage (final):', frontMessage.getBoundingClientRect()); // Depuración
            console.log('Posición de finalImage:', finalImage.getBoundingClientRect()); // Depuración
            console.log('Clases después de 1000ms:', card.classList); // Depuración
            console.log('Transform card-front después:', getComputedStyle(document.querySelector('.card-front')).transform); // Depuración
            console.log('Transform card-back después:', getComputedStyle(document.querySelector('.card-back')).transform); // Depuración
        }, 1000); // Sincronizado con animación de 2s
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
        console.log('Cambiado a diapositiva:', currentSlide); // Depuración
    }
    
    // Mostrar mensaje del regalo
    function showGiftMessage(giftNumber) {
        let title, message, imageSrc;
        
        switch(giftNumber) {
            case '1':
                title = "Unas florcitas 💐";
                message = "Porque te los mereces, porque es tu dia, unas buenas flores (virtuales, presupuesto ajustado que te puedo decir xd), espero que te haya gustado este regalito xd";
                imageSrc = "gift1.webp";
                break;
            case '2':
                title = "Una pentakill? :00";
                message = "Y si, de quien mas, de tu tristana (no encuentre una imagen con ella, pero ey son ratitas de todas formas xdxdxd), esa tristana que nos saca canas verdes pero que nos delumbra con su bombita, y quien mas que jackeline controlandola xd";
                imageSrc = "gift2.webp";
                break;
            case '3':
                title = "Falta poco";
                message = "Esto mas que un regalo, es felicitarte por tu esfuerzo de continuar, ese titulo nadie te lo regala, tú te lo estas ganando, asi que sigue esforzandote que te vaya bien, que pronto seras una gran ingeniera ✨";
                imageSrc = "gift3.webp";
                break;
            default:
                title = "Feliz Cumpleaños";
                message = "¡Que tengas un día increíble!";
                imageSrc = "";
        }
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        if (imageSrc) {
            modalGiftImage.src = imageSrc;
            modalGiftImage.setAttribute('data-gift', giftNumber); // Para tamaño específico
            modalGiftImage.classList.remove('hidden');
            console.log('Imagen modal (gift' + giftNumber + '.webp) mostrada, tamaño:', modalGiftImage.style.width); // Depuración
        } else {
            modalGiftImage.classList.add('hidden');
        }
        modal.style.display = 'flex';
        console.log('Modal mostrado para regalo:', giftNumber, 'Imagen:', imageSrc); // Depuración
    }
    
    // Cerrar modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        modalGiftImage.classList.add('hidden'); // Ocultar imagen al cerrar
        console.log('Modal cerrado'); // Depuración
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            modalGiftImage.classList.add('hidden'); // Ocultar imagen al cerrar
            console.log('Modal cerrado por clic fuera'); // Depuración
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