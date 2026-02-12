import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HouseProvider } from './context/HouseContext'
import Sidebar from './components/layout/Sidebar'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import Chores from './pages/Chores'
import Finances from './pages/Finances'
import Availability from './pages/Availability'
import Reserve from './pages/Reserve'
import SettingsPage from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <HouseProvider>
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/finances" element={<Finances />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/reserve" element={<Reserve />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HouseProvider>
    </BrowserRouter>
  )
}
