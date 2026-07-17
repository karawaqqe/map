const loadedAssets = new Set();
const imageExtensions = new Set(["avif", "gif", "jpeg", "jpg", "png", "svg", "webp"]);

function getAssetExtension(url) {
	const pathname = url.split("?")[0].split("#")[0];
	const extension = pathname.split(".").pop();

	return extension ? extension.toLowerCase() : "";
}

function withTimeout(loader, timeoutMs) {
	return new Promise((resolve) => {
		let settled = false;
		const timeoutId = window.setTimeout(() => {
			if (!settled) {
				settled = true;
				resolve();
			}
		}, timeoutMs);

		loader()
			.catch(() => {})
			.finally(() => {
				if (settled) {
					return;
				}

				settled = true;
				window.clearTimeout(timeoutId);
				resolve();
			});
	});
}

function preloadImage(url) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.decoding = "async";
		image.onload = resolve;
		image.onerror = reject;
		image.src = url;
	});
}

function preloadFile(url) {
	return fetch(url, { cache: "force-cache" }).then((response) => {
		if (!response.ok) {
			throw new Error(`Unable to preload ${url}`);
		}
	});
}

function preloadAsset(url, timeoutMs) {
	if (!url || loadedAssets.has(url)) {
		return Promise.resolve();
	}

	const extension = getAssetExtension(url);
	const loader = imageExtensions.has(extension)
		? () => preloadImage(url)
		: () => preloadFile(url);

	return withTimeout(loader, timeoutMs).then(() => {
		loadedAssets.add(url);
	});
}

export function preloadAssets(assets, onProgress, { timeoutMs = 25000 } = {}) {
	const uniqueAssets = [...new Set(assets.filter(Boolean))];
	const total = uniqueAssets.length;
	let completed = 0;

	if (!total) {
		onProgress?.(1);
		return Promise.resolve();
	}

	onProgress?.(0);

	return Promise.all(
		uniqueAssets.map((asset) =>
			preloadAsset(asset, timeoutMs).then(() => {
				completed += 1;
				onProgress?.(completed / total);
			}),
		),
	).then(() => undefined);
}
