'use client';

import SiteFrame from '@/components/chrome/SiteFrame';
import { copy } from '@/lib/copy';

export default function AboutView() {
  return (
    <SiteFrame variant="page" current="about" path="/o-nas/" backHref="/">
      <section className="about about-page" aria-labelledby="about-title">
        <div className="about-open">
          <span className="about-label">{copy.aboutKicker}</span>
          <h1 id="about-title">{copy.aboutTitle}</h1>
          <div className="about-intro">
            <p>{copy.aboutBody}</p>
            <p>{copy.aboutExtra}</p>
          </div>
          <dl className="about-facts">
            <div>
              <dt>{copy.fields}</dt>
              <dd className="about-fields">
                {copy.fieldList.map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </dd>
            </div>
            <div>
              <dt>{copy.place}</dt>
              <dd>{copy.placeDetail}</dd>
            </div>
          </dl>
        </div>
      </section>
    </SiteFrame>
  );
}
