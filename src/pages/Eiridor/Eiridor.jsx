import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiSliders } from "react-icons/fi";
import { ROUTE_TRANSITION_EVENT } from "../../constants/routeTransition";
import {
	birdImage,
	birdSound,
	cloudImages,
	eiridorMusic,
	windSound,
} from "../../data/continents";
import {
	eiridorMapImage,
	eiridorMapSize,
	eiridorRegions,
} from "../../data/eiridor";
import { eiridorHitboxes } from "../../data/generatedHitboxes";
import styles from "./Eiridor.module.scss";
import eiridorUnionCrest from "../../../img/herbs/eiridor_union/eiridor_union_crest.webp";
import drakenholmTreatyImage from "../../../img/peace_treaty/drakenholmpeace.webp";
import lumerisTreatyImage from "../../../img/peace_treaty/lumerispeace.webp";
import morveinTreatyImage from "../../../img/peace_treaty/morveinpeace.webp";
import noktreynTreatyImage from "../../../img/peace_treaty/noktreynpeace.webp";
import valdoraTreatyImage from "../../../img/peace_treaty/valdorapeace.webp";
import warSwordsImage from "../../../img/herbs/lawherbs/lawswords.webp";

const WORLD_NAVIGATION_DELAY = 1150;
const WORLD_TRANSITION_OPENING_DURATION = 1100;
const REGION_NAVIGATION_DELAY = 1150;
const REGION_TRANSITION_OPENING_DURATION = 1100;
const EIRIDOR_LAW_ACTION_EVENT = "eiridor-law-action";
const UNION_REGION_IDS = new Set(["morveyn", "noktreyn", "lyumeris", "drakenholm"]);
const TREATY_SCROLL_SIZE = {
	width: 62,
	height: 84,
};
const TREATY_SCROLL_OFFSETS = {
	drakenholm: { x: -72, y: -88 },
	lyumeris: { x: -34, y: -86 },
	morveyn: { x: -18, y: -80 },
	noktreyn: { x: -26, y: -46 },
	valdora: { x: -62, y: -78 },
};
const TREATIES_BY_REGION_ID = {
	drakenholm: {
		image: drakenholmTreatyImage,
		title: "Drakenholm peace treaty",
	},
	lyumeris: {
		image: lumerisTreatyImage,
		title: "Lyumeris peace treaty",
	},
	morveyn: {
		image: morveinTreatyImage,
		title: "Morveyn peace treaty",
	},
	noktreyn: {
		image: noktreynTreatyImage,
		title: "Noktreyn peace treaty",
	},
	valdora: {
		image: valdoraTreatyImage,
		title: "Valdora peace treaty",
	},
};
const CLOUDS = [
	{
		image: 0,
		x: -8,
		y: -18,
		scale: 0.78,
		duration: 108,
		delay: -18,
		driftX: 25,
		driftY: 3,
		opacity: 0.18,
	},
	{
		image: 3,
		x: 18,
		y: -13,
		scale: 0.68,
		duration: 134,
		delay: -58,
		driftX: -20,
		driftY: 5,
		opacity: 0.16,
	},
	{
		image: 1,
		x: 57,
		y: -16,
		scale: 0.82,
		duration: 118,
		delay: -36,
		driftX: 24,
		driftY: -3,
		opacity: 0.17,
	},
	{
		image: 6,
		x: -12,
		y: 28,
		scale: 0.74,
		duration: 146,
		delay: -72,
		driftX: 28,
		driftY: -5,
		opacity: 0.15,
	},
	{
		image: 4,
		x: 38,
		y: 30,
		scale: 0.7,
		duration: 116,
		delay: -31,
		driftX: -18,
		driftY: 4,
		opacity: 0.14,
	},
	{
		image: 2,
		x: 73,
		y: 24,
		scale: 0.68,
		duration: 152,
		delay: -88,
		driftX: 18,
		driftY: 3,
		opacity: 0.15,
	},
	{
		image: 5,
		x: 16,
		y: 62,
		scale: 0.78,
		duration: 138,
		delay: -50,
		driftX: -24,
		driftY: -4,
		opacity: 0.13,
	},
];

