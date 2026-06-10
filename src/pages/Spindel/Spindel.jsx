import { memo, useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiSliders } from "react-icons/fi";
import SpindelWeatherVolume from "../../components/SpindelWeatherVolume/SpindelWeatherVolume";
import { ROUTE_TRANSITION_EVENT } from "../../constants/routeTransition";
import {
	spindelBuildingLayers,
	spindelFogParticles,
	spindelMapImage,
	spindelMapSize,
	spindelOst,
	spindelRegions,
} from "../../data/spindel";
import styles from "./Spindel.module.scss";

const WORLD_NAVIGATION_DELAY = 1150;
const WORLD_TRANSITION_OPENING_DURATION = 1100;
const QUALITY_STORAGE_KEY = "spindel-map-quality";
const QUALITY_MODES = [
	{ id: "cinematic", label: "Cinematic" },
	{ id: "balanced", label: "Balanced" },
	{ id: "performance", label: "Performance" },
];
const QUALITY_BODY_CLASSES = QUALITY_MODES.map((mode) => `quality-${mode.id}`);

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

const SpindelLayer = memo(function SpindelLayer({ region }) {
	return (
		<g
			className={styles.region}
			style={{
				"--region-glow": region.glowColor,
				"--region-glow-fill": region.glowFill,
				"--region-glow-opacity": region.glowOpacity,
				"--region-glow-strength": region.glowStrength,
				"--region-float-delay": region.floatDelay,
			}}
		>
			<title>{region.name}</title>
			<g className={styles.regionFloat}>
				<g className={styles.regionLift}>
					<image
						className={styles.regionImage}
						href={region.image}
						width={spindelMapSize.width}
						height={spindelMapSize.height}
						loading="lazy"
						decoding="async"
					/>
				</g>
			</g>
		</g>
	);
});

const BACK_FOG_SPRITES = [
	{ image: 0, x: 78, y: 104, width: 580, opacity: 0.74, delay: "-2s" },
	{ image: 2, x: 390, y: 54, width: 700, opacity: 0.7, delay: "-8s" },
	{ image: 1, x: 730, y: 124, width: 630, opacity: 0.74, delay: "-4s" },
	{ image: 3, x: 1036, y: 92, width: 720, opacity: 0.68, delay: "-12s" },
	{ image: 0, x: 170, y: 382, width: 780, opacity: 0.7, delay: "-6s" },
	{ image: 2, x: 656, y: 334, width: 880, opacity: 0.68, delay: "-10s" },
	{ image: 1, x: 1066, y: 396, width: 720, opacity: 0.69, delay: "-14s" },
	{ image: 3, x: 500, y: 202, width: 760, opacity: 0.62, delay: "-16s" },
	{ image: 0, x: 872, y: 244, width: 680, opacity: 0.6, delay: "-18s" },
	{ image: 2, x: 320, y: 492, width: 860, opacity: 0.58, delay: "-20s" },
	{ image: 1, x: -20, y: 300, width: 760, opacity: 0.56, delay: "-3s" },
	{ image: 3, x: 620, y: 10, width: 820, opacity: 0.58, delay: "-11s" },
	{ image: 0, x: 1180, y: 210, width: 720, opacity: 0.54, delay: "-15s" },
	{ image: 2, x: 760, y: 540, width: 820, opacity: 0.52, delay: "-7s" },
];

const FRONT_FOG_SPRITES = [
	{ image: 3, x: 250, y: 192, width: 430, opacity: 0.14, delay: "-5s" },
	{ image: 1, x: 650, y: 232, width: 500, opacity: 0.15, delay: "-9s" },
	{ image: 0, x: 1010, y: 204, width: 460, opacity: 0.13, delay: "-1s" },
	{ image: 2, x: 430, y: 520, width: 560, opacity: 0.14, delay: "-12s" },
	{ image: 3, x: 960, y: 510, width: 520, opacity: 0.13, delay: "-7s" },
	{ image: 0, x: 120, y: 460, width: 500, opacity: 0.12, delay: "-3s" },
	{ image: 1, x: 1220, y: 360, width: 460, opacity: 0.12, delay: "-10s" },
];

