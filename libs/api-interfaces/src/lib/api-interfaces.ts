export interface WoizCredential {
  id?: string;
  provider?: string;
  email?: string;
  username?: string;
  password?: string;
  comment?: string;
  accessedAt?: Date;
}

export interface WoizCredentials {
  credentials: WoizCredential[];
}

export interface GetPasswordResponse {
  password: string;
}

export interface SetMasterPassword {
  password: string;
}

export interface ChangeMasterPassword {
  oldPassword: string;
  newPassword: string;
}

export class AuthRequest {
  readonly username: string;
  readonly password: string;
}

export class AuthResponse {
  readonly idToken: string;
}

export class User {
  userId: string;
}

export class AuthTokenPayload {
  app: 'woizipass';
  userId: string;
}

export interface DownloadRequest {
  password: string;
}

export interface UploadRequest {
  password: string;
  newPassword: string;
}
