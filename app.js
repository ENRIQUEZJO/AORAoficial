const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

dotenv.config();
const app = express();

// Middlewares
// Middlewares corregidos
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 1. Servir archivos estáticos de la raíz de public (index, styles, etc)
app.use(express.static(path.join(__dirname, 'public')));

// 2. Servir ESPECÍFICAMENTE la carpeta de subidas para que las fotos se vean
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 3. Servir la carpeta de imágenes generales
app.use('/img', express.static(path.join(__dirname, 'public/img')));

// Configurar Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Cuentas fijas de inicio de sesión
const admins = [
  { username: 'admin1', password: '1234' },
  { username: 'admin2', password: 'abcd' }
];

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const isValid = admins.find(admin => admin.username === username && admin.password === password);
  if (isValid) {
    res.sendFile(path.join(__dirname, 'public', 'admin-panel.html'));
  } else {
// Redirigimos al login con un parámetro de error
    res.redirect('/login.html?error=1');
  }
});

// Ruta para obtener noticias con paginación (GET)
app.get('/api/posts', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'noticias.json');
  if (!fs.existsSync(filePath)) return res.json([]);

  const noticias = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Obtener query params
  const page = parseInt(req.query.page) || 1; // Página actual
  const limit = parseInt(req.query.limit) || 5; // Noticias por página

  const total = noticias.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const resultados = noticias.slice(startIndex, endIndex);

  res.json({
    currentPage: page,
    totalPages,
    totalNoticias: total,
    noticias: resultados
  });
});

// Ruta para obtener TODAS las noticias (sin paginación) – solo para el panel admin
app.get('/api/posts/all', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'noticias.json');
  if (fs.existsSync(filePath)) {
    const noticias = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(noticias);
  } else {
    res.json([]);
  }
});



// Ruta para publicar noticia (POST)
app.post('/api/posts', upload.single('media'), (req, res) => {
  const { title, content } = req.body;
  const media = req.file ? req.file.filename : null;

  const nuevaNoticia = {
    id: uuidv4(),
    title,
    content,
    media,
    fecha: new Date().toLocaleString()
  };

  const filePath = path.join(__dirname, 'data', 'noticias.json');
  let noticias = [];

  if (fs.existsSync(filePath)) {
    noticias = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  noticias.unshift(nuevaNoticia);
  fs.writeFileSync(filePath, JSON.stringify(noticias, null, 2));

  res.status(201).json({ mensaje: 'Noticia guardada' });
});

// Ruta para eliminar noticia (DELETE)
app.delete('/api/posts/:id', (req, res) => {
  const noticiaId = req.params.id;
  const filePath = path.join(__dirname, 'data', 'noticias.json');

  if (fs.existsSync(filePath)) {
    let noticias = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const noticia = noticias.find(n => n.id === noticiaId);
    noticias = noticias.filter(n => n.id !== noticiaId);

    // Eliminar archivo si tenía media
    if (noticia && noticia.media) {
      const mediaPath = path.join(__dirname, 'public', 'uploads', noticia.media);
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(noticias, null, 2));
    res.json({ mensaje: 'Noticia eliminada' });
  } else {
    res.status(404).json({ mensaje: 'Archivo de noticias no encontrado' });
  }
});

// Ruta para manejar el formulario de inscripción
app.post('/inscripcion', async (req, res) => {
  const datos = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Usa una contraseña de aplicación segura
    }
  });

  const mensaje = `
=== DATOS PERSONALES ===
Nombre Completo: ${datos.nombre}
Cédula: ${datos.cedula}
Fecha de Nacimiento: ${datos.fecha_nacimiento}
Dirección: ${datos.direccion}
Provincia: ${datos.provincia}
Municipio: ${datos.municipio}
Sector: ${datos.sector}
Teléfono: ${datos.telefono}
Correo Electrónico: ${datos.correo}
Ocupación o Profesión: ${datos.ocupacion}

=== INFORMACIÓN ADICIONAL ===
¿Pertenece a organización?: ${datos.organizacion || ''}
¿Cuál?: ${datos.cual_organizacion}
¿Ha participado en proyectos sociales?: ${datos.proyectos_sociales || ''}
¿Cuáles?: ${datos.cuales_proyectos}

=== ÁREAS DE INTERÉS ===
Seleccionadas: ${(datos.areas || []).toString()}
Otras: ${datos.otras_areas}

=== PROPUESTAS Y EXPECTATIVAS ===
Expectativas: ${datos.expectativas}
Propuesta: ${datos.propuesta}

=== DECLARACIÓN ===
Firma: ${datos.firma}
Fecha: ${datos.fecha}
`;

  const mailOptions = {
    from: datos.correo,
    to: 'paraprueba810@gmail.com',
    subject: `Formulario enviado por: ${datos.nombre}`,
    text: mensaje
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send('<h3>Formulario enviado correctamente</h3><a href="/inscripcion.html">Volver</a>');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al enviar el formulario.');
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
