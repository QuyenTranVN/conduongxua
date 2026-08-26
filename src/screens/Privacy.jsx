import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import PrivacyCard from '../components/privacy/PrivacyCard.jsx'
import { PRIVACY_CONFIG } from '../config/privacy.js'
import { privacyText } from '../data/privacy.js'
import { useApp } from '../lib/store.jsx'

export default function Privacy() {
  const { lang, go } = useApp()
  const copy = privacyText(lang)
  const date = new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', { dateStyle: 'long' }).format(new Date(`${PRIVACY_CONFIG.lastUpdated}T12:00:00Z`))
  const cards = [copy.cards.stored, copy.cards.meditation, copy.cards.saved,
    !PRIVACY_CONFIG.features.accountEnabled && copy.cards.local,
    PRIVACY_CONFIG.features.externalLinksEnabled && copy.cards.external].filter(Boolean)

  return <><AppBar title={copy.pageTitle} /><div className='scroll has-mini privacy-page'><main className='privacy-inner'>
    <header className='privacy-hero'><span>{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p><small>{copy.lastUpdated}: {date}</small></header>
    <div className='privacy-grid'>{cards.map((card) => <PrivacyCard key={card.title} card={card} />)}</div>
    <section className='privacy-promise'><span className='privacy-card__icon'><Icon name='check' size={21} /></span><h2>{copy.promise.title}</h2>
      <ul>{copy.promise.items.map((item) => <li key={item}><Icon name='check' size={16} />{item}</li>)}</ul></section>
    <section className='privacy-rights'><h2>{copy.choices.title}</h2><p>{copy.choices.body}</p>
      <ul>{copy.choices.items.map((item) => <li key={item}>{item}</li>)}</ul>
      <button onClick={() => go('contact')}>{copy.choices.action} →</button></section>
    <section className='privacy-contact'><h2>{copy.contact.title}</h2><p>{copy.contact.body}</p>
      <button className='btn btn-primary' onClick={() => go('contact')}>{copy.contact.action}</button></section>
    {PRIVACY_CONFIG.policyUrl && <a className='privacy-policy-link' href={PRIVACY_CONFIG.policyUrl} target='_blank' rel='noopener noreferrer'>{copy.fullPolicy} →</a>}
    <footer className='privacy-free'><Icon name='lotus' size={25} /><h2>{copy.freeTitle}</h2><p>{copy.freeBody}</p></footer>
  </main></div></>
}

