import Icon from '../Icon.jsx'

export default function PrivacyCard({ card }) {
  return <section className='privacy-card'>
    <span className='privacy-card__icon'><Icon name={card.icon} size={20} /></span>
    <h2>{card.title}</h2><p>{card.body}</p>
    {card.items && <ul>{card.items.map((item) => <li key={item}>{item}</li>)}</ul>}
  </section>
}

