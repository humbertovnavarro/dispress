import axios from "axios";
export interface DiscordAccessToken {
    "access_token": string;
    "token_type": string;
    "expires_in": number;
    "refresh_token": string;
    "scope": string;
}
export interface DiscordUserData {
    "id": string;
    "username": string;
    "discriminator": string;
    "avatar": string;
}
export default class DiscordOAuth {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    constructor(clientId: string, clientSecret: string, redirectUri: string, scopes: string[]) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.scopes = scopes;
    }
    generateAccessToken(code: string): Promise<DiscordAccessToken> {
        return new Promise((resolve, reject) => {
            const endpoint = 'https://discord.com/api/v8';
            const params = new URLSearchParams();
            params.append("client_id", this.clientId);
            params.append("client_secret", this.clientSecret);
            params.append("grant_type", "authorization_code");
            params.append("code", code);
            params.append("redirect_uri", this.redirectUri);
            const headers = {
                "Content-Type": "application/x-www-form-urlencoded"
            };
            axios.post(endpoint + "/oauth2/token", params, { headers }).then(response => resolve(response.data))
                .catch(error => reject(error));
        });
    }
    refreshAccessToken(refreshToken: string): Promise<DiscordAccessToken> {
        return new Promise((resolve, reject) => {
            const endpoint = 'https://discord.com/api/v8';
            const params = new URLSearchParams();
            params.append("client_id", this.clientId);
            params.append("client_secret", this.clientSecret);
            params.append("grant_type", "refresh_token");
            params.append("refresh_token", refreshToken);
            const headers = {
                "Content-Type": "application/x-www-form-urlencoded"
            };
            axios.post(endpoint + "/oauth2/token", params, { headers }).then(response => resolve(response.data))
                .catch(error => reject(error));
        });
    }
    getUser(accessToken: string): Promise<DiscordUserData> {
        return new Promise((resolve, reject) => {
            const endpoint = 'https://discord.com/api/v8';
            const headers = {
                "Authorization": "Bearer " + accessToken
            };
            axios.get(endpoint + "/users/@me", { headers }).then(response => resolve(response.data))
                .catch(error => reject(error));
        });
    }
}