import { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import DialogueBox from "../../components/DialogueBox/DialogueBox";
import { ROUTE_TRANSITION_EVENT } from "../../constants/routeTransition";
import {
	DIALOGUE_ACTIONS,
	statueRepeatDialogue,
	statueDialogue,
} from "../../data/dialogues/statueDialogue";
import useSessionDialogMemory from "../../hooks/useSessionDialogMemory";
import { buildHitboxPath } from "../../utils/mapHitbox";
import styles from "./Shrine.module.scss";

const shrineSize = {
	width: 1774,
	height: 887,
};
const ROUTE_NAVIGATION_DELAY = 1150;
const ROUTE_TRANSITION_OPENING_DURATION = 1100;
const VISION_DURATION = 3200;
const STATUE_DIALOG_ID = "statue_depths";

const shrineBg = new URL(
	"../../../img/cubes/Spindel/shrine/shrine_bg.png",
	import.meta.url,
).href;
const shrineStatue = new URL(
	"../../../img/cubes/Spindel/shrine/shrine_statue.png",
	import.meta.url,
).href;
const shrineEffects = new URL(
	"../../../img/cubes/Spindel/shrine/shrine_effects.png",
	import.meta.url,
).href;
const shrineEyes = new URL(
	"../../../img/cubes/Spindel/shrine/eyes_glow_shrine.png",
	import.meta.url,
).href;
const dialogueWindow = new URL(
	"../../../img/cubes/Spindel/shrine/dialogue_window.png",
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
	const [statueHitbox, setStatueHitbox] = useState("");
	const [isDialogueOpen, setIsDialogueOpen] = useState(false);
	const [activeDialogue, setActiveDialogue] = useState(statueDialogue);
	const [isEyesVisible, setIsEyesVisible] = useState(false);
	const [isVisionPlaying, setIsVisionPlaying] = useState(false);
	const [isReturningToWorld, setIsReturningToWorld] = useState(false);
	const [hasSeenStatueDialogue, markStatueDialogueAsSeen] =
		useSessionDialogMemory(STATUE_DIALOG_ID);
	const ambienceRef = useRef(null);
	const visionTimeoutRef = useRef(null);

	useEffect(() => {
		let isMounted = true;

		async function createStatueHitbox() {
			const hitbox = await buildHitboxPath(shrineStatue);

			if (isMounted) {
				setStatueHitbox(hitbox);
			}
		}

		createStatueHitbox();

		return () => {
			isMounted = false;
		};
	}, []);

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

	useEffect(
		() => () => {
			window.clearTimeout(visionTimeoutRef.current);
		},
		[],
	);

	const closeDialogue = useCallback(() => {
		setIsDialogueOpen(false);
	}, []);

	const navigateToWorld = useCallback(() => {
		setIsReturningToWorld(true);
		dispatchRouteTransition("/");
	}, []);

	const handleDialogueAction = useCallback(
		(action) => {
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
				closeDialogue();
				dispatchRouteTransition("/spindel");
				return;
			}

			if (action === DIALOGUE_ACTIONS.visionThenWorld) {
				closeDialogue();
				setIsVisionPlaying(true);
				window.clearTimeout(visionTimeoutRef.current);
				visionTimeoutRef.current = window.setTimeout(() => {
					navigateToWorld();
				}, VISION_DURATION);
			}
		},
		[closeDialogue, navigateToWorld],
	);

	const startStatueDialogue = () => {
		if (isDialogueOpen || isVisionPlaying) {
			return;
		}

		setActiveDialogue(
			hasSeenStatueDialogue ? statueRepeatDialogue : statueDialogue,
		);

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
			className={`${styles.page} ${isEyesVisible ? styles.pageAwakened : ""}`}
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
				<image
					className={`${styles.eyesLayer} ${isEyesVisible ? styles.eyesLayerVisible : ""}`}
					href={shrineEyes}
					width={shrineSize.width}
					height={shrineSize.height}
				/>
				{statueHitbox && (
					<path
						className={styles.statueHitbox}
						d={statueHitbox}
						role="button"
						tabIndex="0"
						focusable="true"
						aria-label="Speak with the shrine statue"
						onClick={startStatueDialogue}
						onKeyDown={handleStatueKeyDown}
					/>
				)}
			</svg>
			<div className={styles.caveVeil} aria-hidden="true" />
			{isVisionPlaying && (
				<div className={styles.visionOverlay} aria-hidden="true">
					<span className={styles.visionGlyph}>Frostmourne</span>
				</div>
			)}
			{isDialogueOpen && (
				<DialogueBox
					clickSound={dialogueClick}
					dialogue={activeDialogue}
					enableSkip
					frameImage={dialogueWindow}
					isOpen={isDialogueOpen}
					linePause={680}
					onAction={handleDialogueAction}
					onClose={closeDialogue}
					typewriterInterval={78}
				/>
			)}
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
