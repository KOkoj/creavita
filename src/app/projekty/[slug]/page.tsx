import CaseView from '@/components/case/CaseView';
import { getProject, projects } from '@/data/projects';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getProject(params.slug);
  if (!project) return {};
  return {
    title: `${project.client} — CREAVITA`,
    description: project.intro,
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) notFound();
  return <CaseView slug={params.slug} />;
}
