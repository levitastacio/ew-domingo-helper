import { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabase';

const AnimatedIcon = ({ emoji, delay = 0 }) => (
  <span className="animated-icon" style={{ '--delay': `${delay}ms` }}>
    {emoji}
  </span>
);

const INITIAL_SONGS = [
  {
    id: 1,
    title: 'Grandes Cosas',
    author: 'Frances Jane Crosby',
    copyright: '',
    sections: [
      { name: 'VERSO 1', lines: ['Grandes cosas ha hecho el Señor', 'por su pueblo fiel', 'alabemos su nombre', 'con gozo y amor'] },
      { name: 'CORO', lines: ['Grandes cosas hizo', 'grande es su poder', 'y su gloria eterna', 'vamos a creer'] }
    ]
  },
  {
    id: 2,
    title: 'Santo Santo Santo',
    author: 'Reginald Heber',
    copyright: '',
    sections: [
      { name: 'VERSO 1', lines: ['Santo, santo, santo es el Señor', 'Dios de poder y majestad', 'Es santo en la tierra, cielo y mar', 'Toda la creación alaba su verdad'] },
      { name: 'CORO', lines: ['Santo, santo, santo es el Rey', 'Levantemos la voz en adoración', 'Su reino es eterno, su amor sin fin', 'Cantemos con toda devoción'] }
    ]
  },
  {
    id: 3,
    title: 'Cuán Grande Es Él',
    author: 'Stuart K. Hine',
    copyright: '',
    sections: [
      { name: 'VERSO 1', lines: ['Cuando contemplo el cielo azul', 'y sus estrellas mil', 'la obra de tus manos divinas', 'me hace sentir tan pequeño así'] },
      { name: 'CORO', lines: ['¡Cuán grande eres, cuán grande eres!', '¡Cuán grande es tu majestad!', 'Cuando considero el universo', 'solo debo adorar y cantar'] }
    ]
  },
  {
    id: 4,
    title: 'Al Mundo Paz',
    author: 'Isaac Watts',
    copyright: '',
    sections: [
      { name: 'VERSO 1', lines: ['Al mundo paz ha nacido Jesús', 'el Rey celestial', 'con amor infinito vino a salvarnos', 'su gracia es sin igual'] },
      { name: 'CORO', lines: ['Paz, paz, paz al mundo entero', 'Jesús es nuestro Salvador', 'regocijémonos en su gloria', 'eternamente sea su honor'] }
    ]
  },
  {
    id: 5,
    title: 'Oh Cuán Bueno Es El Señor',
    author: '',
    copyright: '',
    sections: [
      { name: 'VERSO 1', lines: ['Oh cuán bueno es el Señor', 'su misericordia sin fin', 'nos perdona nuestros errores', 'nos guía y nos protege así'] },
      { name: 'CORO', lines: ['Su bondad es eterna', 'su amor nunca acabará', 'En el Señor confiamos', 'seguro estaremos siempre'] }
    ]
  },
  {
    id: 6,
    title: 'Sublime Gracia',
    author: 'John Newton',
    copyright: '',
    sections: [
      { name: 'VERSO 1', lines: ['Sublime gracia del Señor', 'que a un infeliz salvó', 'fui ciego mas hoy veo', 'por Cristo me transformó'] },
      { name: 'VERSO 2', lines: ['Su gracia me enseñó a temer', 'mis dudas disipó', 'cuán precioso es creer', 'en Cristo que me rescató'] }
    ]
  },
  {
    id: 7,
    title: 'Hay Poder en Jesús',
    author: 'Lewis E. Jones',
    copyright: '',
    sections: [
      { name: 'VERSO 1', lines: ['Hay poder, poder, poder en Jesús', 'hay poder, poder en su sangre', 'que limpia toda mancha, rompe las cadenas', 'ven a Jesús, Él te libertará'] },
      { name: 'CORO', lines: ['Poder, poder hay en Jesús', 'Poder divino, poder de salvación', 'Acepta hoy su gracia infinita', 'Vive en victoria y liberación'] }
    ]
  },
  {
    id: 8,
    title: 'Dios Es Bueno',
    author: '',
    copyright: '',
    sections: [
      { name: 'VERSO 1', lines: ['Dios es bueno, dios es bueno', 'dios es bueno todo el tiempo', 'y todo el tiempo dios es bueno', 'Él es nuestro Dios, nuestro amor'] },
      { name: 'CORO', lines: ['Bueno, bueno es el Señor', 'Su fidelidad sin comparación', 'En todo momento, en toda situación', 'Confiamos en su protección'] }
    ]
  },
  {
    id: 9,
    title: 'Tuyo Soy Jesús',
    author: '',
    copyright: '',
    sections: [
      { name: 'VERSO 1', lines: ['Tuyo soy Jesús, mi vida entera', 'es tuya, Señor', 'mi corazón te pertenece', 'de ti soy cautivo de amor'] },
      { name: 'CORO', lines: ['Tuyo soy, completamente tuyo', 'mi vida está en tus manos', 'Tuyo soy, por toda la eternidad', 'seré tuyo en todos los tiempos'] }
    ]
  },
  {
    id: 10,
    title: 'Cristo Me Ama',
    author: 'Anna B. Warner',
    copyright: '',
    sections: [
      { name: 'VERSO 1', lines: ['Cristo me ama, me ama a mí', 'la Biblia me lo dice así', 'soy débil, pero Él es fuerte', 'Cristo me ama, sí, sí, sí'] },
      { name: 'CORO', lines: ['Cristo me ama', 'Cristo me ama', 'Cristo me ama', 'me lo dice la Biblia'] }
    ]
  }
];

const CHECKLIST_ITEMS = [
  'Revisar conexión de audio y micrófono',
  'Cargar tema gráfico de EasyWorship',
  'Verificar presentaciones PDF',
  'Comprobar imágenes del servicio',
  'Prueba de diapositivas de canciones',
  'Sincronizar hora con reloj de iglesia',
  'Tener lista la primera canción',
  'Revisar versículos en el formato correcto',
  'Confirmación de hora de inicio',
  'Prueba técnica general'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [songs, setSongs] = useState([]);
  const [checklist, setChecklist] = useState({});
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongAuthor, setNewSongAuthor] = useState('');
  const [newSongLyrics, setNewSongLyrics] = useState('');

  // Quick mode (paste raw lyrics)
  const [songMode, setSongMode] = useState('quick'); // 'quick' o 'manual'
  const [quickLyrics, setQuickLyrics] = useState('');
  const [previewSections, setPreviewSections] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewAuthor, setPreviewAuthor] = useState('');

  // Service generator state
  const [serviceDate, setServiceDate] = useState('');
  const [preparerName, setPreparerName] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [verses, setVerses] = useState([]);
  const [imageFolder, setImageFolder] = useState('');
  const [images, setImages] = useState([]);

  // Load songs from localStorage on mount
  useEffect(() => {
    const savedSongs = localStorage.getItem('ew_songs');
    if (savedSongs) {
      setSongs(JSON.parse(savedSongs));
    } else {
      setSongs(INITIAL_SONGS);
      localStorage.setItem('ew_songs', JSON.stringify(INITIAL_SONGS));
    }
  }, []);

  // Load checklist from Supabase and subscribe to real-time changes
  useEffect(() => {
    const loadChecklist = async () => {
      try {
        const { data, error } = await supabase
          .from('checklist_estado')
          .select('items')
          .eq('id', 1)
          .single();

        if (error) {
          console.error('Error loading checklist:', error);
          return;
        }

        if (data && data.items) {
          setChecklist(data.items);
        } else {
          const initial = {};
          CHECKLIST_ITEMS.forEach(item => {
            initial[item] = false;
          });
          setChecklist(initial);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    loadChecklist();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('checklist_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'checklist_estado',
          filter: 'id=eq.1'
        },
        (payload) => {
          if (payload.new && payload.new.items) {
            setChecklist(payload.new.items);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save songs to localStorage
  const saveSongs = (updatedSongs) => {
    setSongs(updatedSongs);
    localStorage.setItem('ew_songs', JSON.stringify(updatedSongs));
  };

  // Save checklist to Supabase
  const saveChecklist = async (updatedChecklist) => {
    setChecklist(updatedChecklist);

    try {
      const { error } = await supabase
        .from('checklist_estado')
        .upsert(
          {
            id: 1,
            items: updatedChecklist,
            updated_by: preparerName || 'Anónimo'
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.error('Error saving checklist:', error);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Parse lyrics into slides (max 4 lines per slide)
  const parseLyricsToSlides = (lyrics) => {
    const lines = lyrics.split('\n').map(line => line.trim()).filter(line => line);
    const sections = [];
    let currentSection = null;
    let currentLines = [];

    for (const line of lines) {
      if (line.match(/^\[.*\]$/)) {
        if (currentSection && currentLines.length > 0) {
          sections.push({ name: currentSection, lines: [...currentLines] });
        }
        currentSection = line.replace(/[\[\]]/g, '');
        currentLines = [];
      } else if (line === '') {
        if (currentLines.length > 0 && currentLines.length < 4) {
          currentLines.push('');
        }
      } else {
        currentLines.push(line);
        if (currentLines.length === 4) {
          sections.push({ name: currentSection || 'VERSO', lines: [...currentLines] });
          currentLines = [];
        }
      }
    }

    if (currentLines.length > 0) {
      sections.push({ name: currentSection || 'VERSO', lines: currentLines });
    }

    return sections;
  };

  // Parse quick mode lyrics (auto-detect title and sections)
  const parseQuickLyrics = (rawLyrics) => {
    const allLines = rawLyrics.split('\n').map(line => line.trim());

    // Auto-detect title (first short line)
    let title = '';
    let startIdx = 0;
    if (allLines.length > 0 && allLines[0].length < 50 && !allLines[0].match(/^\[.*\]$/)) {
      title = allLines[0];
      startIdx = 1;
    }

    const contentLines = allLines.slice(startIdx).filter((line, i, arr) => {
      // Keep non-empty lines and handle blank lines as section separators
      return line || (i > 0 && i < arr.length - 1);
    });

    const sections = [];
    let currentSection = null;
    let currentLines = [];
    let versoCount = 0;
    let chorusLines = [];

    for (const line of contentLines) {
      // Detect bracketed sections
      if (line.match(/^\[.*\]$/)) {
        if (currentSection && currentLines.length > 0) {
          sections.push({ name: currentSection, lines: [...currentLines] });
        }
        currentSection = line.replace(/[\[\]]/g, '').toUpperCase();
        currentLines = [];
      }
      // Blank line = section separator
      else if (line === '') {
        if (currentLines.length > 0) {
          // Check if this looks like a chorus (repeated pattern)
          const lineStr = currentLines.join(' ').toLowerCase();
          if (chorusLines.length === 0 || lineStr === chorusLines.join(' ').toLowerCase()) {
            if (chorusLines.length === 0) chorusLines = [...currentLines];
            currentSection = 'CORO';
          } else if (!currentSection) {
            versoCount++;
            currentSection = `VERSO ${versoCount}`;
          }
          sections.push({ name: currentSection, lines: [...currentLines] });
          currentLines = [];
        }
      }
      // Regular line
      else {
        currentLines.push(line);
        if (currentLines.length === 4) {
          if (!currentSection) {
            versoCount++;
            currentSection = `VERSO ${versoCount}`;
          }
          sections.push({ name: currentSection, lines: [...currentLines] });
          currentLines = [];
          currentSection = null;
        }
      }
    }

    if (currentLines.length > 0) {
      if (!currentSection) {
        versoCount++;
        currentSection = `VERSO ${versoCount}`;
      }
      sections.push({ name: currentSection, lines: currentLines });
    }

    return { title: title || 'Sin título', sections };
  };

  // Process quick mode lyrics and show preview
  const handleProcessQuickLyrics = () => {
    if (!quickLyrics.trim()) {
      alert('Por favor pega la letra de la canción');
      return;
    }

    const { title, sections } = parseQuickLyrics(quickLyrics);
    setPreviewSections(sections);
    setPreviewTitle(title);
    setPreviewAuthor('');
  };

  // Save song from quick mode preview
  const handleSaveQuickSong = () => {
    if (!previewTitle.trim() || !previewSections || previewSections.length === 0) {
      alert('Por favor procesa la letra primero');
      return;
    }

    const newSong = {
      id: Date.now(),
      title: previewTitle,
      author: previewAuthor,
      copyright: '',
      sections: previewSections
    };

    const updatedSongs = [...songs, newSong];
    saveSongs(updatedSongs);

    setQuickLyrics('');
    setPreviewSections(null);
    setPreviewTitle('');
    setPreviewAuthor('');
    alert('Canción guardada correctamente');
  };

  // Add new song
  const handleAddSong = () => {
    if (!newSongTitle.trim() || !newSongLyrics.trim()) {
      alert('Por favor completa título y letra');
      return;
    }

    const sections = parseLyricsToSlides(newSongLyrics);
    const newSong = {
      id: Date.now(),
      title: newSongTitle,
      author: newSongAuthor,
      copyright: '',
      sections
    };

    const updatedSongs = [...songs, newSong];
    saveSongs(updatedSongs);

    setNewSongTitle('');
    setNewSongAuthor('');
    setNewSongLyrics('');
    alert('Canción agregada correctamente');
  };

  // Delete song
  const handleDeleteSong = (id) => {
    if (confirm('¿Eliminar esta canción?')) {
      const updated = songs.filter(song => song.id !== id);
      saveSongs(updated);
    }
  };

  // Generate service file
  const generateServiceFile = () => {
    if (!serviceDate || !preparerName || selectedSongs.length === 0) {
      alert('Por favor completa fecha, nombre del preparador y selecciona canciones');
      return;
    }

    const selectedSongTitles = selectedSongs.map(id => {
      const song = songs.find(s => s.id === parseInt(id));
      return song ? song.title : '';
    });

    let content = `# Servicio del domingo\n`;
    content += `# Preparado por: ${preparerName}\n\n`;
    content += `FECHA: ${serviceDate}\n\n`;

    if (imageFolder.trim()) {
      content += `IMAGEN_CARPETA: ${imageFolder}\n\n`;
    }

    content += `# --- Canciones ---\n`;
    selectedSongTitles.forEach(title => {
      if (title) content += `CANCION: ${title}\n`;
    });

    if (verses.length > 0) {
      content += `\n# --- Versículos ---\n`;
      verses.forEach(verse => {
        if (verse.trim()) content += `VERSICULO: ${verse}\n`;
      });
    }

    if (images.length > 0) {
      content += `\n# --- Imágenes ---\n`;
      images.forEach(img => {
        if (img.trim()) content += `IMAGEN: ${img}\n`;
      });
    }

    // Download file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `servicio_${serviceDate}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    alert('Archivo descargado correctamente');
  };

  // Toggle checklist item
  const toggleChecklistItem = (item) => {
    const updated = { ...checklist };
    updated[item] = !updated[item];
    saveChecklist(updated);
  };

  // Reset checklist
  const resetChecklist = () => {
    const updated = {};
    CHECKLIST_ITEMS.forEach(item => {
      updated[item] = false;
    });
    saveChecklist(updated);
  };

  const addVerse = () => {
    setVerses([...verses, '']);
  };

  const updateVerse = (index, value) => {
    const updated = [...verses];
    updated[index] = value;
    setVerses(updated);
  };

  const removeVerse = (index) => {
    setVerses(verses.filter((_, i) => i !== index));
  };

  const addImage = () => {
    setImages([...images, '']);
  };

  const updateImage = (index, value) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleSongSelection = (id) => {
    const stringId = String(id);
    if (selectedSongs.includes(stringId)) {
      setSelectedSongs(selectedSongs.filter(sId => sId !== stringId));
    } else {
      setSelectedSongs([...selectedSongs, stringId]);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <img src="/logo-ebs.png" alt="EBS La Vega" className="logo" />
          </div>
          <div className="header-text">
            <h1>Domingo Helper</h1>
            <p>Prepara tu servicio con EasyWorship</p>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          <span className="nav-icon">📋</span>
          <span>Generador</span>
        </button>
        <button
          className={`nav-btn ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          <span className="nav-icon">🎼</span>
          <span>Biblioteca</span>
        </button>
        <button
          className={`nav-btn ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          <span className="nav-icon">✅</span>
          <span>Checklist</span>
        </button>
      </nav>

      <main className="app-content">
        {/* GENERATOR TAB */}
        {activeTab === 'generator' && (
          <section className="tab-section">
            <h2>Generador del Servicio</h2>

            <div className="form-group">
              <label>Fecha del servicio</label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Nombre del preparador</label>
              <input
                type="text"
                value={preparerName}
                onChange={(e) => setPreparerName(e.target.value)}
                placeholder="Ej: Yuliot Astacio"
              />
            </div>

            <div className="form-group">
              <label>Carpeta de imágenes (ruta completa)</label>
              <input
                type="text"
                value={imageFolder}
                onChange={(e) => setImageFolder(e.target.value)}
                placeholder="Ej: C:\Fotos\Domingo"
              />
            </div>

            <div className="form-group">
              <label>Canciones</label>
              <div className="songs-list">
                {songs.map(song => (
                  <div key={song.id} className="song-item">
                    <input
                      type="checkbox"
                      checked={selectedSongs.includes(String(song.id))}
                      onChange={() => toggleSongSelection(song.id)}
                    />
                    <div className="song-info">
                      <strong>{song.title}</strong>
                      {song.author && <span className="song-author">por {song.author}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Versículos (uno por línea)</label>
              {verses.map((verse, idx) => (
                <div key={idx} className="verse-input-group">
                  <input
                    type="text"
                    value={verse}
                    onChange={(e) => updateVerse(idx, e.target.value)}
                    placeholder="Ej: Juan 3:16 | Porque de tal manera amó Dios..."
                  />
                  <button onClick={() => removeVerse(idx)} className="btn-small">✕</button>
                </div>
              ))}
              <button onClick={addVerse} className="btn-secondary">+ Agregar versículo</button>
            </div>

            <div className="form-group">
              <label>Imágenes específicas (nombre de archivo)</label>
              {images.map((img, idx) => (
                <div key={idx} className="image-input-group">
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => updateImage(idx, e.target.value)}
                    placeholder="Ej: fondo_bienvenida.jpg"
                  />
                  <button onClick={() => removeImage(idx)} className="btn-small">✕</button>
                </div>
              ))}
              <button onClick={addImage} className="btn-secondary">+ Agregar imagen</button>
            </div>

            <button onClick={generateServiceFile} className="btn-primary">
              📥 Descargar servicio_domingo.txt
            </button>
          </section>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
          <section className="tab-section">
            <h2>Biblioteca de Canciones</h2>

            <div className="library-container">
              <div className="add-song-panel">
                <h3>Agregar canción</h3>

                {/* Mode selector */}
                <div className="song-mode-selector">
                  <button
                    className={`mode-btn ${songMode === 'quick' ? 'active' : ''}`}
                    onClick={() => setSongMode('quick')}
                  >
                    ⚡ Modo rápido
                  </button>
                  <button
                    className={`mode-btn ${songMode === 'manual' ? 'active' : ''}`}
                    onClick={() => setSongMode('manual')}
                  >
                    ✋ Modo avanzado
                  </button>
                </div>

                {/* QUICK MODE */}
                {songMode === 'quick' && (
                  <>
                    {!previewSections ? (
                      <>
                        <div className="form-group">
                          <label>Pega la letra completa de la canción</label>
                          <textarea
                            value={quickLyrics}
                            onChange={(e) => setQuickLyrics(e.target.value)}
                            placeholder="Pega aquí la letra sin formato especial. La app detectará el título, secciones y dividirá en slides automáticamente."
                            rows={12}
                          />
                        </div>
                        <button onClick={handleProcessQuickLyrics} className="btn-primary">
                          🔍 Procesar letra →
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="form-group">
                          <label>Título (editable)</label>
                          <input
                            type="text"
                            value={previewTitle}
                            onChange={(e) => setPreviewTitle(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Autor (editable)</label>
                          <input
                            type="text"
                            value={previewAuthor}
                            onChange={(e) => setPreviewAuthor(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Preview de slides</label>
                          <div className="preview-slides">
                            {previewSections.map((section, idx) => (
                              <div key={idx} className="preview-slide">
                                <div className="slide-label">{section.name}</div>
                                <div className="slide-content">
                                  {section.lines.map((line, lineIdx) => (
                                    <div key={lineIdx} className="slide-line">
                                      {line || '—'}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={handleSaveQuickSong} className="btn-primary" style={{ flex: 1 }}>
                            ✅ Guardar en biblioteca
                          </button>
                          <button
                            onClick={() => {
                              setPreviewSections(null);
                              setQuickLyrics('');
                            }}
                            className="btn-secondary"
                            style={{ flex: 1 }}
                          >
                            ← Atrás
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* MANUAL MODE */}
                {songMode === 'manual' && (
                  <>
                    <div className="form-group">
                      <label>Título</label>
                      <input
                        type="text"
                        value={newSongTitle}
                        onChange={(e) => setNewSongTitle(e.target.value)}
                        placeholder="Ej: Grandes Cosas"
                      />
                    </div>

                    <div className="form-group">
                      <label>Autor</label>
                      <input
                        type="text"
                        value={newSongAuthor}
                        onChange={(e) => setNewSongAuthor(e.target.value)}
                        placeholder="Ej: Frances Jane Crosby"
                      />
                    </div>

                    <div className="form-group">
                      <label>Letra (usa [VERSO], [CORO], etc.)</label>
                      <textarea
                        value={newSongLyrics}
                        onChange={(e) => setNewSongLyrics(e.target.value)}
                        placeholder={`[VERSO 1]\nPrimera línea\nSegunda línea\nTercera línea\n\n[CORO]\nLínea del coro\nOtra línea`}
                        rows={12}
                      />
                    </div>

                    <button onClick={handleAddSong} className="btn-primary">
                      🎵 Agregar canción
                    </button>
                  </>
                )}
              </div>

              <div className="songs-library">
                <h3>Canciones guardadas ({songs.length})</h3>
                {songs.length === 0 ? (
                  <p className="empty-state">No hay canciones guardadas</p>
                ) : (
                  songs.map(song => (
                    <div key={song.id} className="song-card">
                      <div className="song-header">
                        <h4>{song.title}</h4>
                        <button
                          onClick={() => handleDeleteSong(song.id)}
                          className="btn-delete"
                        >
                          🗑️
                        </button>
                      </div>
                      {song.author && <p className="song-author">Autor: {song.author}</p>}
                      <div className="song-sections">
                        {song.sections.map((section, idx) => (
                          <div key={idx} className="section">
                            <strong>{section.name}</strong>
                            <ul>
                              {section.lines.map((line, lineIdx) => (
                                <li key={lineIdx}>{line || '—'}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* CHECKLIST TAB */}
        {activeTab === 'checklist' && (
          <section className="tab-section">
            <h2>Checklist del Domingo</h2>

            <div className="checklist-actions">
              <button onClick={resetChecklist} className="btn-secondary">
                🔄 Resetear checklist
              </button>
            </div>

            <div className="checklist">
              {CHECKLIST_ITEMS.map((item, idx) => (
                <label key={idx} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={checklist[item] || false}
                    onChange={() => toggleChecklistItem(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>

            <div className="checklist-progress">
              <p>
                Progreso: {Object.values(checklist).filter(Boolean).length} de{' '}
                {CHECKLIST_ITEMS.length}
              </p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(Object.values(checklist).filter(Boolean).length / CHECKLIST_ITEMS.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>EasyWorship Domingo Helper • Iglesia El Buen Samaritano, La Vega, RD</p>
      </footer>
    </div>
  );
}
