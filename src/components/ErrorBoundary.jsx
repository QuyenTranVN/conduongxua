import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() { return { failed: true } }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('Application error', error, info)
  }

  render() {
    if (!this.state.failed) return this.props.children
    const english = document.documentElement.lang === 'en'
    return <main className='app-fallback' role='alert'>
      <IconFallback />
      <h1>{english ? 'Something went wrong' : 'Đã xảy ra lỗi'}</h1>
      <p>{english ? 'Your saved practice data is safe. Please reload the app and try again.' : 'Dữ liệu thực hành đã lưu vẫn an toàn. Vui lòng tải lại ứng dụng và thử lại.'}</p>
      <button className='btn btn-primary' onClick={() => window.location.reload()}>{english ? 'Reload' : 'Tải lại'}</button>
    </main>
  }
}

function IconFallback() {
  return <svg width='38' height='38' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.4' aria-hidden='true'><path d='M12 4c2 2.6 3.1 4.8 3.1 7 0 2.5-1.4 4.6-3.1 6-1.7-1.4-3.1-3.5-3.1-6C8.9 8.8 10 6.6 12 4M12 17c-2.7 1.7-6.2 1.5-8.3-.8 1.3-2.4 3.8-3.6 6.3-3.1M12 17c2.7 1.7 6.2 1.5 8.3-.8-1.3-2.4-3.8-3.6-6.3-3.1' /></svg>
}
