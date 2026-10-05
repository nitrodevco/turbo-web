import { useQueryClient } from '@tanstack/react-query';
import { LogOut, Play } from 'lucide-react';
import { useEffect } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';

import { DISCORD_SIGN_IN, post, useConfig, useMe } from '#/api';
import { Button, DiscordMark, Notice, Page } from '#/ui';

/** What went wrong on the way back from Discord, by the reason the server sent. */
const ERRORS: Record<string, string> = {
    denied: 'You didn\'t allow the sign-in on Discord.',
    expired: 'That sign-in took too long or came from somewhere else. Try again.',
    discord: 'Discord didn\'t confirm who you are. Try again.',
    closed: 'New accounts aren\'t being made right now.',
    unavailable: 'Signing in with Discord isn\'t set up yet.',
};

/**
 * The front door: sign in with Discord; or, signed in, Play and sign out. Someone halfway through
 * signing up is sent on to choose their name.
 */
export const HomePage = () => {
    const config = useConfig().data;
    const me = useMe();
    const queryClient = useQueryClient();
    const [ params, setParams ] = useSearchParams();
    const error = params.get('error');
    const hotel = config?.hotelName ?? 'Hotel';

    useEffect(() => {
        document.title = hotel;
    }, [ hotel ]);

    if (me.data?.signUp)
        return <Navigate to="/welcome" replace />;

    const player = me.data?.player;

    const signOut = async () => {
        await post('/sign-out');
        await queryClient.invalidateQueries({ queryKey: [ 'me' ] });
    };

    return (
        <Page hotel={hotel} aside={player && <Button tone="ghost" onClick={() => void signOut()} className="h-10 text-sm"><LogOut />Sign out</Button>}>
            {player
                ? (
                        <div className="flex flex-col items-center gap-5 text-center">
                            {player.avatarUrl
                                ? <img src={player.avatarUrl} alt="" className="h-28 [image-rendering:pixelated]" />
                                : <div className="grid size-20 place-items-center rounded-2xl bg-accent-soft text-2xl font-bold text-accent">{player.name.slice(0, 2).toUpperCase()}</div>}
                            <div>
                                <h1 className="text-2xl font-bold">Hi, {player.name}</h1>
                                {player.motto && <p className="mt-1 text-sm text-muted">{player.motto}</p>}
                            </div>
                            {me.data?.ban
                                ? (
                                        <Notice>
                                            You're banned{me.data.ban.expiresAtUtc ? ` until ${new Date(me.data.ban.expiresAtUtc).toLocaleString()}` : ''}: {me.data.ban.reason}
                                        </Notice>
                                    )
                                : config?.playReady === false
                                    ? <Notice tone="warn">The hotel isn't open to play from here yet.</Notice>
                                    : <Link to="/play" className="w-full"><Button className="w-full"><Play />Play</Button></Link>}
                        </div>
                    )
                : (
                        <div className="flex flex-col gap-5">
                            <div>
                                <h1 className="text-2xl font-bold">Welcome to {hotel}</h1>
                                <p className="mt-1.5 text-sm text-muted">
                                    Sign in with your Discord account.{config?.registrationOpen === false ? '' : ' The first time, you choose your name and your account is made.'}
                                </p>
                            </div>
                            {error && (
                                <Notice>
                                    {ERRORS[error] ?? 'That sign-in didn\'t work. Try again.'}
                                    {' '}
                                    <button type="button" className="underline" onClick={() => setParams({})}>Dismiss</button>
                                </Notice>
                            )}
                            {me.error && <Notice>{me.error.message}</Notice>}
                            <a href={DISCORD_SIGN_IN} aria-disabled={config?.discordReady === false}>
                                <Button tone="discord" className="w-full" disabled={config?.discordReady === false}>
                                    <DiscordMark />
                                    Sign in with Discord
                                </Button>
                            </a>
                        </div>
                    )}
        </Page>
    );
};
