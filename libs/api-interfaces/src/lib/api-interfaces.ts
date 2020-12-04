export interface WoizCredential {
  id?: string;
  provider?: string;
  username?: string;
  password?: string;
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
