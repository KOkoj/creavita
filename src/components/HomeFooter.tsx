import Link from 'next/link';
import { studioCopy } from '@/data/projects';

export default function HomeFooter() {
  return (
    <footer className="home-footer" id="kontakt">
      <div className="home-footer__inner">
        <p className="home-footer__kicker">Kontakt</p>
        <p className="home-footer__intro">{studioCopy.contactIntro}</p>
        <dl className="home-footer__rows">
          <div>
            <dt>E-mail</dt>
            <dd>
              <a href="mailto:info@creavita.cz">info@creavita.cz</a>
            </dd>
          </div>
          <div>
            <dt>Stránka</dt>
            <dd>
              <Link href="/contact/">Kontakt</Link>
            </dd>
          </div>
        </dl>
        <p className="home-footer__process">{studioCopy.process}</p>
      </div>
    </footer>
  );
}
