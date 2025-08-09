const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const PDFDocument = require('pdfkit');

let state = {
  canvas: null,
  ctx: null,
  elements: [],
};

exports.createCanvasAPI = (req, res) => {
  const { width, height } = req.body;
  state.canvas = createCanvas(Number(width), Number(height));
  state.ctx = state.canvas.getContext('2d');
  state.elements = [];
  res.json({ message: 'Canvas created' });
};

exports.addElementAPI = async (req, res) => {
  const el = {
    type: req.body.type,
    x: Number(req.body.x),
    y: Number(req.body.y),
    width: Number(req.body.width),
    height: Number(req.body.height),
    radius: Number(req.body.radius),
    text: req.body.text,
    color: req.body.color,
    fontSize: Number(req.body.fontSize),
    imageUrl: req.body.imageUrl,
    file: req.file,
  };

  state.elements.push(el);
  res.json({ message: 'Element added' });
};

exports.exportPDFAPI = async (req, res) => {
  if (!state.canvas || !state.ctx) {
    return res.status(400).json({ error: 'Canvas not initialized' });
  }

  const ctx = state.ctx;

  // Redraw canvas
  for (let el of state.elements) {
    ctx.fillStyle = el.color || 'black';
    switch (el.type) {
      case 'rectangle':
        ctx.fillRect(el.x, el.y, el.width, el.height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'text':
        ctx.font = `${el.fontSize || 16}px Arial`;
        ctx.fillText(el.text, el.x, el.y);
        break;
      case 'image':
        try {
          const imagePath = el.imageUrl || (el.file ? el.file.path : null);
          if (!imagePath) break;

          const image = await loadImage(imagePath);
          ctx.drawImage(image, el.x, el.y, el.width, el.height);
        } catch (err) {
          console.error('Image drawing failed:', err.message);
        }
        break;
    }
  }

  const buffer = state.canvas.toBuffer('image/png');
  const doc = new PDFDocument({ autoFirstPage: false });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="canvas.pdf"`);

  doc.pipe(res);
  doc.addPage({ size: [state.canvas.width, state.canvas.height] });
  doc.image(buffer, 0, 0);
  doc.end();
};
