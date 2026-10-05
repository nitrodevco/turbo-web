import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Sparkles, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { api, type Me, post, useConfig, useMe } from '#/api';
import { Button, Notice, Page } from '#/ui';

/** A name, asked about once typing pauses. */
const useNameCheck = (name: string) => {
    const [ settled, setSettled ] = useState(name);

    useEffect(() => {
        const timer = setTimeout(() => setSettled(name.trim()), 350);

        return () => clearTimeout(timer);
    }, [ name ]);

    return useQuery({
        queryKey: [ 'name', settled ],
        queryFn: () => api<{ available: boolean; reason: string | null }>(`/names/${encodeURIComponent(settled)}`),
        enabled: settled.length > 0,
        staleTime: 10_000,
    });
};

/**
 * Finishing a first sign-in: the hotel name, offered from their Discord name and changeable, and
 * whether their character starts as a boy or a girl. Their account is made when they confirm.
 */
export const WelcomePage = () => {
    const hotel = useConfig().data?.hotelName ?? 'Hotel';
    const me = useMe();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const suggested = me.data?.signUp?.suggestedName ?? '';
    const [ name, setName ] = useState<string | null>(null);
    const [ gender, setGender ] = useState<'male' | 'female'>('male');
    const chosen = name ?? suggested;
    const check = useNameCheck(chosen);
    const create = useMutation({
        mutationFn: () => post<Me>('/sign-up', { name: chosen.trim(), gender }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [ 'me' ] });
            navigate('/');
        },
    });

    if (me.isPending)
        return <Page hotel={hotel}><p className="text-sm text-muted">One moment…</p></Page>;

    if (me.data?.player)
        return <Navigate to="/" replace />;

    if (!me.data?.signUp)
        return <Navigate to="/?error=expired" replace />;

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        create.mutate();
    };

    const available = check.data?.available;

    return (
        <Page hotel={hotel}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                    <h1 className="text-2xl font-bold">Choose your name</h1>
                    <p className="mt-1.5 text-sm text-muted">
                        Signed in with Discord as {me.data.signUp.discordName}. This is what everyone in {hotel} will call you.
                    </p>
                </div>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">Name</span>
                    <div className="relative">
                        <input
                            value={chosen}
                            onChange={event => setName(event.target.value)}
                            maxLength={15}
                            autoComplete="off"
                            spellCheck={false}
                            autoFocus
                            className="h-12 w-full rounded-xl border border-line bg-canvas px-4 pr-11 font-mono text-[15px] focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
                        />
                        <span className="absolute top-1/2 right-3.5 -translate-y-1/2 [&>svg]:size-5">
                            {available === true && <Check className="text-good" />}
                            {available === false && <X className="text-bad" />}
                        </span>
                    </div>
                    <span className={available === false ? 'text-xs text-bad' : 'text-xs text-muted'}>
                        {available === false ? check.data?.reason : '3 to 15 letters, digits and - = ? ! @ : . , _ — no spaces.'}
                    </span>
                </label>

                <fieldset className="flex flex-col gap-1.5">
                    <legend className="mb-1.5 text-sm font-medium">Your character</legend>
                    <div className="grid grid-cols-2 gap-2">
                        {([ [ 'male', 'Boy' ], [ 'female', 'Girl' ] ] as const).map(([ value, label ]) => (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={gender === value}
                                onClick={() => setGender(value)}
                                className={gender === value
                                    ? 'h-11 rounded-xl border border-accent bg-accent-soft text-sm font-semibold text-accent'
                                    : 'h-11 rounded-xl border border-line text-sm text-muted hover:text-ink'}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </fieldset>

                {create.error && <Notice>{create.error.message}</Notice>}

                <Button type="submit" disabled={create.isPending || available === false || chosen.trim().length < 3}>
                    <Sparkles />
                    Create my account
                </Button>
            </form>
        </Page>
    );
};
