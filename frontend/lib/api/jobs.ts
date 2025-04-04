import { getToken } from '@/lib/auth';

// Base URL from environment variable or fallback
// When running in Docker, the browser can't resolve 'backend' hostname
// So we need to use 'localhost' for client-side requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Job {
  job_id: number;
  title: string;
  department?: string;
  location?: string;
  type: string;
  salary?: string;
  description: string;
  status: string;
  responsibilities?: string[];
  requirements?: string[];
  nice_to_have?: string[];
  benefits?: string[];
  skills: string[];
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  matched_candidates?: number;
}

export interface JobCreateData {
  title: string;
  department?: string;
  location?: string;
  type: string;
  salary?: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  nice_to_have?: string[];
  benefits?: string[];
  skills: string[];
}

// Client-side functions
function getJobsClient(token: string): Promise<Job[]> {
  return fetch(`${API_URL}/jobs`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(error => {
        throw new Error(error.detail || 'Failed to fetch jobs');
      });
    }
    return response.json();
  });
}

function getJobClient(jobId: string, token: string): Promise<Job> {
  return fetch(`${API_URL}/jobs/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(error => {
        throw new Error(error.detail || 'Failed to fetch job');
      });
    }
    return response.json();
  });
}

function createJobClient(jobData: JobCreateData, token: string): Promise<Job> {
  return fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobData),
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(error => {
        throw new Error(error.detail || 'Failed to create job');
      });
    }
    return response.json();
  });
}

function updateJobClient(jobId: string, jobData: Partial<JobCreateData>, token: string): Promise<Job> {
  return fetch(`${API_URL}/jobs/${jobId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobData),
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(error => {
        throw new Error(error.detail || 'Failed to update job');
      });
    }
    return response.json();
  });
}

function deleteJobClient(jobId: string, token: string): Promise<void> {
  return fetch(`${API_URL}/jobs/${jobId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(error => {
        throw new Error(error.detail || 'Failed to delete job');
      });
    }
  });
}

// Server-side functions
export async function getJobs(): Promise<Job[]> {
  if (typeof window !== 'undefined') {
    // Client-side: use token from localStorage
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    return getJobsClient(token);
  } else {
    // Server-side: use Next.js fetch with cookies
    const response = await fetch(`${API_URL}/jobs`, {
      headers: {
        // Server-side fetch will automatically include cookies
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch jobs');
    }

    return await response.json();
  }
}

export async function getJob(jobId: string): Promise<Job> {
  if (typeof window !== 'undefined') {
    // Client-side: use token from localStorage
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    return getJobClient(jobId, token);
  } else {
    // Server-side: use Next.js fetch with cookies
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
      headers: {
        // Server-side fetch will automatically include cookies
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch job');
    }

    return await response.json();
  }
}

export async function createJob(jobData: JobCreateData): Promise<Job> {
  if (typeof window !== 'undefined') {
    // Client-side: use token from localStorage
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    return createJobClient(jobData, token);
  } else {
    // Server-side: use Next.js fetch with cookies
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: {
        // Server-side fetch will automatically include cookies
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create job');
    }

    return await response.json();
  }
}

export async function updateJob(jobId: string, jobData: Partial<JobCreateData>): Promise<Job> {
  if (typeof window !== 'undefined') {
    // Client-side: use token from localStorage
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    return updateJobClient(jobId, jobData, token);
  } else {
    // Server-side: use Next.js fetch with cookies
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        // Server-side fetch will automatically include cookies
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update job');
    }

    return await response.json();
  }
}

export async function deleteJob(jobId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    // Client-side: use token from localStorage
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    return deleteJobClient(jobId, token);
  } else {
    // Server-side: use Next.js fetch with cookies
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        // Server-side fetch will automatically include cookies
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete job');
    }
  }
}
