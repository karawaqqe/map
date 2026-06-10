import { useCallback, useState } from "react";

function getSessionDialogKey(dialogId) {
	return `dialog_seen_${dialogId}`;
}

function readSessionDialogMemory(dialogId) {
	if (typeof window === "undefined") {
		return false;
	}

	return window.sessionStorage.getItem(getSessionDialogKey(dialogId)) === "true";
}

function useSessionDialogMemory(dialogId) {
	const [hasSeenDialog, setHasSeenDialog] = useState(() =>
		readSessionDialogMemory(dialogId),
	);

	const markDialogAsSeen = useCallback(() => {
		if (typeof window !== "undefined") {
			window.sessionStorage.setItem(getSessionDialogKey(dialogId), "true");
		}

		setHasSeenDialog(true);
	}, [dialogId]);

	return [hasSeenDialog, markDialogAsSeen];
}

export default useSessionDialogMemory;
