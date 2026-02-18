const cloudinaryLib = require('cloudinary');
const cloudinary = cloudinaryLib.v2;
const multer = require('multer');
const streamifier = require('streamifier');
require('dotenv').config();

// 🔍 Validar variables de entorno de Cloudinary
console.log('\n☁️  Validando configuración de Cloudinary...');
const requiredCloudinaryVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingCloudinaryVars = requiredCloudinaryVars.filter(varName => !process.env[varName]);

if (missingCloudinaryVars.length > 0) {
  console.error('❌ Variables de entorno faltantes para Cloudinary:');
  missingCloudinaryVars.forEach(varName => console.error(`   📌 ${varName}`));
  process.exit(1);
}

console.log('   ✅ Variables de entorno configuradas');
console.log(`   ☁️  Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
console.log(`   🔑 API Key: ${process.env.CLOUDINARY_API_KEY?.substring(0, 8)}...`);

// ✅ Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  timeout: 30000
});

// 🔗 Probar conexión a Cloudinary
cloudinary.api.ping()
  .then((result) => {
    console.log('✅ Conexión a Cloudinary exitosa');
    console.log(`   ⚡ Respuesta: ${result.status}`);
  })
  .catch((error) => {
    console.error('❌ Error conectando a Cloudinary:', error.message);
  });

// 🧠 FUNCIÓN SIMPLIFICADA: Crear uploader con memoria
const createUploader = (folderName = 'espumas_plasticos_general', fieldName = 'imagen') => {
  console.log(`📁 Configurando uploader para carpeta: ${folderName}, campo: ${fieldName}`);
  
  const multerMiddleware = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (validTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Formato de imagen no permitido. Solo JPEG, PNG, JPG, WEBP'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  });
  
  return multerMiddleware.single(fieldName);
};

// 📤 FUNCIÓN PARA SUBIR A CLOUDINARY
const uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    console.log(`☁️  Iniciando upload a carpeta: ${folderName}`);
    
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout: Cloudinary no respondió en 25 segundos'));
    }, 25000);
    
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          public_id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          transformation: [{ width: 800, height: 600, crop: 'limit' }]
        },
        (error, result) => {
          clearTimeout(timeoutId);
          
          if (error) {
            console.error('❌ Error en Cloudinary:', error);
            reject(error);
          } else {
            console.log(`✅ Upload completado: ${result.public_id}`);
            resolve(result);
          }
        }
      );
      
      uploadStream.on('error', (streamError) => {
        clearTimeout(timeoutId);
        console.error('❌ Error en stream:', streamError);
        reject(streamError);
      });
      
      const readableStream = streamifier.createReadStream(fileBuffer);
      readableStream.pipe(uploadStream);
      
      readableStream.on('error', (readError) => {
        clearTimeout(timeoutId);
        console.error('❌ Error lectura stream:', readError);
        reject(readError);
      });
      
    } catch (setupError) {
      clearTimeout(timeoutId);
      console.error('❌ Error configurando upload:', setupError);
      reject(setupError);
    }
  });
};

// 🔍 Función para probar conexión a Cloudinary
async function testCloudinaryConnection() {
  try {
    console.log('\n☁️  Probando conexión a Cloudinary...');
    
    const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Variables de entorno faltantes para Cloudinary:');
      missingVars.forEach(varName => console.error(`   📌 ${varName}`));
      return false;
    }
    
    console.log('   ✅ Variables de entorno configuradas');
    console.log(`   🌩️  Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`   🔑 API Key: ${process.env.CLOUDINARY_API_KEY?.substring(0, 8)}...`);
    
    // Test de ping con timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout en ping a Cloudinary')), 10000);
    });
    
    const pingPromise = cloudinary.api.ping();
    const result = await Promise.race([pingPromise, timeoutPromise]);
    
    if (result.status === 'ok') {
      console.log('✅ Conexión a Cloudinary exitosa');
      console.log(`   ⚡ Respuesta: ${result.status} (${result.message || 'Servicio disponible'})`);
      return true;
    } else {
      console.error('❌ Cloudinary respondió con error:', result);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error conectando a Cloudinary:', error.message);
    return false;
  }
}

// 🔄 Función para eliminar imagen de Cloudinary
async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('❌ Error eliminando imagen:', error.message);
    return false;
  }
}

// 📊 Función para obtener URL optimizada
function getOptimizedUrl(publicId, width = 800, height = 600) {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  });
}

// 🚀 Exportamos para uso en rutas o controladores
module.exports = {
  cloudinary,
  createUploader,
  uploadToCloudinary,
  testCloudinaryConnection,
  deleteImage,
  getOptimizedUrl
};
