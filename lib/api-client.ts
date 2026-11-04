import {
  CircuitProject,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectSummary,
} from '@circuitlab/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchProjects(): Promise<{ projects: ProjectSummary[]; total: number }> {
  const res = await fetch(`${API_BASE}/api/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  const json = await res.json();
  return json.data;
}

export async function fetchProject(id: string): Promise<CircuitProject> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`);
  if (!res.ok) throw new Error(`Project ${id} not found`);
  const json = await res.json();
  return json.data;
}

export async function createProjectApi(data: CreateProjectRequest): Promise<CircuitProject> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create project');
  }
  const json = await res.json();
  return json.data;
}

export async function updateProjectApi(id: string, data: UpdateProjectRequest): Promise<CircuitProject> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to update project');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteProjectApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete project');
  }
}

export async function shareProjectApi(id: string): Promise<{ shareId: string; shareUrl: string }> {
  const res = await fetch(`${API_BASE}/api/projects/${id}/share`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to create share link');
  const json = await res.json();
  return json.data;
}

export async function fetchSharedProject(shareId: string): Promise<CircuitProject & { readOnly: boolean }> {
  const res = await fetch(`${API_BASE}/api/projects/share/${shareId}`);
  if (!res.ok) throw new Error('Shared project not found or expired');
  const json = await res.json();
  return json.data;
}

export async function importProjectApi(data: object): Promise<CircuitProject> {
  const res = await fetch(`${API_BASE}/api/projects/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to import project');
  }
  const json = await res.json();
  return json.data;
}
