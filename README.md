# Backend I - Proyecto Final 1 - Sofía Cerminati

Este proyecto es la programación del Backend del E-Commerce So-Games, para juegos de mesa.

## Tabla de Contenidos

1. [Instalación](#instalación)
2. [Servidor](#servidor)
3. [Routers](#routers)
4. [File System](#file-system)
5. [Endpoints](#endpoints)
6. [Visualización y Gestión de Productos en FrontEnd](#visualización-y-gestión-de-productos-en-frontend)
7. [Recursos Utilizados](#recursos-utilizados)

## Instalación

1. Clonar el repositorio

```bash
git clone https://github.com/scerminati/BE_PF1_Cerminati.git
```

2. Navegar al directorio del repositorio

```bash
cd BE-PF1-Cerminati
```

3. Instalar las dependencias

```bash
npm install
```

4. Inicia la aplicación

```bash
npm start
```

## Servidor

El servidor está configurado para ejecutarse en _localhost_ en el puerto _8080_.

## Routers

La aplicación cuenta con tres routers, _products_, _carts_ y _views_. _Products_ contiene los métodos **GET**, **POST**, **PUT** y **DELETE**, mientras que _carts_ tiene solamente los métodos **GET**, **POST** y **PUT**. Para acceder a los métodos de productos, se debe ir a la ruta **/api/products**, consecuentemente el de carts es **/api/carts/**. _Views_ permite renderizar en los handlebars la información en pantalla mediante el método **GET**.

## File System

Se tienen dos archivos .json en la carpeta ./json, _products.json_, el cual cuenta con 48 productos con los respectivos ids, título, código, descripción, status, stock, categoría y thumbnail; y _carts.json_, que comienza con un array vacío. A medida que se ejecuten los métodos en la aplicación, ambos archivos se leerán y se actualizarán según corresponda.

## Endpoints

### Products

- **GET**: El método permite obtener el listado completo de los productos con todo su detalle. Si se especifica un id, **/api/products/_id_**, el método mostrará el producto con dicho id si existe tal. Asimismo, al especificar un límite como pedido con **/api/products/?limit=_X_**, se devuelve el listado de productos limitados en cantidad X.

- **POST**: El método permite agregar un nuevo producto. El id del nuevo producto se define solo, de manera que no se repita con ninguno de los anteriores. El método también toma como obligatorios los campos de título, código, descripción, stock y categoría, así como también el tipo de dato que se ingresa. Si stock pasa a tener un valor de 0, el status se añadirá al producto como _false_, de lo contrario, siempre será _true_. En cuanto a thumbnail, espera recibir un string, pero el ingreso de dicho dato no es necesario. En caso de no recibirlo o recibir otro tipo de dato (como numérico), se completará como un string vacío. Una vez realizado el método, se actualiza el archivo en la carpeta json. El método debe ejecutarse en la raíz de la api, **/api/products/**.

- **PUT**: Este método permite modificar cualquiera de los productos que se encuentran en la base de datos especificando el id del mismo mediante **/api/products/_id_**. El método buscará los datos a cambiar y solo cambiará los mismos, sin necesidad de volver a escribir todo el producto, o lo que se desea dejar igual. En caso de que el producto no exista, devolverá un error _404_.

- **DELETE**: El método busca el producto mediante la especificación del id **/api/products/_id_**, y elimina el producto del array, actualizando el archivo al hacerlo.

### Carts

- **GET**: El método permite obtener el listado completo de los carritos con el detalle de id y los productos dentro de ellos, especificando id y cantidad. Si se especifica un id, **/api/carts/_id_**, el método mostrará el carrito con dicho id si existe. Asimismo, al especificar un límite como pedido con **/api/carts/?limit=_X_**, se devuelve el listado de carritos limitados en cantidad X.

- **POST**: El método debe ejecutarse en la raíz **/api/carts**, y generará un nuevo carrito con un id asignado automáticamente. El mismo se guardará en el archivo .json y generará el array de productos vacíos para luego ser añadidos.

- **PUT**: El método necesita dos parámetros: el id del carrito y el id del producto a agregar. Se debe ejecutar en la ruta **/api/carts/_idCarrito_/product/_idProducto_**. Ambos ids deben ser válidos y existir en los arrays correspondientes. Si tanto el id como el producto existen, se verifica primero que el status del producto sea **_true_**, lo cual implica que hay stock disponible. En caso de que sea falso, se arroja un error _404_. Si hay stock, se agrega a cantidades del producto de a 1, generando un nuevo objeto de producto con el id del producto en caso de que no exista, y sumando una cantidad de 1 si ya existe. A medida que se agregan productos, se van descontando del array de productos la misma cantidad en stock. En caso de que el stock llegue a 0, el método arroja un error _404_ avisando que no hay más stock para agregar.

## Visualización y Gestión de Productos en FrontEnd

### Templates de Handlebars

- **index**: Permite acceder al listado completo de productos.
- **realtimeproducts**: La aplicación cuenta con una funcionalidad en tiempo real que permite la visualización y gestión dinámica de productos desde una vista de administrador. Esta funcionalidad se implementa utilizando **Socket.io** para permitir la comunicación en tiempo real entre el servidor y el cliente.

## Esqueleto del Proyecto
```bash
BE-PF1-Cerminati/
│
├── src/
│ ├── routes/
│ │ ├── productRoutes.js # Rutas para productos
│ │ ├── cartRoutes.js # Rutas para carritos
│ │ └── viewRoutes.js # Rutas para vistas (handlebars)
│ │
│ ├── models/
│ │ ├── productModel.js # Modelo de datos para productos
│ │ └── cartModel.js # Modelo de datos para carritos
│ │
│ ├── views/
│ │ ├── index.handlebars # Plantilla para listado de productos
│ │ └── realtimeproducts.handlebars # Plantilla para gestión de productos en tiempo real
│ │
│ ├── utils/
│ │ ├── fileSystem.js # Utilidades para manejo de archivos
│ │ └── helpers.js # Helpers Handlebars
│ │
│ ├── config/
│ │ └── serverConfig.js # Configuración del servidor
│ │
│ ├── public/
│ │ ├── images/ # Imágenes utilizadas en la aplicación
│ │ └── styles/ # Hojas de estilo CSS
│ │
│ └── server.js # Archivo principal para iniciar el servidor
│
├── .gitignore # Archivos y carpetas a ignorar por Git
├── package.json # Archivo de configuración de dependencias
└── README.md # Archivo de documentación del proyecto
```


### Descripción de Carpetas y Archivos

- **`src/controllers/`**: Contiene los controladores para manejar las solicitudes de productos y carritos.
- **`src/routes/`**: Define las rutas de la API y las vistas para el frontend.
- **`src/models/`**: Modelos de datos que definen la estructura de los productos y carritos.
- **`src/views/`**: Plantillas Handlebars para la visualización de productos y la gestión en tiempo real.
- **`src/utils/`**: Utilidades y helpers para la manipulación de archivos y Handlebars.
- **`src/config/`**: Configuración del servidor y otros ajustes importantes.
- **`src/public/`**: Archivos estáticos como imágenes y hojas de estilo.
- **`server.js`**: Archivo principal que arranca el servidor y configura la aplicación.
- **`json/`**: Archivos JSON utilizados para almacenar datos de productos y carritos.
- **`.gitignore`**: Lista de archivos y carpetas que Git debe ignorar.
- **`package.json`**: Configuración del proyecto y dependencias.
- **`README.md`**: Documentación del proyecto.



## Recursos Utilizados

Este proyecto utiliza las siguientes tecnologías y bibliotecas:

- **[Express](https://expressjs.com/)**: Un marco web para Node.js, utilizado para construir el backend.
  - Versión: `^4.19.2`
- **[Express Handlebars](https://handlebarsjs.com/)**: Motor de plantillas para generar vistas HTML dinámicas.
  - Versión: `^7.1.3`
- **[Multer](https://www.npmjs.com/package/multer)**: Middleware para manejar `multipart/form-data`, utilizado para la carga de archivos.
  - Versión: `^1.4.5-lts.1`
- **[Socket.io](https://socket.io/)**: Biblioteca para la comunicación en tiempo real entre el servidor y el cliente.
  - Versión: `^4.7.5`

