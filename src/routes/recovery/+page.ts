/** @type {import('./$types').PageLoad} */

export function load({ params, url }) {
	console.log(params);
    console.log(url);
    let access_token = url.searchParams.get('access_token');
    let refresh_token = url.searchParams.get('refresh_token');
    return { access_token, refresh_token };
}