const BIRD_FLOCKS = [
	{
		id: "ridge",
		className: "birdFlockPrimary",
		y: 33,
		duration: 218,
		delay: -46,
		birds: [
			{ x: 0, y: 18, scale: 0.66, rotate: -5 },
			{ x: 36, y: 5, scale: 0.52, rotate: 3 },
			{ x: 70, y: 28, scale: 0.56, rotate: -8 },
			{ x: 108, y: 10, scale: 0.44, rotate: 7 },
			{ x: 142, y: 36, scale: 0.5, rotate: -2 },
		],
	},
	{
		id: "southern",
		className: "birdFlockSecondary",
		y: 57,
		duration: 244,
		delay: -100,
		birds: [
			{ x: 0, y: 8, scale: 0.48, rotate: 4 },
			{ x: 34, y: 30, scale: 0.58, rotate: -6 },
			{ x: 70, y: 14, scale: 0.46, rotate: 9 },
			{ x: 110, y: 42, scale: 0.52, rotate: -4 },
			{ x: 146, y: 22, scale: 0.42, rotate: 6 },
		],
	},
];
const QUALITY_STORAGE_KEY = "eiridor-map-quality";
const BIRD_SOUND_MIN_DELAY = 10000;
const BIRD_SOUND_MAX_DELAY = 15000;
const QUALITY_MODES = [
	{ id: "cinematic", label: "Cinematic" },
	{ id: "balanced", label: "Balanced" },
	{ id: "performance", label: "Performance" },
];
const QUALITY_BODY_CLASSES = QUALITY_MODES.map((mode) => `quality-${mode.id}`);

function getLayerFrame(layer) {
	return layer.frame ?? { x: 0, y: 0, width: eiridorMapSize.width, height: eiridorMapSize.height };
}

function getInitialQuality() {
	if (typeof window === "undefined") {
		return "cinematic";
	}

	let storedQuality = null;

	try {
		storedQuality = window.localStorage.getItem(QUALITY_STORAGE_KEY);
	} catch {
		storedQuality = null;
	}

	return QUALITY_MODES.some((mode) => mode.id === storedQuality)
		? storedQuality
		: "cinematic";
}

const RegionLayer = memo(function RegionLayer({
	hitbox,
	isUnionActive,
	onEnterRegion,
	region,
}) {
	const frame = getLayerFrame(region);
	const handleKeyDown = (event) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onEnterRegion(region.id);
		}
	};

	return (
		<g
			className={`${styles.region} ${isUnionActive ? styles.regionUnionActive : ""}`}
			transform={`translate(${frame.x} ${frame.y})`}
			style={{
				"--region-glow": isUnionActive ? "#f1cc6d" : region.glowColor,
				"--region-glow-fill": isUnionActive ? "rgba(241, 204, 109, 0.18)" : region.glowFill,
				"--region-glow-opacity": isUnionActive ? 0.48 : region.glowOpacity,
				"--region-glow-strength": isUnionActive ? 0.46 : region.glowStrength,
				"--region-float-delay": region.floatDelay,
			}}
		>
			<title>{region.name}</title>
			<g className={styles.regionFloat}>
				<g className={styles.regionLift}>
					{hitbox && <path className={styles.regionGlow} d={hitbox} />}
					<image
						className={styles.regionImage}
						href={region.image}
						width={frame.width}
						height={frame.height}
						loading="lazy"
						decoding="async"
					/>
				</g>
			</g>
			{hitbox && (
				<path
					className={styles.regionHitbox}
					data-region-id={region.id}
					d={hitbox}
					role="button"
					aria-label={region.name}
					tabIndex="0"
					focusable="true"
					onClick={() => onEnterRegion(region.id)}
					onKeyDown={handleKeyDown}
				/>
			)}
		</g>
	);
});

