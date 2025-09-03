# 🌐 Telefunken - Backend

Servidor Node.js con Socket.IO para partidas multijugador en tiempo real. Gestiona salas de juego, puntuaciones de jugadores y persistencia de datos en MongoDB.

## 🚀 Características Principales

- **⚡ Tiempo Real**: Comunicación bidireccional con Socket.IO
- **🎮 Gestión de Partidas**: Crear, unirse y administrar salas de juego
- **📊 Sistema de Puntuaciones**: Registro y actualización de puntos por jugador
- **💾 Persistencia**: Almacenamiento en MongoDB de partidas y estadísticas
- **🔧 API REST**: Endpoints para operaciones CRUD
- **🌐 CORS**: Configurado para conexiones cross-origin
- **🧪 Testing**: Suite de pruebas automatizadas

## 🛠️ Tecnologías

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.21.2
- **WebSockets**: Socket.IO 4.8.1
- **Base de Datos**: MongoDB 8.10.1
- **ODM**: Mongoose (si se usa)
- **Desarrollo**: Nodemon 3.1.9
- **Testing**: Jest 29.7.0
- **Otros**: CORS 2.8.5, dotenv 16.4.7

## 📋 Prerrequisitos

- Node.js 18.0.0+
- npm 9.0.0+
- MongoDB 6.0+ (local o en la nube)

```bash
# Verificar versiones
node --version
npm --version
mongod --version
```

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Jeyner17/Telefuken-Backend.git
cd Telefunken-Backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Crear archivo de variables de entorno
cp .env.example .env
```

Editar `.env`:
```bash
# Puerto del servidor
PORT=3000

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/telefunken
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/telefunken

# Configuración CORS
CORS_ORIGIN=http://localhost:4200,https://tu-frontend.vercel.app

# Entorno
NODE_ENV=development
```

### 4. Iniciar MongoDB (si es local)
```bash
# En Windows
mongod

# En Linux/macOS
sudo systemctl start mongod
```

### 5. Ejecutar el servidor
```bash
# Desarrollo con nodemon
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
src/
├── config/
│   ├── config.js              # Configuración general
│   └── database.js            # Configuración MongoDB
├── models/
│   ├── Game.js                # Modelo de partidas
│   └── Room.js                # Modelo de salas
├── services/
│   ├── GameDBService.js       # Servicio de base de datos para juegos
│   └── RoomService.js         # Servicio de gestión de salas
├── socket/
│   └── handlers/
│       ├── roomHandler.js     # Manejadores de eventos de salas
│       └── socket.js          # Configuración principal de Socket.IO
├── tests/
│   ├── models/
│   │   ├── Game.test.js       # Tests del modelo Game
│   │   └── Room.test.js       # Tests del modelo Room
│   └── services/
│       ├── GameDBService.test.js    # Tests del servicio de DB
│       └── RoomService.test.js      # Tests del servicio de salas
└── server.js                  # Punto de entrada principal
```

## 🎮 Funcionalidades del Socket

### Eventos de Sala
```javascript
// Cliente se une a una sala
socket.emit('join-room', { roomCode: 'ABC123', playerName: 'Jugador1' });

// Crear nueva sala
socket.emit('create-room', { hostName: 'Anfitrion', maxPlayers: 4 });

// Iniciar partida
socket.emit('start-game', { roomCode: 'ABC123' });
```

### Eventos de Juego
```javascript
// Actualizar puntuación
socket.emit('update-score', { 
  roomCode: 'ABC123', 
  playerId: 'player1', 
  score: 150 
});

// Finalizar partida
socket.emit('end-game', { roomCode: 'ABC123' });
```

### Eventos del Servidor
```javascript
// Confirmación de unión
socket.on('room-joined', (data) => {
  console.log(`Unido a sala: ${data.roomCode}`);
});

// Actualización de jugadores
socket.on('players-updated', (players) => {
  console.log('Jugadores actualizados:', players);
});

// Puntuaciones en tiempo real
socket.on('score-updated', (data) => {
  console.log(`Nuevo puntaje: ${data.score}`);
});
```

## 🛣️ Endpoints API

### Salas
```bash
# Obtener todas las salas activas
GET /api/rooms

# Obtener información de sala específica
GET /api/rooms/:roomCode

# Crear nueva sala
POST /api/rooms
{
  "hostName": "Anfitrión",
  "maxPlayers": 4
}

# Eliminar sala
DELETE /api/rooms/:roomCode
```

### Partidas
```bash
# Obtener historial de partidas
GET /api/games

# Obtener partida específica
GET /api/games/:gameId

# Guardar nueva partida
POST /api/games
{
  "roomCode": "ABC123",
  "players": [...],
  "scores": {...},
  "duration": 1200
}
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage de tests
npm run test:coverage

# Tests específicos
npm test -- --testPathPattern=Room
```

## 📊 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor con nodemon
npm start           # Servidor en producción

# Testing
npm test            # Ejecutar tests
npm run test:watch  # Tests en modo watch

# Base de datos
npm run db:seed     # Poblar BD con datos de prueba
npm run db:reset    # Limpiar base de datos

# Utilidades
npm run lint        # Verificar código
npm run format      # Formatear código
```

## 🔧 Configuración de MongoDB

### Colecciones principales:

#### Games
```javascript
{
  _id: ObjectId,
  roomCode: String,
  players: [
    {
      id: String,
      name: String,
      score: Number,
      joinedAt: Date
    }
  ],
  status: String, // 'waiting', 'playing', 'finished'
  createdAt: Date,
  finishedAt: Date,
  duration: Number, // en segundos
  finalScores: Object
}
```

#### Rooms
```javascript
{
  _id: ObjectId,
  code: String, // Código único de sala
  hostId: String,
  hostName: String,
  maxPlayers: Number,
  currentPlayers: Number,
  status: String, // 'waiting', 'playing', 'finished'
  createdAt: Date,
  gameId: ObjectId // Referencia a la partida
}
```

## 🌐 Despliegue

### Variables de entorno para producción:
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/telefunken
CORS_ORIGIN=https://tu-frontend-domain.com
```

### Docker (opcional):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🚨 Solución de Problemas

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté corriendo
mongosh --eval "db.runCommand({ connectionStatus: 1 })"

# Verificar variable de entorno
echo $MONGODB_URI
```

### Error de CORS
```bash
# Verificar configuración en config.js
# Asegurar que el frontend esté en la lista de orígenes permitidos
```

### Error de Socket.IO
```bash
# Verificar que el cliente use la misma versión
# Comprobar configuración de transports
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Jeyner Manzaba**
- GitHub: [@Jeyner17](https://github.com/Jeyner17)
- Email: jeyner.oswaldo@gmail.com

## 🔗 Enlaces Relacionados

- [Frontend de Telefunken](https://github.com/Jeyner17/Telefuken-Frontend)

---

⭐ Si este proyecto te fue útil, ¡no olvides darle una estrella!
