'use client';

import SiteFrame from './SiteFrame';
import { copy } from '@/lib/copy';

export default function NotFoundView() {
  return (
    <SiteFrame variant="page" path="/404/" backHref="/">
      <section className="about about-page" aria-labelledby="missing-title">
        <div className="about-open">
          <span className="about-label">404</span>
          <h1 id="missing-title">{copy.notFoundTitle}</h1>
          <div className="about-intro">
            <p>{copy.notFoundBody}</p>
          </div>
          <p className="about-facts">
            <a className="page-back" href="/">
              {copy.backHome}
            </a>
          </p>
        </div>
      </section>
    </SiteFrame>
  );
}
