import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiSliders } from "react-icons/fi";
import DialogueBox from "../../components/DialogueBox/DialogueBox";
import SpindelWeatherVolume from "../../components/SpindelWeatherVolume/SpindelWeatherVolume";
import { ROUTE_TRANSITION_EVENT } from "../../constants/routeTransition";
import { spindelRoomHitboxes } from "../../data/generatedHitboxes";
import { spindelFogParticles, spindelRoomAssets } from "../../data/spindel";
import styles from "./SpindelRoom.module.scss";

const WINDOW_SNOW_PARTICLES = Array.from({ length: 68 }, (_, index) => {
	const isLeftWindow = index % 3 !== 0;
	const windowOffset = isLeftWindow ? 0 : 1;
	const x = isLeftWindow
		? 5.65 + (index % 7) * 0.82
		: 31.55 + (index % 5) * 0.75;
	const y = isLeftWindow
		? 25.4 + ((index + windowOffset) % 5) * 1.05
		: 31.9 + ((index + windowOffset) % 4) * 1.25;

	return {
		id: `window-snow-${index}`,
		x: `${x}%`,
		y: `${y}%`,
		delay: `${index * -0.31}s`,
		duration: `${5.8 + (index % 7) * 0.5}s`,
		size: `${1.35 + (index % 4) * 0.48}px`,
		travelX: `${10 + (index % 5) * 1.6}vh`,
		travelY: `${38 + (index % 6) * 4.5}vh`,
		stretch: `${2 + (index % 5) * 0.28}`,
		softness: `${0.2 + (index % 4) * 0.1}px`,
		opacity: `${0.34 + (index % 5) * 0.035}`,
	};
});

const OUTSIDE_WINDOW_SNOW_PANES = [
	{
		id: "left",
		className: "outsideWindowSnowLeft",
		haze: [
			{ image: 0, x: -42, y: -4, width: 178, opacity: 0.66, delay: "-3s" },
			{ image: 2, x: -22, y: 28, width: 154, opacity: 0.56, delay: "-8s" },
			{ image: 1, x: -50, y: 58, width: 190, opacity: 0.48, delay: "-12s" },
		],
		particles: Array.from({ length: 42 }, (_, index) => ({
			id: `outside-left-snow-${index}`,
			x: `${4 + ((index * 19) % 92)}%`,
			delay: `${index * -0.16}s`,
			duration: `${3.25 + (index % 6) * 0.34}s`,
			size: `${1.25 + (index % 5) * 0.38}px`,
			driftX: `${-7 + (index % 5) * 3.2}px`,
			opacity: `${0.42 + (index % 5) * 0.045}`,
		})),
		gusts: Array.from({ length: 72 }, (_, index) => ({
			id: `outside-left-gust-${index}`,
			x: `${4 + ((index * 29) % 92)}%`,
			delay: `${index * -0.05}s`,
			duration: `${0.82 + (index % 5) * 0.09}s`,
			length: `${10 + (index % 5) * 2.8}px`,
			opacity: `${0.7 + (index % 4) * 0.055}`,
			driftX: `${-5 - (index % 5) * 1.8}px`,
		})),
	},
	{
		id: "middle",
		className: "outsideWindowSnowMiddle",
		haze: [
			{ image: 3, x: -46, y: -8, width: 176, opacity: 0.6, delay: "-5s" },
			{ image: 0, x: -24, y: 34, width: 148, opacity: 0.52, delay: "-10s" },
			{ image: 2, x: -54, y: 62, width: 190, opacity: 0.44, delay: "-14s" },
		],
		particles: Array.from({ length: 34 }, (_, index) => ({
			id: `outside-middle-snow-${index}`,
			x: `${6 + ((index * 23) % 88)}%`,
			delay: `${index * -0.18}s`,
			duration: `${3.35 + (index % 5) * 0.38}s`,
			size: `${1.15 + (index % 5) * 0.34}px`,
			driftX: `${-6 + (index % 5) * 2.8}px`,
			opacity: `${0.38 + (index % 5) * 0.045}`,
		})),
		gusts: Array.from({ length: 60 }, (_, index) => ({
			id: `outside-middle-gust-${index}`,
			x: `${5 + ((index * 31) % 90)}%`,
			delay: `${index * -0.055}s`,
			duration: `${0.84 + (index % 5) * 0.09}s`,
			length: `${9 + (index % 5) * 2.6}px`,
			opacity: `${0.66 + (index % 4) * 0.055}`,
			driftX: `${-4.5 - (index % 5) * 1.7}px`,
		})),
	},
];

