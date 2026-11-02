'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import SiteFrame from '@/components/chrome/SiteFrame';
import { copy, MAILTO, TOPICS } from '@/lib/copy';
import { studioCopy } from '@/data/projects';
import { prefersReducedMotion } from '@/lib/motion';

type Fields = {
  name: string;
  email: string;
  company: string;
  topic: string;
  message: string;
  consent: boolean;
  website: string;
};

const empty: Fields = {
  name: '',
  email: '',
  company: '',
  topic: '',
  message: '',
  consent: false,
  website: '',
};

export default function ContactView() {
  const root = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<'idle' | 'invalid' | 'sending' | 'failed'>('idle');
  const [fields, setFields] = useState<Fields>(empty);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-rise]', {
        autoAlpha: 0,
        y: 18,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.07,
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const set =
    (key: keyof Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value;
      setFields((f) => ({ ...f, [key]: value }));
    };

  const mailto = () => {
    const subject = encodeURIComponent(`Poptávka: ${fields.topic || copy.name}`);
    const body = encodeURIComponent(
      [
        fields.message,
        '',
        fields.name,
        fields.email,
        fields.company,
        fields.topic,
      ]
        .filter(Boolean)
        .join('\n')
    );
    return `${MAILTO}?subject=${subject}&body=${body}`;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.website) return;
    if (
      !(
        fields.name.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) &&
        fields.topic &&
        fields.message.trim().length >= 10 &&
        fields.consent
      )
    ) {
      setStatus('invalid');
      return;
    }
    setStatus('sending');
    window.location.href = mailto();
    window.setTimeout(() => setStatus('idle'), 1200);
  };

  return (
    <SiteFrame variant="page" current="contact" path="/kontakt/" backHref="/">
      <section
        className="wUDG8a_section _8n00eG_page contact-page"
        aria-labelledby="contact-title"
        ref={root}
      >
        <div className="wUDG8a_copy">
          <h1 id="contact-title" className="wUDG8a_title" data-rise="true">
            {copy.contactTitle}
          </h1>
          <p className="wUDG8a_lead" data-rise="true">
            {copy.contactLead}
          </p>
          <dl className="wUDG8a_info" data-rise="true">
            <div>
              <dt>{copy.emailLabel}</dt>
              <dd>
                <a href={MAILTO}>{studioCopy.email}</a>
              </dd>
            </div>
          </dl>
        </div>
        <div className="wUDG8a_panel" data-rise="true">
          <form className="wUDG8a_form" noValidate onSubmit={onSubmit}>
            <label className="wUDG8a_field">
              <span>{copy.formName}</span>
              <input
                autoComplete="name"
                required
                maxLength={120}
                name="name"
                value={fields.name}
                onChange={set('name')}
              />
            </label>
            <label className="wUDG8a_field">
              <span>{copy.formEmail}</span>
              <input
                type="email"
                autoComplete="email"
                required
                maxLength={200}
                name="email"
                value={fields.email}
                onChange={set('email')}
              />
            </label>
            <label className="wUDG8a_field">
              <span>{copy.formCompany}</span>
              <input
                autoComplete="organization"
                maxLength={160}
                name="company"
                value={fields.company}
                onChange={set('company')}
              />
            </label>
            <label className="wUDG8a_field">
              <span>{copy.formTopic}</span>
              <select name="topic" required value={fields.topic} onChange={set('topic')}>
                <option value="" disabled>
                  —
                </option>
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="wUDG8a_field">
              <span>{copy.formMessage}</span>
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={5000}
                rows={5}
                value={fields.message}
                onChange={set('message')}
              />
            </label>
            <label className="_8n00eG_check">
              <input type="checkbox" name="consent" checked={fields.consent} onChange={set('consent')} />
              <span>{copy.formConsent}</span>
            </label>
            <label className="wUDG8a_hp" aria-hidden="true">
              Web
              <input
                tabIndex={-1}
                autoComplete="off"
                name="website"
                value={fields.website}
                onChange={set('website')}
              />
            </label>
            <div className="_8n00eG_status" aria-live="polite">
              {status === 'invalid' ? <p className="_8n00eG_error">{copy.formInvalid}</p> : null}
              {status === 'failed' ? (
                <p className="_8n00eG_error">
                  {copy.formFailed}{' '}
                  <a className="wUDG8a_mailto" href={mailto()}>
                    {studioCopy.email}
                  </a>
                  .
                </p>
              ) : null}
            </div>
            <div className="wUDG8a_actions">
              <span />
              <button type="submit" className="wUDG8a_submit" disabled={status === 'sending'}>
                {status === 'sending' ? copy.sending : copy.send}
              </button>
            </div>
          </form>
        </div>
      </section>
    </SiteFrame>
  );
}
