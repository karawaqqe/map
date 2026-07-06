import { useEffect, useMemo, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import styles from "./DialogueBox.module.scss";

const DEFAULT_TYPEWRITER_INTERVAL = 50;
const DEFAULT_LINE_PAUSE = 420;
const MAX_LINES_PER_PAGE = 2;
const CLOSE_ANIMATION_DURATION = 460;

function getLinePause(line, fallbackPause) {
	if (typeof line.pause === "number") {
		return line.pause;
	}

	if (line.text.endsWith("...")) {
		return fallbackPause + 320;
	}

	if (/[?!]$/.test(line.text)) {
		return fallbackPause + 160;
	}

	return fallbackPause;
}

function normalizeLines(page) {
	if (Array.isArray(page)) {
		return page
			.map((line) => (typeof line === "string" ? { text: line } : line))
			.filter((line) => line?.text?.trim());
	}

	return String(page)
		.split("\n")
		.map((line) => ({ text: line.trim() }))
		.filter((line) => line.text);
}

function splitIntoPages(lines) {
	const pages = [];

	for (let index = 0; index < lines.length; index += MAX_LINES_PER_PAGE) {
		pages.push(lines.slice(index, index + MAX_LINES_PER_PAGE));
	}

	return pages;
}

function getNodePages(node) {
	if (!node) {
		return [];
	}

	if (Array.isArray(node.pages)) {
		return node.pages
			.flatMap((page) => splitIntoPages(normalizeLines(page)))
			.filter((page) => page.length);
	}

	const text = node.text ?? "";

	if (!text.trim()) {
		return [];
	}

	return text
		.split(/\n\s*\n/g)
		.flatMap((page) => splitIntoPages(normalizeLines(page)))
		.filter((page) => page.length);
}

function DialogueBox({
	className = "",
	clickSound,
	dialogue,
	enableSkip = false,
	frameImage,
	isOpen,
	linePause = DEFAULT_LINE_PAUSE,
	onAction,
	onClose,
	startNodeId = "start",
	typewriterInterval = DEFAULT_TYPEWRITER_INTERVAL,
}) {
	const [nodeId, setNodeId] = useState(startNodeId);
	const [pageIndex, setPageIndex] = useState(0);
	const [shownLines, setShownLines] = useState([]);
	const [typedLine, setTypedLine] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [history, setHistory] = useState([]);
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [segmentKey, setSegmentKey] = useState(0);
	const clickAudioRef = useRef(null);
	const historyLinesRef = useRef(null);
	const timeoutIdsRef = useRef([]);
	const closeTimeoutRef = useRef(null);

	const node = dialogue[nodeId];
	const pages = useMemo(() => getNodePages(node), [node]);
	const currentPage = useMemo(() => pages[pageIndex] ?? [], [pageIndex, pages]);
	const options = node?.options ?? [];
	const hasNextPage = pageIndex < pages.length - 1;
	const hasCompletedPage = !isTyping && !typedLine;
	const hasTextAction = Boolean(
		node?.action && currentPage.length && !hasNextPage && options.length === 0,
	);
	const canContinue = isOpen && hasCompletedPage && hasNextPage;
	const canContinueToAction = isOpen && hasCompletedPage && hasTextAction;
	const canChoose =
		isOpen && hasCompletedPage && !hasNextPage && options.length > 0;

	useEffect(
		() => () => {
			window.clearTimeout(closeTimeoutRef.current);
			timeoutIdsRef.current.forEach((timeoutId) =>
				window.clearTimeout(timeoutId),
			);
		},
		[],
	);

	useEffect(() => {
		if (!isHistoryOpen || !historyLinesRef.current) {
			return;
		}

		historyLinesRef.current.scrollTo({
			top: historyLinesRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [history.length, isHistoryOpen]);

	useEffect(() => {
		timeoutIdsRef.current.forEach((timeoutId) =>
			window.clearTimeout(timeoutId),
		);
		timeoutIdsRef.current = [];

		if (!isOpen || !node) {
			return undefined;
		}

		if (!currentPage.length) {
			if (node.action) {
				const timeoutId = window.setTimeout(() => onAction(node.action), 0);
				timeoutIdsRef.current.push(timeoutId);
			}
			return undefined;
		}

		const playClick = () => {
			const audio = clickAudioRef.current;

			if (!audio) {
				return;
			}

			audio.currentTime = 0;
			audio.play().catch(() => {});
		};

		const startPage = () => {
			let lineIndex = 0;
			setShownLines([]);
			setTypedLine("");
			setIsTyping(true);
			setSegmentKey((current) => current + 1);

			const typeLine = () => {
				const line = currentPage[lineIndex];
				let charIndex = 0;

				const typeCharacter = () => {
					charIndex += 1;
					setTypedLine(line.text.slice(0, charIndex));

					if (line.text[charIndex - 1]?.trim()) {
						playClick();
					}

					if (charIndex < line.text.length) {
						const timeoutId = window.setTimeout(
							typeCharacter,
							typewriterInterval,
						);
						timeoutIdsRef.current.push(timeoutId);
						return;
					}

					setHistory((current) => [
						...current,
						{ speaker: node.speaker, text: line.text },
					]);
					setShownLines((current) => [...current, line.text]);
					setTypedLine("");
					lineIndex += 1;

					if (lineIndex < currentPage.length) {
						const timeoutId = window.setTimeout(
							typeLine,
							getLinePause(line, linePause),
						);
						timeoutIdsRef.current.push(timeoutId);
						return;
					}

					setIsTyping(false);
				};

				typeCharacter();
			};

			typeLine();
		};

		const timeoutId = window.setTimeout(startPage, 0);
		timeoutIdsRef.current.push(timeoutId);

		return () => {
			timeoutIdsRef.current.forEach((currentTimeoutId) =>
				window.clearTimeout(currentTimeoutId),
			);
			timeoutIdsRef.current = [];
		};
	}, [
		currentPage,
		hasNextPage,
		isOpen,
		linePause,
		node,
		onAction,
		options.length,
		typewriterInterval,
	]);

	if (!isOpen || !node) {
		return null;
	}

	const clearTypingTimers = () => {
		timeoutIdsRef.current.forEach((timeoutId) =>
			window.clearTimeout(timeoutId),
		);
		timeoutIdsRef.current = [];
	};

	const completeCurrentPage = () => {
		clearTypingTimers();
		setHistory((current) => [
			...current,
			...currentPage
				.slice(shownLines.length)
				.map((line) => ({ speaker: node.speaker, text: line.text })),
		]);
		setShownLines(currentPage.map((line) => line.text));
		setTypedLine("");
		setIsTyping(false);
	};

	const chooseOption = (option) => {
		if (!canChoose) {
			return;
		}

		if (option.action) {
			onAction(option.action);
		}

		setNodeId(option.next);
		setPageIndex(0);
		setShownLines([]);
		setTypedLine("");
		setIsTyping(false);
	};

	const continueDialogue = () => {
		if (!canContinue) {
			return;
		}

		setPageIndex((current) => current + 1);
		setShownLines([]);
		setTypedLine("");
		setIsTyping(false);
	};

	const continueToAction = () => {
		if (!canContinueToAction) {
			return;
		}

		onAction(node.action);
	};

	const skipDialogue = () => {
		if (isTyping || typedLine) {
			completeCurrentPage();
			return;
		}

		if (canContinue) {
			continueDialogue();
			return;
		}

		if (canContinueToAction) {
			continueToAction();
		}
	};

	const hideDialogue = () => {
		if (isClosing) {
			return;
		}

		clearTypingTimers();
		setIsHistoryOpen(false);
		setIsClosing(true);
		closeTimeoutRef.current = window.setTimeout(() => {
			setIsClosing(false);
			onClose();
		}, CLOSE_ANIMATION_DURATION);
	};

	return (
		<>
			<section
				className={`${styles.dialoguePanel} ${
					isClosing ? styles.dialoguePanelClosing : ""
				} ${className}`}
				aria-live="polite"
				aria-hidden={isClosing}
			>
				{clickSound && (
					<audio
						ref={clickAudioRef}
						className={styles.dialogueAudio}
						src={clickSound}
						preload="auto"
						aria-hidden="true"
					/>
				)}
				<div className={styles.dialogueContent}>
					<div className={styles.speakerRow}>
						<span className={styles.speakerName}>{node.speaker}</span>
						<div className={styles.dialogueTools}>
							<button
								className={styles.toolButton}
								type="button"
								aria-expanded={isHistoryOpen}
								onClick={() => setIsHistoryOpen((current) => !current)}
							>
								Log
							</button>
							{enableSkip && (
								<button
									className={styles.toolButton}
									type="button"
									onClick={skipDialogue}
								>
									Skip
								</button>
							)}
							<button
								className={styles.toolButton}
								type="button"
								onClick={hideDialogue}
							>
								Close
							</button>
						</div>
					</div>
					<div className={styles.textFrame}>
						{frameImage && (
							<img
								className={styles.dialogueFrame}
								src={frameImage}
								alt=""
								draggable="false"
							/>
						)}
						<div key={segmentKey} className={styles.dialogueLines}>
							{shownLines.map((line, index) => (
								<p key={`${line}-${index}`} className={styles.dialogueLine}>
									{line}
								</p>
							))}
							{typedLine && (
								<p className={`${styles.dialogueLine} ${styles.activeLine}`}>
									{typedLine}
								</p>
							)}
						</div>
					</div>
					<div className={styles.optionsArea}>
						{canContinue && (
							<div
								className={`${styles.options} ${styles.continueOptions}`}
								aria-label="Continue dialogue"
							>
								<button
									className={`${styles.option} ${styles.continueOption}`}
									type="button"
									onClick={continueDialogue}
								>
									Continue
								</button>
							</div>
						)}
						{canContinueToAction && (
							<div
								className={`${styles.options} ${styles.continueOptions}`}
								aria-label="Continue dialogue"
							>
								<button
									className={`${styles.option} ${styles.continueOption}`}
									type="button"
									onClick={continueToAction}
								>
									Continue
								</button>
							</div>
						)}
						{options.length > 0 && !hasNextPage && (
							<div
								className={`${styles.options} ${styles.choiceOptions}`}
								aria-label="Dialogue options"
							>
								{options.map((option) => (
									<button
										key={`${nodeId}-${option.text}`}
										className={styles.option}
										type="button"
										disabled={!canChoose}
										onClick={() => chooseOption(option)}
									>
										{option.text}
									</button>
								))}
							</div>
						)}
						{!canContinue &&
							!canContinueToAction &&
							!(options.length > 0 && !hasNextPage) && (
								<div className={styles.optionsPlaceholder} aria-hidden="true" />
							)}
					</div>
				</div>
			</section>
			{isHistoryOpen && (
				<aside className={styles.historyPanel} aria-label="Dialogue history">
					<div className={styles.historyHeader}>
						<span className={styles.historyTitle}>Dialogue Archive</span>
						<button
							className={styles.historyClose}
							type="button"
							aria-label="Close dialogue archive"
							onClick={() => setIsHistoryOpen(false)}
						>
							<FiX aria-hidden="true" />
						</button>
					</div>
					<div ref={historyLinesRef} className={styles.historyLines}>
						{history.map((entry, index) => (
							<p key={`${entry.text}-${index}`} className={styles.historyLine}>
								<span>{entry.speaker}</span>
								{entry.text}
							</p>
						))}
					</div>
				</aside>
			)}
		</>
	);
}

export default DialogueBox;
