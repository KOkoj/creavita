import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { projects, studioCopy } from '@/data/projects';

export default function HomeHero() {
  return (
    <section className="page" aria-label="Úvod">
      <div className="page__inner">
        <SiteHeader current="work" />

        <div className="hero__projects" id="prace">
          <p className="prace-intro">{studioCopy.lead}</p>
          <div className="project-list-viewport">
            <ul className="project-list">
              {projects.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/projekty/${project.slug}/`}
                    className="project-list__item"
                  >
                    <span className="project-list__name">{project.client}</span>
                    <span className="project-list__type">{project.type}</span>
                    <span className="project-list__category">{project.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hero__footer">
          <p className="about-text">
            {studioCopy.intro} {studioCopy.about}
          </p>
        </div>
      </div>

      <Link
        href={`/projekty/${projects[0].slug}/`}
        className="hero__visual"
        aria-label={projects[0].title}
      >
        <img
          src={projects[0].images[0].src}
          alt={projects[0].images[0].alt}
          width={1024}
          height={645}
        />
      </Link>
    </section>
  );
}
