// Generates the landing page's crow: an engraving-style line drawing (contours
// plus hatching clipped to each shape) of a crow perched on a stack of books,
// in the same pink-to-purple gradient as the original illustration.
// Usage: node scripts/generate-crow.mjs static/assets/crow.svg
import { writeFileSync } from 'node:fs';

const W = 350;
const H = 500;
const out = [];
const defs = [];
let uid = 0;

const f = (n) => Math.round(n * 100) / 100;

/** Parallel lines at `angle` (degrees) covering the viewBox, spaced `gap`,
 *  each bowed by `bow` px so the shading follows the form like engraving. */
function hatchLines(angle, gap, width, { jitter = 0.6, dash, bow = 0, cx: ox = W / 2, cy: oy = H / 2 } = {}) {
	const a = (angle * Math.PI) / 180;
	const dx = Math.cos(a);
	const dy = Math.sin(a);
	const nx = -dy;
	const ny = dx;
	const reach = Math.hypot(W, H);
	const lines = [];
	let seed = angle * 13 + gap * 7;
	const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280 - 0.5) * 2;
	for (let o = -reach; o <= reach; o += gap) {
		const cx = ox + nx * (o + rnd() * jitter);
		const cy = oy + ny * (o + rnd() * jitter);
		const b = bow * (1 + rnd() * 0.15);
		lines.push(
			`M${f(cx - dx * reach)} ${f(cy - dy * reach)}Q${f(cx + nx * b)} ${f(cy + ny * b)} ${f(cx + dx * reach)} ${f(cy + dy * reach)}`
		);
	}
	if (!dash) return `<path d="${lines.join('')}" stroke-width="${width}"/>`;
	return `<g stroke-width="${width}" stroke-dasharray="${dash}">${lines
		.map((d) => `<path d="${d}" stroke-dashoffset="${f((rnd() + 1) * 14)}"/>`)
		.join('')}</g>`;
}

/** Hatching clipped to `shape` (path data), optionally masked. */
function hatch(shape, angle, gap, width, opts = {}) {
	const id = `c${uid++}`;
	defs.push(`<clipPath id="${id}"><path d="${shape}"/></clipPath>`);
	out.push(
		`<g clip-path="url(#${id})"${opts.mask ? ` mask="url(#${opts.mask})"` : ''}>${hatchLines(angle, gap, width, opts)}</g>`
	);
}

const stroke = (d, width = 2, extra = '') =>
	out.push(`<path d="${d}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`);

