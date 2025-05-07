// Script para generar imágenes de categorías
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Datos de las marcas y sus categorías
const brandCategories = {
  bosch: [
    "Rotomartillos y taladros",
    "Amoladoras",
    "Herramienta para madera",
    "Herramientas de medición",
    "Herramienta a Batería 12V y 18V",
    "Limpieza y jardineria"
  ],
  makita: [
    "Taladros inalámbricos",
    "Amoladoras",
    "Herramienta para madera",
    "Herramientas de medición",
    "Herramienta a Batería 12V y 18V",
    "Limpieza y jardineria"
  ],
  husqvarna: [
    "Cortadoras de concreto",
    "Apisonadoras o bailarinas",
    "Placas Vibratorias",
    "Rodillos Vibratorios",
    "Desbaste y pulido de concreto",
    "Barrenadores",
    "Accesorios y Herramientas de diamante"
  ],
  honda: [
    "Generadores",
    "Motobombas 2 y 3 pulgadas",
    "Motores de 6.5hp, 9hp y 14hp"
  ],
  marshalltown: [
    "Llanas tipo avión",
    "Llanas tipo fresno",
    "Texturizadores 1/2, 3/4 y 1 pulgada",
    "Regla Vibratoria",
    "Llanas Manuales",
    "Orilladores",
    "Barredoras de concreto",
    "Cortadores de concreto"
  ],
  mpower: [
    "Motores a gasolina 6.5, 9, 15hp.",
    "Motobombas 2 y 3 pulgadas.",
    "Generadores de luz de 3,500w a 8000w.",
    "Soldadora 200 A.",
    "Discos de 14 in para corte de concreto",
    "Accesorios"
  ],
  cipsa: [
    "Revolvedoras para concreto de 1 y 2 sacos",
    "Vibradores a gasolina para concreto",
    "Rodillos Vibratorios",
    "Apisonadores o bailarinas",
    "Torres de ilumiación",
    "Soldadoras",
    "Bombas para concreto"
  ]
};

// Colores para cada marca
const brandColors = {
  bosch: '#00A3E0',
  makita: '#0067B1',
  husqvarna: '#FF7900',
  honda: '#E10000',
  marshalltown: '#FFD700',
  mpower: '#008000',
  cipsa: '#800080'
};

// Función para generar un slug a partir del nombre de la categoría
function generateSlug(categoryName) {
  return categoryName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

// Función para generar una imagen para una categoría
function generateCategoryImage(brand, category) {
  const slug = generateSlug(category);
  const outputPath = path.join(__dirname, '..', '..', 'public', 'images', brand, `${slug}.png`);
  
  // Crear el directorio si no existe
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Crear un canvas para la imagen
  const width = 300;
  const height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Dibujar el fondo
  ctx.fillStyle = brandColors[brand] || '#333333';
  ctx.fillRect(0, 0, width, height);
  
  // Dibujar un borde
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 5;
  ctx.strokeRect(10, 10, width - 20, height - 20);
  
  // Configurar el texto
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Dividir el texto en líneas si es demasiado largo
  const words = category.split(' ');
  let lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > width - 40 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Dibujar las líneas de texto
  const lineHeight = 25;
  const totalTextHeight = lines.length * lineHeight;
  const startY = (height - totalTextHeight) / 2;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });
  
  // Guardar la imagen
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Generada imagen para ${brand} - ${category}: ${outputPath}`);
}

// Generar imágenes para todas las categorías de todas las marcas
Object.entries(brandCategories).forEach(([brand, categories]) => {
  categories.forEach(category => {
    generateCategoryImage(brand, category);
  });
});

console.log('Generación de imágenes completada.');
