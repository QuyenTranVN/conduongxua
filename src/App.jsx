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
import MeditationMethod from './screens/MeditationMethod.jsx'
import { AudioProvider } from './lib/audio.jsx'
import AudioDetail from './screens/AudioDetail.jsx'
import { MeditationAudioProvider } from './lib/meditationAudio.jsx'
import './styles/tokens.css'
import './styles/app.css'

function Screen() {
  const { route } = useApp()
  switch (route.name) {
    case 'home':      return <Home />
    case 'meditate':  return <Meditate />
    case 'create':    return <CreateMeditation id={route.id} />
    case 'method':    return <MeditationMethod id={route.id} />
    case 'session':   return <Session param={route.id} />
    case 'listen':    return <Listen />
    case 'player':    return <Player id={route.id} />
    case 'audio':     return <AudioDetail slug={route.id} />
    case 'teachers':  return <Teachers />
    case 'teacher':   return <TeacherDetail id={route.id} />
    case 'library':   return <Library />
    case 'talk':      return <TalkDetail id={route.id} />
    default:          return <Home />
  }
}

function Device() {
  const { splash, route } = useApp()
  const fullscreen = route.name === 'session' || route.name === 'player'
  return (
    <div className="shell">
      <div className="device">
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
  return <AppProvider><AudioProvider><MeditationAudioProvider><Device /></MeditationAudioProvider></AudioProvider></AppProvider>
}
