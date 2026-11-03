'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Shield } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { shareProjectApi } from '../../lib/api-client';

export const ShareModal: React.FC = () => {
  const activeModal = useEditorStore((s) => s.activeModal);
  const openModal = useEditorStore((s) => s.openModal);
  const project = useEditorStore((s) => s.project);
  const addToast = useEditorStore((s) => s.addToast);

  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (activeModal !== 'share') return null;

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      const res = await shareProjectApi(project.id);
      const fullUrl = `${window.location.origin}/share/${res.shareId}`;
      setShareUrl(fullUrl);
      addToast({ type: 'success', title: 'Share Link Ready', message: 'Read-only link generated.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Share Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({ type: 'success', title: 'Copied to Clipboard' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-md rounded-xl border border-panel-border bg-panel-bg p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-panel-border pb-3">
          <div className="flex items-center space-x-2 text-blue-400">
            <Share2 className="h-5 w-5" />
            <h3 className="font-semibold text-gray-100">Share Project</h3>
          </div>
          <button
            onClick={() => openModal(null)}
            className="rounded p-1 text-gray-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-gray-300">
          <p>
            Generate a secure, public read-only link. Anyone with this link will be able to inspect, interact with, and simulate your circuit without modifying your original design.
          </p>

          <div className="rounded-lg bg-panel-header p-3 border border-panel-border space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Shield className="h-4 w-4" />
              <span className="font-semibold">Read-Only Protection Enforced</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Shared viewers cannot overwrite components, wires, or save changes to your project.
            </p>
          </div>

          {!shareUrl ? (
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full rounded bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
            >
              {loading ? 'Generating Link...' : 'Create Public Share Link'}
            </button>
          ) : (
            <div className="space-y-2">
              <label className="text-gray-400 font-medium">Public URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full rounded bg-panel-header px-3 py-2 font-mono text-xs text-gray-200 border border-panel-border focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="rounded bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-500 flex items-center space-x-1"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
