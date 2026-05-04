## Levantar el proyecto
 
### Requisitos previos
 
- Docker Desktop instalado y corriendo
- Git (para clonar el repositorio)

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd <nombre-del-repositorio>
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
 
El backend esta disponible en `http://localhost:3000`.