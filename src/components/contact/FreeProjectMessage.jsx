import Icon from '../Icon.jsx'

export default function FreeProjectMessage({ title, description, thankYou }) {
  return <section className='contact-free'>
    <Icon name='lotus' size={26} />
    <h2>{title}</h2><p>{description}</p><p>{thankYou}</p>
  </section>
}

