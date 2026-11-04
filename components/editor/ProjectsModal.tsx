'use client';

import React, { useEffect, useState } from 'react';
import { FolderOpen, Plus, Trash2, Calendar, Cpu, Cable, X, Loader2 } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { fetchProjects, fetchProject, deleteProjectApi } from '../../lib/api-client';
import { ProjectSummary } from '@circuitlab/shared';

export const ProjectsModal: React.FC = () => {
  const activeModal = useEditorStore((s) => s.activeModal);
  const openModal = useEditorStore((s) => s.openModal);
  const setProject = useEditorStore((s) => s.setProject);
  const newProject = useEditorStore((s) => s.newProject);
  const addToast = useEditorStore((s) => s.addToast);
  const isReadOnly = useEditorStore((s) => s.isReadOnly);

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeModal === 'projects') {
      loadProjectList();
    }
  }, [activeModal]);

  const loadProjectList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProjects();
      setProjects(res.projects || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = async (id: string) => {
    try {
      setLoading(true);
      const proj = await fetchProject(id);
      setProject(proj, false);
      openModal(null);
      addToast({
        type: 'success',
        title: 'Project Loaded',
        message: `Loaded "${proj.name}" from database.`,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Load Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete project "${name}"?`)) return;
    try {
      await deleteProjectApi(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      addToast({ type: 'info', title: 'Project Deleted', message: `Deleted "${name}".` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };

  if (activeModal !== 'projects') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 select-none">
      <div className="w-full max-w-lg rounded-xl border border-panel-border bg-panel-bg p-4 sm:p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-panel-border pb-3 shrink-0">
          <div className="flex items-center space-x-2 text-blue-400">
            <FolderOpen className="h-5 w-5" />
            <h3 className="font-semibold text-gray-100">Saved Circuit Projects</h3>
          </div>
          <button
            onClick={() => openModal(null)}
            className="rounded p-1 text-gray-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {loading && projects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-xs">Fetching projects from MongoDB...</span>
            </div>
          )}

          {error && (
            <div className="rounded bg-red-950/30 p-3 text-xs text-red-400 border border-red-900/40">
              {error}
            </div>
          )}

          {!loading && projects.length === 0 && !error && (
            <div className="py-12 text-center text-xs text-gray-400 space-y-3">
              <p>No saved projects found in database.</p>
              <button
                onClick={() => {
                  newProject();
                  openModal(null);
                }}
                className="inline-flex items-center space-x-1.5 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Project</span>
              </button>
            </div>
          )}

          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => handleSelectProject(proj.id)}
              className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-header p-3 hover:border-blue-500/60 hover:bg-panel-hover transition cursor-pointer"
            >
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-gray-200">{proj.name}</h4>
                <div className="flex items-center space-x-3 text-[11px] text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Cpu className="h-3 w-3 text-blue-400" />
                    <span>{proj.componentCount} components</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Cable className="h-3 w-3 text-emerald-400" />
                    <span>{proj.wireCount} wires</span>
                  </span>
                  <span className="flex items-center space-x-1" suppressHydrationWarning>
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleDeleteProject(e, proj.id, proj.name)}
                  disabled={isReadOnly}
                  className="rounded p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/40 transition disabled:opacity-30"
                  title="Delete Project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-panel-border pt-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              newProject();
              openModal(null);
            }}
            className="flex items-center space-x-1.5 rounded bg-panel-header border border-panel-border px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:bg-panel-hover transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => openModal(null)}
            className="rounded bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
