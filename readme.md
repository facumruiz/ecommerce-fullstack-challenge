# NestJS Ecommerce — Event-Driven Evolution

## Descripción

Evolución de un monolito NestJS hacia un modelo event-driven, con frontend React que refleja cambios asincrónicos en tiempo real.

---

## URLs de acceso

- **Backend:** https://ecommerce-fullstack-challenge.onrender.com
- **Frontend:** https://ecommerce-frontend-six-dusky.vercel.app

> ⚠️ **Nota sobre el backend:** está deployado en Render plan gratuito. Si el servicio estuvo inactivo, puede tardar hasta 60 segundos en responder la primera request (cold start). Esto es una limitación del plan gratuito de Render, no del sistema.

---

## Problemas detectados en el diseño original

### Arquitectura
- **Entidad `Inventory` sin módulo funcional**: existía la entidad pero no había `InventoryService`, `InventoryController` ni `InventoryModule`. El inventario no era accesible ni mantenible.
- **Sin módulo de órdenes**: el sistema no tenía concepto de orden/compra, que es el evento más natural de un e-commerce.
- **Sin eventos de dominio**: toda la lógica estaba acoplada. No había mecanismo para comunicar cambios entre módulos sin importarlos directamente.
- **Comunicación directa entre módulos**: los módulos se acoplaban vía imports directos, dificultando la extensibilidad.

### Implementación
- **`entities` cargadas desde variable de entorno como string glob**: `entities: [process.env.DATABASE_ENTITIES]` es frágil y puede fallar silenciosamente. Se reemplazó por imports explícitos de cada entidad.
- **Validators de class-validator en la entidad `Product`**: decoradores como `@IsDefined()`, `@IsString()` no pertenecen a la entidad sino al DTO. Mezclar responsabilidades dificulta el mantenimiento.
- **Sin CORS configurado**: el backend no aceptaba requests del frontend.
- **Sin `.env.example`**: las variables de entorno requeridas no estaban documentadas, dificultando el setup inicial.

### Dependencias
- **NestJS 9 desactualizado**: limita la compatibilidad con el ecosistema moderno. Por ejemplo, `@nestjs/event-emitter` v3 requiere NestJS 10+, por lo que se usó v1.4.2, compatible con NestJS 9, como solución mínima sin romper el proyecto.

---

## Eventos implementados

### `order.created`
**¿Por qué?** Crear una orden es el punto más natural del dominio donde ocurre un cambio de estado relevante. Toda compra debe descontar stock. En lugar de que `OrderService` llame directamente a `InventoryService` (acoplamiento fuerte), emite un evento que el `InventoryListener` consume de forma desacoplada.

**Flujo:**
```
POST /orders
  → OrderService crea la orden en DB
  → emite evento order.created
  → InventoryListener.handleOrderCreated()
      → descuenta stock en inventario
      → si stock < 5, emite inventory.low_stock
```

### `inventory.low_stock`
**¿Por qué?** Es un evento derivado que representa una condición de negocio importante: stock bajo. Modelarlo como evento permite que múltiples consumidores reaccionen (notificaciones, alertas, reposición automática) sin modificar la lógica de descuento de stock. Actualmente loguea un warning y notifica al frontend vía SSE, pero es fácilmente extensible a email, webhook, etc.

**Flujo:**
```
inventory.low_stock emitido
  → InventoryListener.handleLowStock()
      → Logger.warn()
      → InventorySseService.emit() → frontend recibe alerta en tiempo real
```

---

## Decisiones técnicas relevantes

### Event Emitter sobre message broker
Se usó `@nestjs/event-emitter` (in-process) en lugar de RabbitMQ/Kafka porque el objetivo era demostrar el patrón event-driven con cambios mínimos sobre la base existente. En producción, con múltiples instancias, correspondería migrar a un broker externo.

### Update atómico en inventario
```typescript
await this.inventoryRepo.update(
  { productVariationId, countryCode },
  { quantity: () => `quantity - ${quantity}` },
);
```
Se usa un update directo en DB en lugar de leer-modificar-guardar para evitar race conditions cuando múltiples órdenes se procesan concurrentemente.

### SSE para tiempo real
Se eligió Server-Sent Events sobre WebSockets porque es unidireccional (servidor → cliente), más simple de implementar y suficiente para el caso de uso: notificar al frontend sobre cambios de inventario.

### Módulos desacoplados
`OrderModule` no importa `InventoryModule`. La comunicación es exclusivamente por eventos. Esto permite que cada módulo evolucione independientemente.

---

## Cómo levantar el proyecto

### Requisitos
- Node.js 18+
- Docker y Docker Compose
- npm

### Backend
```bash
# 1. Clonar el repositorio
git clone https://github.com/facumruiz/ecommerce-fullstack-challenge
cd nestjs-ecommerce

# 2. Levantar la base de datos
docker-compose up -d

# 3. Instalar dependencias
npm install

# 4. Correr migraciones
npm run migration:run

# 5. Correr seeders
npm run seed:run

# 6. Levantar el servidor
npm run start:dev
```

El backend corre en `http://localhost:3000`

### Frontend
```bash
cd ecommerce-frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:5173`

### Variables de entorno necesarias
Crear el archivo `src/common/envs/development.env` con:
```
PORT=3000
DATABASE_HOST=localhost
DATABASE_NAME=ecommercedb
DATABASE_USER=hassan
DATABASE_PASSWORD=password
DATABASE_PORT=5432
DATABASE_SSL=false
JWT_SECRET=keep-this-secret-private
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=12345678
```

### Credenciales por defecto
- Email: `admin@admin.com`
- Password: `12345678`

### Datos de prueba
Para probar el flujo de eventos, insertar un registro de inventario:
```bash
# Conectarse a la DB
docker exec -it nestjs-ecommerce-postgres psql -U hassan -d ecommercedb
```
```sql
INSERT INTO product ("code", "title", "variationType", "isActive", "merchantId", "categoryId")
VALUES ('PROD001', 'Test Product', 'NONE', true, 1, 1);

INSERT INTO product_variation ("productId", "sizeCode", "colorName")
VALUES (1, 'NA', 'NA');

INSERT INTO inventory ("productVariationId", "countryCode", "quantity")
VALUES (1, 'EG', 20);
```

---

## Flujo de punta a punta
```
1. Login en el frontend → obtiene JWT
2. Se visualiza el inventario actual
3. Se crea una orden (POST /orders)
4. El backend emite order.created
5. InventoryListener descuenta el stock
6. Si stock < 5, emite inventory.low_stock
7. Ambos eventos llegan al frontend vía SSE en tiempo real
8. La tabla de inventario se actualiza automáticamente
9. Las alertas de low stock se muestran en rojo
```

### Resetear stock para pruebas

Si el stock llega a 0 o se quiere reiniciar para volver a probar el flujo de eventos:
```bash
docker exec -it nestjs-ecommerce-postgres psql -U hassan -d ecommercedb -c "UPDATE inventory SET quantity = 20 WHERE id = 1;"
```
