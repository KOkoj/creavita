import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { projects, type Project } from '@/data/projects';

export default function ProjectDetailView({ project }: { project: Project }) {
  const index = projects.findIndex((item) => item.slug === project.slug);
  const previous = index > 0 ? projects[index - 1] : projects[projects.length - 1];
  const next = index < projects.length - 1 ? projects[index + 1] : projects[0];

  return (
    <div className="creavita-home">
      <div className="page page--detail">
        <div className="page__inner">
          <SiteHeader current="work" />
        </div>
      </div>

      <article className="project-detail">
        <div className="project-detail__inner">
          <p className="project-detail__counter">
            {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
          </p>
          <h1 className="project-detail__title">{project.title}</h1>

          <dl className="project-detail__meta">
            <div className="project-detail__meta-item">
              <dt className="project-detail__meta-label">Klient</dt>
              <dd className="project-detail__meta-value">{project.client}</dd>
            </div>
            <div className="project-detail__meta-item">
              <dt className="project-detail__meta-label">Typ</dt>
              <dd className="project-detail__meta-value">{project.type}</dd>
            </div>
            <div className="project-detail__meta-item">
              <dt className="project-detail__meta-label">Kategorie</dt>
              <dd className="project-detail__meta-value">{project.category}</dd>
            </div>
          </dl>

          <p className="project-detail__intro">{project.intro}</p>

          <ul className="project-detail__services">
            {project.services.map((service) => (
              <li key={service} className="project-detail__service">
                {service}
              </li>
            ))}
          </ul>

          {project.sections.map((section) => (
            <section key={section.label}>
              <h2 className="project-detail__section-title">{section.label}</h2>
              <p className="project-detail__process">{section.body}</p>
            </section>
          ))}

          <div className="project-detail__gallery">
            {project.images.map((image) => (
              <figure key={image.src} className="project-detail__figure">
                <div className="project-detail__frame">
                  <img src={image.src} alt={image.alt} width={1024} height={1024} />
                </div>
                <figcaption className="project-detail__caption">{image.alt}</figcaption>
              </figure>
            ))}
          </div>

          <nav className="project-detail__pager" aria-label="Další projekty">
            <Link
              href={`/projekty/${previous.slug}/`}
              className="project-detail__pager-button project-detail__pager-button--prev"
            >
              <span className="project-detail__pager-text">
                <span className="project-detail__pager-label">Předchozí</span>
                <span className="project-detail__pager-name">{previous.title}</span>
              </span>
            </Link>
            <Link
              href={`/projekty/${next.slug}/`}
              className="project-detail__pager-button project-detail__pager-button--next"
            >
              <span className="project-detail__pager-text">
                <span className="project-detail__pager-label">Další</span>
                <span className="project-detail__pager-name">{next.title}</span>
              </span>
            </Link>
          </nav>
        </div>
      </article>
    </div>
  );
}
