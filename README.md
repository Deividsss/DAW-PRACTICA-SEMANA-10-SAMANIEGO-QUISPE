# Práctica Semana 10 - Inventario de productos

Aplicación desarrollada con Node.js, Express y MySQL para administrar productos con una interfaz web y una API REST mediante arquitectura MVC.

## 1. Requisitos
- Node.js LTS (20 o superior) y npm.
- MySQL (por ejemplo, XAMPP).
- Visual Studio Code.
- Postman.

## 2. Crear la base de datos
1. Inicia MySQL desde XAMPP.
2. Abre phpMyAdmin o MySQL Workbench.
3. Ejecuta el contenido de `database/db_lab10.sql`.
4. Verifica que exista `db_lab10` y la tabla `productos`.

## 3. Configurar el proyecto
Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Copia `.env.example` y crea un archivo llamado `.env` en la raíz. Ajusta los valores según tu instalación de MySQL:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_lab10
```

No subas el archivo `.env` a GitHub. Está excluido mediante `.gitignore`.

## 4. Ejecutar la aplicación

```bash
npm run dev
```

Abre `http://localhost:3000/` para usar el panel de inventario. Desde allí puedes consultar, buscar, crear, editar y eliminar productos. La interfaz consume los endpoints de la API descritos a continuación.

## 5. Endpoints

| Método | URL | Función | Respuesta esperada |
|---|---|---|---|
| GET | `/api/productos` | Listar productos | 200 |
| GET | `/api/productos/:id` | Consultar por ID | 200 / 404 |
| POST | `/api/productos` | Crear producto | 201 / 400 |
| PUT | `/api/productos/:id` | Actualizar producto | 200 / 400 / 404 |
| DELETE | `/api/productos/:id` | Eliminar producto | 200 / 400 / 404 |

### Body de ejemplo para POST y PUT
Selecciona `Body > raw > JSON` en Postman:

```json
{
  "nombre": "Audífonos",
  "descripcion": "Audífonos con cable",
  "precio": 39.90,
  "stock": 12
}
```

Asegúrate de enviar `Content-Type: application/json`.

## 6. Importar pruebas en Postman
En Postman selecciona **Import**, elige `postman/Practica_Semana10.postman_collection.json` y ejecuta las solicitudes. Para PUT y DELETE, el ejemplo usa el ID 1; crea o verifica ese registro antes de ejecutarlas.

## 7. Estructura
- `src/config/db.js`: pool de conexiones MySQL con `mysql2/promise`.
- `src/controllers/productosController.js`: lógica CRUD y validaciones.
- `src/routes/productosRoutes.js`: rutas HTTP.
- `src/app.js`: configuración Express, archivos de la interfaz y errores 404/500.
- `public/`: interfaz web adaptable y gestión de productos conectada a la API.
- `server.js`: inicio del servidor y comprobación de conexión.
- `database/db_lab10.sql`: creación de base de datos, tabla y datos iniciales.
- `postman/`: colección de pruebas.

## 8. Errores frecuentes
- **Access denied**: revisa `DB_USER` y `DB_PASSWORD` en `.env`.
- **ECONNREFUSED**: confirma que MySQL esté iniciado y que el puerto sea correcto.
- **Unknown database**: ejecuta el script SQL.
- **Port 3000 in use**: cambia `PORT` en `.env`.

> Nota: los errores 500 reales dependen de una falla del servidor o la base de datos. No provoques una falla destructiva solo para obtener una captura; puedes documentar el manejo implementado y, si el docente exige evidencia de 500, provocar temporalmente una desconexión controlada de MySQL en un entorno de prueba.
