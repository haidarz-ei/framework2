import { BrowserRouter as Router } from 'react-router-dom'
import MainRoutes from './routes'
import { Toaster } from 'react-hot-toast'
import './App.css'

function App() {
  return (
    <Router>
      <MainRoutes />
      <Toaster position="top-right" richColors />
    </Router>
  );
}

export default App
