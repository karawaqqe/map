import { useEffect, useRef, useState } from "react";
import styles from "./AudioConsentGate.module.scss";

function AudioConsentGate() {
	const [isVisible, setIsVisible] = useState(true);
	const [isLeaving, setIsLeaving] = useState(false);
	const exitTimerRef = useRef(null);

	useEffect(() => () => window.clearTimeout(exitTimerRef.current), []);

	const enableMedia = () => {
		window.__mediaConsentGranted = true;

		document.querySelectorAll("audio").forEach((audio) => {
			audio.play().catch(() => {});
		});
		document.querySelectorAll("video").forEach((video) => video.load());

		window.dispatchEvent(new CustomEvent("media-consent-granted"));
		setIsLeaving(true);
		exitTimerRef.current = window.setTimeout(() => setIsVisible(false), 1100);
	};

	if (!isVisible) {
		return null;
	}

	return (
		<div
			className={`${styles.gate} ${isLeaving ? styles.gateLeaving : ""}`}
			role="dialog"
			aria-modal="true"
			aria-label="Media consent"
		>
			<div className={styles.panel}>
				<p className={styles.eyebrow}>An atmospheric experience</p>
				<h1>Enter with sound?</h1>
				<p>Music, environmental audio, and cinematic video are part of the journey.</p>
				<button type="button" onClick={enableMedia} disabled={isLeaving} autoFocus>
					Enable media and enter
				</button>
			</div>
		</div>
	);
}

export default AudioConsentGate;
