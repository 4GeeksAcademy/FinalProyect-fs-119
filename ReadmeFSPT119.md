Restaurant Management App
Aplicación web para la gestión de restaurantes, categorías, platos e ingredientes.
Cada usuario puede crear y administrar su propio restaurante, gestionar sus categorías, platos y los ingredientes de cada plato.
 
Estructura General del Proyecto

•	Login / Registro / Logout (autenticación con JWT)
•	Panel privado (Dashboard) con selección de restaurante
•	Gestión completa de:

    –	Restaurantes
    
    –	Categorías
    
    –	Platos
    
    –	Ingredientes
    
    –	Relación plato ↔ ingredientes

•	Perfil de usuario (editable, con foto de perfil, etc.)
 
    Backend
        -Tablas principales
        -Tabla	Descripción
        -Users	Usuarios del sistema
        -Restaurants	Restaurantes asociados a cada usuario
        -Categories	Categorías de los platos
        -Dishes	Platos del restaurante
        -Ingredients	Ingredientes base
        -Dish_ingredient	Relación entre platos e ingredientes
        -Company	Información general de la empresa
     
    Endpoints protegidos con JWT
    
    Perfil
    
        GET /perfil
        PUT /perfil
        DELETE /perfil
        PATCH /perfil/password  # opcional
    
    Restaurantes
        GET /restaurants
        GET /restaurants/:id
        POST /restaurants
        PUT /restaurants/:id
        DELETE /restaurants/:id
    
    Categorías
        GET /categories
        GET /categories/:id
        POST /categories
        PUT /categories/:id
        DELETE /categories/:id
    
    Platos
        GET /dishes
        GET /dishes/:id
        POST /dishes
        PUT /dishes/:id
        DELETE /dishes/:id
    
    Ingredientes
        GET /ingredients
        GET /ingredients/:id
        POST /ingredients
        PUT /ingredients/:id
        DELETE /ingredients/:id
        GET /ingredients/search?name=<string>   # opcional
    
    Relación Plato ↔ Ingredientes
        GET /dishes/:dish_id/ingredients
        POST /dishes/:dish_id/ingredients
        DELETE /dishes/:dish_id/ingredients/:ingredient_id
        PUT /dishes/:dish_id/ingredients/:ingredient_id  # opcional
         
    Endpoints sin JWT
        POST /login
        POST /signup
        POST /logout
     
    Frontend
        Páginas principales
        Página	Ruta	Descripción
        Home	/	Dashboard principal tras iniciar sesión
        Login	/login	Inicio de sesión
        Signup	/signup	Registro de usuario
        Perfil	/perfil	Información y edición de perfil
        Dish	/dish	Gestión y edición de platos
 
              ---Subtareas por página---
Home
    •	Modal perfil → logout / ver perfil
    
    •	Modal añadir categoría
    
    •	Modal seleccionar empresa (al hacer click en dashboard)
    
    •	Si no hay foto en empresa o producto → mostrar inicial del .name

Perfil
    •	Añadir foto de perfil
    
    •	Añadir empresa o editar datos de empresa
    
    •	Más opciones de personalización del usuario
Dish

    •	Modal para editar ingrediente al hacer click en la imagen
    
    •	Editar cantidad usada (peso neto / peso en plato / precio por unidad)
 
          ---Componentes Reutilizables---
      Componente	          Función
      Categories	          Mostrar lista de categorías
      AllDishes	            Mostrar todos los platos
      Ingredients	          Listar ingredientes y gestión
      Dashboard	            Panel principal de usuario
      Navbar	              Navegación superior
      Footer	              Pie de página
      FormRestaurant	      Formulario para restaurante
      FormDish	            Formulario para platos
      Form	                Componentes de formularios genéricos
 
----Tareas pendientes o por aclarar----

Lógica / Backend

  •	☐ Definir cómo se manejará la autenticación JWT (headers, expiración, refresh token).
  
  •	☐ Decidir si /Company será global o por usuario.
  
  •	☐ Añadir endpoint GET /stats → métricas del restaurante (platos totales, ingresos, etc.).
  
  •	☐ Endpoint /upload o integración de almacenamiento para imágenes (Cloudinary, S3…).
  
  •	☐ Validaciones y middlewares para:
      –	Controlar acceso a restaurantes solo del usuario autenticado.
      
      –	Verificar existencia de entidades relacionadas antes de crear (ej. categoría no existe).
      Frontend

  •	☐ Implementar protección de rutas privadas con token (redirect al login).
  
  •	☐ Manejo global de estado (Context API / Zustand / Redux).
  
  •	☐ Indicadores de carga (spinners, skeletons).
  
  •	☐ Toasts / alertas de éxito y error.
  
  •	☐ Diseño responsive en todos los modales.
  
  •	☐ Placeholder dinámico para las iniciales de productos o empresas sin imagen.
      Dev / Organización
  •	☐ Configurar .env (variables para backend y frontend).
  
  •	☐ Crear documentación de instalación y arranque (npm run dev, etc.).
  
  •	☐ Añadir tests básicos (unitarios o de integración).
  
  •	☐ Pipeline o scripts de deploy (Render / Vercel / Netlify / Railway).
 
Notas para el equipo
La idea es que cada bloque (BACKEND / FRONT / IA) se copie directamente a GitHub Projects como columnas o etiquetas.
•	Verde → Tareas listas o terminadas

•	Amarillo → En progreso

•	Rojo → Pendientes o por aclarar
 
Objetivo: Crear una plataforma moderna, modular y escalable para gestión de restaurantes.
