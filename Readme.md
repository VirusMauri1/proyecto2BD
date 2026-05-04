## Levantar el proyecto

En el Folder Entrega se encuentra todo el producto final por otro lado en el documento docs encontramos las imagenes y pdf se que solicito para la entrega de avances

### Requisitos previos
 
- Docker Desktop instalado y corriendo
- Git (para clonar el repositorio)

1. Clonar el repositorio:
```bash
git clone <https://github.com/VirusMauri1/proyecto2BD.git>
```
Ingresar a la ruta del proyecto y del folder correcto
```bash
cd <proyecto2BD>
cd <Entrega>
 ```
2. Crear el archivo `.env` (ya incluido con credenciales de calificacion):
```bash
cp .env.example .env
```
 
3. Levantar todos los servicios:
```bash
docker compose up --build
```
 
4. Abrir el navegador en:
```
http://localhost:8080
```
 
El backend esta disponible en `http://localhost:3000/api/productos` o tambien en `http://localhost:3000/api/clientes`.