/** @type {import('./$types').PageLoad} */

export function load({ params, url }) {
    console.log(params);
    console.log(url);
    let parsed = new URLSearchParams(url.hash.substring(1));
    console.log(`Parsed: ${parsed}`);

    let access_token = parsed.get('access_token');
    let refresh_token = parsed.get('refresh_token');

    return { access_token, refresh_token };
}