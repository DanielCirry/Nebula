import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Portfolio from './pages/Portfolio'
import Upload from './pages/Upload'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  )
}
