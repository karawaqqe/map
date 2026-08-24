import { useCallback, useEffect, useRef, useState } from "react";
import {
	FiActivity,
	FiArrowLeft,
	FiFastForward,
	FiMessageSquare,
} from "react-icons/fi";
import DialogueBox from "../../components/DialogueBox/DialogueBox";
import { ROUTE_TRANSITION_EVENT } from "../../constants/routeTransition";
import {
	DIALOGUE_ACTIONS,
	statueRepeatDialogue,
	statueDialogue,
} from "../../data/dialogues/statueDialogue";
import { shrineStatueHitbox } from "../../data/generatedHitboxes";
import useSessionDialogMemory from "../../hooks/useSessionDialogMemory";
import styles from "./Shrine.module.scss";

const shrineSize = {
	width: 1774,
	height: 887,
};
const ROUTE_NAVIGATION_DELAY = 1150;
const ROUTE_TRANSITION_OPENING_DURATION = 1100;
const STATUE_DIALOG_ID = "statue_depths";
const SMOKE_PLUMES = [
	{ x: 18, y: 58, delay: "-8s", duration: "26s", scale: 1.1 },
	{ x: 35, y: 68, delay: "-16s", duration: "31s", scale: 0.86 },
	{ x: 73, y: 60, delay: "-4s", duration: "28s", scale: 1 },
	{ x: 84, y: 72, delay: "-21s", duration: "34s", scale: 0.78 },
];
const DUST_PARTICLES = [
	{ x: 12, y: 18, delay: "-2s", duration: "18s", drift: 26 },
	{ x: 24, y: 42, delay: "-11s", duration: "23s", drift: -18 },
	{ x: 38, y: 24, delay: "-7s", duration: "20s", drift: 22 },
	{ x: 51, y: 54, delay: "-15s", duration: "25s", drift: -24 },
	{ x: 64, y: 33, delay: "-5s", duration: "19s", drift: 18 },
	{ x: 76, y: 46, delay: "-18s", duration: "27s", drift: -20 },
	{ x: 88, y: 22, delay: "-9s", duration: "21s", drift: 24 },
	{ x: 44, y: 76, delay: "-13s", duration: "24s", drift: -14 },
	{ x: 68, y: 70, delay: "-20s", duration: "29s", drift: 16 },
];
const WATER_DRIPS = [
	{ x: 18, delay: "-1s", duration: "1s", length: 42 },
	{ x: 31, delay: "-4s", duration: "1.3s", length: 34 },
	{ x: 57, delay: "-2.8s", duration: "2s", length: 48 },
	{ x: 79, delay: "-5.2s", duration: "1s", length: 38 },
	{ x: 91, delay: "-3.3s", duration: "1.5s", length: 30 },
];

const shrineBg = new URL(
	"../../../img/cubes/Spindel/shrine/shrine_bg.webp",
	import.meta.url,
).href;
const shrineStatue = new URL(
	"../../../img/cubes/Spindel/shrine/shrine_statue.webp",
	import.meta.url,
).href;
const shrineEffects = new URL(
	"../../../img/cubes/Spindel/shrine/shrine_effects.webp",
	import.meta.url,
).href;
const shrineEyes = new URL(
	"../../../img/cubes/Spindel/shrine/eyes_glow_shrine.webp",
	import.meta.url,
).href;
const dialogueWindow = new URL(
	"../../../img/cubes/Spindel/shrine/dialogue_window.webp",
	import.meta.url,
).href;
const shrineAmbience = new URL(
	"../../../sounds/spindel/cave/cave_shrine_ambience.mp3",
	import.meta.url,
).href;
const dialogueClick = new URL(
	"../../../sounds/spindel/cave/dialogue_click.mp3",
	import.meta.url,
).href;
const screamerVideo = new URL(
	"../../../videos/screamer-test.mp4",
	import.meta.url,
).href;

function dispatchRouteTransition(to) {
	window.dispatchEvent(
		new CustomEvent(ROUTE_TRANSITION_EVENT, {
			detail: {
				to,
				navigationDelay: ROUTE_NAVIGATION_DELAY,
				openingDuration: ROUTE_TRANSITION_OPENING_DURATION,
				variant: "black",
			},
		}),
	);
}

