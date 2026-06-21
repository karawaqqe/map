import { FiArrowLeft } from "react-icons/fi";
import { ROUTE_TRANSITION_EVENT } from "../../constants/routeTransition";
import styles from "./SpindelBookSection.module.scss";

function dispatchRouteTransition(to) {
	window.dispatchEvent(
		new CustomEvent(ROUTE_TRANSITION_EVENT, {
			detail: {
				to,
				navigationDelay: 850,
				openingDuration: 900,
				variant: "black",
			},
		}),
	);
}

function SpindelBookSection() {
	return (
		<section className={styles.bookSection} aria-label="Frostbound Ledger section">
			<button
				className={styles.backButton}
				type="button"
				aria-label="Back to Spindel"
				onClick={() => dispatchRouteTransition("/spindel")}
			>
				<FiArrowLeft aria-hidden="true" />
			</button>

			<div className={styles.bookMount} data-book-mount>
				<span className={styles.placeholderLabel}>Frostbound Ledger</span>
			</div>
		</section>
	);
}

export default SpindelBookSection;
