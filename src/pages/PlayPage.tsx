import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Maximize, RotateCw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router';

import { ApiError, post, useConfig, useMe } from '#/api';
import { Button, Notice, Page } from '#/ui';

/**
 * The hotel itself: the client, from its own subdomain, filling the window below a thin bar. Each
 * visit asks for a fresh ticket, which the client logs in with once; Reload asks for another.
 */
export const PlayPage = () => {
    const hotel = useConfig().data?.hotelName ?? 'Hotel';
    const me = useMe();
    const frame = useRef<HTMLIFrameElement>(null);
    const play = useMutation({ mutationFn: () => post<{ clientUrl: string }>('/play') });
    const { mutate } = play;
    const signedIn = Boolean(me.data?.player);

    // Once a visit: each ask issues a ticket that replaces the last, so asking twice would leave
    // the first frame with a ticket that no longer works.
    const asked = useRef(false);

    useEffect(() => {
        if (signedIn && !asked.current) {
            asked.current = true;
            mutate();
        }
    }, [ signedIn, mutate ]);

    if (me.isPending)
        return <Page hotel={hotel}><p className="text-sm text-muted">One moment…</p></Page>;

    if (!signedIn || (play.error instanceof ApiError && play.error.status === 401))
        return <Navigate to="/" replace />;

    if (play.error)
        return (
            <Page hotel={hotel}>
                <div className="flex flex-col gap-4">
                    <Notice>{play.error.message}</Notice>
                    <Link to="/"><Button tone="ghost"><ArrowLeft />Back</Button></Link>
                </div>
            </Page>
        );

    return (
        <div className="flex h-dvh flex-col bg-black">
            <div className="flex h-10 shrink-0 items-center gap-1 border-b border-line bg-chrome px-2 text-sm text-muted">
                <Link to="/" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 hover:bg-subtle hover:text-ink [&>svg]:size-4"><ArrowLeft />{hotel}</Link>
                <span className="ml-auto" />
                <button type="button" title="Reload the hotel" aria-label="Reload the hotel" onClick={() => mutate()} className="grid size-8 place-items-center rounded-lg hover:bg-subtle hover:text-ink [&>svg]:size-4"><RotateCw /></button>
                <button type="button" title="Full screen" aria-label="Full screen" onClick={() => void frame.current?.requestFullscreen()} className="grid size-8 place-items-center rounded-lg hover:bg-subtle hover:text-ink [&>svg]:size-4"><Maximize /></button>
            </div>
            {play.data
                ? (
                        <iframe
                            ref={frame}
                            key={play.data.clientUrl}
                            src={play.data.clientUrl}
                            title={hotel}
                            allow="fullscreen; autoplay; clipboard-read; clipboard-write"
                            className="w-full flex-1 border-0"
                        />
                    )
                : <p className="m-auto text-sm text-muted">Opening the hotel…</p>}
        </div>
    );
};
