import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiVolume2, FiVolumeX } from "react-icons/fi";
import HTMLFlipBook from "react-pageflip";
import { ROUTE_TRANSITION_EVENT } from "../../constants/routeTransition";
import { crewRecords, diaryEntries } from "../../data/spindelJournal";
import styles from "./SpindelBookSection.module.scss";

const ASSET_ROOT = "../../../img/books/spindel/voss_journal/book_assets/";
const assets = {
	cover: new URL(`${ASSET_ROOT}cover_front.png`, import.meta.url).href,
	open: new URL(`${ASSET_ROOT}open_book.png`, import.meta.url).href,
	pages: {
		left: new URL(`${ASSET_ROOT}pages_left.png`, import.meta.url).href,
		right: new URL(`${ASSET_ROOT}pages_right.png`, import.meta.url).href,
	},
	castle: {
		left: new URL(`${ASSET_ROOT}castle_page_left.png`, import.meta.url).href,
		right: new URL(`${ASSET_ROOT}castle_page_right.png`, import.meta.url).href,
	},
};

const PAGE_WEIGHT_LIMIT = 900;

function paragraphWeight(paragraph) {
	const lineBreaks = paragraph.match(/\n/g)?.length ?? 0;
	return paragraph.length + lineBreaks * 36 + 34;
}

function paginateParagraphs(paragraphs) {
	const pages = [];
	let page = [];
	let weight = 0;

	for (const paragraph of paragraphs) {
		const nextWeight = paragraphWeight(paragraph);
		if (page.length && weight + nextWeight > PAGE_WEIGHT_LIMIT) {
			pages.push(page);
			page = [];
			weight = 0;
		}
		page.push(paragraph);
		weight += nextWeight;
	}

	if (page.length) pages.push(page);
	return pages;
}

function groupReports(records) {
	const groups = [];
	let group = [];

	for (const paragraph of records) {
		if (paragraph.startsWith("Report ") && group.some(item => item.startsWith("Report "))) {
			groups.push(group);
			group = [];
		}
		group.push(paragraph);
	}

	if (group.length) groups.push(group);
	return groups;
}

function balanceSpread(paragraphs) {
	if (paragraphs.length < 2) return { left: paragraphs, right: [] };

	const totalWeight = paragraphs.reduce((total, paragraph) => total + paragraphWeight(paragraph), 0);
	let leftWeight = 0;
	let splitIndex = 1;
	let smallestDifference = Number.POSITIVE_INFINITY;

	for (let index = 1; index < paragraphs.length; index += 1) {
		leftWeight += paragraphWeight(paragraphs[index - 1]);
		const difference = Math.abs(totalWeight - leftWeight * 2);
		if (difference < smallestDifference) {
			smallestDifference = difference;
			splitIndex = index;
		}
	}

	return { left: paragraphs.slice(0, splitIndex), right: paragraphs.slice(splitIndex) };
}

function pairPages(pages, keyPrefix) {
	const paired = [];
	for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 2) {
		paired.push({
			pageKey: `${keyPrefix}-${pageIndex / 2 + 1}`,
			section: keyPrefix,
			left: pages[pageIndex] ?? [],
			right: pages[pageIndex + 1] ?? [],
		});
	}
	return paired;
}

const reportStartIndex = crewRecords.findIndex(paragraph => paragraph.startsWith("Report "));
const reportSpreads = groupReports(crewRecords.slice(reportStartIndex)).map(paragraphs => {
	const reportNumber = paragraphs.find(paragraph => paragraph.startsWith("Report "))?.match(/Report (\d+)/)?.[1];
	return {
		...balanceSpread(paragraphs),
		pageKey: `report-${reportNumber}`,
		section: "report",
	};
});
const crewAndRoles = crewRecords
	.find(paragraph => paragraph.startsWith("Team:\n"))
	?.split("\n")
	.slice(1) ?? [];
const frontMatterSpread = {
	frontMatter: true,
	pageKey: "front-matter",
	section: "front-matter",
	left: [crewRecords[0]],
	right: ["Crew and Roles", ...crewAndRoles],
};

const diaryPages = paginateParagraphs(diaryEntries.slice(2));
const lastDiaryPage = diaryPages.pop() ?? [];
if (diaryPages.length % 2 !== 0) diaryPages.push([]);

const spreads = [
	frontMatterSpread,
	...reportSpreads,
	...pairPages(diaryPages, "diary"),
	{ art: "castle", pageKey: "diary-final", section: "diary", left: lastDiaryPage, right: [] },
];

const journalPages = spreads.flatMap((_, spreadIndex) => [
	getPage(spreadIndex, "left"),
	getPage(spreadIndex, "right"),
]);

const snow = Array.from({ length: 48 }, (_, i) => ({
	id: i, x: `${(i * 37) % 100}%`, delay: `${-((i * 0.47) % 9)}s`,
	duration: `${5 + (i % 7) * 0.65}s`, size: `${1 + (i % 4) * 0.7}px`, drift: `${-45 + (i % 9) * 11}px`,
}));

