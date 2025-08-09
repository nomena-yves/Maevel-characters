const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;
const filePath = 'characters.json'; // Chemin relatif simple (moins sûr)

app.use(cors());
app.use(express.json());

// Helpers
function readData() {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON file:', err);
    return { characters: [] };
  }
}

function writeData(data, res, onSuccess) {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      if (res) return res.status(500).json({ error: "Impossible d'écrire le fichier" });
    } else {
      if (onSuccess) onSuccess();
    }
  });
}

// GET all
app.get('/api/characters', (req, res) => {
  const data = readData();
  res.json({ characters: data.characters });
});

// POST create
app.post('/api/characters', (req, res) => {
  const data = readData();
  const { name, realName, universe } = req.body;
  if (!name || !realName || !universe) {
    return res.status(400).json({ error: 'Champs manquants (name, realName, universe)' });
  }
  const maxId = data.characters.reduce((m, c) => Math.max(m, c.id || 0), 0);
  const newChar = { id: maxId + 1, name, realName, universe };
  data.characters.push(newChar);
  writeData(data, res, () => res.json({ message: 'Ajouté', characters: data.characters }));
});

// PUT update
app.put('/api/characters/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id, 10);
  const idx = data.characters.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Personnage non trouvé' });
  data.characters[idx] = { ...data.characters[idx], ...req.body };
  writeData(data, res, () => res.json({ message: 'Modifié', characters: data.characters }));
});

// DELETE
app.delete('/api/characters/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id, 10);
  const newList = data.characters.filter(c => c.id !== id);
  if (newList.length === data.characters.length) return res.status(404).json({ error: 'Personnage non trouvé' });
  data.characters = newList;
  writeData(data, res, () => res.json({ message: 'Supprimé', characters: data.characters }));
});

app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
