const CONFIG = {
  margin: 1, // inches
  orientation: 'landscape', // 'portrait' or 'landscape' (8.5" x 11")
  backgroundImagePath: 'img/background.png',
}

const jsPDF = window.jspdf.jsPDF;

document.getElementById('pdf-form').addEventListener('submit', onFormSubmit);

async function onFormSubmit(e) {
  e.preventDefault();

  const name = getValueById('name');
  const email = getValueById('email');

  try {
    const img = await loadImage(CONFIG.backgroundImagePath);
    const backgroundImage = await fetchImageAsBase64(CONFIG.backgroundImagePath);
    const dimensions = calculateDimensions(img, 72);
    generatePDF(name, email, backgroundImage, dimensions, img);
  } catch (error) {
    console.error('Error:', error);
  }
}

function getValueById(id) {
  return document.getElementById(id).value;
}

async function fetchImageAsBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// PDF generation functions
async function generatePDF(name, email, backgroundImage, dimensions, img) {
  const doc = createPDF(dimensions);
  addBackgroundImage(doc, backgroundImage, dimensions, img);
  const fontSize = 16;
  addText(doc, name, email, dimensions, fontSize);
  savePDF(doc);
}

async function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

function calculateDimensions(img, dpi) {
  let width, height;

  if (CONFIG.orientation === 'portrait') {
    width = 8.5;
    height = 11;
  } else {
    width = 11;
    height = 8.5;
  }

  return {
    width: width,
    height: height,
  };
}
function createPDF(dimensions) {
  return new jsPDF({
    orientation: CONFIG.orientation,
    unit: 'in',
    format: [dimensions.width, dimensions.height],
  });
}

function addBackgroundImage(doc, backgroundImage, dimensions, img) {
  const scaleX = (dimensions.width - 2 * CONFIG.margin) / img.width;
  const scaleY = (dimensions.height - 2 * CONFIG.margin) / img.height;
  const scale = Math.min(scaleX, scaleY);

  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;

  const backgroundX = (dimensions.width - scaledWidth) / 2;
  const backgroundY = (dimensions.height - scaledHeight) / 2;

  doc.addImage(backgroundImage, 'PNG', backgroundX, backgroundY, scaledWidth, scaledHeight);
}

function addText(doc, name, email, dimensions, fontSize) {
  doc.setFontSize(fontSize);

  const nameText = `Name: ${name}`;
  const emailText = `Email: ${email}`;

  const nameX = calculateXPosition(doc, nameText, dimensions.width);
  const emailX = calculateXPosition(doc, emailText, dimensions.width);

  const centerY = dimensions.height / 2;

  const nameY = centerY - fontSize / 72;
  const emailY = centerY + fontSize / 72;

  doc.text(nameText, nameX, nameY);
  doc.text(emailText, emailX, emailY);
}


function calculateXPosition(doc, text, width) {
  return (width - doc.getTextWidth(text)) / 2;
}

function savePDF(doc) {
  doc.save('generated.pdf');
}
