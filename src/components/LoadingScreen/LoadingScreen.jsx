import styles from "./LoadingScreen.module.scss";

const frameImage = new URL(
	"../../../img/loading/ChatGPT_Image_18_июл._2026_г.__01_21_13-removebg-preview.png",
	import.meta.url,
).href;

function LoadingScreen({ label = "Location", progress = 0, visible = false }) {
	const normalizedProgress = Math.max(0, Math.min(progress, 1));
	const percent = Math.round(normalizedProgress * 100);

	return (
		<div
			className={`${styles.overlay} ${visible ? styles.overlayVisible : ""}`}
			aria-hidden={!visible}
			aria-live="polite"
			style={{ "--load-progress": normalizedProgress }}
		>
			<div className={styles.panel} role="status">
				<div className={styles.frameWrap} aria-hidden="true">
					<img className={styles.frameBase} src={frameImage} alt="" />
					<img className={styles.frameFill} src={frameImage} alt="" />
					<div className={styles.progressAura} />
					<div className={styles.progressTrack}>
						<i />
					</div>
				</div>
				<div className={styles.meta}>
					<span>{label}</span>
					<b>{percent}%</b>
				</div>
			</div>
		</div>
	);
}

export default LoadingScreen;
