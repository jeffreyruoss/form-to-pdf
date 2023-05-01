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
  const dpi = 72;

  // Load the background image
  const img = new Image();
  img.src = backgroundImage;
  await new Promise((resolve) => (img.onload = resolve));

  // Calculate the dimensions in inches
  const widthInInches = img.width / dpi;
  const heightInInches = img.height / dpi;

  // Create the PDF with the correct dimensions
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [widthInInches, heightInInches],
  });

  // Add the background image
  doc.addImage(backgroundImage, 'PNG', 0, 0, widthInInches, heightInInches);

  // Add the text
  doc.setFontSize(16);
  doc.text(`Name: ${name}`, 10 / 72, 20 / 72); // Convert pt to inches
  doc.text(`Email: ${email}`, 10 / 72, 30 / 72); // Convert pt to inches

  // Save the PDF
  doc.save('generated.pdf');
}

