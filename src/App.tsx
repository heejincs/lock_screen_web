import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import AgentsList from './pages/AgentsList'
import AgentDetail from './pages/AgentDetail'
import BulletinDetail from './pages/BulletinDetail'
import LockMsgAdd from './pages/LockMsgAdd'

/**
 * Top-level router. Mirrors `docs/view_separation.md` §6.2 mapping:
 *   /                          → MainActivity > Agents tab
 *   /agent/:serverId/:name     → AgentDetailActivity
 *   /bulletin/:id              → BulletinDetailActivity (PIN gate)
 *   /settings/lock-msg/add     → AddLockMsgDialog (modal → route on web)
 *
 * Settings tab + DiagLog are out of scope for this scaffold.
 */
export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 8, borderBottom: '1px solid #ddd', fontSize: 14 }}>
        <Link to="/">Agents</Link> ·{' '}
        <Link to="/settings/lock-msg/add">+ Lock-msg</Link>
      </nav>
      <Routes>
        <Route path="/" element={<AgentsList />} />
        <Route path="/agent/:serverId/:name" element={<AgentDetail />} />
        <Route path="/bulletin/:id" element={<BulletinDetail />} />
        <Route path="/settings/lock-msg/add" element={<LockMsgAdd />} />
      </Routes>
    </BrowserRouter>
  )
}
