import Img from '../components/Img.jsx'
import { useApp } from '../lib/store.jsx'

export default function Splash() {
  const { setSplash } = useApp()
  return (
    <div className="splash" onClick={() => setSplash(false)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && setSplash(false)} aria-label="Enter the app">
      <Img src="/images/scenes/splash.jpg" label="" className="bgimg" />
      <div className="veil" />
      <div className="inner">
        <svg className="mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3c2.2 2.9 3.4 5.3 3.4 7.7 0 2.8-1.6 5.1-3.4 6.6-1.8-1.5-3.4-3.8-3.4-6.6C8.6 8.3 9.8 5.9 12 3" />
          <path d="M12 17.3c-3 1.9-6.9 1.7-9.2-.9 1.4-2.7 4.2-4 7-3.4M12 17.3c3 1.9 6.9 1.7 9.2-.9-1.4-2.7-4.2-4-7-3.4" />
          <path d="M12 17.3c-1.6 2-4.2 2.9-6.6 2.2M12 17.3c1.6 2 4.2 2.9 6.6 2.2" />
        </svg>
        <h1>Con Đường Xưa</h1>
        <div className="sub">Đạo Phật Nguyên Thuỷ</div>
      </div>
      <p className="tag">Trở về con đường giác ngộ<br />của Đức Phật Thích Ca Mâu Ni</p>
    </div>
  )
}
