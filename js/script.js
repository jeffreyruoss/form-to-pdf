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
  const additionalText = getValueById('additional-text');

  try {
    const img = await loadImage(CONFIG.backgroundImagePath);
    const backgroundImage = await fetchImageAsBase64(CONFIG.backgroundImagePath);
    const dimensions = calculateDimensions(img, 72);
    generatePDF(name, additionalText, backgroundImage, dimensions, img);
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
async function generatePDF(name, additionalText, backgroundImage, dimensions, img) {
  const doc = createPDF(dimensions);
  addBackgroundImage(doc, backgroundImage, dimensions, img);
  const fontSize = 12;
  const textColor = '#58595B';
  addText(doc, name, additionalText, dimensions, fontSize, textColor);
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

function addText(doc, name, additionalText, dimensions, fontSize, textColor) {
  // Presented to
  const presentedToText = "Presented to";
  const presentedToFontSize = fontSize * 1.2;
  doc.setFontSize(presentedToFontSize);
  doc.setTextColor(textColor);
  const presentedToX = calculateXPosition(doc, presentedToText, dimensions.width);
  const presentedToY = 3.5;

  doc.text(presentedToText, presentedToX, presentedToY);

  // Name
  const nameFontSize = fontSize * 3;
  doc.setFontSize(nameFontSize);
  const nameX = calculateXPosition(doc, name, dimensions.width);
  const nameY = presentedToY + 0.5;

  doc.text(name, nameX, nameY);

  // For completion of
  const minutes = "5:59";
  const completionText = `For completion of ${minutes} minutes of education:`;
  doc.setFontSize(fontSize);
  const completionX = calculateXPosition(doc, completionText, dimensions.width);
  const completionY = nameY + fontSize * 3.5 / 72;

  doc.text(completionText, completionX, completionY);

  // Additional text
  const additionalTextX = calculateXPosition(doc, additionalText, dimensions.width);
  const additionalTextY = completionY + fontSize / 72 + 0.1;

  doc.text(additionalText, additionalTextX, additionalTextY);

  // Date
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const dateText = `Date: ${formattedDate}`;
  const dateX = calculateXPosition(doc, dateText, dimensions.width);
  const dateY = dimensions.height - 0.5;

  doc.text(dateText, dateX, dateY);
}

function calculateXPosition(doc, text, width) {
  return (width - doc.getTextWidth(text)) / 2;
}

function savePDF(doc) {
  doc.save('generated.pdf');
}
