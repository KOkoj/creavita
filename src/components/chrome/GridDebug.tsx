'use client';

import { useEffect, useState } from 'react';

export default function GridDebug() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('grid') === '1') setOn(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.key !== 'g' && e.key !== 'G') || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      )
        return;
      e.preventDefault();
      setOn((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!on) return null;
  return (
    <div className="grid-debug" aria-hidden="true">
      <div className="grid-debug-rows" />
      <div className="grid-debug-cols">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i}>
            <span>{i + 1}</span>
          </i>
        ))}
      </div>
    </div>
  );
}
