import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './pages/Dashboard'
import { Projects } from './pages/Projects'
import { Timeline } from './pages/Timeline'
import { Tasks } from './pages/Tasks'
import { GoalsPhases } from './pages/GoalsPhases'
import { Settings } from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/goals" element={<GoalsPhases />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
