//LOGICA OJO DE PASSWORDS
// Seleccionamos todos los contenedores de los inputs de contraseña
const passwordWrappers = document.querySelectorAll('.input-wrapper');

passwordWrappers.forEach(wrapper => {
    // Buscamos los elementos solo dentro de este contenedor específico
    const passwordInput = wrapper.querySelector('input');
    const closedEyeBtn = wrapper.querySelector('.eye-btn:not(.open)'); 
    const openEyeBtn = wrapper.querySelector('.eye-btn.open');

    if (closedEyeBtn && openEyeBtn) {
        // Evento para mostrar la contraseña (click en ojo cerrado)
        closedEyeBtn.addEventListener('click', () => {
            passwordInput.type = 'text'; // Cambia el input a texto visible
            closedEyeBtn.style.display = 'none'; // Oculta ojo cerrado
            openEyeBtn.style.display = 'block'; // Muestra ojo abierto
        });

        // Evento para ocultar la contraseña (click en ojo abierto)
        openEyeBtn.addEventListener('click', () => {
            passwordInput.type = 'password'; // Devuelve el input a modo oculto
            openEyeBtn.style.display = 'none'; // Oculta ojo abierto
            closedEyeBtn.style.display = 'block'; // Muestra ojo cerrado
        });
    }
});
//LOGICA PAG DE LOGIN
const loginForm = document.getElementById('loginForm');

// Solo ejecutamos esto si estamos en la página que tiene el loginForm
if (loginForm) {
    loginForm.addEventListener('submit', function(evento) {
        let errorMessage = document.getElementById('error-message');
        
        // Evita el comportamiento por defecto (recargar la página)
        evento.preventDefault();

        // Captura los valores y limpia espacios
        const usernameValue = document.getElementById('username').value.trim();
        const passwordValue = document.getElementById('password').value.trim();

        // Evalúa si ambos campos tienen contenido
        if (usernameValue !== '' && passwordValue !== '') {
            errorMessage.style.display = 'none';
            window.location.href = 'pages/home.html'; 
        } else {
            errorMessage.textContent = 'Las credenciales no coinciden o están incompletas.';
            errorMessage.style.display = 'block';
        }
    });
}

//LÓGICA DEL CAPTCHA
const captchaBox = document.getElementById('captchaBox');
let captchaResuelto = false; // Variable para saber si el usuario pasó la prueba

if (captchaBox) {
    captchaBox.addEventListener('click', function() {
        // Si ya está cargando o ya se resolvió, ignoramos los clics extra
        if (captchaBox.classList.contains('loading') || captchaBox.classList.contains('checked')) {
            return;
        }

        // 1. Pasamos al estado "pensando" (gris)
        captchaBox.classList.add('loading');

        // 2. Esperamos 800ms y pasamos al estado resuelto
        setTimeout(() => {
            captchaBox.classList.remove('loading');
            captchaBox.classList.add('checked');
            captchaResuelto = true; // Avisamos que el captcha es válido
        }, 800);
    });
}


//LOGICA PAG DE REGISTRO
const registerForm = document.getElementById('registerForm');

// Solo ejecutamos esto si estamos en la página que tiene el registerForm
if (registerForm) {
    registerForm.addEventListener('submit', function(evento) {
        let errorMessage = document.getElementById("register-error");
        
        // Evita que la página se recargue
        evento.preventDefault();

        // Captura todos los valores y les quita los espacios en blanco
        const nameValue = document.getElementById('name').value.trim();
        const surnameValue = document.getElementById('surname').value.trim();
        const usernameR = document.getElementById('Rusername').value.trim();
        const dofValue = document.getElementById('dof').value.trim();
        const emailValue = document.getElementById('email').value.trim();
        const passwordValue = document.getElementById('password').value.trim();
        const repeatPasswordValue = document.getElementById('repeatPassword').value.trim();

        // Evalúa si TODOS los campos obligatorios están llenos
        if (nameValue !== '' && surnameValue !== '' && dofValue !== '' && 
            emailValue !== '' && passwordValue !== '' && repeatPasswordValue !== '') {
            
            if (!captchaResuelto) {
                errorMessage.textContent = 'Por favor, verifica que no eres un robot.';
                errorMessage.style.display = 'block';
                return;
            }

            // Validación extra: verificar que ambas contraseñas sean iguales
            if (passwordValue !== repeatPasswordValue) {
                errorMessage.textContent = 'Las contraseñas no coinciden.';
                errorMessage.style.display = 'block';

                captchaBox.classList.remove('checked', 'loading');
                captchaResuelto = false;

                return; // Corta la ejecución para que no avance al home
            }

            // Si está todo perfecto, ocultamos el error y redirigimos
            errorMessage.style.display = 'none';

            // 1. Seleccionamos todos los inputs del formulario y los pintamos de verde
            const allInputs = registerForm.querySelectorAll('input');
            allInputs.forEach(input => {
                input.classList.add('successMode');
            });

            // 2. Cambiamos el botón para dar más feedback
            const submitBtn = registerForm.querySelector('button.login');
            submitBtn.textContent = '¡Éxito!';
            submitBtn.classList.add('success-btn'); // Aplicamos la clase que cambia las capas

            // 3. Retrasamos la redirección 1.2 segundos para que se vea el efecto
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1200);  
            
        } else {
            // Feedback si falta algún dato
            errorMessage.textContent = 'Por favor, completa todos los campos obligatorios.';
            errorMessage.style.display = 'block';

            // (Solo si ya lo había tildado antes de intentar enviar)
            if (captchaBox) {
                captchaBox.classList.remove('checked', 'loading');
                captchaResuelto = false;
            }
        }
    });
}