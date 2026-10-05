# Turbo Web

The public site for a [Turbo](..) hotel: people sign in with Discord, which makes them a player the
first time (they choose their name), and press Play to open the client with a fresh login ticket.
It talks to the public site API inside the Turbo server (`Turbo:Web`), which is its own small web
host on its own address, apart from the admin API.

## Running it

```bash
yarn install
yarn dev        # http://localhost:5175, /api proxied to 127.0.0.1:8092
yarn build      # dist/, static files for any web server
```

The server side needs `Turbo:Web:Enabled`, a Discord application (`Turbo:Web:Discord:ClientId` and
`ClientSecret`, with `<site>/api/auth/discord/callback` as its redirect), and the client's address
(`Turbo:Web:ClientUrl`, with `{ticket}`). See `docs/public-site.md`.

## Deploying

Serve `dist/` on the public domain and send its `/api/` to the `Turbo:Web:Url` address, as the
admin panel's domain does for the admin API. Every path that isn't a file goes to `index.html`.
The client runs on its own subdomain in a frame; its host must allow being framed by this site.