function FogSpriteLayer({ className, fogSprites }) {
	return (
		<svg
			className={className}
			viewBox={`0 0 ${spindelMapSize.width} ${spindelMapSize.height}`}
			preserveAspectRatio="xMidYMid slice"
			aria-hidden="true"
		>
			{fogSprites.map((fog, index) => {
				const href = spindelFogParticles[fog.image % spindelFogParticles.length];
				const height = fog.width * 0.46;

				return (
					<image
						key={`${href}-${index}`}
						className={styles.fogSprite}
						href={href}
						x={fog.x}
						y={fog.y}
						width={fog.width}
						height={height}
						opacity={fog.opacity}
						style={{ "--fog-delay": fog.delay }}
					/>
				);
			})}
		</svg>
	);
}

function Spindel() {
	const [quality, setQuality] = useState(getInitialQuality);
	const [isQualityOpen, setIsQualityOpen] = useState(false);
	const [isReturningToWorld, setIsReturningToWorld] = useState(false);
	const ostAudioRef = useRef(null);

	useEffect(() => {
		const audio = ostAudioRef.current;

		if (!audio) {
			return undefined;
		}

		audio.volume = 0.05;

		const playOst = () => {
			audio.play().catch(() => {});
		};

		playOst();
		window.addEventListener("pointerdown", playOst, { once: true });
		window.addEventListener("keydown", playOst, { once: true });

		return () => {
			window.removeEventListener("pointerdown", playOst);
			window.removeEventListener("keydown", playOst);
			audio.pause();
		};
	}, []);

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

	const closeQualityPanelOnBlur = (event) => {
		if (!event.currentTarget.contains(event.relatedTarget)) {
			setIsQualityOpen(false);
		}
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
					variant: "black",
				},
			}),
		);
	};

	return (
		<section className={styles.page}>
			<audio
				ref={ostAudioRef}
				className={styles.ambientAudio}
				src={spindelOst}
				loop
				autoPlay
				preload="auto"
				aria-hidden="true"
			/>
			<div className={styles.mapStage}>
				<div className={styles.behindBaseFogLayer} aria-hidden="true" />

				<svg
					className={styles.baseMapLayer}
					viewBox={`0 0 ${spindelMapSize.width} ${spindelMapSize.height}`}
					preserveAspectRatio="xMidYMid slice"
					role="img"
					aria-label="Spindel continent base map"
				>
					<image
						className={styles.baseMap}
						href={spindelMapImage}
						width={spindelMapSize.width}
						height={spindelMapSize.height}
						fetchPriority="high"
						decoding="async"
					/>
				</svg>

				<svg
					className={styles.terrainMapLayer}
					viewBox={`0 0 ${spindelMapSize.width} ${spindelMapSize.height}`}
					preserveAspectRatio="xMidYMid slice"
					role="img"
					aria-label="Spindel terrain map"
				>
					{spindelRegions.map((region) => (
						<SpindelLayer key={region.id} region={region} />
					))}
				</svg>

				<div className={styles.buildingBackHazeLayer} aria-hidden="true" />

				<FogSpriteLayer
					className={styles.buildingBackFogLayer}
					fogSprites={BACK_FOG_SPRITES}
				/>

				<svg
					className={styles.buildingMapLayer}
					viewBox={`0 0 ${spindelMapSize.width} ${spindelMapSize.height}`}
					preserveAspectRatio="xMidYMid slice"
					role="img"
					aria-label="Spindel building cut-outs"
				>
					{spindelBuildingLayers.map((building) => (
						<SpindelLayer key={building.id} region={building} />
					))}
				</svg>

				<FogSpriteLayer
					className={styles.buildingFrontFogLayer}
					fogSprites={FRONT_FOG_SPRITES}
				/>

				<SpindelWeatherVolume
					mapSize={spindelMapSize}
					opacity={1}
					quality={quality}
					zIndex={9}
				/>
				<div className={styles.frontHazeLayer} aria-hidden="true" />
			</div>
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
					aria-label="Spindel graphics settings"
					aria-expanded={isQualityOpen}
					onClick={() => setIsQualityOpen((current) => !current)}
				>
					<FiSliders aria-hidden="true" />
				</button>
				<div className={styles.qualityMenu} aria-label="Spindel graphics quality">
					<span className={styles.qualityTitle}>Spindel Graphics</span>
					<div className={styles.qualityOptions}>
						{QUALITY_MODES.map((mode) => (
							<button
								key={mode.id}
								className={`${styles.qualityOption} ${
									quality === mode.id ? styles.qualityOptionActive : ""
								}`}
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
		</section>
	);
}

export default Spindel;
