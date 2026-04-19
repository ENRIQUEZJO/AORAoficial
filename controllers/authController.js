// Arreglo en memoria para almacenar los usuarios
let users = [];

// Función para registrar un usuario
const register = (req, res) => {
  const { username, password } = req.body;
  
  // Verifica si el usuario ya existe
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'Usuario ya existe' });
  }

  // Crea un nuevo usuario y lo guarda en el arreglo
  const newUser = { username, password };  // En un entorno real, no debes guardar contraseñas en texto plano
  users.push(newUser);

  res.status(201).json({ message: 'Usuario registrado exitosamente' });
};

// Función para iniciar sesión
const login = (req, res) => {
  const { username, password } = req.body;
  
  // Busca el usuario por nombre de usuario
  const user = users.find(user => user.username === username);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  res.status(200).json({ message: 'Inicio de sesión exitoso' });
};

module.exports = { register, login };
