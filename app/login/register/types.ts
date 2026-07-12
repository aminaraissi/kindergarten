export interface ParentInfo {
  name: string;
  lastname: string;
  dob: string;
  pob: string;
  phone: string;
  email: string;
}

export interface Guardian {
  id: number;
  name: string;
  lastname: string;
  dob: string;
  pob: string;
  phone: string;
  email: string;
}

export interface ChildInfo {
  name: string;
  lastname: string;
  dob: string;
  pob: string;
  address: string;
  health: string;
  note: string;
}

export function emptyParentInfo(): ParentInfo {
  return { name: '', lastname: '', dob: '', pob: '', phone: '', email: '' };
}

export function emptyChildInfo(): ChildInfo {
  return { name: '', lastname: '', dob: '', pob: '', address: '', health: '', note: '' };
}

export type SubmitStatus = 'idle' | 'sending' | 'ok' | 'err';