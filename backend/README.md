# Backend Seguro para IAGen

## Descripción

Backend Node.js + Express que actúa como proxy seguro entre el frontend y las APIs de IA. 

**Ventajas:**
- ✅ Las API keys quedan en servidor (no se exponen al cliente)
- ✅ Control centralizado de acceso
- ✅ Posibilidad de agregar rate limiting, logging, autenticación futura
- ✅ El frontend no necesita conocer las claves

## Instalación

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` y agrega tus API keys:
```
GROQ_API_KEY=tu_clave_aqui
GEMINI_API_KEY=tu_clave_aqui
OPENROUTER_API_KEY=tu_clave_aqui
PORT=8080
CORS_ORIGIN=http://localhost:5173
```

### 3. Ejecutar el servidor
**Desarrollo (con auto-reload):**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:8080`

### ⚠️ Nota sobre el servidor
En el servidor de producción, las URLs `/api/*` se redirigen automáticamente al puerto 8080. Si el frontend vive en otro dominio, ajusta `CORS_ORIGIN` y el proxy reverso del despliegue; el frontend no necesita `.env` propio.

## Endpoints

Todos los endpoints aceptan JSON y devuelven JSON.

### Groq
```
POST /api/groq
Body: { messages, model?, temperature? }
```

### Gemini
```
POST /api/gemini
Body: { messages, model? }
```

### OpenRouter
```
POST /api/openrouter
Body: { messages, model?, temperature? }
```

### Ollama (Local)
```
POST /api/ollama
Body: { messages, model?, temperature? }
```

### Health Check
```
GET /health
Response: { status: "ok", timestamp: "..." }
```

## Integración con Frontend

### Cambios en apiFunctions.js

En lugar de llamar directamente a las APIs, ahora llamas al backend:

**Antes (Groq):**
```javascript
export const fetchFromGroq = (messages) => {
    return fetch('https://api.groq.com/openai/v1/chat/completions', {
        headers: { Authorization: 'Bearer <clave>' },
        ...
    });
};
```

**Después (Groq via Backend):**
```javascript
// En desarrollo: http://localhost:8080
// En producción: /api (se redirige automáticamente)
const getBackendUrl = () => {
    if (import.meta.env.DEV) {
        return 'http://localhost:8080';
    }
    return ''; // En producción, las URLs /api/* se redirigen automáticamente
};

export const fetchFromGroq = (messages, model = 'llama-3.3-70b-versatile') => {
    return fetchIA({
        url: `${getBackendUrl()}/api/groq`,
        model,
        apiKey: null, // El backend maneja la autenticación
        messages
    });
};
```

### Variables de entorno frontend (.env)

**Desarrollo:**
```
# Apunta a localhost:8080 para desarrollo local
```

**Producción:**
```
# Las URLs /api/* se redirigen automáticamente al puerto 8080
```

### Cambios en fetchIA base
```javascript
const fetchIA = async ({
    url,
    model,
    apiKey,      // null si es via backend
    messages,
    temperature = 0.7,
    headers = {},
}) => {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            ...headers
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
        }),
    });
    // ... resto igual
};
```

## Seguridad

### ⚠️ IMPORTANTE
- **NUNCA** subas `.env` a Git (ya está en `.gitignore`)
- **NUNCA** expongas el backend sin HTTPS en producción
- Considera agregar rate limiting en producción
- Considera agregar autenticación (JWT, API keys propias) si es necesario

### En Producción
```bash
# Usar HTTPS
# Agregar rate limiting
# Agregar logging
# Monitorear uso de APIs
# Usar variables de entorno del sistema, no archivos .env
```

## Deployment

### Con Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
CMD ["npm", "start"]
```

### Tu servidor (con redirección /api/*)
1. Sube los archivos del backend
2. Configura variables de entorno en el servidor (API keys)
3. Asegúrate de que el backend corre en puerto 8080
4. Verifica que el servidor redirige `/api/*` al puerto 8080
5. Ejecuta `npm install && npm start`
6. Usa un process manager (PM2, systemd, etc.)

**Ejemplo con PM2:**
```bash
cd backend
npm install
pm2 start server.js --name "iagen-backend"
pm2 save
pm2 startup
```

## Troubleshooting

### "Connection refused al backend"
- Verifica que el backend está corriendo: `npm run dev`
- Verifica el puerto: `netstat -ano | findstr 8080` (Windows) o `lsof -i :8080` (Mac/Linux)
- Verifica que el servidor redirige `/api/*` al puerto 8080 correctamente
- Verifica CORS: el frontend debe estar en whitelist

### "401 Unauthorized" desde backend
- Verifica que las API keys en `.env` son correctas
- Verifica que no tienen espacios al principio/final
- Intenta una llamada manual con curl para aislar el problema

## Configuración en el servidor web

Asegúrate de que tu servidor web (Apache, Nginx, etc.) esté configurado para:

```nginx
# Nginx ejemplo
location /api/ {
    proxy_pass http://localhost:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

```apache
# Apache ejemplo (mod_proxy)
<Location /api/>
    ProxyPass http://localhost:8080/api/
    ProxyPassReverse http://localhost:8080/api/
</Location>
```

## Próximas mejoras
- [ ] Agregar rate limiting por IP
- [ ] Agregar autenticación con JWT
- [ ] Agregar logging de llamadas (para auditoría)
- [ ] Agregar endpoint de estadísticas de uso
- [ ] Cachear respuestas repetidas