function Shrine() {
	const [isDialogueOpen, setIsDialogueOpen] = useState(false);
	const [activeDialogue, setActiveDialogue] = useState(statueDialogue);
	const [dialogueSessionKey, setDialogueSessionKey] = useState(0);
	const [isDialogueSessionActive, setIsDialogueSessionActive] = useState(false);
	const [isDebugOpen, setIsDebugOpen] = useState(false);
	const [yunshulIrritation, setYunshulIrritation] = useState(0);
	const [isEyesVisible, setIsEyesVisible] = useState(false);
	const [isVisionPlaying, setIsVisionPlaying] = useState(false);
	const [isReturningToWorld, setIsReturningToWorld] = useState(false);
	const [hasSeenStatueDialogue, markStatueDialogueAsSeen] =
		useSessionDialogMemory(STATUE_DIALOG_ID);
	const ambienceRef = useRef(null);
	const visionVideoRef = useRef(null);

	useEffect(() => {
		const audio = ambienceRef.current;

		if (!audio) {
			return undefined;
		}

		audio.volume = 0.26;

		const playAmbience = () => {
			audio.play().catch(() => {});
		};

		playAmbience();
		window.addEventListener("pointerdown", playAmbience, { once: true });
		window.addEventListener("keydown", playAmbience, { once: true });

		return () => {
			window.removeEventListener("pointerdown", playAmbience);
			window.removeEventListener("keydown", playAmbience);
			audio.pause();
		};
	}, []);

	const closeDialogue = useCallback(() => {
		setIsDialogueOpen(false);
		setIsDialogueSessionActive(false);
		setDialogueSessionKey((current) => current + 1);
	}, []);

	const hideDialogue = useCallback(() => {
		setIsDialogueOpen(false);
	}, []);

	const navigateToWorld = useCallback(() => {
		setIsReturningToWorld(true);
		dispatchRouteTransition("/");
	}, []);

	const navigateToVoid = useCallback(() => {
		setIsReturningToWorld(true);
		dispatchRouteTransition("/void");
	}, []);

	const navigateToSpindel = useCallback(() => {
		closeDialogue();
		dispatchRouteTransition("/spindel");
	}, [closeDialogue]);

	const handleDialogueAction = useCallback(
		(action) => {
			if (action === DIALOGUE_ACTIONS.increaseIrritation) {
				setYunshulIrritation((current) => current + 1);
				return;
			}

			if (action === DIALOGUE_ACTIONS.close) {
				closeDialogue();
				return;
			}

			if (action === DIALOGUE_ACTIONS.navigateWorld) {
				closeDialogue();
				navigateToWorld();
				return;
			}

			if (action === DIALOGUE_ACTIONS.navigateSpindel) {
				navigateToSpindel();
				return;
			}

			if (action === DIALOGUE_ACTIONS.visionThenWorld) {
				closeDialogue();
				setIsVisionPlaying(true);

				const video = visionVideoRef.current;
				if (video) {
					ambienceRef.current?.pause();
					video.currentTime = 0;
					video.muted = false;
					video.volume = 1;
					video.play().catch(() => navigateToVoid());
				}
			}
		},
		[closeDialogue, navigateToSpindel, navigateToVoid, navigateToWorld],
	);

	const resetDebugState = () => {
		setYunshulIrritation(0);
	};

	const startStatueDialogue = () => {
		if (isDialogueOpen || isVisionPlaying) {
			return;
		}

		if (!isDialogueSessionActive) {
			setActiveDialogue(
				hasSeenStatueDialogue ? statueRepeatDialogue : statueDialogue,
			);
			setIsDialogueSessionActive(true);
		}

		if (!hasSeenStatueDialogue) {
			markStatueDialogueAsSeen();
		}

		setIsEyesVisible(true);
		setIsDialogueOpen(true);
	};

	const handleStatueKeyDown = (event) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			startStatueDialogue();
		}
	};

	const returnToWorld = () => {
		if (isReturningToWorld) {
			return;
		}

		closeDialogue();
		navigateToWorld();
	};

	return (
		<section
			className={`${styles.page} mapNoSelect ${isEyesVisible ? styles.pageAwakened : ""}`}
			onDragStart={(event) => event.preventDefault()}
		>
			<audio
				ref={ambienceRef}
				className={styles.ambientAudio}
				src={shrineAmbience}
				loop
				autoPlay
				preload="auto"
				aria-hidden="true"
			/>
			<svg
				className={styles.scene}
				viewBox={`0 0 ${shrineSize.width} ${shrineSize.height}`}
				preserveAspectRatio="xMidYMid slice"
				role="img"
				aria-label="Spindel shrine"
			>
				<image
					className={styles.shrineLayer}
					href={shrineBg}
					width={shrineSize.width}
					height={shrineSize.height}
				/>
				<image
					className={styles.statueLayer}
					href={shrineStatue}
					width={shrineSize.width}
					height={shrineSize.height}
				/>
				<image
					className={styles.effectsLayer}
					href={shrineEffects}
					width={shrineSize.width}
					height={shrineSize.height}
				/>
				{shrineStatueHitbox && (
					<path
						className={styles.statueHitbox}
						d={shrineStatueHitbox}
						role="button"
						tabIndex="0"
						focusable="true"
						aria-label="Speak with the shrine statue"
						onClick={startStatueDialogue}
						onKeyDown={handleStatueKeyDown}
					/>
				)}
			</svg>
			{isDialogueSessionActive && !isDialogueOpen && (
				<button
					className={styles.openDialogueButton}
					type="button"
					onClick={startStatueDialogue}
				>
					<FiMessageSquare aria-hidden="true" />
					<span>Open dialogue</span>
				</button>
			)}
			<div className={styles.caveAtmosphere} aria-hidden="true">
				<div className={styles.blackSmokeLayer}>
					{SMOKE_PLUMES.map((smoke, index) => (
						<span
							key={`smoke-${index}`}
							className={styles.smokePlume}
							style={{
								"--smoke-x": `${smoke.x}%`,
								"--smoke-y": `${smoke.y}%`,
								"--smoke-delay": smoke.delay,
								"--smoke-duration": smoke.duration,
								"--smoke-scale": smoke.scale,
							}}
						/>
					))}
				</div>
				<div className={styles.dustLayer}>
					{DUST_PARTICLES.map((dust, index) => (
						<span
							key={`dust-${index}`}
							className={styles.dustParticle}
							style={{
								"--dust-x": `${dust.x}%`,
								"--dust-y": `${dust.y}%`,
								"--dust-delay": dust.delay,
								"--dust-duration": dust.duration,
								"--dust-drift": `${dust.drift}px`,
							}}
						/>
					))}
				</div>
				<div className={styles.dripLayer}>
					{WATER_DRIPS.map((drip, index) => (
						<span
							key={`drip-${index}`}
							className={styles.waterDrip}
							style={{
								"--drip-x": `${drip.x}%`,
								"--drip-delay": drip.delay,
								"--drip-duration": drip.duration,
								"--drip-length": `${drip.length}px`,
							}}
						/>
					))}
				</div>
			</div>
			<div className={styles.caveVeil} aria-hidden="true" />
			<div className={styles.blackOverlayLayer} aria-hidden="true" />
			<svg
				className={styles.eyesScene}
				viewBox={`0 0 ${shrineSize.width} ${shrineSize.height}`}
				preserveAspectRatio="xMidYMid slice"
				aria-hidden="true"
			>
				<image
					className={`${styles.eyesLayer} ${isEyesVisible ? styles.eyesLayerVisible : ""}`}
					href={shrineEyes}
					width={shrineSize.width}
					height={shrineSize.height}
				/>
			</svg>
			<div
				className={`${styles.visionOverlay} ${isVisionPlaying ? styles.visionOverlayVisible : ""}`}
				aria-hidden="true"
			>
				<video
					ref={visionVideoRef}
					className={styles.visionVideo}
					src={screamerVideo}
					preload="auto"
					playsInline
					onEnded={navigateToVoid}
					onError={navigateToVoid}
				/>
			</div>
			<DialogueBox
				key={dialogueSessionKey}
				clickSound={dialogueClick}
				dialogue={activeDialogue}
				enableSkip
				frameImage={dialogueWindow}
				isOpen={isDialogueOpen}
				linePause={680}
				onAction={handleDialogueAction}
				onClose={hideDialogue}
				typewriterInterval={78}
			/>
			<div className={styles.debugControls} aria-label="Shrine debug controls">
				<button
					className={styles.debugButton}
					type="button"
					onClick={navigateToSpindel}
				>
					<FiFastForward aria-hidden="true" />
					<span>Spindel</span>
				</button>
				<button
					className={styles.debugButton}
					type="button"
					aria-expanded={isDebugOpen}
					onClick={() => setIsDebugOpen((current) => !current)}
				>
					<FiActivity aria-hidden="true" />
					<span>Debug</span>
				</button>
				{isDebugOpen && (
					<div className={styles.debugPanel}>
						<div>
							<span>Irritation</span>
							<strong>{yunshulIrritation}</strong>
						</div>
						<div>
							<span>Seen statue</span>
							<strong>{hasSeenStatueDialogue ? "yes" : "no"}</strong>
						</div>
						<div>
							<span>Dialogue</span>
							<strong>{isDialogueOpen ? "open" : "closed"}</strong>
						</div>
						<button type="button" onClick={resetDebugState}>
							Reset test state
						</button>
					</div>
				)}
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

export default Shrine;
