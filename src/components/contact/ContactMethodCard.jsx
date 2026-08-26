function ContactIcon({ name }) {
  if (name === 'facebook') {
    return <svg width='23' height='23' viewBox='0 0 24 24' aria-hidden='true'>
      <path fill='currentColor' d='M13.7 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.5-.2-2.9-.2-2.9 0-4.9 1.8-4.9 5V10H6.3v3h2.9v8h4.5Z' />
    </svg>
  }
  if (name === 'phone') {
    return <svg width='23' height='23' viewBox='0 0 24 24' fill='none' stroke='currentColor'
      strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <path d='M7.2 3.8 10 7.4 8.2 9.6a15.2 15.2 0 0 0 6.2 6.2l2.2-1.8 3.6 2.8c.4.3.5.8.3 1.2-.7 1.6-2.2 2.5-4 2.2C9.9 19.1 4.9 14.1 3.8 7.5c-.3-1.8.6-3.3 2.2-4 .4-.2.9-.1 1.2.3Z' />
    </svg>
  }

  return <svg width='23' height='23' viewBox='0 0 24 24' fill='none' stroke='currentColor'
    strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <rect x='3' y='5.5' width='18' height='13' rx='2' />
    <path d='m4 7 8 6 8-6' />
  </svg>
}

export default function ContactMethodCard({ icon, title, description, detail, action, href, external = false }) {
  const content = <>
    <span className='contact-method__icon'><ContactIcon name={icon} /></span>
    <span className='contact-method__body'>
      <strong>{title}</strong><span className='contact-method__description'>{description}</span>
      {detail && <span className='contact-method__detail'>{detail}</span>}
      <span className='contact-method__action'>{action}{href ? ' →' : ''}</span>
    </span>
  </>
  return href ? <a className='contact-method' href={href} target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined} aria-label={action}>
    {content}
  </a> : <div className='contact-method contact-method--pending' aria-label={`${title}: ${action}`}>{content}</div>
}
