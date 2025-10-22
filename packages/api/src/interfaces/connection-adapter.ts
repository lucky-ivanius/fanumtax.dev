import type { Result } from "@fanumtax/utils/result";

export type CreateAccessTokenResult = Result<string, "invalid_code">;

export type ConnectionUser = {
  id: string;
  username: string;
};

export type GetCurrentUserResult = Result<ConnectionUser, "invalid_token">;

export interface ConnectionAdapter<TAccessTokenRequestOptions> {
  createAccessToken(options: TAccessTokenRequestOptions): Promise<CreateAccessTokenResult>;
  getCurrentUser(accessToken: string): Promise<GetCurrentUserResult>;
}
