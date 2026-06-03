const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ⚙️ CONEXIÓN A MONGODB (reemplaza con tu cadena real)
const mongoURI = 'mongodb+srv://TU_USUARIO:TU_PASSWORD@cluster0.xxxxx.mongodb.net/sensores?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// 📦 Esquema y modelo de datos
const SensorDataSchema = new mongoose.Schema({
  temperatura: Number,
  humedad: Number,
  fecha: { type: Date, default: Date.now }
});
const SensorData = mongoose.model('SensorData', SensorDataSchema);

// 📡 ENDPOINT para recibir datos del ESP32
app.post('/sensor', async (req, res) => {
  try {
    const { temperatura, humedad } = req.body;
    if (temperatura === undefined || humedad === undefined) {
      return res.status(400).json({ error: 'Faltan temperatura o humedad' });
    }
    const nuevoRegistro = new SensorData({ temperatura, humedad });
    await nuevoRegistro.save();
    res.status(201).json({ message: 'Dato guardado', id: nuevoRegistro._id });
  } catch (error) {
    console.error('Error al guardar:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Opcional: endpoint para ver los últimos 10 datos
app.get('/ultimos', async (req, res) => {
  const datos = await SensorData.find().sort({ fecha: -1 }).limit(10);
  res.json(datos);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});