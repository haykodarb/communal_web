/** @type {import('./$types').PageLoad} */

export function load({ params, url }) {
	console.log(params);
    console.log(url);
    let code = url.searchParams.get('code');
    return { code };
}