// ---------------------------------------------------------------- books
// Three stacked books, each slightly askew: spine, cover bands, page lines.
function book(x, y, w, h, rot, kind) {
	const cx = x + w / 2;
	const cy = y + h / 2;
	const r = 3;
	const outline = `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
	const before = out.length;
	if (kind === 'pages') {
		// Page block between two covers: fine page lines, hatched covers.
		const cover = 4;
		hatch(`M${x} ${y}H${x + w}V${y + cover}H${x}Z`, 0, 2.2, 0.9);
		hatch(`M${x} ${y + h - cover}H${x + w}V${y + h}H${x}Z`, 0, 2.2, 0.9);
		const lines = [];
		for (let py = y + cover + 2.4; py < y + h - cover - 1; py += 2.6) {
			lines.push(`M${x + 6} ${f(py)}H${x + w - 3}`);
		}
		stroke(lines.join(''), 0.7);
		stroke(`M${x} ${y + cover}H${x + w}M${x} ${y + h - cover}H${x + w}`, 1.2);
		// The spine's rounded back on the left.
		stroke(`M${x + 6} ${y + cover}Q${x - 2} ${cy} ${x + 6} ${y + h - cover}`, 1.2);
	} else {
		// Spine facing out: hatched cloth with raised bands and a title panel.
		hatch(outline, 75, 3.2, 0.8);
		const bands = [0.12, 0.2, 0.8, 0.88].map((t) => x + w * t);
		stroke(bands.map((bx) => `M${f(bx)} ${y + 2}V${y + h - 2}`).join(''), 1.4);
		const px = x + w * 0.34;
		const pw = w * 0.32;
		const ph = h * 0.5;
		const py = cy - ph / 2;
		stroke(`M${f(px)} ${f(py)}h${f(pw)}v${f(ph)}h${f(-pw)}Z`, 1.1);
		// The panel itself is left clear of hatching, with title strokes.
		const tid = `m${uid++}`;
		defs.push(
			`<mask id="${tid}"><rect width="${W}" height="${H}" fill="white"/><rect x="${f(px)}" y="${f(py)}" width="${f(pw)}" height="${f(ph)}" fill="black"/></mask>`
		);
		out[before] = out[before].replace('<g ', `<g mask="url(#${tid})" `);
		stroke(
			`M${f(px + pw * 0.15)} ${f(cy - ph * 0.12)}h${f(pw * 0.7)}M${f(px + pw * 0.25)} ${f(cy + ph * 0.16)}h${f(pw * 0.5)}`,
			1
		);
	}
	stroke(outline, 1.6);
	const group = out.splice(before);
	out.push(`<g transform="rotate(${rot} ${f(cx)} ${f(cy)})">${group.join('')}</g>`);
}

book(52, 438, 250, 42, -1.5, 'spine');
book(74, 405, 214, 34, 2.2, 'pages');
book(98, 376, 186, 30, -2.4, 'spine');

// ---------------------------------------------------------------- crow
out.push('<g transform="translate(0 14)">');
// Facing right on the top book, leaning forward the way a perched crow does:
// heavy beak running straight from a flat forehead, thick neck, shaggy throat,
// a long folded wing reaching back along the tail.
const body =
	'M234 90C224 80 210 72 190 72C168 72 152 92 144 120C124 136 100 160 84 196C70 226 60 256 54 280L14 352L26 362L44 360L104 318C120 330 140 338 158 340C176 348 196 350 212 340C240 318 256 280 258 236C260 200 254 170 246 150C243 144 246 138 248 134C240 124 238 108 234 90Z';
const head =
	'M234 90C224 80 210 72 190 72C168 72 152 92 144 120C166 136 206 144 248 134C240 124 238 108 234 90Z';
const wing =
	'M152 128C196 132 226 172 224 222C222 262 196 296 150 318C120 332 80 340 34 344C56 320 84 290 104 250C120 210 132 160 152 128Z';
const tail = 'M54 280L14 352L26 362L44 360L104 318C84 310 66 298 54 280Z';
const beak =
	'M232 90C262 88 298 104 322 128C316 132 306 134 296 134C282 136 264 138 248 136C242 122 240 106 232 90Z';
const eye = { x: 206, y: 100 };

// Where light catches the feathers (the original's pale streaks), the hatching
// is thinned out; the eye is kept clear.
defs.push(`<mask id="sheen"><rect width="${W}" height="${H}" fill="white"/>
<ellipse cx="150" cy="226" rx="4" ry="60" transform="rotate(50 150 226)" fill="#8c8c8c"/>
<ellipse cx="136" cy="252" rx="3" ry="52" transform="rotate(54 136 252)" fill="#999"/>
<ellipse cx="164" cy="204" rx="3" ry="38" transform="rotate(46 164 204)" fill="#9a9a9a"/>
<ellipse cx="240" cy="240" rx="4" ry="44" transform="rotate(12 240 240)" fill="#8c8c8c"/>
<ellipse cx="194" cy="84" rx="22" ry="6" transform="rotate(-14 194 84)" fill="#777"/>
<circle cx="${eye.x}" cy="${eye.y}" r="9.5" fill="black"/></mask>`);
defs.push(`<mask id="ridge"><rect width="${W}" height="${H}" fill="white"/>
<path d="M238 94C266 94 294 106 314 124" stroke="#555" stroke-width="5" fill="none"/></mask>`);

// A crow is black: a dense form-following tone everywhere, crosshatched in the
// shadows (along the back, under the wing, the lower belly).
hatch(body, 64, 3.3, 1.28, { mask: 'sheen', bow: 12, dash: '16 2.5 7 2 11 3' });
hatch(head, 14, 3.4, 1.16, { mask: 'sheen', bow: 6, dash: '9 2 5 2' });
hatch(
	'M144 120C124 136 100 160 84 196C70 226 60 256 54 280L104 318C92 296 96 250 112 210C124 176 138 150 152 128Z', -24, 3.8, 1.16,
	{ mask: 'sheen', bow: -8, dash: '12 3 6 2' }
);
hatch(
	'M104 318C130 334 180 352 212 340C232 326 248 300 256 270C232 314 190 336 104 318Z',
	18,
	3,
	0.95
);
hatch(wing, 30, 4.6, 1.1, { mask: 'sheen', bow: 10, dash: '18 3 9 2' });
hatch(tail, -6, 3, 1.22, { bow: 3 });
hatch(beak, -8, 2.5, 1.16, { mask: 'ridge', bow: 3 });

// Feathers. Long primaries fanning back to the wing tip, rows of covert
// scallops, breast scallops, tail feathers.
const primaries = [];
for (let i = 0; i < 7; i++) {
	const sx = 214 - i * 8;
	const sy = 238 + i * 6;
	primaries.push(
		`M${sx} ${sy}C${sx - 22} ${sy + 38} ${124 - i * 8} ${318 - i * 2} ${40 + i * 7} ${342 - i * 3}`
	);
}
stroke(primaries.join(''), 1.45);
const coverts = [];
for (let row = 0; row < 5; row++) {
	const n = 6 - Math.floor(row / 2);
	for (let i = 0; i < n; i++) {
		const x = 142 + row * 4 + i * 12;
		const y = 140 + row * 15 + i * 3 + (i % 2) * 1.5;
		coverts.push(`M${f(x)} ${f(y)}q6 ${10 + (i % 3)} 12.5 0.5`);
	}
}
stroke(coverts.join(''), 1.4);
const breast = [];
for (let r = 0; r < 9; r++) {
	for (let c = 0; c < 4; c++) {
		const x = 220 + c * 10 - r * 2 + (r % 2) * 5;
		const y = 156 + r * 19 + (c % 2) * 6;
		if (x + 9 > 254 - Math.max(0, r - 5) * 7) continue;
		breast.push(`M${f(x)} ${y}q4.5 7 9 0`);
	}
}
stroke(breast.join(''), 1.2);
// Feathered thighs over the legs.
stroke('M162 346c-2-6 2-10 7-12M190 350c-1-6 3-10 8-11M174 348c0-5 4-8 9-9', 1.3);
stroke('M62 290L18 354M74 298L26 360M86 306L36 362M96 312L44 360', 1.3);

// Shaggy throat and the bristles over the base of the beak.
const throat = [];
for (let i = 0; i < 10; i++) {
	const x = 247 - i * 1;
	const y = 136 + i * 5;
	throat.push(`M${f(x)} ${y}l${7 - (i % 3) * 2} ${8 + (i % 2) * 3}`);
}
stroke(throat.join(''), 1.3);
stroke('M234 94l18-1M235 99l17 0M237 104l14 1M236 89l14-4', 1.1);
stroke('M228 86l-10 3M220 81l-10 4M210 79l-10 5M192 80l-8 7M182 86l-6 8M168 98l-6 8', 1.1);
stroke('M184 116C198 126 220 130 242 128', 1.3);

// Contours.
stroke(body, 3.1);
stroke(wing, 2.2);
stroke(beak, 2.5);
stroke('M250 122C272 124 296 126 318 128', 1.6);
stroke('M258 110c4-1.5 8-1.5 11 0', 1.4);

// Eye: a pale ring around a dark pupil with a highlight.
out.push(
	`<circle cx="${eye.x}" cy="${eye.y}" r="6.5" stroke-width="2"/>`,
	`<circle cx="${eye.x + 0.6}" cy="${eye.y + 0.2}" r="3.9" fill="url(#ink)" stroke="none"/>`,
	`<circle cx="${eye.x - 0.9}" cy="${eye.y - 1.4}" r="1.2" fill="#fffaf3" stroke="none"/>`
);

out.push('</g>');
// Legs: scaly, toes curled over the top book's edge.
stroke('M194 360C195 366 197 372 198 378M170 358C171 366 171 372 172 380', 2.8);
const scales = [];
for (let y = 364; y < 378; y += 4) scales.push(`M${f(194 + (y - 360) * 0.2 - 3)} ${y}h6`);
for (let y = 362; y < 380; y += 4) scales.push(`M${f(170 + (y - 358) * 0.1 - 3)} ${y}h6`);
stroke(scales.join(''), 1);
stroke(
	'M198 378c7-1 13 1 15 6M198 378c3 1 7 4 7 9M198 378c-6 0-10 2-12 6M172 380c7-1 12 1 14 6M172 380c2 2 5 5 5 9M172 380c-6 0-10 2-11 6',
	2.2
);

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="ink" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse">
<stop offset="0.25" stop-color="#D7827E"/>
<stop offset="1" stop-color="#907AA9"/>
</linearGradient>
${defs.join('\n')}
</defs>
<g stroke="url(#ink)" fill="none">
${out.join('\n')}
</g>
</svg>
`;
writeFileSync(process.argv[2], svg);
console.log(`wrote ${process.argv[2]} (${svg.length} bytes)`);