function dispatchRouteTransition(to) {
	window.dispatchEvent(new CustomEvent(ROUTE_TRANSITION_EVENT, { detail: { to, navigationDelay: 850, openingDuration: 900, variant: "black" } }));
}

function getPage(spreadIndex, side) {
	const spread = spreads[spreadIndex];
	let paragraphs = spread[side];
	let art = assets[spread.art ?? "pages"][side];
	let illustrated = false;

	if (spread.art === "castle") {
		illustrated = side === "right";
		art = illustrated ? assets.castle.right : assets.pages.left;
		paragraphs = illustrated ? [] : [...spread.left, ...spread.right];
	}

	return {
		art,
		frontMatter: spread.frontMatter ?? false,
		illustrated,
		key: spread.frontMatter
			? side === "left" ? "company-title" : "crew-roster"
			: `${spread.pageKey}-${side}`,
		number: spreadIndex * 2 + (side === "left" ? 1 : 2),
		paragraphs,
		section: spread.section,
		side,
		spread: spreadIndex + 1,
	};
}

function PageContent({ page, preview = false }) {
	const className = [
		styles.leafContent,
		styles[page.side],
		page.frontMatter && page.side === "left" ? styles.titlePage : "",
		page.frontMatter && page.side === "right" ? styles.rosterPage : "",
		page.illustrated ? styles.illustrated : "",
		"book-page",
		`book-page-${page.key}`,
		`book-page-number-${page.number}`,
		`book-page-${page.side}`,
		`book-section-${page.section}`,
	].filter(Boolean).join(" ");

	return <div
		id={preview ? undefined : `book-page-${page.key}`}
		className={className}
		data-page-key={page.key}
		data-page-number={page.number}
		data-section={page.section}
		data-side={page.side}
		data-spread={page.spread}
	>
		{page.paragraphs.map((text, contentIndex) => {
			const isHeading = text.startsWith("Report ") || text.startsWith("Company Records") || text === "Crew and Roles";
			const className = isHeading ? styles.sourceHeading : text === "—" ? styles.divider : contentIndex === 0 ? styles.dropCap : "";
			return <p key={`${page.number}-${contentIndex}`} className={className}>{text}</p>;
		})}
		<span className={styles.pageNumber}>{page.number}</span>
	</div>;
}

function SheetFace({ page, cover = false, back = false }) {
	return <div
		id={cover ? undefined : `book-face-${page.key}`}
		className={`${styles.sheetFace} ${back ? styles.sheetBack : styles.sheetFront} ${cover ? styles.coverFace : ""} ${cover ? "book-cover-face" : `book-page-face book-page-face-${page.key}`}`}
		data-page-key={cover ? undefined : page.key}
		data-page-number={cover ? undefined : page.number}
	>
		<img src={cover ? assets.cover : page.art} alt="" />
		{!cover && <PageContent page={page} />}
	</div>;
}

const FlipPage = forwardRef(function FlipPage({ page }, ref) {
	return <div ref={ref} className={styles.flipPage} data-density="soft" data-page-key={page.key} data-page-side={page.side}>
		<div className={`${styles.flipPageFace} ${page.side === "left" ? styles.flipLeftFace : styles.flipRightFace}`}>
			<img src={page.art} alt="" />
			<PageContent page={page} />
		</div>
	</div>;
});

