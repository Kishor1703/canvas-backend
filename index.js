const express = require('express');
const cors = require('cors');
const app = express();
const canvasRoutes = require('./routes/canvasRoutes');
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/canvas', canvasRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
