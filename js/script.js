document.getElementById('pdf-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;

  generatePDF(name, email);
});

function generatePDF(name, email) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Name: ${name}`, 10, 20);
  doc.text(`Email: ${email}`, 10, 30);

  // Save the PDF
  doc.save('generated.pdf');
}