const ROOM_FOG_SPRITES = [
	{ image: 0, x: -8, y: 44, width: 46, opacity: 0.2, delay: "-4s" },
	{ image: 2, x: 14, y: 58, width: 54, opacity: 0.16, delay: "-10s" },
	{ image: 1, x: 46, y: 50, width: 52, opacity: 0.15, delay: "-7s" },
	{ image: 3, x: 68, y: 60, width: 48, opacity: 0.13, delay: "-13s" },
	{ image: 0, x: 24, y: 24, width: 42, opacity: 0.09, delay: "-16s" },
];

const WINDOW_CLOSEUP_FOG_SPRITES = [
	{ image: 0, x: -16, y: 28, width: 78, opacity: 0.32, delay: "-4s" },
	{ image: 2, x: 16, y: 12, width: 72, opacity: 0.24, delay: "-9s" },
	{ image: 1, x: 48, y: 22, width: 76, opacity: 0.27, delay: "-7s" },
	{ image: 3, x: 70, y: 40, width: 64, opacity: 0.22, delay: "-12s" },
	{ image: 0, x: 8, y: 58, width: 68, opacity: 0.2, delay: "-15s" },
	{ image: 2, x: 58, y: 60, width: 72, opacity: 0.18, delay: "-18s" },
];

const WINDOW_CLOSEUP_ROOM_SNOW_SOURCES = [
	{ id: "left-pane", x: 53, y: 8, spreadX: 13, spreadY: 28, count: 48 },
	{ id: "right-pane", x: 67, y: 10, spreadX: 14, spreadY: 30, count: 52 },
	{ id: "lower-draft", x: 62, y: 30, spreadX: 20, spreadY: 16, count: 34 },
];

const WINDOW_CLOSEUP_ROOM_SNOW = WINDOW_CLOSEUP_ROOM_SNOW_SOURCES.flatMap(
	(source, sourceIndex) =>
		Array.from({ length: source.count }, (_, index) => {
			const globalIndex = sourceIndex * 80 + index;

			return {
				id: `closeup-room-snow-${source.id}-${index}`,
				x: `${source.x + ((index * 17) % source.spreadX) - source.spreadX / 2}%`,
				y: `${source.y + ((index * 11) % source.spreadY)}%`,
				delay: `${globalIndex * -0.075}s`,
				duration: `${2.25 + (globalIndex % 8) * 0.22}s`,
				size: `${1.08 + (globalIndex % 6) * 0.32}px`,
				driftX: `${-12 - (globalIndex % 9) * 1.55}vh`,
				fallY: `${42 + (globalIndex % 8) * 4.6}vh`,
				wobbleX: `${-4 + (globalIndex % 9)}vh`,
				stretch: `${2.25 + (globalIndex % 6) * 0.34}`,
				rotation: `${-74 - (globalIndex % 12)}deg`,
				softness: `${0.34 + (globalIndex % 5) * 0.1}px`,
				opacity: `${0.26 + (globalIndex % 6) * 0.035}`,
			};
		}),
);

const WINDOW_CLOSEUP_WEATHER_OPACITY = {
	cinematic: 0.5,
	balanced: 0.58,
	performance: 0.58,
};

const ROOM_WEATHER_QUALITY = {
	cinematic: "balanced",
	balanced: "balanced",
	performance: "performance",
};

const ROOM_EFFECT_LIMITS = {
	cinematic: {
		windowSnow: 68,
		outsideParticles: 1,
		outsideGusts: 0.82,
		roomFog: 5,
		closeupFog: 6,
		closeupRoomSnow: 112,
	},
	balanced: {
		windowSnow: 50,
		outsideParticles: 0.72,
		outsideGusts: 0.58,
		roomFog: 4,
		closeupFog: 5,
		closeupRoomSnow: 86,
	},
	performance: {
		windowSnow: 34,
		outsideParticles: 0.48,
		outsideGusts: 0.34,
		roomFog: 3,
		closeupFog: 4,
		closeupRoomSnow: 58,
	},
};

