import { Octokit } from "octokit";

import { err, ok } from "@fanumtax/utils/result";

import type { ConnectionAdapter } from "../../interfaces/connection-adapter";

interface GitHubCreateAccessTokenRequestOptions {
  code: string;
  state?: string;
}

export const createGithubConnectionAdapter = (
  clientId: string,
  clientSecret: string
): ConnectionAdapter<GitHubCreateAccessTokenRequestOptions> => {
  return {
    createAccessToken: async ({ code, state }) => {
      try {
        const data = JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          state,
        });

        const res = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: data,
        });

        if (res.status !== 200) return err("unexpected_error", "Failed to get access token");

        const { access_token: accessToken } = (await res.json()) as {
          access_token: string;
        };

        return ok(accessToken);
      } catch (_error) {
        return err("unexpected_error", (_error as Error).message);
      }
    },
    getCurrentUser: async (accessToken) => {
      try {
        const octokit = new Octokit({
          auth: accessToken,
        });

        const auth = await octokit.rest.users.getAuthenticated();
        if (auth.status !== 200) return err("invalid_token", "Invalid access token");

        return ok({
          id: auth.data.id.toString(),
          username: auth.data.login,
        });
      } catch (_error) {
        return err("unexpected_error", (_error as Error).message);
      }
    },
  };
};
