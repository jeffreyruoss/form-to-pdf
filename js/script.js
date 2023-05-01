// Event listeners
document.getElementById('pdf-form').addEventListener('submit', onFormSubmit);

// Event handler functions
async function onFormSubmit(e) {
  e.preventDefault();

  const name = getValueById('name');
  const email = getValueById('email');

  try {
    const backgroundImage = await fetchImageAsBase64('img/background.png');
    generatePDF(name, email, backgroundImage);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Utility functions
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
async function generatePDF(name, email, backgroundImage) {
  const { jsPDF } = window.jspdf;
  const dpi = 72;

  const img = await loadImage(backgroundImage);

  const dimensions = calculateDimensions(img, dpi);

  const doc = createPDF(dimensions);

  addBackgroundImage(doc, backgroundImage, dimensions);

  const fontSize = 16 * 4.16666667;
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
  return {
    width: img.width / dpi,
    height: img.height / dpi,
  };
}

function createPDF(dimensions) {
  const jsPDF = window.jspdf.jsPDF;
  return new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: [dimensions.width, dimensions.height],
  });
}

function addBackgroundImage(doc, backgroundImage, dimensions) {
  doc.addImage(backgroundImage, 'PNG', 0, 0, dimensions.width, dimensions.height);
}

function addText(doc, name, email, dimensions, fontSize) {
  doc.setFontSize(fontSize);

  const nameText = `Name: ${name}`;
  const emailText = `Email: ${email}`;

  const nameX = calculateXPosition(doc, nameText, dimensions.width);
  const emailX = calculateXPosition(doc, emailText, dimensions.width);

  const nameY = 725 / 72;
  const emailY = nameY + fontSize / 72;

  doc.text(nameText, nameX, nameY);
  doc.text(emailText, emailX, emailY);
}

function calculateXPosition(doc, text, width) {
  return (width - doc.getTextWidth(text)) / 2;
}

function savePDF(doc) {
  doc.save('generated.pdf');
}
