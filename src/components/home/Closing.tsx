'use client';

import { copy, MAILTO } from '@/lib/copy';
import { studioCopy } from '@/data/projects';
import { useLenis } from '@/lib/lenis';
import { scrollToTarget } from '@/lib/scroll';

export function FooterBar() {
  const lenis = useLenis();
  return (
    <footer className="foot-bar">
      <span>{copy.rights}</span>
      <span>
        <a href={MAILTO}>{studioCopy.email}</a>
      </span>
      <a
        className="foot-up"
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          scrollToTarget('#top', lenis);
        }}
      >
        {copy.top}
      </a>
      <button
        type="button"
        className="foot-top"
        aria-label={copy.backTop}
        data-cursor-label={copy.backTop}
        onClick={() => scrollToTarget('#top', lenis)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 19V6M6 11l6-6 6 6" />
        </svg>
      </button>
    </footer>
  );
}

export function BookingEmpty() {
  return (
    <section id="rezervace" className="wUDG8a_section" aria-labelledby="rezervace-title">
      <div className="wUDG8a_copy">
        <h2 id="rezervace-title" className="wUDG8a_title">
          {copy.closingTitle}
        </h2>
        <p className="wUDG8a_lead">{copy.closingLead}</p>
        <dl className="wUDG8a_info">
          <div>
            <dt>{copy.emailLabel}</dt>
            <dd>
              <a href={MAILTO}>{studioCopy.email}</a>
            </dd>
          </div>
        </dl>
      </div>
      <div className="wUDG8a_panel">
        <p className="wUDG8a_note">
          {copy.bookingEmpty}{' '}
          <a className="wUDG8a_mailto" href={MAILTO}>
            {studioCopy.email}
          </a>
          .
        </p>
      </div>
    </section>
  );
}

export function ClosingCompact() {
  return (
    <section className="closing-compact" aria-labelledby="closing-title">
      <h2 id="closing-title">{copy.closingTitle}</h2>
      <p>{copy.closingLead}</p>
      <dl className="closing-info">
        <div>
          <dt>{copy.emailLabel}</dt>
          <dd>
            <a href={MAILTO}>{studioCopy.email}</a>
          </dd>
        </div>
      </dl>
      <div className="closing-actions">
        <span className="closing-book">
          <a href={MAILTO}>{copy.writeEmail}</a>
        </span>
      </div>
    </section>
  );
}
