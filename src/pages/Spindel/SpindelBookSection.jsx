import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiGlobe, FiMusic, FiSliders, FiVolume2, FiVolumeX } from "react-icons/fi";
import HTMLFlipBook from "react-pageflip";
import { ROUTE_TRANSITION_EVENT } from "../../constants/routeTransition";
import { spindelOst } from "../../data/spindel";
import { journalContent } from "../../data/spindelJournal";
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

const PAGE_WEIGHT_LIMIT = 780;

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
		if (isReportHeading(paragraph) && group.some(isReportHeading)) {
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

function isReportHeading(paragraph) {
	return /^(Report|Отчет) \d+/.test(paragraph);
}

function buildJournalData(content) {
	const { crewRecords, diaryEntries } = content;
	const reportStartIndex = crewRecords.findIndex(isReportHeading);
	const reportSpreads = groupReports(crewRecords.slice(reportStartIndex)).map(paragraphs => {
		const reportNumber = paragraphs.find(isReportHeading)?.match(/(?:Report|Отчет) (\d+)/)?.[1];
		return {
			...balanceSpread(paragraphs),
			pageKey: `report-${reportNumber}`,
			section: "report",
		};
	});
	const crewAndRoles = crewRecords
		.find(paragraph => paragraph.startsWith("Team:\n") || paragraph.startsWith("Команда:\n"))
		?.split("\n")
		.slice(1) ?? [];
	const frontMatterSpread = {
		frontMatter: true,
		pageKey: "front-matter",
		section: "front-matter",
		left: [crewRecords[0]],
		right: [content.crewTitle, ...crewAndRoles],
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

	return {
		spreads,
		journalPages: spreads.flatMap((_, spreadIndex) => [
			getPage(spreads, spreadIndex, "left"),
			getPage(spreads, spreadIndex, "right"),
		]),
	};
}

const snow = Array.from({ length: 48 }, (_, i) => ({
	id: i, x: `${(i * 37) % 100}%`, delay: `${-((i * 0.47) % 9)}s`,
	duration: `${5 + (i % 7) * 0.65}s`, size: `${1 + (i % 4) * 0.7}px`, drift: `${-45 + (i % 9) * 11}px`,
}));
const BOOK_FLIP_TIME = 920;
const BUTTON_FLIP_TIME = 680;
const BOOK_SETTINGS_STORAGE_KEY = "spindel-book-options";
const BOOK_MUSIC_VOLUME = 0.045;
const LANGUAGES = {
	en: {
		aria: "Edran Voss's journal",
		back: "Back to room",
		options: "Book options",
		optionsTitle: "Book Options",
		pageTurnSfx: "Turning SFX",
		music: "Music",
		language: "Language",
		openHint: "Open the journal",
		prev: "Previous pages",
		next: "Next pages",
		keyHint: "drag pages or use left/right arrows",
		on: "On",
		off: "Off",
	},
	ru: {
		aria: "Журнал Эдрана Восса",
		back: "Вернуться в комнату",
		options: "Настройки книги",
		optionsTitle: "Настройки книги",
		pageTurnSfx: "Звук страниц",
		music: "Музыка",
		language: "Язык",
		openHint: "Открыть журнал",
		prev: "Предыдущие страницы",
		next: "Следующие страницы",
		keyHint: "тащите страницы или используйте стрелки",
		on: "Вкл",
		off: "Выкл",
	},
};
const DEFAULT_BOOK_SETTINGS = {
	language: "en",
	musicEnabled: true,
	pageTurnSfxEnabled: true,
};

function dispatchRouteTransition(to) {
	window.dispatchEvent(new CustomEvent(ROUTE_TRANSITION_EVENT, { detail: { to, navigationDelay: 850, openingDuration: 900, variant: "black" } }));
}

function getInitialBookSettings() {
	if (typeof window === "undefined") return DEFAULT_BOOK_SETTINGS;

	try {
		const storedSettings = JSON.parse(window.localStorage.getItem(BOOK_SETTINGS_STORAGE_KEY));
		return {
			...DEFAULT_BOOK_SETTINGS,
			...storedSettings,
			language: LANGUAGES[storedSettings?.language] ? storedSettings.language : DEFAULT_BOOK_SETTINGS.language,
		};
	} catch {
		return DEFAULT_BOOK_SETTINGS;
	}
}

function getPage(spreads, spreadIndex, side) {
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
			const isHeading = isReportHeading(text) || text.startsWith("Company Records") || text.startsWith("Документы") || text === "Crew and Roles" || text === "Состав отряда";
			const isDivider = text === "—" || text === "вЂ”";
			const className = isHeading ? styles.sourceHeading : isDivider ? styles.divider : contentIndex === 0 ? styles.dropCap : "";
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
	const [isOptionsOpen, setIsOptionsOpen] = useState(false);
	const [bookSettings, setBookSettings] = useState(getInitialBookSettings);
	const [flipBookRevision, setFlipBookRevision] = useState(0);
	const [flipBookMounted, setFlipBookMounted] = useState(true);
	const timer = useRef(null);
	const speedTimer = useRef(null);
	const remountTimer = useRef(null);
	const audioContext = useRef(null);
	const musicAudio = useRef(null);
	const flipBook = useRef(null);
	const pageDrag = useRef(null);
	const activeContent = journalContent[bookSettings.language] ?? journalContent.en;
	const { journalPages, spreads } = useMemo(() => buildJournalData(activeContent), [activeContent]);
	const index = Math.min(spreads.length - 1, Math.floor(currentPage / 2));
	const spread = spreads[index];
	const labels = LANGUAGES[bookSettings.language] ?? LANGUAGES.en;

	const playPageTurn = useCallback(() => {
		if (!bookSettings.pageTurnSfxEnabled) return;
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
	}, [bookSettings.pageTurnSfxEnabled]);

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
		const settings = pageFlip.getSettings?.();
		const normalFlipTime = settings?.flippingTime ?? BOOK_FLIP_TIME;

		window.clearTimeout(speedTimer.current);
		if (settings) settings.flippingTime = BUTTON_FLIP_TIME;
		if (direction > 0) pageFlip.flipNext("bottom");
		else pageFlip.flipPrev("bottom");
		speedTimer.current = window.setTimeout(() => {
			if (settings) settings.flippingTime = normalFlipTime;
		}, 0);
	}, [locked, opened]);

	const getFlipPointer = useCallback((clientX, clientY) => {
		const pageFlip = flipBook.current?.pageFlip();
		const distElement = pageFlip?.getUI?.()?.getDistElement?.();
		const renderRect = pageFlip?.getRender?.()?.getRect?.();
		if (!pageFlip || !distElement || !renderRect) return null;

		const distRect = distElement.getBoundingClientRect();
		return {
			pageFlip,
			renderRect,
			point: {
				x: clientX - distRect.left,
				y: clientY - distRect.top,
			},
		};
	}, []);

	const getPageEdgePoint = useCallback((renderRect, point, side, inset = 2) => ({
		x: side === "right"
			? renderRect.left + renderRect.width - inset
			: renderRect.left + inset,
		y: Math.min(
			renderRect.top + renderRect.height - 2,
			Math.max(renderRect.top + 2, point.y),
		),
	}), []);

	const handlePagePointerDown = useCallback((event) => {
		if (!opened || locked || event.button !== 0) return;

		const flipPointer = getFlipPointer(event.clientX, event.clientY);
		if (!flipPointer) return;

		const { pageFlip, point, renderRect } = flipPointer;
		const withinBook =
			point.x >= renderRect.left &&
			point.x <= renderRect.left + renderRect.width &&
			point.y >= renderRect.top &&
			point.y <= renderRect.top + renderRect.height;
		if (!withinBook) return;

		const side = point.x < renderRect.left + renderRect.width / 2 ? "left" : "right";
		if (side === "left" && currentPage <= 0) return;
		if (side === "right" && currentPage >= journalPages.length - 2) return;

		const edgePoint = getPageEdgePoint(renderRect, point, side);
		const primedPoint = getPageEdgePoint(renderRect, point, side, 14);
		pageFlip.startUserTouch(edgePoint);
		pageDrag.current = {
			edgePoint,
			hasMoved: false,
			pointerId: event.pointerId,
			primed: false,
			primedPoint,
		};

		event.currentTarget.setPointerCapture?.(event.pointerId);
		event.preventDefault();
	}, [currentPage, getFlipPointer, getPageEdgePoint, locked, opened]);

	const handlePagePointerMove = useCallback((event) => {
		const drag = pageDrag.current;
		if (!drag || drag.pointerId !== event.pointerId) return;

		const flipPointer = getFlipPointer(event.clientX, event.clientY);
		if (!flipPointer) return;

		if (!drag.primed) {
			flipPointer.pageFlip.userMove(drag.primedPoint, false);
			drag.primed = true;
		}

		drag.hasMoved = true;
		flipPointer.pageFlip.userMove(flipPointer.point, false);
		event.preventDefault();
	}, [getFlipPointer]);

	const stopPagePointerDrag = useCallback((event) => {
		const drag = pageDrag.current;
		if (!drag || drag.pointerId !== event.pointerId) return;

		const flipPointer = getFlipPointer(event.clientX, event.clientY);
		if (flipPointer) {
			flipPointer.pageFlip.userStop(drag.hasMoved ? flipPointer.point : drag.edgePoint);
		}

		event.currentTarget.releasePointerCapture?.(event.pointerId);
		pageDrag.current = null;
		event.preventDefault();
	}, [getFlipPointer]);

	const handleFlipState = useCallback((event) => {
		const nextState = event.data;
		if (nextState === "flipping") {
			setLocked(true);
			playPageTurn();
		} else if (nextState === "read") {
			setLocked(false);
		}
	}, [playPageTurn]);

	const updateBookSetting = useCallback((key, value) => {
		setBookSettings((current) => ({
			...current,
			[key]: value,
		}));
	}, []);

	const changeLanguage = useCallback((language) => {
		if (language === bookSettings.language) return;
		setIsOptionsOpen(false);
		setOpening(false);
		setLocked(true);
		setCurrentPage(0);
		pageDrag.current = null;
		setFlipBookMounted(false);
		setBookSettings((current) => ({
			...current,
			language,
		}));
		window.clearTimeout(remountTimer.current);
		remountTimer.current = window.setTimeout(() => {
			setFlipBookRevision((current) => current + 1);
			setFlipBookMounted(true);
			setLocked(false);
		}, 60);
	}, [bookSettings.language]);

	const closeOptionsPanelOnBlur = (event) => {
		if (!event.currentTarget.contains(event.relatedTarget)) {
			setIsOptionsOpen(false);
		}
	};

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

	useEffect(() => {
		setIsOptionsOpen(false);
		pageDrag.current = null;
		setCurrentPage(0);
	}, [bookSettings.language]);

	useEffect(() => () => {
		window.clearTimeout(timer.current);
		window.clearTimeout(speedTimer.current);
		window.clearTimeout(remountTimer.current);
		audioContext.current?.close();
	}, []);

	useEffect(() => {
		try {
			window.localStorage.setItem(BOOK_SETTINGS_STORAGE_KEY, JSON.stringify(bookSettings));
		} catch {
			// Settings still apply for the current visit if storage is unavailable.
		}
	}, [bookSettings]);

	useEffect(() => {
		const audio = musicAudio.current;
		if (!audio) return;

		audio.volume = BOOK_MUSIC_VOLUME;
		if (bookSettings.musicEnabled) {
			audio.play().catch(() => {});
			return;
		}

		audio.pause();
	}, [bookSettings.musicEnabled]);

	const progress = useMemo(() => ((index + 1) / spreads.length) * 100, [index]);

	return <section className={styles.bookSection} aria-label={labels.aria} lang={bookSettings.language}>
		<audio
			ref={musicAudio}
			className={styles.ambientAudio}
			src={spindelOst}
			loop
			preload="auto"
			aria-hidden="true"
		/>
		<div className={styles.aurora} aria-hidden="true" />
		<div className={styles.snow} aria-hidden="true">{snow.map(f => <i key={f.id} style={{ "--x": f.x, "--delay": f.delay, "--duration": f.duration, "--size": f.size, "--drift": f.drift }} />)}</div>
		<div className={styles.candleGlow} aria-hidden="true" />
		<button className={styles.backButton} type="button" aria-label={labels.back} onClick={() => dispatchRouteTransition("/spindel/room")}><FiArrowLeft /></button>
		<div
			className={`${styles.optionsPanel} ${isOptionsOpen ? styles.optionsPanelOpen : ""}`}
			onMouseEnter={() => setIsOptionsOpen(true)}
			onMouseLeave={() => setIsOptionsOpen(false)}
			onFocus={() => setIsOptionsOpen(true)}
			onBlur={closeOptionsPanelOnBlur}
		>
			<button
				className={styles.optionsToggle}
				type="button"
				aria-label={labels.options}
				aria-expanded={isOptionsOpen}
				onClick={() => setIsOptionsOpen((current) => !current)}
			>
				<FiSliders aria-hidden="true" />
			</button>
			<div className={styles.optionsMenu} aria-label={labels.options}>
				<span className={styles.optionsTitle}>{labels.optionsTitle}</span>
				<button
					className={`${styles.optionRow} ${bookSettings.pageTurnSfxEnabled ? styles.optionRowActive : ""}`}
					type="button"
					aria-pressed={bookSettings.pageTurnSfxEnabled}
					onClick={() => updateBookSetting("pageTurnSfxEnabled", !bookSettings.pageTurnSfxEnabled)}
				>
					{bookSettings.pageTurnSfxEnabled ? <FiVolume2 aria-hidden="true" /> : <FiVolumeX aria-hidden="true" />}
					<span>{labels.pageTurnSfx}</span>
					<b>{bookSettings.pageTurnSfxEnabled ? labels.on : labels.off}</b>
				</button>
				<button
					className={`${styles.optionRow} ${bookSettings.musicEnabled ? styles.optionRowActive : ""}`}
					type="button"
					aria-pressed={bookSettings.musicEnabled}
					onClick={() => updateBookSetting("musicEnabled", !bookSettings.musicEnabled)}
				>
					<FiMusic aria-hidden="true" />
					<span>{labels.music}</span>
					<b>{bookSettings.musicEnabled ? labels.on : labels.off}</b>
				</button>
				<div className={styles.languageGroup} aria-label={labels.language}>
					<span><FiGlobe aria-hidden="true" />{labels.language}</span>
					<div className={styles.languageOptions}>
						{[
							{ id: "en", label: "English" },
							{ id: "ru", label: "Русский" },
						].map((language) => (
							<button
								key={language.id}
								className={bookSettings.language === language.id ? styles.languageOptionActive : ""}
								type="button"
								aria-pressed={bookSettings.language === language.id}
								onClick={() => changeLanguage(language.id)}
							>
								{language.label}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>

		<div className={`${styles.bookStage} ${opened ? styles.isOpen : ""} ${opening ? styles.isOpening : ""}`}>
			<div className={styles.bookFrameLayer} aria-hidden="true">
				<img className={styles.bookFrame} src={assets.open} alt="" />
			</div>
			<div className={styles.bookShadow} aria-hidden="true" />
			<div className={styles.flipBookLayer}>
				{opened && flipBookMounted && <>
					<HTMLFlipBook
						key={`${bookSettings.language}-${flipBookRevision}`}
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
						flippingTime={BOOK_FLIP_TIME}
						usePortrait={false}
						startZIndex={3}
						autoSize
						maxShadowOpacity={0.62}
						showCover={false}
						mobileScrollSupport={false}
						clickEventForward
						useMouseEvents={false}
						swipeDistance={24}
						showPageCorners={false}
						disableFlipByClick={false}
						renderOnlyPageLengthChange={false}
						onFlip={event => setCurrentPage(event.data)}
						onChangeState={handleFlipState}
					>
						{journalPages.map(page => <FlipPage
							key={page.key}
							page={page}
						/>)}
					</HTMLFlipBook>
					<div
						className={styles.dragSurface}
						aria-hidden="true"
						onPointerDown={handlePagePointerDown}
						onPointerMove={handlePagePointerMove}
						onPointerUp={stopPagePointerDrag}
						onPointerCancel={stopPagePointerDrag}
					/>
				</>}
			</div>
			<div className={`${styles.sheetBook} ${styles.coverBook}`} aria-hidden={opened}>
				<div className={`${styles.sheet} ${opened ? styles.sheetFlipped : ""} ${styles.coverSheet}`}>
					<SheetFace cover />
				</div>
				{!opened && <button className={styles.coverTrigger} type="button" onClick={openBook} aria-label={labels.openHint}><span className={styles.openHint}>{labels.openHint}</span></button>}
			</div>
			{opened && <div className={styles.openEffects}>
				{spread.art === "castle" && <div className={styles.castleLights} aria-hidden="true"><i/><i/><i/><i/></div>}
			</div>}
			<button className={`${styles.pageNav} ${styles.prev}`} disabled={currentPage <= 0 || locked} onClick={() => changePage(-1)} aria-label={labels.prev}><FiChevronLeft /></button>
			<button className={`${styles.pageNav} ${styles.next}`} disabled={currentPage >= journalPages.length - 2 || locked} onClick={() => changePage(1)} aria-label={labels.next}><FiChevronRight /></button>
		</div>

		{opened && <div className={styles.footer}>
			<span>{String(index + 1).padStart(2, "0")} / {String(spreads.length).padStart(2, "0")}</span>
			<div className={styles.progress}><i style={{ width: `${progress}%` }} /></div>
			<span className={styles.keyHint}>{labels.keyHint}</span>
		</div>}
	</section>;
}

export default SpindelBookSection;
