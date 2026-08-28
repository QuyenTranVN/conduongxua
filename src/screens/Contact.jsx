import { AppBar } from '../components/Chrome.jsx'
import ContactMethodCard from '../components/contact/ContactMethodCard.jsx'
import ContactReasonChip from '../components/contact/ContactReasonChip.jsx'
import ContentPermissionCard from '../components/contact/ContentPermissionCard.jsx'
import FreeProjectMessage from '../components/contact/FreeProjectMessage.jsx'
import { CONTACT_CONFIG } from '../config/contact.js'
import { contactText } from '../data/contact.js'
import { useApp } from '../lib/store.jsx'
import { isSafeWebUrl } from '../services/contentValidation.js'

const configured = (value) => value && !value.startsWith('YOUR_')

export default function Contact() {
  const { lang, setLang } = useApp()
  const copy = contactText(lang)
  const email = configured(CONTACT_CONFIG.email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONTACT_CONFIG.email) ? CONTACT_CONFIG.email : ''
  const facebookUrl = configured(CONTACT_CONFIG.facebookUrl) && isSafeWebUrl(CONTACT_CONFIG.facebookUrl) ? CONTACT_CONFIG.facebookUrl : ''
  const emailHref = email ? `mailto:${email}` : ''
  const phoneHref = /^\+?[\d\s().-]{7,}$/.test(CONTACT_CONFIG.phone || '') ? `tel:${CONTACT_CONFIG.phone.replace(/[^+\d]/g, '')}` : ''

  return <>
    <AppBar title={copy.pageTitle} right={<div className='contact-language' aria-label='Language'>
      <button aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>VI</button><span>/</span>
      <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
    </div>} />
    <div className='scroll has-mini contact-page buddhist-page-background'>
      <main className='contact-inner'>
        <header className='contact-hero'><span>{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.description}</p></header>
        <div className='contact-methods'>
          <ContactMethodCard icon='mail' title={copy.email} description={copy.emailDescription} detail={email}
            action={copy.sendEmail} href={emailHref} />
          <ContactMethodCard icon='phone' title={copy.phone} description={copy.phoneDescription} detail={CONTACT_CONFIG.phone}
            action={copy.callPhone} href={phoneHref} />
          <ContactMethodCard icon='facebook' title={copy.facebook} description={copy.facebookDescription}
            action={facebookUrl ? copy.openFacebook : copy.comingSoon} href={facebookUrl} external={Boolean(facebookUrl)} />
        </div>
        <section className='contact-reasons' aria-labelledby='contact-reasons-title'>
          <h2 id='contact-reasons-title'>{copy.contactAbout}</h2>
          <div>{copy.reasons.map((reason) => <ContactReasonChip key={reason}>{reason}</ContactReasonChip>)}</div>
        </section>
        <ContentPermissionCard title={copy.permissionsTitle} description={copy.permissionsDescription}
          action={copy.contactByEmail} href={emailHref} unavailable={copy.unavailable} />
        <FreeProjectMessage title={copy.freeTitle} description={copy.freeDescription} thankYou={copy.thankYou} />
      </main>
    </div>
  </>
}
