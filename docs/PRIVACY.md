# Privacy

What Watched stores, what it never stores, and which services see a place you look up. The
[README](../README.md) has the short version.

The orbit maths runs in your browser. The site counts how it is used; it does not track people.

| Record | What Watched keeps |
|:--|:--|
| Lookup | A cell about 10 km across (0.1°), and that place's country and town. |
| Share | The town-level place name, a point rounded to about 1 km (0.01°), the pass and its photos, and a view count. |
| Visit | What happened (searches, results, passes and photos opened, shares, errors, page speed), tied to a random ID that lives only as long as the browser tab, with the device class, your country (from the host's edge), the referring site, any UTM tags and the app version. |

Raw events, visits and single lookups are deleted after 48 hours. What stays is counts: usage per hour and per day,
and lookups per cell. Shares are kept.

Watched's database never stores exact coordinates, IP addresses, cookies or full referrer URLs, and the event relay
never reads the IP. The app never sends street-level place names. The site's host and Supabase see IP addresses in
transit and in their own request logs, like any host. The host is Cloudflare (Vercel until November 2026).

Other services see the place too, but less often than you might think: names come from a list of towns,
countries and landmarks that ships with the site, so most searches, and any spot near a town, never leave your
browser. A search the list can't answer goes to [Open-Meteo](https://open-meteo.com/en/docs/geocoding-api), and to
[Photon](https://photon.komoot.io) if Open-Meteo has nothing; a spot far from any town goes to Photon, and to
[Nominatim](https://nominatim.openstreetmap.org) if Photon is slow. Planetary Computer and NASA GIBS see the point and the area around it, to send the photos.
Where a Meteosat watches the place, its small picture is cut by the site itself from a copy of EUMETSAT's newest
frame, which the site fetches on a timer: that request tells the site's host the point to about a kilometre, is
not stored, and tells EUMETSAT nothing. EUMETSAT sees the point and the area around it only if you open that picture.
Element 84 sees it only when Planetary Computer is down.

The host, Cloudflare, also counts page views and page speed with Cloudflare Web Analytics, with no cookies or local
storage (until November 2026 the site ran on Vercel, which counted them with Vercel Web Analytics). It receives the
page address, which for a place link can include its coordinates and name.

On Cloudflare, every page also gets a script Cloudflare adds to tell people from bots (JavaScript detections, which
the free plan cannot turn off). It sets one security cookie, `cf_clearance`, on watched.earth for up to a year. Watched
never reads it, and it is not used for analytics. It is the only cookie the site's visitors get.

Usage events are sent only from watched.earth, and never from a development build, an automated browser or a tab
opened with `?noanalytics=1` (for as long as that tab stays open). The flag doesn't stop lookups and shares being
counted: any build with Supabase configured counts them, development included. The host's web analytics ignores the
flag.
