import { BrowserRouter, NavLink, Routes, Route } from 'react-router-dom'
import AgentsList from './pages/AgentsList'
import AgentDetail from './pages/AgentDetail'
import BulletinDetail from './pages/BulletinDetail'
import LockMsgAdd from './pages/LockMsgAdd'
import StudyList from './pages/StudyList'
import StudyAdd from './pages/StudyAdd'
import StudyFlash from './pages/StudyFlash'
import StudyDetail from './pages/StudyDetail'
import NmsgList from './pages/NmsgList'
import './theme.css'

/**
 * Top-level router.  Mirrors the Android MainActivity 3-tab layout
 * (Agents / nmsg / Servers) and adds a 단어 tab that has no Android
 * equivalent — 단어공부 is web-first, Android side just captures via
 * PROCESS_TEXT / SEND intents.
 *
 * Full mapping in lock_screen `docs/view_separation.md` §6.
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="top-bar">
          <h1>agent.ncreate.ai</h1>
        </div>
        <nav className="tab-bar">
          <NavLink to="/" end>Agents</NavLink>
          <NavLink to="/nmsg">nmsg</NavLink>
          <NavLink to="/servers">Servers</NavLink>
          <NavLink to="/study">단어</NavLink>
          <NavLink to="/settings/lock-msg/add">+ Lock</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<AgentsList />} />
          <Route path="/nmsg" element={<NmsgList />} />
          <Route path="/servers" element={<ServersTabStub />} />
          <Route path="/study" element={<StudyList />} />
          <Route path="/study/add" element={<StudyAdd />} />
          <Route path="/study/flash" element={<StudyFlash />} />
          <Route path="/study/:id" element={<StudyDetail />} />
          <Route path="/agent/:serverId/:name" element={<AgentDetail />} />
          <Route path="/bulletin/:id" element={<BulletinDetail />} />
          <Route path="/settings/lock-msg/add" element={<LockMsgAdd />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

/** Placeholder — wiki is single-instance (serverId 고정 "main"). */
function ServersTabStub() {
  return (
    <main className="page">
      <h1 style={{ marginTop: 0, fontSize: 18 }}>Servers</h1>
      <div className="list-card">
        <div className="list-row">
          <div className="list-row-head">
            <span className="status-glyph st-done">●</span>
            <span className="name">main</span>
            <span className="timestamp">wiki.ncreate.ai</span>
          </div>
          <div className="list-row-body">
            Single wiki-hosted MCP instance. Multi-server management이
            필요해지면 여기 확장.
          </div>
        </div>
      </div>
    </main>
  )
}
