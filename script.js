/**
 * AORA - script.js actualizado
 * Manejo de noticias, buscador y formulario
 */

// 1. VARIABLE GLOBAL PARA EL BUSCADOR
let todasLasNoticias = []; 

// 2. FUNCIÓN PARA CARGAR NOTICIAS DESDE LA API
async function cargarNoticias() {
    const grid = document.querySelector('.noticias-grid'); 
    if (!grid) return;

    try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        
        // Manejo de datos: API puede devolver un array directo o un objeto con propiedad .noticias
        todasLasNoticias = Array.isArray(data) ? data : (data.noticias || []);

        if (todasLasNoticias.length === 0) {
            grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">No hay noticias disponibles en este momento.</p>';
            return;
        }

        // Llamamos a la función que dibuja las noticias
        renderizarNoticias(todasLasNoticias);

    } catch (error) {
        console.error("Error al cargar noticias:", error);
        grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Error al conectar con el servidor de noticias.</p>';
    }
}

// 3. FUNCIÓN PARA DIBUJAR LAS NOTICIAS (REUTILIZABLE)
function renderizarNoticias(noticias) {
    const grid = document.querySelector('.noticias-grid');
    if (!grid) return;
    
    grid.innerHTML = ''; // Limpiamos el contenedor

    noticias.forEach(post => {
        // --- SOLUCIÓN DE IMAGEN DE PORTADA ---
        // Si no hay media en la DB, usamos noticias.jpg que está en la carpeta img
        const imagenUrl = post.media ? post.media : 'img/noticias.jpg';
        
        // Limpiamos el HTML del contenido para el resumen
        const textoPlano = post.content ? post.content.replace(/<[^>]*>?/gm, '') : '';
        const resumen = textoPlano.substring(0, 100) + '...';

        const card = document.createElement('div');
        card.className = 'noticia-card';
        card.style.cursor = 'pointer';
        card.onclick = () => {
            window.location.href = `detalle.html?id=${post.id}`;
        };

        card.innerHTML = `
            <div class="noticia-img-wrapper" style="height: 200px; overflow: hidden;">
                <img src="${imagenUrl}" 
                     alt="${post.title}" 
                     onerror="this.src='img/noticias.jpg'" 
                     style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="noticia-info" style="padding: 15px;">
                <h3 style="color: #003366; margin-bottom: 10px;">${post.title}</h3>
                <p style="font-size: 0.9em; color: #444;">${resumen}</p>
                <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <small style="color: #888;">
                        <i class="fas fa-calendar-alt"></i> ${post.created_at || post.fecha || ''}
                    </small>
                    <span class="leer-mas" style="color: #28a745; font-weight: bold;">Leer más +</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 4. FUNCIÓN DEL BUSCADOR
function buscarNoticia() {
    const filtroInput = document.getElementById('searchInput');
    if (!filtroInput) return;
    
    const termino = filtroInput.value.toLowerCase();
    
    // Filtramos sobre la variable global
    const filtradas = todasLasNoticias.filter(post => {
        const titulo = post.title ? post.title.toLowerCase() : '';
        const contenido = post.content ? post.content.toLowerCase() : '';
        return titulo.includes(termino) || contenido.includes(termino);
    });

    renderizarNoticias(filtradas);
}

// 5. MANEJO DEL FORMULARIO DE INSCRIPCIÓN
function configurarFormularioInscripcion() {
    const form = document.querySelector('.join-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                nombre: form.querySelector('input[placeholder="Nombre"]').value,
                provincia: form.querySelector('select').value,
                telefono: form.querySelector('input[placeholder="Teléfono"]').value,
                correo: form.querySelector('input[placeholder="Correo"]').value
            };

            try {
                const response = await fetch('/inscripcion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert(`¡Gracias ${formData.nombre}! Tu solicitud ha sido enviada.`);
                    form.reset();
                } else {
                    alert("Error al enviar el formulario.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Error de conexión.");
            }
        });
    }
}

// 6. INICIALIZACIÓN ÚNICA
document.addEventListener('DOMContentLoaded', () => {
    cargarNoticias();
    configurarFormularioInscripcion();
});

// MENU HAMBURGUESA

  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  // Abrir y cerrar el menú al hacer clic
  hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      
      // Opcional: Animación sencilla de las barras (opcional)
      hamburger.classList.toggle('open');
  });

  // Cerrar el menú automáticamente cuando se hace clic en un enlace
  document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
          navMenu.classList.remove('active');
      });
  });
