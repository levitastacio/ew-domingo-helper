import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabase'

const USERS = ['Gabriela', 'Christopher', 'Magdy', 'Elena', 'Maryori', 'Rosanny', 'Saul', 'Jason', 'Levit']
const GABRIELA_PASSWORD = '123'

const POSITIONS = {
  'Proyección': { color: '#4A90E2', icon: '🎬' },
  'Luces': { color: '#7B68EE', icon: '💡' },
  'Transmisión': { color: '#FF6B6B', icon: '📡' },
  'Foto/Video': { color: '#F5A623', icon: '📸' }
}

const DEFAULT_TASKS = {
  'Proyección': [
    'Abrir EasyWorship',
    'Cargar orden de servicio',
    'Verificar versículos',
    'Revisar imágenes/anuncios',
    'Conectar proyector',
    'Test de audio/video'
  ],
  'Luces': [
    'Revisar controles de luces',
    'Test: encender/apagar secuencias',
    'Preparar ambiente para alabanza',
    'Preparar ambiente para predica'
  ],
  'Transmisión': [
    'Revisar cámara y micrófono',
    'Test de conexión internet',
    'Hacer live test (5 min)',
    'Esperar a que empiece el servicio',
    'Iniciar transmisión en vivo',
    'Monitorear conexión durante servicio',
    'Terminar transmisión'
  ],
  'Foto/Video': [
    'Revisar cámaras/baterías',
    'Llegar 15 min antes',
    'Captar entrada de pastor/adoración',
    'Captar momento especial',
    'Captar salida',
    'Subir video para aprobación'
  ]
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [userMode, setUserMode] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [weeklyAssignments, setWeeklyAssignments] = useState([])
  const [contentAssignments, setContentAssignments] = useState([])
  const [todayDate, setTodayDate] = useState(new Date())

  useEffect(() => {
    loadData()
    const timer = setInterval(() => setTodayDate(new Date()), 60000)

    const channel = supabase
      .channel('weekly_assignments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_assignments'
        },
        (payload) => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      clearInterval(timer)
      channel.unsubscribe()
    }
  }, [])

  const loadData = async () => {
    try {
      const { data: assignments } = await supabase
        .from('weekly_assignments')
        .select('*')
        .order('week_date', { ascending: false })
        .limit(100)

      const { data: content } = await supabase
        .from('content_assignments')
        .select('*')
        .order('date', { ascending: false })
        .limit(100)

      setWeeklyAssignments(assignments || [])
      setContentAssignments(content || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }

  const handleSelectUser = (user) => {
    if (user === 'Gabriela') {
      setShowPassword(true)
    } else {
      setCurrentUser(user)
      setUserMode('Puesto')
    }
  }

  const handlePasswordSubmit = () => {
    if (passwordInput === GABRIELA_PASSWORD) {
      setCurrentUser('Gabriela')
      setShowPassword(false)
      setPasswordInput('')
      setUserMode(null)
    } else {
      alert('Contraseña incorrecta')
      setPasswordInput('')
    }
  }

  if (!currentUser) {
    if (showPassword) {
      return <PasswordScreen onBack={() => setShowPassword(false)} onSubmit={handlePasswordSubmit} password={passwordInput} setPassword={setPasswordInput} />
    }
    return <LoginScreen users={USERS} onSelectUser={handleSelectUser} />
  }

  if (currentUser === 'Gabriela' && !userMode) {
    return <ModeSelector onSelectMode={(mode) => setUserMode(mode)} />
  }

  if (userMode === 'Jefa') {
    return (
      <AdminPanel
        weeklyAssignments={weeklyAssignments}
        contentAssignments={contentAssignments}
        onAddAssignment={async (data) => {
          try {
            const { error } = await supabase.from('weekly_assignments').insert([data])
            if (error) {
              console.error('Error inserting:', error)
              alert('Error al guardar: ' + error.message)
            } else {
              await new Promise(r => setTimeout(r, 500))
              await loadData()
            }
          } catch (err) {
            console.error('Exception:', err)
            alert('Error: ' + err.message)
          }
        }}
        onAddContentAssignment={async (data) => {
          try {
            const { error } = await supabase.from('content_assignments').insert([data])
            if (error) {
              console.error('Error inserting content:', error)
              alert('Error al guardar: ' + error.message)
            } else {
              await new Promise(r => setTimeout(r, 500))
              await loadData()
            }
          } catch (err) {
            console.error('Exception:', err)
            alert('Error: ' + err.message)
          }
        }}
        users={USERS}
        positions={Object.keys(POSITIONS)}
        onLogout={() => {
          setCurrentUser(null)
          setUserMode(null)
        }}
      />
    )
  }

  const sunday = getSundayOfWeek(todayDate)
  const todayAssignment = weeklyAssignments.find(a =>
    new Date(a.week_date).toDateString() === sunday.toDateString() &&
    a.person_name === currentUser
  )

  const nextSunday = new Date(todayDate)
  nextSunday.setDate(nextSunday.getDate() + 7)
  const nextAssignment = weeklyAssignments.find(a =>
    new Date(a.week_date).toDateString() === getSundayOfWeek(nextSunday).toDateString() &&
    a.person_name === currentUser
  )

  const contentAssign = contentAssignments.filter(a => a.person_name === currentUser)

  return (
    <div className="user-app">
      <div className="user-header">
        <h1>EBS La Vega</h1>
        <div className="user-top-info">
          <span className="user-badge">{currentUser}</span>
          {currentUser === 'Gabriela' && (
            <button onClick={() => setUserMode(null)} className="mode-btn">
              Cambiar Modo
            </button>
          )}
          <button onClick={() => {
            setCurrentUser(null)
            setUserMode(null)
          }} className="logout-btn">
            Salir
          </button>
        </div>
      </div>

      <div className="user-content">
        {todayAssignment ? (
          <div className="today-card">
            <div className="card-header">
              <span className="position-icon">{POSITIONS[todayAssignment.position].icon}</span>
              <h2>Hoy: {todayAssignment.position}</h2>
            </div>
            <ChecklistView assignment={todayAssignment} defaultTasks={DEFAULT_TASKS[todayAssignment.position]} />
          </div>
        ) : (
          <div className="today-card empty">
            <p>No tienes asignación para hoy</p>
          </div>
        )}

        {nextAssignment && (
          <div className="next-card">
            <div className="next-header">
              <span className="position-icon-small">{POSITIONS[nextAssignment.position].icon}</span>
              <div>
                <h3>Lo que te toca próximo</h3>
                <p className="next-date">{new Date(nextAssignment.week_date).toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <p className="next-position">{nextAssignment.position}</p>
          </div>
        )}

        {contentAssign.length > 0 && (
          <div className="content-section">
            <h3>📹 Contenido a crear</h3>
            <div className="content-list">
              {contentAssign.map(c => (
                <div key={c.id} className="content-item">
                  <div className="content-info">
                    <p className="content-title">{c.event_name}</p>
                    <p className="content-date">{new Date(c.date).toLocaleDateString('es-ES')}</p>
                  </div>
                  <span className={`status status-${c.status}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {todayAssignment?.position === 'Proyección' && (
          <EasyWorshipGenerator assignment={todayAssignment} />
        )}
      </div>
    </div>
  )
}

function getSundayOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

function LoginScreen({ users, onSelectUser }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="login-screen">
      <div className="login-wrapper">
        <div className="login-content">
          <h1 className="app-title">EBS La Vega</h1>
          <p className="app-subtitle">Servicio Dominical</p>

          <div className="dropdown-container">
            <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
              <span>¿Quién eres?</span>
              <span className="arrow">▼</span>
            </button>

            {isOpen && (
              <div className="dropdown-menu">
                {users.map(user => (
                  <button
                    key={user}
                    className="dropdown-item"
                    onClick={() => {
                      onSelectUser(user)
                      setIsOpen(false)
                    }}
                  >
                    {user}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PasswordScreen({ onBack, onSubmit, password, setPassword }) {
  return (
    <div className="login-screen">
      <div className="login-wrapper">
        <div className="login-content">
          <h1 className="app-title">Gabriela</h1>
          <p className="app-subtitle">Ingresa tu contraseña</p>

          <div className="password-form">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
              className="password-input"
              autoFocus
            />
            <button onClick={onSubmit} className="password-submit">
              Acceder
            </button>
            <button onClick={onBack} className="password-back">
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModeSelector({ onSelectMode }) {
  return (
    <div className="mode-screen">
      <div className="mode-wrapper">
        <h2>¿Qué vas a hacer?</h2>

        <div className="modes-grid">
          <button onClick={() => onSelectMode('Jefa')} className="mode-card jefa">
            <span className="mode-emoji">👑</span>
            <h3>Modo Jefa</h3>
            <p>Administrar horarios y estadísticas</p>
          </button>

          <button onClick={() => onSelectMode('Puesto')} className="mode-card puesto">
            <span className="mode-emoji">🎯</span>
            <h3>Mi Puesto</h3>
            <p>Ver mis tareas del domingo</p>
          </button>
        </div>
      </div>
    </div>
  )
}

function ChecklistView({ assignment, defaultTasks }) {
  const [completed, setCompleted] = useState(assignment?.tasks || [])

  const toggleTask = (taskIndex) => {
    setCompleted(prev => {
      const newCompleted = [...prev]
      newCompleted[taskIndex] = !newCompleted[taskIndex]
      return newCompleted
    })
  }

  const tasks = assignment?.tasks || defaultTasks

  return (
    <div className="checklist-container">
      {tasks.map((task, idx) => (
        <label key={idx} className="check-item">
          <input
            type="checkbox"
            checked={completed[idx] || false}
            onChange={() => toggleTask(idx)}
          />
          <span className="check-text">{task}</span>
        </label>
      ))}
    </div>
  )
}

function EasyWorshipGenerator({ assignment }) {
  const [songs, setSongs] = useState([])
  const [verses, setVerses] = useState([])
  const [newSong, setNewSong] = useState('')
  const [newVerse, setNewVerse] = useState('')

  const exportToEWSX = () => {
    const schedule = {
      date: assignment.week_date,
      generatedBy: assignment.person_name,
      songs: songs,
      verses: verses,
      timestamp: new Date().toISOString()
    }

    const dataStr = JSON.stringify(schedule, null, 2)
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr))
    element.setAttribute('download', `schedule_${assignment.week_date}.ewsx`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="generator-card">
      <h3>🎬 Generador de EasyWorship</h3>

      <div className="gen-section">
        <h4>Canciones</h4>
        <div className="input-row">
          <input
            type="text"
            placeholder="Nombre de canción"
            value={newSong}
            onChange={(e) => setNewSong(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && newSong && (setSongs([...songs, newSong]), setNewSong(''))}
          />
          <button onClick={() => {
            if (newSong) {
              setSongs([...songs, newSong])
              setNewSong('')
            }
          }}>Agregar</button>
        </div>
        <div className="items-display">
          {songs.map((song, idx) => (
            <span key={idx} className="item-tag">
              {song}
              <button onClick={() => setSongs(songs.filter((_, i) => i !== idx))}>×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="gen-section">
        <h4>Versículos</h4>
        <div className="input-row">
          <input
            type="text"
            placeholder="Referencia | Texto"
            value={newVerse}
            onChange={(e) => setNewVerse(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && newVerse && (setVerses([...verses, newVerse]), setNewVerse(''))}
          />
          <button onClick={() => {
            if (newVerse) {
              setVerses([...verses, newVerse])
              setNewVerse('')
            }
          }}>Agregar</button>
        </div>
        <div className="items-display">
          {verses.map((verse, idx) => (
            <span key={idx} className="item-tag">
              {verse}
              <button onClick={() => setVerses(verses.filter((_, i) => i !== idx))}>×</button>
            </span>
          ))}
        </div>
      </div>

      <button onClick={exportToEWSX} className="export-btn">📥 Descargar Schedule</button>
    </div>
  )
}

function AdminPanel({ weeklyAssignments, contentAssignments, onAddAssignment, users, positions, onLogout }) {
  const [newAssignment, setNewAssignment] = useState({ person_name: '', position: '', week_date: '' })
  const [warning, setWarning] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)
  const [localAssignments, setLocalAssignments] = useState(weeklyAssignments)

  useEffect(() => {
    setLocalAssignments(weeklyAssignments)
  }, [weeklyAssignments])

  const handleAddAssignment = async () => {
    if (!newAssignment.person_name || !newAssignment.position || !newAssignment.week_date) {
      alert('Por favor completa todos los campos')
      return
    }

    const existing = localAssignments.find(a =>
      a.person_name === newAssignment.person_name &&
      new Date(a.week_date).toDateString() === new Date(newAssignment.week_date).toDateString()
    )

    if (existing) {
      setWarning(`⚠️ ${newAssignment.person_name} ya está asignado para ${existing.position} ese día. ¿Continuar?`)
      return
    }

    const newData = {
      person_name: newAssignment.person_name,
      position: newAssignment.position,
      week_date: newAssignment.week_date,
      tasks: DEFAULT_TASKS[newAssignment.position]
    }

    setLocalAssignments([...localAssignments, newData])
    await onAddAssignment(newData)

    setNewAssignment({ person_name: '', position: '', week_date: '' })
    setWarning('')
  }

  const groupedByDate = {}
  localAssignments.forEach(a => {
    const dateKey = new Date(a.week_date).toISOString().split('T')[0]
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = []
    }
    groupedByDate[dateKey].push(a)
  })

  const sortedDates = Object.keys(groupedByDate).sort().reverse()

  return (
    <div className="admin-app">
      <div className="admin-header">
        <h1>👑 Panel de Jefa</h1>
        <button onClick={onLogout} className="logout-btn">Salir</button>
      </div>

      <div className="admin-content">
        <section className="admin-card">
          <h2>Crear Horario Semanal</h2>
          {warning && <div className="warning-alert">{warning}</div>}

          <div className="form-row">
            <select value={newAssignment.person_name} onChange={(e) => setNewAssignment({...newAssignment, person_name: e.target.value})} className="form-select">
              <option value="">Selecciona persona</option>
              {users.map(u => <option key={u} value={u}>{u}</option>)}
            </select>

            <select value={newAssignment.position} onChange={(e) => setNewAssignment({...newAssignment, position: e.target.value})} className="form-select">
              <option value="">Selecciona puesto</option>
              {positions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <div className="date-input-wrapper">
              <span className="calendar-icon">📅</span>
              <input type="date" value={newAssignment.week_date} onChange={(e) => setNewAssignment({...newAssignment, week_date: e.target.value})} className="form-input date-input" />
            </div>

            <button onClick={handleAddAssignment} className="form-submit">Agregar</button>
          </div>
        </section>

        <section className="admin-card">
          <h2>Horarios Guardados</h2>
          {localAssignments.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
              No hay horarios creados aún. Crea el primero arriba.
            </p>
          ) : (
          <div className="schedule-days">
            {sortedDates.map(dateKey => {
              const assignments = groupedByDate[dateKey]
              const dateObj = new Date(dateKey)
              const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' })
              const dayDate = dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })

              return (
                <div key={dateKey} className="day-card">
                  <button
                    className="day-header"
                    onClick={() => setSelectedDay(selectedDay === dateKey ? null : dateKey)}
                  >
                    <div className="day-info">
                      <p className="day-name">{dayName}</p>
                      <p className="day-date">{dayDate}</p>
                    </div>
                    <div className="day-summary">
                      <p className="people-count">{assignments.length} personas</p>
                      <span className="expand-icon">{selectedDay === dateKey ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {selectedDay === dateKey && (
                    <div className="day-rundown">
                      {Object.keys(POSITIONS).map(position => {
                        const peopleInPosition = assignments.filter(a => a.position === position)
                        return (
                          <div key={position} className="position-section">
                            <div className="position-header" style={{ backgroundColor: POSITIONS[position].color }}>
                              <span className="position-icon">{POSITIONS[position].icon}</span>
                              <h4>{position}</h4>
                            </div>
                            <div className="people-list">
                              {peopleInPosition.length > 0 ? (
                                peopleInPosition.map((a, idx) => (
                                  <div key={idx} className="person-item">
                                    <span className="person-name">{a.person_name}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="no-assignment">No asignado</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          )}
        </section>
      </div>
    </div>
  )
}
