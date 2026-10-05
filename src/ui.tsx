import type { ButtonHTMLAttributes, ReactNode } from 'react';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export const Button = ({ tone = 'accent', className, children, ...button }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'accent' | 'ghost' | 'discord' }) => (
    <button
        type="button"
        {...button}
        className={cx(
            'inline-flex h-12 items-center justify-center gap-2.5 rounded-xl px-5 text-[15px] font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-5',
            tone === 'accent' && 'bg-accent text-on-accent hover:bg-accent-hover',
            tone === 'discord' && 'bg-[#5865F2] text-white hover:bg-[#4752c4]',
            tone === 'ghost' && 'text-muted hover:bg-subtle hover:text-ink',
            className,
        )}
    >
        {children}
    </button>
);

export const Notice = ({ tone = 'bad', children }: { tone?: 'bad' | 'warn'; children: ReactNode }) => (
    <div role="alert" className={cx('rounded-xl border px-4 py-3 text-sm', tone === 'bad' ? 'border-bad-line bg-bad-soft text-bad' : 'border-warn-line bg-warn-soft text-warn')}>
        {children}
    </div>
);

/** The site's frame: the hotel's name across the top, the page in a card in the middle. */
export const Page = ({ hotel, children, aside }: { hotel: string; children: ReactNode; aside?: ReactNode }) => (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
        <header className="flex h-16 items-center justify-between px-5 sm:px-8">
            <span className="text-lg font-bold tracking-tight">{hotel}</span>
            {aside}
        </header>
        <main className="flex flex-1 items-center justify-center px-4 pb-16">
            <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl sm:p-8">{children}</div>
        </main>
    </div>
);

export const DiscordMark = () => (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.4 18.4 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18.1a19.9 19.9 0 0 0 6 3l1.3-2a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2a19.8 19.8 0 0 0 6-3c.5-5.2-.9-9.7-3.6-13.7ZM8 15.4c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.6 8 10.6s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" />
    </svg>
);
