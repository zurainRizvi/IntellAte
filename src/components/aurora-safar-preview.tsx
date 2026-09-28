'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700-italic.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/700.css';
import '@/demos/aurora-safar/demo-globals.css';
import '@/demos/aurora-safar/foliage.css';

const Invitation = dynamic(() => import('@/demos/aurora-safar/components/Invitation'), {
  ssr: false,
  loading: () => (
    <div className="aurora-preview-loading" role="status">
      Loading Aurora Safar…
    </div>
  ),
});

export function AuroraSafarPreview({ embed = false }: { embed?: boolean }) {
  return (
    <div className={`aurora-demo${embed ? ' is-embed' : ''}`}>
      {!embed && (
        <div className="aurora-preview-chrome">
          <Link href="/invitations/aurora-safar" className="aurora-preview-back">
            ← Back to design
          </Link>
          <p className="aurora-preview-note">Preview mode · fictional demo couple</p>
          <Link href="/order?design=aurora-safar" className="aurora-preview-cta">
            Request This Design
          </Link>
        </div>
      )}
      <Invitation />
    </div>
  );
}
