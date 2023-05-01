document.getElementById('pdf-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;

  try {
      const backgroundImage = await fetchImageAsBase64('img/background.png');
      generatePDF(name, email, backgroundImage);
  } catch (error) {
      console.error('Error:', error);
  }
});

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

async function generatePDF(name, email, backgroundImage) {
  const { jsPDF } = window.jspdf;
  const dpi = 72;

  // Load the background image
  const img = new Image();
  img.src = backgroundImage;
  await new Promise((resolve) => (img.onload = resolve));

  // Calculate the dimensions in inches
  const widthInInches = img.width / dpi;
  const heightInInches = img.height / dpi;

  // Create the PDF with the correct dimensions
  const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [widthInInches, heightInInches],
  });

  // Add the background image
  doc.addImage(backgroundImage, 'PNG', 0, 0, widthInInches, heightInInches);

  // Add the text
  const fontSize = 16;
  doc.setFontSize(fontSize);

  const nameText = `Name: ${name}`;
  const emailText = `Email: ${email}`;

  const nameTextWidth = doc.getTextWidth(nameText);
  const emailTextWidth = doc.getTextWidth(emailText);

  const nameX = (widthInInches - nameTextWidth) / 2;
  const emailX = (widthInInches - emailTextWidth) / 2;

  const nameY = 725 / dpi;
  const emailY = nameY + fontSize / 72;

  doc.text(nameText, nameX, nameY); // Convert pt to inches
  doc.text(emailText, emailX, emailY); // Convert pt to inches

  // Save the PDF
  doc.save('generated.pdf');
}


