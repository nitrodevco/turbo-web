import { useQuery } from '@tanstack/react-query';

/** A request the site's API refused, with its reason in words. */
export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

/** The site's API, on the site's own origin: its cookies say who is signed in. */
export const api = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    let response: Response;

    try {
        response = await fetch(`/api${path}`, {
            ...init,
            credentials: 'same-origin',
            headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
        });
    } catch {
        throw new ApiError(0, 'The hotel can\'t be reached right now. Try again in a moment.');
    }

    if (!response.ok) {
        let message = `Something went wrong (${response.status}).`;

        try {
            message = ((await response.json()) as { message?: string }).message ?? message;
        } catch {
            // No reason given.
        }

        throw new ApiError(response.status, message);
    }

    return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
};

export const post = <T>(path: string, body?: unknown) =>
    api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

export interface SiteConfig {
    hotelName: string;
    registrationOpen: boolean;
    discordReady: boolean;
    playReady: boolean;
}

export interface Player {
    id: number;
    name: string;
    motto: string | null;
    figure: string;
    avatarUrl: string | null;
}

export interface Me {
    player: Player | null;
    ban: { reason: string; expiresAtUtc: string | null } | null;
    signUp: { discordName: string; suggestedName: string } | null;
}

export const useConfig = () => useQuery({
    queryKey: [ 'config' ],
    queryFn: () => api<SiteConfig>('/config'),
    staleTime: 5 * 60_000,
});

export const useMe = () => useQuery({
    queryKey: [ 'me' ],
    queryFn: () => api<Me>('/me'),
});

/** Where Discord sign-in starts: a full page visit, so the browser follows Discord's redirects. */
export const DISCORD_SIGN_IN = '/api/auth/discord';
