import React, { useEffect, useState } from 'react';

const API = 'http://localhost:3000/api/characters';

export default function App() {
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({ name: '', realName: '', universe: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCharacters(data.characters || []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les personnages. Voir console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCharacter.name || !newCharacter.realName || !newCharacter.universe) {
      return alert('Remplis tous les champs');
    }
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCharacter),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCharacters(data.characters);
      setNewCharacter({ name: '', realName: '', universe: '' });
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'ajout (voir console)');
    }
  };

  const handleUpdate = async (id) => {
    const name = prompt('Nouveau nom :');
    if (!name) return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCharacters(data.characters);
    } catch (err) {
      console.error(err);
      alert('Erreur modification');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce personnage ?')) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCharacters(data.characters);
    } catch (err) {
      console.error(err);
      alert('Erreur suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Personnages</h1>
      <div className="max-w-2xl mx-auto">
        <form className="bg-white p-6 rounded shadow mb-6" onSubmit={handleAdd}>
          <div className="grid gap-3">
            <input className="border p-2 rounded" placeholder="Nom" value={newCharacter.name} onChange={e => setNewCharacter({...newCharacter, name: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Nom réel" value={newCharacter.realName} onChange={e => setNewCharacter({...newCharacter, realName: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Univers" value={newCharacter.universe} onChange={e => setNewCharacter({...newCharacter, universe: e.target.value})} />
            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded" type="submit">Ajouter</button>
          </div>
        </form>

        {loading ? <p>Chargement...</p> : error ? <p className="text-red-600">{error}</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.map(char => (
              <div key={char.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-bold text-lg">{char.name}</h3>
                <p className="text-gray-600">{char.realName}</p>
                <p className="text-sm text-gray-500">{char.universe}</p>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1 bg-yellow-400 rounded" onClick={() => handleUpdate(char.id)}>Modifier</button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => handleDelete(char.id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

