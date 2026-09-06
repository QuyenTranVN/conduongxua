import { lazy, Suspense } from 'react'
import { AppProvider, useApp } from './lib/store.jsx'
import { TabBar, MiniPlayer } from './components/Chrome.jsx'
import Drawer from './components/Drawer.jsx'
import Splash from './screens/Splash.jsx'
import Home from './screens/Home.jsx'
import Meditate from './screens/Meditate.jsx'
import CreateMeditation from './screens/CreateMeditation.jsx'
import Session from './screens/Session.jsx'
import Listen from './screens/Listen.jsx'
import Player from './screens/Player.jsx'
import { Teachers, TeacherDetail } from './screens/Teachers.jsx'
import Library from './screens/Library.jsx'
import TalkDetail from './screens/TalkDetail.jsx'
import { AudioProvider } from './lib/audio.jsx'
import AudioDetail from './screens/AudioDetail.jsx'
import About from './screens/About.jsx'
import Contact from './screens/Contact.jsx'
import Privacy from './screens/Privacy.jsx'
import SupportPracticeDetail from './screens/SupportPracticeDetail.jsx'
import SupportPracticePlayer from './screens/SupportPracticePlayer.jsx'
import { MeditationAudioProvider } from './lib/meditationAudio.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './styles/tokens.css'
import './styles/app.css'

const BookReader = lazy(() => import('./screens/BookReader.jsx'))

function Screen() {
  const { route } = useApp()
  switch (route.name) {
    case 'home':      return <Home />
    case 'meditate':  return <Meditate />
    case 'create':    return <CreateMeditation id={route.id} />
    // Meditation-method browsing is intentionally hidden for the current release.
    case 'method':    return <Meditate />
    case 'session':   return <Session param={route.id} />
    case 'listen':    return <Listen />
    case 'player':    return <Player id={route.id} />
    case 'audio':     return <AudioDetail slug={route.id} />
    case 'teachers':  return <Teachers />
    case 'teacher':   return <TeacherDetail id={route.id} />
    case 'library':   return <Library />
    case 'talk':      return <TalkDetail id={route.id} />
    case 'about':     return <About />
    case 'contact':   return <Contact />
    case 'privacy':   return <Privacy />
    case 'support':   return <SupportPracticeDetail id={route.id} />
    case 'support-player': return <SupportPracticePlayer id={route.id} />
    case 'book':      return <Suspense fallback={<div className='empty'>Đang mở sách…</div>}><BookReader id={route.id} /></Suspense>
    default:          return <Home />
  }
}

function Device() {
  const { splash, route } = useApp()
  const fullscreen = route.name === 'session' || route.name === 'player' || route.name === 'support-player' || route.name === 'book'
  return (
    <div className="shell">
      <div className='device'>
        {splash && <Splash />}
        <Screen />
        {!fullscreen && <MiniPlayer />}
        {!fullscreen && <TabBar />}
        <Drawer />
      </div>
    </div>
  )
}

export default function App() {
  return <ErrorBoundary><AppProvider><AudioProvider><MeditationAudioProvider><Device /></MeditationAudioProvider></AudioProvider></AppProvider></ErrorBoundary>
}
