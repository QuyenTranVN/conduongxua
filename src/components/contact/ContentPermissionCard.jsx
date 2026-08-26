export default function ContentPermissionCard({ title, description, action, href, unavailable }) {
  return <section className='contact-permissions'>
    <h2>{title}</h2>
    <p>{description}</p>
    {href ? <a href={href}>{action} →</a> : <span className='contact-unavailable'>{unavailable}</span>}
  </section>
}

