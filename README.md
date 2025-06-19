# Proyecto de Psicología

## Estructura del Proyecto

```
proyecto_psicologia/
├── src/                    # Código fuente del frontend
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas de la aplicación
│   ├── routes/            # Configuración de rutas
│   ├── services/          # Servicios y llamadas a API
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilidades y funciones auxiliares
│   ├── types/             # Definiciones de tipos TypeScript
│   ├── context/           # Contextos de React
│   └── config/            # Configuración de la aplicación
│
├── server/                # Código del backend
│   ├── routes/            # Rutas de la API
│   ├── models/            # Modelos de datos
│   └── middleware/        # Middleware de Express
│
├── public/                # Archivos estáticos
└── tests/                 # Pruebas unitarias y de integración
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run test`: Ejecuta las pruebas
- `npm run lint`: Ejecuta el linter

## Tecnologías Principales

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Base de datos: MongoDB
- Estilos: Tailwind CSS
- Testing: Vitest 