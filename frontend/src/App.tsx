import ImageUpload from './components/ImageUpload'
import './App.css'

function App() {
  return (
    <section id="center">
      <h1>FaceOff</h1>
      <p className="subtitle">Gesichter automatisch erkennen und unkenntlich machen.</p>
      <ImageUpload />
    </section>
  )
}

export default App