function Eiridor() {
	const [quality, setQuality] = useState(getInitialQuality);
	const [isUnionActive, setIsUnionActive] = useState(false);
	const [showTreaties, setShowTreaties] = useState(false);
	const [selectedTreaty, setSelectedTreaty] = useState(null);
	const [isWarModalOpen, setIsWarModalOpen] = useState(false);
	const [isQualityOpen, setIsQualityOpen] = useState(false);
	const [isReturningToWorld, setIsReturningToWorld] = useState(false);
	const [isEnteringRegion, setIsEnteringRegion] = useState(false);
	const musicAudioRef = useRef(null);
	const windAudioRef = useRef(null);
	const birdAudioRef = useRef(null);

	const enterRegion = useCallback(
		(regionId) => {
			if (isEnteringRegion) {
				return;
			}

			setIsEnteringRegion(true);
			window.dispatchEvent(
				new CustomEvent(ROUTE_TRANSITION_EVENT, {
					detail: {
						to: `/region/${regionId}`,
						navigationDelay: REGION_NAVIGATION_DELAY,
						openingDuration: REGION_TRANSITION_OPENING_DURATION,
					},
				}),
			);
		},
		[isEnteringRegion],
	);

	useEffect(() => {
		const audioEntries = [
			{ audio: musicAudioRef.current, volume: 0.1 },
			{ audio: windAudioRef.current, volume: 0.18 },
		].filter(({ audio }) => audio);

		if (!audioEntries.length) {
			return undefined;
		}

		audioEntries.forEach(({ audio, volume }) => {
			audio.volume = volume;
		});

		const playAudio = () => {
			audioEntries.forEach(({ audio }) => {
				audio.play().catch(() => {});
			});
		};

		playAudio();

		window.addEventListener("pointerdown", playAudio, { once: true });
		window.addEventListener("keydown", playAudio, { once: true });

		return () => {
			window.removeEventListener("pointerdown", playAudio);
			window.removeEventListener("keydown", playAudio);
			audioEntries.forEach(({ audio }) => {
				audio.pause();
			});
		};
	}, []);

	useEffect(() => {
		const audio = birdAudioRef.current;

		if (!audio || quality === "performance") {
			return undefined;
		}

		let timeoutId;
		let isCancelled = false;

		audio.volume = quality === "balanced" ? 0.1 : 0.15;

		const getNextDelay = () =>
			BIRD_SOUND_MIN_DELAY +
			Math.random() * (BIRD_SOUND_MAX_DELAY - BIRD_SOUND_MIN_DELAY);

		const scheduleBirdSound = () => {
			timeoutId = window.setTimeout(() => {
				if (isCancelled) {
					return;
				}

				audio.currentTime = 0;
				audio.play().catch(() => {});
				scheduleBirdSound();
			}, getNextDelay());
		};

		scheduleBirdSound();

		return () => {
			isCancelled = true;
			window.clearTimeout(timeoutId);
			audio.pause();
		};
	}, [quality]);

	useEffect(() => {
		document.body.classList.remove(...QUALITY_BODY_CLASSES);
		document.body.classList.add(`quality-${quality}`);

		try {
			window.localStorage.setItem(QUALITY_STORAGE_KEY, quality);
		} catch {
			// Quality still applies for this session if storage is unavailable.
		}

		return () => {
			document.body.classList.remove(...QUALITY_BODY_CLASSES);
		};
	}, [quality]);

	useEffect(() => {
		const handleLawAction = (event) => {
			const action = event.detail?.action;
			const isActive = event.detail?.active !== false;

			setIsUnionActive(action === "flags" && isActive);
			setShowTreaties(action === "list" && isActive);
			setSelectedTreaty(null);

			setIsWarModalOpen(action === "swords" && isActive);
		};

		window.addEventListener(EIRIDOR_LAW_ACTION_EVENT, handleLawAction);

		return () => {
			window.removeEventListener(EIRIDOR_LAW_ACTION_EVENT, handleLawAction);
		};
	}, []);

	useEffect(() => {
		if (!selectedTreaty) {
			return undefined;
		}

		const closeTreatyOnEscape = (event) => {
			if (event.key === "Escape") {
				setSelectedTreaty(null);
			}
		};

		window.addEventListener("keydown", closeTreatyOnEscape);

		return () => {
			window.removeEventListener("keydown", closeTreatyOnEscape);
		};
	}, [selectedTreaty]);

	const closeQualityPanelOnBlur = (event) => {
		if (!event.currentTarget.contains(event.relatedTarget)) {
			setIsQualityOpen(false);
		}
	};

	const closeWarModal = () => {
		setIsWarModalOpen(false);
	};

	const openTreaty = (event, treaty) => {
		event.preventDefault();
		event.stopPropagation();
		setSelectedTreaty(treaty);
	};

	const closeTreaty = () => {
		setSelectedTreaty(null);
	};

	const returnToWorld = () => {
		if (isReturningToWorld) {
			return;
		}

		setIsReturningToWorld(true);
		window.dispatchEvent(
			new CustomEvent(ROUTE_TRANSITION_EVENT, {
				detail: {
					to: "/",
					navigationDelay: WORLD_NAVIGATION_DELAY,
					openingDuration: WORLD_TRANSITION_OPENING_DURATION,
				},
			}),
		);
	};

	return (
		<section className={`${styles.page} mapNoSelect`} onDragStart={(event) => event.preventDefault()}>
			<div className={styles.mapStage}>
				<audio
					ref={musicAudioRef}
					className={styles.ambientAudio}
					src={eiridorMusic}
					loop
					autoPlay
					preload="auto"
					aria-hidden="true"
				/>
				<audio
					ref={windAudioRef}
					className={styles.ambientAudio}
					src={windSound}
					loop
					autoPlay
					preload="auto"
					aria-hidden="true"
				/>
				<audio
					ref={birdAudioRef}
					className={styles.ambientAudio}
					src={birdSound}
					preload="auto"
					aria-hidden="true"
				/>
				<svg
					className={styles.map}
					viewBox={`0 0 ${eiridorMapSize.width} ${eiridorMapSize.height}`}
					preserveAspectRatio="xMidYMid slice"
					role="img"
					aria-label="Eiridor continent map"
				>
					<g>
						<image
							className={styles.baseMap}
							href={eiridorMapImage}
							width={eiridorMapSize.width}
							height={eiridorMapSize.height}
							fetchPriority="high"
							decoding="async"
						/>
					</g>

					{eiridorRegions.map((region) => (
						<RegionLayer
							key={region.id}
							hitbox={eiridorHitboxes[region.id]}
							isUnionActive={isUnionActive && UNION_REGION_IDS.has(region.id)}
							onEnterRegion={enterRegion}
							region={region}
						/>
					))}

					<foreignObject
						className={styles.atmosphereLayer}
						x="0"
						y="0"
						width={eiridorMapSize.width}
						height={eiridorMapSize.height}
						aria-hidden="true"
					>
						<div className={styles.atmosphere}>
							<div className={styles.birdLayer}>
								{BIRD_FLOCKS.map((flock) => (
									<div
										key={flock.id}
										className={`${styles.birdFlock} ${styles[flock.className]}`}
										style={{
											"--flock-y": `${flock.y}%`,
											"--flock-duration": `${flock.duration}s`,
											"--flock-delay": `${flock.delay}s`,
										}}
									>
										{flock.birds.map((bird, index) => (
											<img
												key={`${flock.id}-${index}`}
												className={styles.bird}
												src={birdImage}
												alt=""
												style={{
													"--bird-x": `${bird.x}px`,
													"--bird-y": `${bird.y}px`,
													"--bird-scale": bird.scale,
													"--bird-rotate": `${bird.rotate}deg`,
												}}
											/>
										))}
									</div>
								))}
							</div>
							<div className={styles.cloudImages}>
								{CLOUDS.map((cloud, index) => (
									<img
										key={`cloud-${index}`}
										className={styles.cloudImage}
										src={cloudImages[cloud.image]}
										alt=""
										style={{
											"--cloud-x": `${cloud.x}%`,
											"--cloud-y": `${cloud.y}%`,
											"--cloud-scale": cloud.scale,
											"--cloud-duration": `${cloud.duration}s`,
											"--cloud-delay": `${cloud.delay}s`,
											"--cloud-drift-x": `${cloud.driftX}%`,
											"--cloud-drift-y": `${cloud.driftY}%`,
											"--cloud-opacity": cloud.opacity,
										}}
									/>
								))}
							</div>
							<div className={styles.lowMist} />
							<div className={styles.highMist} />
							<div className={styles.emberGrade} />
							<div className={styles.vignette} />
						</div>
					</foreignObject>

					<foreignObject
						className={`${styles.unionCrestOverlay} ${isUnionActive ? styles.unionCrestOverlayActive : ""}`}
						x="884"
						y="286"
						width="112"
						height="146"
						aria-hidden="true"
					>
						<img
							className={styles.unionCrest}
							src={eiridorUnionCrest}
							alt=""
						/>
					</foreignObject>

					<g className={styles.treatyOverlayLayer} aria-hidden={!showTreaties}>
						{eiridorRegions.map((region) => {
							const treaty = TREATIES_BY_REGION_ID[region.id];

							if (!treaty) {
								return null;
							}

							const frame = getLayerFrame(region);
							const offset = TREATY_SCROLL_OFFSETS[region.id] ?? { x: -42, y: -34 };
							const x = frame.x + frame.width / 2 - TREATY_SCROLL_SIZE.width / 2 + offset.x;
							const y = frame.y + frame.height / 2 - TREATY_SCROLL_SIZE.height / 2 + offset.y;

							return (
								<foreignObject
									key={`treaty-${region.id}`}
									className={`${styles.treatyScrollOverlay} ${
										showTreaties ? styles.treatyScrollOverlayActive : ""
									}`}
									x={x}
									y={y}
									width={TREATY_SCROLL_SIZE.width}
									height={TREATY_SCROLL_SIZE.height}
								>
									<button
										className={styles.treatyScrollFrame}
										type="button"
										aria-label={treaty.title}
										tabIndex={showTreaties ? 0 : -1}
										onClick={(event) => openTreaty(event, treaty)}
									>
										<img
											className={styles.treatyScroll}
											src={treaty.image}
											alt=""
										/>
									</button>
								</foreignObject>
							);
						})}
					</g>

					{!showTreaties && (
						<g className={styles.capitalOverlayLayer} aria-hidden="true">
							{eiridorRegions.map((region) => {
								const isUnionRegion = isUnionActive && UNION_REGION_IDS.has(region.id);
								const showRegionCrest = region.crest && !isUnionRegion;

								return (
									<foreignObject
										key={`capital-${region.id}`}
										data-region-id={region.id}
										className={`${styles.capitalOverlay} ${
											isUnionRegion ? styles.capitalOverlayActive : ""
										} ${
											isUnionRegion ? styles.capitalOverlayUnion : ""
										}`}
										x={region.label.x}
										y={region.label.y}
										width={region.label.width}
										height={region.label.height}
									>
										<div
											className={`${styles.capitalBadge} ${showRegionCrest ? styles.capitalBadgeWithIcon : ""}`}
											style={{
												"--capital-size": `${region.label.size}px`,
											}}
										>
											{showRegionCrest && (
												<img
													className={styles.capitalIcon}
													src={region.crest}
													alt=""
												/>
											)}
											<span className={styles.capitalName}>
												{region.capitalName}
											</span>
										</div>
									</foreignObject>
								);
							})}
						</g>
					)}
				</svg>
				<button
					className={styles.backButton}
					type="button"
					aria-label="Back to world map"
					disabled={isReturningToWorld}
					onClick={returnToWorld}
				>
					<FiArrowLeft aria-hidden="true" />
				</button>
				<div
					className={`${styles.qualityPanel} ${isQualityOpen ? styles.qualityPanelOpen : ""}`}
					onMouseEnter={() => setIsQualityOpen(true)}
					onMouseLeave={() => setIsQualityOpen(false)}
					onFocus={() => setIsQualityOpen(true)}
					onBlur={closeQualityPanelOnBlur}
				>
					<button
						className={styles.qualityToggle}
						type="button"
						aria-label="Eiridor quality settings"
						aria-expanded={isQualityOpen}
						onClick={() => setIsQualityOpen((current) => !current)}
					>
						<FiSliders aria-hidden="true" />
					</button>
					<div className={styles.qualityMenu} aria-label="Eiridor quality">
						<span className={styles.qualityTitle}>Eiridor Quality</span>
						<div className={styles.qualityOptions}>
							{QUALITY_MODES.map((mode) => (
								<button
									key={mode.id}
									className={`${styles.qualityOption} ${quality === mode.id ? styles.qualityOptionActive : ""}`}
									type="button"
									aria-pressed={quality === mode.id}
									onClick={() => {
										setQuality(mode.id);
										setIsQualityOpen(false);
									}}
								>
									{mode.label}
								</button>
							))}
						</div>
					</div>
				</div>
				{isWarModalOpen && (
					<div className={styles.warModalBackdrop} role="presentation" onClick={closeWarModal}>
						<div
							className={styles.warModal}
							role="dialog"
							aria-modal="true"
							aria-label="War status"
							onClick={(event) => event.stopPropagation()}
						>
							<div className={styles.warModalIcon} aria-hidden="true">
								<img
									className={styles.warModalIconImage}
									src={warSwordsImage}
									alt=""
								/>
							</div>
							<button
								className={styles.warModalClose}
								type="button"
								aria-label="Close war status"
								onClick={closeWarModal}
							>
								x
							</button>
							<p className={styles.warModalText}>
								There are currently no hostilities
							</p>
						</div>
					</div>
				)}
				{selectedTreaty && (
					<div className={styles.treatyModalBackdrop} role="presentation" onClick={closeTreaty}>
						<div
							className={styles.treatyModal}
							role="dialog"
							aria-modal="true"
							aria-label={selectedTreaty.title}
							onClick={(event) => event.stopPropagation()}
						>
							<button
								className={styles.treatyModalClose}
								type="button"
								aria-label="Close treaty"
								onClick={closeTreaty}
							>
								x
							</button>
							<img
								className={styles.treatyModalImage}
								src={selectedTreaty.image}
								alt={selectedTreaty.title}
							/>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

export default Eiridor;