function SpindelBookSection() {
	const [opened, setOpened] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const [locked, setLocked] = useState(false);
	const [opening, setOpening] = useState(false);
	const [muted, setMuted] = useState(false);
	const timer = useRef(null);
	const audioContext = useRef(null);
	const flipBook = useRef(null);
	const index = Math.min(spreads.length - 1, Math.floor(currentPage / 2));
	const spread = spreads[index];

	const playPageTurn = useCallback(() => {
		if (muted) return;
		const AudioContext = window.AudioContext || window.webkitAudioContext;
		if (!AudioContext) return;

		const context = audioContext.current ?? new AudioContext();
		audioContext.current = context;
		const duration = 0.24;
		const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
		const samples = buffer.getChannelData(0);
		for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
			const progress = sampleIndex / samples.length;
			const envelope = Math.sin(progress * Math.PI) * (1 - progress * 0.58);
			samples[sampleIndex] = (Math.random() * 2 - 1) * envelope;
		}

		const source = context.createBufferSource();
		const filter = context.createBiquadFilter();
		const gain = context.createGain();
		filter.type = "bandpass";
		filter.frequency.setValueAtTime(1250, context.currentTime);
		filter.frequency.exponentialRampToValueAtTime(520, context.currentTime + duration);
		filter.Q.value = 0.72;
		gain.gain.setValueAtTime(0.0001, context.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.075, context.currentTime + 0.025);
		gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
		source.buffer = buffer;
		source.connect(filter).connect(gain).connect(context.destination);
		source.start();
	}, [muted]);

	const openBook = useCallback(() => {
		if (opened || locked) return;
		playPageTurn();
		setOpened(true);
		setOpening(true);
		setLocked(true);
		window.clearTimeout(timer.current);
		timer.current = window.setTimeout(() => {
			setLocked(false);
			setOpening(false);
		}, 940);
	}, [locked, opened, playPageTurn]);

	const changePage = useCallback((direction) => {
		if (!opened || locked) return;
		const pageFlip = flipBook.current?.pageFlip();
		if (!pageFlip) return;
		if (direction > 0) pageFlip.flipNext("bottom");
		else pageFlip.flipPrev("bottom");
	}, [locked, opened]);

	const handleFlipState = useCallback((event) => {
		const nextState = event.data;
		if (nextState === "flipping") {
			setLocked(true);
			playPageTurn();
		} else if (nextState === "read") {
			setLocked(false);
		}
	}, [playPageTurn]);

	useEffect(() => {
		const keydown = (event) => {
			if (event.key === "Escape") dispatchRouteTransition("/spindel/room");
			if (!opened && (event.key === "Enter" || event.key === " ")) openBook();
			if (event.key === "ArrowRight") changePage(1);
			if (event.key === "ArrowLeft") changePage(-1);
		};
		window.addEventListener("keydown", keydown);
		return () => window.removeEventListener("keydown", keydown);
	}, [changePage, openBook, opened]);

	useEffect(() => () => {
		window.clearTimeout(timer.current);
		audioContext.current?.close();
	}, []);

	const progress = useMemo(() => ((index + 1) / spreads.length) * 100, [index]);

	return <section className={styles.bookSection} aria-label="Edran Voss's journal">
		<div className={styles.aurora} aria-hidden="true" />
		<div className={styles.snow} aria-hidden="true">{snow.map(f => <i key={f.id} style={{ "--x": f.x, "--delay": f.delay, "--duration": f.duration, "--size": f.size, "--drift": f.drift }} />)}</div>
		<div className={styles.candleGlow} aria-hidden="true" />
		<button className={styles.backButton} type="button" aria-label="Back to room" onClick={() => dispatchRouteTransition("/spindel/room")}><FiArrowLeft /></button>
		<button className={styles.soundButton} type="button" aria-label={muted ? "Enable page sounds" : "Mute page sounds"} onClick={() => setMuted(v => !v)}>{muted ? <FiVolumeX /> : <FiVolume2 />}</button>

		<div className={`${styles.bookStage} ${opened ? styles.isOpen : ""} ${opening ? styles.isOpening : ""}`}>
			<div className={styles.bookFrameLayer} aria-hidden="true">
				<img className={styles.bookFrame} src={assets.open} alt="" />
			</div>
			<div className={styles.bookShadow} aria-hidden="true" />
			<div className={styles.flipBookLayer}>
				<HTMLFlipBook
					ref={flipBook}
					className={styles.curlBook}
					style={{}}
					startPage={0}
					size="stretch"
					width={520}
					height={570}
					minWidth={250}
					maxWidth={580}
					minHeight={274}
					maxHeight={636}
					drawShadow
					flippingTime={920}
					usePortrait={false}
					startZIndex={3}
					autoSize
					maxShadowOpacity={0.62}
					showCover={false}
					mobileScrollSupport={false}
					clickEventForward
					useMouseEvents
					swipeDistance={24}
					showPageCorners={false}
					disableFlipByClick
					renderOnlyPageLengthChange
					onFlip={event => setCurrentPage(event.data)}
					onChangeState={handleFlipState}
				>
					{journalPages.map(page => <FlipPage
						key={page.key}
						page={page}
					/>)}
				</HTMLFlipBook>
			</div>
			<div className={`${styles.sheetBook} ${styles.coverBook}`} aria-hidden={opened}>
				<div className={`${styles.sheet} ${opened ? styles.sheetFlipped : ""} ${styles.coverSheet}`}>
					<SheetFace cover />
				</div>
				{!opened && <button className={styles.coverTrigger} type="button" onClick={openBook} aria-label="Open Edran Voss's journal"><span className={styles.openHint}>Open the journal</span></button>}
			</div>
			{opened && <div className={styles.openEffects}>
				{spread.art === "castle" && <div className={styles.castleLights} aria-hidden="true"><i/><i/><i/><i/></div>}
			</div>}
			<button className={`${styles.pageNav} ${styles.prev}`} disabled={currentPage <= 0 || locked} onClick={() => changePage(-1)} aria-label="Previous pages"><FiChevronLeft /></button>
			<button className={`${styles.pageNav} ${styles.next}`} disabled={currentPage >= journalPages.length - 2 || locked} onClick={() => changePage(1)} aria-label="Next pages"><FiChevronRight /></button>
		</div>

		{opened && <div className={styles.footer}>
			<span>{String(index + 1).padStart(2, "0")} / {String(spreads.length).padStart(2, "0")}</span>
			<div className={styles.progress}><i style={{ width: `${progress}%` }} /></div>
			<span className={styles.keyHint}>drag pages or use ← →</span>
		</div>}
	</section>;
}

export default SpindelBookSection;
