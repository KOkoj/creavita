import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProjectDetailView from '@/components/ProjectDetailView';
import { getProject, projects } from '@/data/projects';

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getProject(params.slug);
  if (!project) return { title: 'Projekt | CREAVITA' };
  return {
    title: `${project.title} | Creavita`,
    description: project.intro,
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) notFound();
  return <ProjectDetailView project={project} />;
}