function getLimitedCount(length, limit) {
	if (limit <= 1) {
		return Math.max(1, Math.round(length * limit));
	}

	return Math.min(length, limit);
}

const roomSize = {
	width: 1774,
	height: 887,
};

const dialogueWindow = new URL(
	"../../../img/cubes/Spindel/shrine/dialogue_window.png",
	import.meta.url,
).href;
const dialogueClick = new URL(
	"../../../sounds/spindel/cave/dialogue_click.mp3",
	import.meta.url,
).href;

const ROOM_DIALOGUES = {
	windows: {
		start: {
			speaker: "Frosted Windows",
			text: "The glass is white with old frost. Beyond the panes, the storm keeps dragging snow across the dark like a curtain that never opens.",
			action: "close",
		},
	},
	bookshelves: {
		start: {
			speaker: "Frozen Shelves",
			text: "The shelves are frozen through. A few titles still cling to the dark wood, their spines cracked by cold and silence.",
			action: "close",
		},
	},
	banner: {
		start: {
			speaker: "Torn Banner",
			text: "The banner still bears Spindel colors, faded almost black. It stirs without wind, as if remembering a hall full of voices.",
			action: "close",
		},
	},
};

function SpindelRoom({
	isTransitioning = false,
	onBack,
	onQualityChange,
	quality = "cinematic",
	qualityModes = [],
}) {
	const [activeDialogue, setActiveDialogue] = useState(null);
	const [hoveredObject, setHoveredObject] = useState("");
	const [isQualityOpen, setIsQualityOpen] = useState(false);
	const [windowViewMode, setWindowViewMode] = useState("room");
	const windowTransitionTimeoutRef = useRef(null);
	const effectLimits =
		ROOM_EFFECT_LIMITS[quality] ?? ROOM_EFFECT_LIMITS.cinematic;
	const roomWeatherQuality =
		ROOM_WEATHER_QUALITY[quality] ?? ROOM_WEATHER_QUALITY.cinematic;
	const windowSnowParticles = useMemo(
		() => WINDOW_SNOW_PARTICLES.slice(0, effectLimits.windowSnow),
		[effectLimits.windowSnow],
	);
	const outsideWindowSnowPanes = useMemo(
		() =>
			OUTSIDE_WINDOW_SNOW_PANES.map((pane) => ({
				...pane,
				particles: pane.particles.slice(
					0,
					getLimitedCount(pane.particles.length, effectLimits.outsideParticles),
				),
				gusts: pane.gusts.slice(
					0,
					getLimitedCount(pane.gusts.length, effectLimits.outsideGusts),
				),
			})),
		[effectLimits.outsideGusts, effectLimits.outsideParticles],
	);
	const roomFogSprites = useMemo(
		() => ROOM_FOG_SPRITES.slice(0, effectLimits.roomFog),
		[effectLimits.roomFog],
	);
	const windowCloseupFogSprites = useMemo(
		() => WINDOW_CLOSEUP_FOG_SPRITES.slice(0, effectLimits.closeupFog),
		[effectLimits.closeupFog],
	);
	const windowCloseupRoomSnow = useMemo(
		() => WINDOW_CLOSEUP_ROOM_SNOW.slice(0, effectLimits.closeupRoomSnow),
		[effectLimits.closeupRoomSnow],
	);
	useEffect(
		() => () => {
			window.clearTimeout(windowTransitionTimeoutRef.current);
		},
		[],
	);

	const openObjectDialogue = useCallback((dialogueId) => {
		setActiveDialogue(ROOM_DIALOGUES[dialogueId] ?? null);
	}, []);

	const closeObjectDialogue = useCallback(() => {
		setActiveDialogue(null);
	}, []);

	const closeQualityPanelOnBlur = (event) => {
		if (!event.currentTarget.contains(event.relatedTarget)) {
			setIsQualityOpen(false);
		}
	};

	const openWindowView = useCallback(() => {
		window.clearTimeout(windowTransitionTimeoutRef.current);
		setActiveDialogue(null);
		setWindowViewMode("entering");

		windowTransitionTimeoutRef.current = window.setTimeout(() => {
			setWindowViewMode("view");
			setActiveDialogue(ROOM_DIALOGUES.windows);
		}, 760);
	}, []);

	const closeWindowView = useCallback(() => {
		window.clearTimeout(windowTransitionTimeoutRef.current);
		setActiveDialogue(null);
		setWindowViewMode("exiting");

		windowTransitionTimeoutRef.current = window.setTimeout(() => {
			setWindowViewMode("room");
		}, 360);
	}, []);

	const closeDialogue = useCallback(() => {
		if (windowViewMode === "view") {
			closeWindowView();
			return;
		}

		closeObjectDialogue();
	}, [closeObjectDialogue, closeWindowView, windowViewMode]);

	const openBookSection = useCallback(() => {
		closeObjectDialogue();
		window.dispatchEvent(
			new CustomEvent(ROUTE_TRANSITION_EVENT, {
				detail: {
					to: "/spindel/frostbound-ledger",
					navigationDelay: 850,
					openingDuration: 900,
					variant: "black",
				},
			}),
		);
	}, [closeObjectDialogue]);

	const closeupScene = (
		<div
			className={`${styles.windowCloseupScene} ${
				windowViewMode === "entering" ? styles.windowCloseupSceneEntering : ""
			}`}
			aria-hidden={windowViewMode === "entering"}
		>
			<img
				className={styles.windowCloseupOutside}
				src={spindelRoomAssets.windowOutside}
				alt=""
				aria-hidden="true"
			/>
			<div className={styles.windowCloseupWeather} aria-hidden="true">
				<SpindelWeatherVolume
					mapSize={roomSize}
					opacity={WINDOW_CLOSEUP_WEATHER_OPACITY[quality] ?? 0.58}
					quality={roomWeatherQuality}
					zIndex={2}
				/>
			</div>
			<img
				className={styles.windowCloseupInterior}
				src={spindelRoomAssets.windowInterior}
				alt=""
				aria-hidden="true"
			/>
			<div
				className={styles.windowCloseupRoomSnow}
				aria-hidden="true"
				style={{
					"--window-out-mask": `url(${spindelRoomAssets.windowOutside})`,
				}}
			>
				{windowCloseupRoomSnow.map((particle) => (
					<span
						key={particle.id}
						className={styles.windowCloseupRoomSnowParticle}
						style={{
							"--room-snow-x": particle.x,
							"--room-snow-y": particle.y,
							"--room-snow-delay": particle.delay,
							"--room-snow-duration": particle.duration,
							"--room-snow-size": particle.size,
							"--room-snow-drift-x": particle.driftX,
							"--room-snow-fall-y": particle.fallY,
							"--room-snow-wobble-x": particle.wobbleX,
							"--room-snow-stretch": particle.stretch,
							"--room-snow-rotation": particle.rotation,
							"--room-snow-softness": particle.softness,
							"--room-snow-opacity": particle.opacity,
						}}
					/>
				))}
			</div>
			<div className={styles.windowCloseupFog} aria-hidden="true">
				{windowCloseupFogSprites.map((fog, index) => (
					<img
						key={`${fog.image}-${index}`}
						className={styles.windowCloseupFogSprite}
						src={spindelFogParticles[fog.image % spindelFogParticles.length]}
						alt=""
						style={{
							"--fog-x": `${fog.x}%`,
							"--fog-y": `${fog.y}%`,
							"--fog-width": `${fog.width}%`,
							"--fog-opacity": fog.opacity,
							"--fog-delay": fog.delay,
						}}
					/>
				))}
			</div>
		</div>
	);

	return (
		<section className={styles.room} aria-label="Abandoned Spindel castle room">
			<div className={styles.outsideAtmosphere} aria-hidden="true">
				<img src={spindelRoomAssets.outer} alt="" />
				<SpindelWeatherVolume
					mapSize={roomSize}
					opacity={0.16}
					quality={roomWeatherQuality}
					zIndex={1}
				/>
			</div>

			<img
				className={styles.background}
				src={spindelRoomAssets.room}
				alt=""
				aria-hidden="true"
			/>

			<div className={styles.outsideWindowSnow} aria-hidden="true">
				<div className={styles.outsideWindowSnowCanvas}>
					{outsideWindowSnowPanes.map((pane) => (
						<div
							key={pane.id}
							className={`${styles.outsideWindowSnowPane} ${styles[pane.className]}`}
						>
							{pane.haze.map((haze, index) => (
								<img
									key={`${pane.id}-haze-${index}`}
									className={styles.outsideWindowHazeSprite}
									src={
										spindelFogParticles[haze.image % spindelFogParticles.length]
									}
									alt=""
									style={{
										"--outside-haze-x": `${haze.x}%`,
										"--outside-haze-y": `${haze.y}%`,
										"--outside-haze-width": `${haze.width}%`,
										"--outside-haze-opacity": haze.opacity,
										"--outside-haze-delay": haze.delay,
									}}
								/>
							))}
							{pane.particles.map((particle) => (
								<span
									key={particle.id}
									className={styles.outsideWindowSnowParticle}
									style={{
										"--outside-snow-x": particle.x,
										"--outside-snow-delay": particle.delay,
										"--outside-snow-duration": particle.duration,
										"--outside-snow-size": particle.size,
										"--outside-snow-drift-x": particle.driftX,
										"--outside-snow-opacity": particle.opacity,
									}}
								/>
							))}
							{pane.gusts.map((gust) => (
								<span
									key={gust.id}
									className={styles.outsideWindowFastSnowParticle}
									style={{
										"--outside-fast-snow-x": gust.x,
										"--outside-fast-snow-delay": gust.delay,
										"--outside-fast-snow-duration": gust.duration,
										"--outside-fast-snow-length": gust.length,
										"--outside-fast-snow-opacity": gust.opacity,
										"--outside-fast-snow-drift-x": gust.driftX,
									}}
								/>
							))}
						</div>
					))}
				</div>
			</div>

			<img
				className={`${styles.windowsLayer} ${
					hoveredObject === "windows" ? styles.windowsLayerActive : ""
				}`}
				src={spindelRoomAssets.windows}
				alt=""
				aria-hidden="true"
			/>

			<svg
				className={styles.objectGlowLayer}
				viewBox={`0 0 ${roomSize.width} ${roomSize.height}`}
				preserveAspectRatio="xMidYMid slice"
				aria-hidden="true"
			>
				{spindelRoomHitboxes.leftWindow && (
					<path
						className={`${styles.glowShape} ${styles.windowGlowShape} ${
							hoveredObject === "windows" ? styles.glowShapeActive : ""
						}`}
						d={spindelRoomHitboxes.leftWindow}
					/>
				)}
				{spindelRoomHitboxes.rightWindow && (
					<path
						className={`${styles.glowShape} ${styles.windowGlowShape} ${
							hoveredObject === "windows" ? styles.glowShapeActive : ""
						}`}
						d={spindelRoomHitboxes.rightWindow}
					/>
				)}
				{spindelRoomHitboxes.bookshelves && (
					<path
						className={`${styles.glowShape} ${styles.bookshelvesGlowShape} ${
							hoveredObject === "bookshelves" ? styles.glowShapeActive : ""
						}`}
						d={spindelRoomHitboxes.bookshelves}
					/>
				)}
				{spindelRoomHitboxes.book && (
					<path
						className={`${styles.glowShape} ${styles.bookGlowShape} ${
							hoveredObject === "book" ? styles.glowShapeActive : ""
						}`}
						d={spindelRoomHitboxes.book}
					/>
				)}
				{spindelRoomHitboxes.banner && (
					<path
						className={`${styles.glowShape} ${styles.bannerGlowShape} ${
							hoveredObject === "banner" ? styles.glowShapeActive : ""
						}`}
						d={spindelRoomHitboxes.banner}
					/>
				)}
			</svg>

			<img
				className={`${styles.bookshelves} ${
					hoveredObject === "bookshelves" ? styles.bookshelvesActive : ""
				}`}
				src={spindelRoomAssets.bookshelves}
				alt=""
				aria-hidden="true"
			/>
			<img
				className={`${styles.banner} ${
					hoveredObject === "banner" ? styles.bannerActive : ""
				}`}
				src={spindelRoomAssets.banner}
				alt=""
				aria-hidden="true"
			/>
			<img
				className={`${styles.bookLayer} ${
					hoveredObject === "book" ? styles.bookLayerActive : ""
				}`}
				src={spindelRoomAssets.book}
				alt=""
				aria-hidden="true"
			/>

			<svg
				className={styles.hitboxLayer}
				viewBox={`0 0 ${roomSize.width} ${roomSize.height}`}
				preserveAspectRatio="xMidYMid slice"
				aria-hidden="false"
			>
				{spindelRoomHitboxes.leftWindow && (
					<path
						className={`${styles.objectHitbox} ${styles.windowHitbox}`}
						d={spindelRoomHitboxes.leftWindow}
						role="button"
						tabIndex="0"
						focusable="true"
						aria-label="Inspect the frost-covered windows"
						onClick={openWindowView}
						onFocus={() => setHoveredObject("windows")}
						onBlur={() => setHoveredObject("")}
						onMouseEnter={() => setHoveredObject("windows")}
						onMouseLeave={() => setHoveredObject("")}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								openWindowView();
							}
						}}
					/>
				)}
				{spindelRoomHitboxes.rightWindow && (
					<path
						className={`${styles.objectHitbox} ${styles.windowHitbox}`}
						d={spindelRoomHitboxes.rightWindow}
						role="button"
						tabIndex="0"
						focusable="true"
						aria-label="Inspect the frost-covered windows"
						onClick={openWindowView}
						onFocus={() => setHoveredObject("windows")}
						onBlur={() => setHoveredObject("")}
						onMouseEnter={() => setHoveredObject("windows")}
						onMouseLeave={() => setHoveredObject("")}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								openWindowView();
							}
						}}
					/>
				)}
				{spindelRoomHitboxes.bookshelves && (
					<path
						className={`${styles.objectHitbox} ${styles.bookshelvesHitbox}`}
						d={spindelRoomHitboxes.bookshelves}
						role="button"
						tabIndex="0"
						focusable="true"
						aria-label="Inspect the frozen bookshelves"
						onClick={() => openObjectDialogue("bookshelves")}
						onFocus={() => setHoveredObject("bookshelves")}
						onBlur={() => setHoveredObject("")}
						onMouseEnter={() => setHoveredObject("bookshelves")}
						onMouseLeave={() => setHoveredObject("")}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								openObjectDialogue("bookshelves");
							}
						}}
					/>
				)}
				{spindelRoomHitboxes.book && (
					<path
						className={`${styles.objectHitbox} ${styles.bookHitbox}`}
						d={spindelRoomHitboxes.book}
						role="button"
						tabIndex="0"
						focusable="true"
						aria-label="Open the frostbound book"
						onClick={openBookSection}
						onFocus={() => setHoveredObject("book")}
						onBlur={() => setHoveredObject("")}
						onMouseEnter={() => setHoveredObject("book")}
						onMouseLeave={() => setHoveredObject("")}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								openBookSection();
							}
						}}
					/>
				)}
				{spindelRoomHitboxes.banner && (
					<path
						className={`${styles.objectHitbox} ${styles.bannerHitbox}`}
						d={spindelRoomHitboxes.banner}
						role="button"
						tabIndex="0"
						focusable="true"
						aria-label="Inspect the torn Spindel banner"
						onClick={() => openObjectDialogue("banner")}
						onFocus={() => setHoveredObject("banner")}
						onBlur={() => setHoveredObject("")}
						onMouseEnter={() => setHoveredObject("banner")}
						onMouseLeave={() => setHoveredObject("")}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								openObjectDialogue("banner");
							}
						}}
					/>
				)}
			</svg>

			<div
				className={`${styles.windowSnow} ${
					windowViewMode !== "room" ? styles.windowSnowHidden : ""
				}`}
				aria-hidden="true"
			>
				{windowSnowParticles.map((particle) => (
					<span
						key={particle.id}
						className={styles.windowSnowParticle}
						style={{
							"--snow-x": particle.x,
							"--snow-y": particle.y,
							"--snow-delay": particle.delay,
							"--snow-duration": particle.duration,
							"--snow-size": particle.size,
							"--snow-travel-x": particle.travelX,
							"--snow-travel-y": particle.travelY,
							"--snow-stretch": particle.stretch,
							"--snow-softness": particle.softness,
							"--snow-opacity": particle.opacity,
						}}
					/>
				))}
			</div>
			<div className={styles.frontMask} aria-hidden="true">
				<span
					className={`${styles.snowSpawnMask} ${styles.snowSpawnMaskLeft}`}
				/>
				<span
					className={`${styles.snowSpawnMask} ${styles.snowSpawnMaskMiddle}`}
				/>
			</div>
			<div className={styles.roomFog} aria-hidden="true">
				{roomFogSprites.map((fog, index) => (
					<img
						key={`${fog.image}-${index}`}
						className={styles.roomFogSprite}
						src={spindelFogParticles[fog.image % spindelFogParticles.length]}
						alt=""
						style={{
							"--fog-x": `${fog.x}%`,
							"--fog-y": `${fog.y}%`,
							"--fog-width": `${fog.width}%`,
							"--fog-opacity": fog.opacity,
							"--fog-delay": fog.delay,
						}}
					/>
				))}
			</div>
			<div className={styles.roomGrade} aria-hidden="true" />

			{windowViewMode !== "room" && (
				<div
					className={`${styles.windowCloseup} ${
						windowViewMode === "entering" ? styles.windowCloseupEntering : ""
					} ${windowViewMode === "view" ? styles.windowCloseupView : ""} ${
						windowViewMode === "exiting" ? styles.windowCloseupExiting : ""
					}`}
					aria-hidden={
						windowViewMode === "entering" || windowViewMode === "exiting"
					}
				>
					{closeupScene}
				</div>
			)}

			<button
				className={styles.backButton}
				type="button"
				aria-label="Back to Spindel map"
				disabled={isTransitioning}
				onClick={() => {
					if (windowViewMode !== "room") {
						closeWindowView();
						return;
					}

					closeDialogue();
					onBack();
				}}
			>
				<FiArrowLeft aria-hidden="true" />
			</button>

			{qualityModes.length > 0 && (
				<div
					className={`${styles.qualityPanel} ${
						isQualityOpen ? styles.qualityPanelOpen : ""
					}`}
					onMouseEnter={() => setIsQualityOpen(true)}
					onMouseLeave={() => setIsQualityOpen(false)}
					onFocus={() => setIsQualityOpen(true)}
					onBlur={closeQualityPanelOnBlur}
				>
					<button
						className={styles.qualityToggle}
						type="button"
						aria-label="Room graphics settings"
						aria-expanded={isQualityOpen}
						onClick={() => setIsQualityOpen((current) => !current)}
					>
						<FiSliders aria-hidden="true" />
					</button>
					<div
						className={styles.qualityMenu}
						aria-label="Room graphics quality"
					>
						<span className={styles.qualityTitle}>Room Graphics</span>
						<div className={styles.qualityOptions}>
							{qualityModes.map((mode) => (
								<button
									key={mode.id}
									className={`${styles.qualityOption} ${
										quality === mode.id ? styles.qualityOptionActive : ""
									}`}
									type="button"
									aria-pressed={quality === mode.id}
									onClick={() => {
										onQualityChange?.(mode.id);
										setIsQualityOpen(false);
									}}
								>
									{mode.label}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{activeDialogue && (
				<DialogueBox
					className={styles.roomDialogue}
					clickSound={dialogueClick}
					dialogue={activeDialogue}
					enableSkip
					frameImage={dialogueWindow}
					isOpen={Boolean(activeDialogue)}
					linePause={680}
					onAction={closeDialogue}
					onClose={closeDialogue}
					typewriterInterval={78}
				/>
			)}
		</section>
	);
}

export default SpindelRoom;
