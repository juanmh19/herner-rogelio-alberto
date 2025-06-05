const [, , method, resource, ...params] = process.argv;
const API_BASE_URL = 'https://fakestoreapi.com';

async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(' Error en la petición:', error.message);
        process.exit(1);
    }
}

async function getAllProducts() {
    console.log(' Obteniendo todos los productos...\n');
    
    const products = await makeRequest(`${API_BASE_URL}/products`);
    
    console.log(` Total de productos encontrados: ${products.length}\n`);
    
    products.forEach(product => {
        console.log(` ID: ${product.id}`);
        console.log(` Título: ${product.title}`);
        console.log(` Precio: $${product.price}`);
        console.log(` Categoría: ${product.category}`);
        console.log(` Rating: ${product.rating.rate} (${product.rating.count} reseñas)`);
        console.log('─'.repeat(50));
    });
}

async function getProductById(productId) {
    console.log(` Buscando producto con ID: ${productId}...\n`);
    
    const product = await makeRequest(`${API_BASE_URL}/products/${productId}`);
    
    console.log(' Producto encontrado:\n');
    console.log(` ID: ${product.id}`);
    console.log(` Título: ${product.title}`);
    console.log(` Precio: $${product.price}`);
    console.log(` Categoría: ${product.category}`);
    console.log(` Descripción: ${product.description}`);
    console.log(` Imagen: ${product.image}`);
    console.log(` Rating: ${product.rating.rate} (${product.rating.count} reseñas)`);
}

async function createProduct(title, price, category) {
    console.log('🆕 Creando nuevo producto...\n');
    
    const newProduct = {
        title: title,
        price: parseFloat(price),
        description: `Producto ${title} de la categoría ${category}`,
        image: 'https://fakestoreapi.com/img/placeholder.jpg',
        category: category
    };
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    };
    
    const result = await makeRequest(`${API_BASE_URL}/products`, options);
    
    console.log(' Producto creado exitosamente:\n');
    console.log(` ID: ${result.id}`);
    console.log(` Título: ${result.title || title}`);
    console.log(` Precio: $${result.price || price}`);
    console.log(` Categoría: ${result.category || category}`);
    console.log(` Descripción: ${result.description || newProduct.description}`);
}

async function deleteProduct(productId) {
    console.log(` Eliminando producto con ID: ${productId}...\n`);
    
    const options = {
        method: 'DELETE'
    };
    
    const result = await makeRequest(`${API_BASE_URL}/products/${productId}`, options);
    
    console.log(' Producto eliminado exitosamente:');
    console.log(` ID eliminado: ${productId}`);
    console.log(' Respuesta del servidor:', result);
}

function showHelp() {
    console.log(' GESTOR DE PRODUCTOS - TECHLAB PROJECT\n');
    console.log(' Comandos disponibles:\n');
    console.log(' Obtener todos los productos:');
    console.log(' npm run start GET products\n');
    console.log(' Obtener un producto específico:');
    console.log(' npm run start GET products/<productId>');
    console.log(' Ejemplo: npm run start GET products/15\n');
    console.log(' Crear un nuevo producto:');
    console.log(' npm run start POST products <title> <price> <category>');
    console.log(' Ejemplo: npm run start POST products T-Shirt-Rex 300 remeras\n');
    console.log(' Eliminar un producto:');
    console.log(' npm run start DELETE products/<productId>');
    console.log(' Ejemplo: npm run start DELETE products/7\n');
    console.log(' Usa cualquier comando para comenzar!');
}

async function processCommand() {
    // Validar que se proporcionaron argumentos
    if (!method || !resource) {
        showHelp();
        return;
    }
    
    // Validar que el recurso sea 'products'
    if (!resource.startsWith('products')) {
        console.error(' Error: Solo se admite el recurso "products"');
        showHelp();
        return;
    }
    
    try {
        switch (method.toUpperCase()) {
            case 'GET':
                // Verificar si se solicita un producto específico
                if (resource.includes('/')) {
                    const productId = resource.split('/')[1];
                    if (!productId || isNaN(productId)) {
                        console.error(' Error: ID de producto inválido');
                        return;
                    }
                    await getProductById(productId);
                } else {
                    await getAllProducts();
                }
                break;
                
            case 'POST':
                // Verificar que se proporcionaron todos los parámetros
                if (params.length < 3) {
                    console.error(' Error: Faltan parámetros para crear el producto');
                    console.log(' Uso: npm run start POST products <title> <price> <category>');
                    return;
                }
                
                const [title, price, category] = params;
                
                // Validar precio
                if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
                    console.error(' Error: El precio debe ser un número válido mayor a 0');
                    return;
                }
                
                await createProduct(title, price, category);
                break;
                
            case 'DELETE':
                // Verificar que se especificó un ID
                if (!resource.includes('/')) {
                    console.error(' Error: Debe especificar un ID de producto para eliminar');
                    console.log(' Uso: npm run start DELETE products/<productId>');
                    return;
                }
                
                const productIdToDelete = resource.split('/')[1];
                if (!productIdToDelete || isNaN(productIdToDelete)) {
                    console.error(' Error: ID de producto inválido');
                    return;
                }
                
                await deleteProduct(productIdToDelete);
                break;
                
            default:
                console.error(` Error: Método HTTP "${method}" no soportado`);
                console.log('💡 Métodos disponibles: GET, POST, DELETE');
                showHelp();
                break;
        }
    } catch (error) {
        console.error(' Error inesperado:', error.message);
        process.exit(1);
    }
}

console.log('Iniciando Gestor de Productos TechLab...\n');
processCommand();