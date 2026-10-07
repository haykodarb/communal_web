// Builds the web fonts in src/lib/fonts from the source TTFs in fonts/.
//
// Poppins is cut down to Latin (with Spanish and other Western European
// accents) and the Atlas icon fonts to just the glyphs Icon.svelte uses, all as
// WOFF2. Run `npm run fonts` after adding an icon to Icon.svelte's ATLAS map.
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import subsetFont from 'subset-font';

const root = new URL('../', import.meta.url);
const out = new URL('src/lib/fonts/', root);

/** Code point ranges kept in Poppins (Google Fonts' "latin" + Latin Extended-A). */
const LATIN = [
	[0x0000, 0x017f],
	[0x0192, 0x0192],
	[0x02bb, 0x02bc],
	[0x02c6, 0x02c6],
	[0x02da, 0x02da],
	[0x02dc, 0x02dc],
	[0x2000, 0x206f],
	[0x20ac, 0x20ac],
	[0x2122, 0x2122],
	[0x2190, 0x2193],
	[0x2212, 0x2212],
	[0xfeff, 0xfeff],
	[0xfffd, 0xfffd]
];
const latinText = LATIN.flatMap(([from, to]) =>
	Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i))
).join('');

const POPPINS = {
	Regular: 400,
	Medium: 500,
	SemiBold: 600,
	Bold: 700,
	ExtraBold: 800
};

async function build(source, text, name) {
	const input = await readFile(new URL(source, root));
	const output = await subsetFont(input, text, { targetFormat: 'woff2' });
	await writeFile(new URL(name, out), output);
	console.log(`${name.padEnd(28)} ${(input.length / 1024).toFixed(1).padStart(6)} KB -> ${(output.length / 1024).toFixed(1).padStart(5)} KB`);
}

await mkdir(out, { recursive: true });
for (const file of await readdir(out)) {
	if (file.endsWith('.woff2')) await unlink(new URL(file, out));
}

for (const [style, weight] of Object.entries(POPPINS)) {
	await build(`fonts/Poppins-${style}.ttf`, latinText, `poppins-${weight}.woff2`);
}

// Glyphs per Atlas family, read from Icon.svelte's `name: ['family', 0xcode]` entries.
const icon = await readFile(new URL('src/lib/components/Icon.svelte', root), 'utf8');
const glyphs = new Map();
for (const [, family, code] of icon.matchAll(/\[\s*'([a-z-]+)',\s*0x([0-9a-f]+)/gi)) {
	glyphs.set(family, (glyphs.get(family) ?? '') + String.fromCodePoint(parseInt(code, 16)));
}
for (const [family, text] of glyphs) {
	await build(`fonts/atlas/${family}.ttf`, text, `atlas-${family}.woff2`);
}
