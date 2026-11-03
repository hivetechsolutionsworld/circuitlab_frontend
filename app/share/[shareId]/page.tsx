'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { EditorLayout } from '../../../components/editor/EditorLayout';
import { fetchSharedProject } from '../../../lib/api-client';
import { useEditorStore } from '../../../stores/editorStore';
import { Loader2, AlertCircle } from 'lucide-react';

export default function SharedProjectPage() {
  const params = useParams();
  const shareId = Array.isArray(params.shareId) ? params.shareId[0] : params.shareId;
  const setProject = useEditorStore((s) => s.setProject);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;

    fetchSharedProject(shareId)
      .then((project) => {
        setProject(project, true); // Enforce read-only mode!
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Shared project could not be found.');
        setLoading(false);
      });
  }, [shareId, setProject]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-gray-300 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="font-mono text-sm">Loading shared circuit...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-gray-300 p-4 space-y-4">
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6 max-w-md text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
          <h2 className="text-base font-bold text-red-200">Shared Project Unavailable</h2>
          <p className="text-xs text-gray-400">{error}</p>
          <a
            href="/"
            className="inline-block rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition"
          >
            Go to CircuitLab 3D
          </a>
        </div>
      </div>
    );
  }

  return <EditorLayout />;
}
