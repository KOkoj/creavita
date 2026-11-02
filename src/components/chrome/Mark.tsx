import Link from 'next/link';

export default function Mark({
  href = '/',
  className = 'nav-mark',
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link className={className} href={href} aria-label="CREAVITA" data-cursor-label="Zpět na úvod">
      <img
        className="logo-mark"
        src="/creavita-logo.svg"
        alt=""
        width={138}
        height={20}
      />
    </Link>
  );
}
