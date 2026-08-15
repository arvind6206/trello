export interface User {
  id: string;
  username: string;
}

export interface Organization {
  id: string;
  orgname: string;
  description: string;
}

export interface Board {
  id: string;
  title: string;
  orgId: string;
}

export interface Section {
  id: string;
  title: string;
  boardId: string;
  position: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  boardId: string;
  sectionId: string;
  position: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
