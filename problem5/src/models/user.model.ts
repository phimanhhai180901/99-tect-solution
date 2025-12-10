export interface User {
  id: number;
  name: string;
  type: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  type?: string;
}

export interface UpdateUserDto {
  name?: string;
  type?: string;
}

export interface UserFilters {
  name?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

