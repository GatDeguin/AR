# Guitarra Tutor AR

Aplicación web de realidad aumentada para superponer escalas, acordes y ejercicios sobre tu guitarra en tiempo real.

## Estructura
- **frontend/**: Proyecto React + Vite + Tailwind + Three.js + WebXR.
- **backend/**: API FastAPI con PostgreSQL y MongoDB.
- **infra/**: Docker Compose y Nginx.
- **.github/**: CI con GitHub Actions.
- **openapi.yaml**: Definición OpenAPI 3.1.
- **uml_diagrams.puml**: Diagramas PlantUML.

## Requisitos
- **Node.js** >= 18 (desarrollado con Node 20).

## Uso rápido
Instala las dependencias y levanta el entorno de desarrollo con:

```bash
npm install
npm run dev
```

## Ejecución de pruebas
Para lanzar la suite de tests ejecuta:

```bash
npm test
```

## Problemas conocidos
- Algunos navegadores requieren permisos de WebXR y cámara sobre HTTPS. Asegúrate de aceptar los permisos cuando se soliciten o la sesión AR no iniciará.
