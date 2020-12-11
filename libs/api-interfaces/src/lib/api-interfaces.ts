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
  key: string;
}

export interface ChangeMasterPassword {
  oldKey: string;
  newKey: string;
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
  key: string;
}

export interface UploadRequest {
  key: string;
  newKey: string;
}

export interface UploadTextRequest {
  key: string;
  newKey: string;
  text: string;
}
