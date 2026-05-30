## Levantar el proyecto

En el Folder Entrega se encuentra todo el producto final por otro lado en el documento docs encontramos las imagenes y pdf se que solicito para la entrega de avances

### Requisitos previos
 
- Docker Desktop instalado y corriendo
- Git (para clonar el repositorio)

1. Clonar el repositorio:
```bash
git clone <https://github.com/VirusMauri1/proyecto2BD.git>
```
Ingresar a la ruta del proyecto y del folder correcto y verificar que estamos en la rama del proyecto 3
```bash
cd <proyecto2BD>
cd <Entrega>
 ```
2. Crear el archivo `.env` (ya incluido con credenciales de calificacion):
```bash
cp env.example .env
```
en caso de no funcionar el exmaple.env 
crear el .env a mano e ingresar lo siguiente 

DB_NAME=tienda
DB_USER=proy3
DB_PASSWORD=secret
DB_HOST=db
DB_PORT=5432
SESSION_SECRET=proy3_super_secret_2026
PORT=3000

3. Levantar todos los servicios:
```bash
docker compose up --build
```
 
4. Abrir el navegador en:
```
http://localhost:8080
```
 
El backend esta disponible en `http://localhost:3000/api/productos` o tambien en `http://localhost:3000/api/clientes`.


## Usuarios de prueba (1 por rol)
 
| Usuario       | Contraseña | Rol        |
|---------------|------------|------------|
| admin1        | secret     | admin      |
| gerente1      | secret     | gerente    |
| vendedor1     | secret     | vendedor   |
| cajero1       | secret     | cajero     |
| inventario1   | secret     | inventario |
 
---

## ORM (Sequelize)
 
Sequelize está configurado en `backend/orm/sequelize.js` y se usa en:
 
- `GET /api/clientes` — `Cliente.findAll()`
- `GET /api/clientes/:id` — `Cliente.findByPk()`
- `POST /api/clientes` — `Cliente.create()`
- `PUT /api/clientes/:id` — `cliente.update()`
- `GET /api/productos` — `Producto.findAll()` con JOIN a `Categoria`
- `GET /api/productos/:id` — `Producto.findByPk()`
- `PUT /api/productos/:id` — `producto.update()`
- `DELETE /api/productos/:id` — `producto.destroy()`
- `POST /api/auth/login` — `AppUsuario.findOne()`