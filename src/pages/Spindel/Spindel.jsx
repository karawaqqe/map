import { memo, useEffect, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { ROUTE_TRANSITION_EVENT } from "../../constants/routeTransition";
import {
	spindelMapImage,
	spindelMapSize,
	spindelOst,
	spindelRegions,
} from "../../data/spindel";
import { buildHitboxPath } from "../../utils/mapHitbox";
import styles from "./Spindel.module.scss";

const WORLD_NAVIGATION_DELAY = 1150;
const WORLD_TRANSITION_OPENING_DURATION = 1100;

const SpindelLayer = memo(function SpindelLayer({ hitbox, region }) {
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
					{hitbox && <path className={styles.regionGlow} d={hitbox} />}
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

function Spindel() {
	const [hitboxes, setHitboxes] = useState({});
	const [isReturningToWorld, setIsReturningToWorld] = useState(false);
	const ostAudioRef = useRef(null);

	useEffect(() => {
		let isMounted = true;

		async function createHitboxes() {
			const entries = await Promise.all(
				spindelRegions.map(async (region) => [
					region.id,
					await buildHitboxPath(region.image),
				]),
			);

			if (isMounted) {
				setHitboxes(Object.fromEntries(entries));
			}
		}

		createHitboxes();

		return () => {
			isMounted = false;
		};
	}, []);

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
				<svg
					className={styles.map}
					viewBox={`0 0 ${spindelMapSize.width} ${spindelMapSize.height}`}
					preserveAspectRatio="xMidYMid slice"
					role="img"
					aria-label="Spindel continent map"
				>
					<image
						className={styles.baseMap}
						href={spindelMapImage}
						width={spindelMapSize.width}
						height={spindelMapSize.height}
						fetchPriority="high"
						decoding="async"
					/>

					{spindelRegions.map((region) => (
						<SpindelLayer
							key={region.id}
							hitbox={hitboxes[region.id]}
							region={region}
						/>
					))}
				</svg>
				<div className={styles.vignette} aria-hidden="true" />
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
		</section>
	);
}

export default Spindel;
