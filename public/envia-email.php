<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $to = "josentiquescustodio@gmail.com"; // Reemplaza por tu correo real

    // Asunto personalizado con el nombre
    $subject = "Formulario enviado por: " . $_POST['nombre'];

    // Recoge todos los campos
    $mensaje = "=== DATOS PERSONALES ===\n";
    $mensaje .= "Nombre Completo: " . $_POST['nombre'] . "\n";
    $mensaje .= "Cédula: " . $_POST['cedula'] . "\n";
    $mensaje .= "Fecha de Nacimiento: " . $_POST['fecha_nacimiento'] . "\n";
    $mensaje .= "Dirección: " . $_POST['direccion'] . "\n";
    $mensaje .= "Provincia: " . $_POST['provincia'] . "\n";
    $mensaje .= "Municipio: " . $_POST['municipio'] . "\n";
    $mensaje .= "Sector: " . $_POST['sector'] . "\n";
    $mensaje .= "Teléfono: " . $_POST['telefono'] . "\n";
    $mensaje .= "Correo Electrónico: " . $_POST['correo'] . "\n";
    $mensaje .= "Ocupación o Profesión: " . $_POST['ocupacion'] . "\n\n";

    $mensaje .= "=== INFORMACIÓN ADICIONAL ===\n";
    $mensaje .= "¿Pertenece a organización?: " . ($_POST['organizacion'] ?? '') . "\n";
    $mensaje .= "¿Cuál?: " . $_POST['cual_organizacion'] . "\n";
    $mensaje .= "¿Ha participado en proyectos sociales?: " . ($_POST['proyectos_sociales'] ?? '') . "\n";
    $mensaje .= "¿Cuáles?: " . $_POST['cuales_proyectos'] . "\n\n";

    $mensaje .= "=== ÁREAS DE INTERÉS ===\n";
    if (!empty($_POST['areas'])) {
        $mensaje .= "Seleccionadas: " . implode(", ", $_POST['areas']) . "\n";
    }
    $mensaje .= "Otras: " . $_POST['otras_areas'] . "\n\n";

    $mensaje .= "=== PROPUESTAS Y EXPECTATIVAS ===\n";
    $mensaje .= "Expectativas: " . $_POST['expectativas'] . "\n";
    $mensaje .= "Propuesta: " . $_POST['propuesta'] . "\n\n";

    $mensaje .= "=== DECLARACIÓN ===\n";
    $mensaje .= "Firma: " . $_POST['firma'] . "\n";
    $mensaje .= "Fecha: " . $_POST['fecha'] . "\n";

    // Cabecera del correo
    $headers = "From: " . $_POST['correo'] . "\r\n";
    $headers .= "Reply-To: " . $_POST['correo'] . "\r\n";
    $headers .= "Content-type: text/plain; charset=UTF-8\r\n";

    // Enviar correo
    if (mail($to, $subject, $mensaje, $headers)) {
        echo "Formulario enviado con éxito.";
    } else {
        echo "Error al enviar el formulario.";
    }
} else {
    echo "Método no permitido.";
}
?>
