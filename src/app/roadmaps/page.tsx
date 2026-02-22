import { Suspense } from 'react';
import RoadmapsClient from './RoadmapsClient';

export default function RoadmapsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">Loading...</div>}>
      <RoadmapsClient />
    </Suspense>
  );
}
