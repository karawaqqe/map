import { useEffect, useRef } from "react";

const FAR_FOG = {
	opacity: 0.58,
	speedX: 24,
	speedY: -3.5,
	parallax: 0.1,
};

const FAR_SNOW = {
	count: 12800,
	size: [0.28, 0.62],
	speedX: [115, 190],
	speedY: [10, 24],
	opacity: [0.13, 0.32],
	parallax: 0.18,
	wobble: [1, 3.5],
	stretch: [1.6, 2.4],
};

const MID_SNOW = {
	count: 5200,
	size: [0.48, 1],
	speedX: [235, 380],
	speedY: [22, 48],
	opacity: [0.22, 0.52],
	parallax: 0.38,
	wobble: [2, 6],
	stretch: [1.9, 3.2],
};

const NEAR_SNOW = {
	count: 700,
	size: [0.9, 1.65],
	largeSize: [1.7, 2.35],
	largeChance: 0.045,
	speedX: [420, 650],
	speedY: [42, 86],
	opacity: [0.34, 0.7],
	parallax: 0.78,
	wobble: [3, 9],
	stretch: [2.3, 4],
};

const GUSTS = {
	count: 920,
	length: [34, 112],
	speedX: [820, 1280],
	speedY: [18, 54],
	opacity: [0.22, 0.62],
	parallax: 0.9,
	burstDuration: 1050,
	burstGap: 1250,
	activeWindow: 0.36,
};

const QUALITY_SETTINGS = {
	cinematic: {
		particleScale: 1,
		fogOpacity: 1,
		snowOpacity: 1,
		gustOpacity: 1,
		speed: 1,
		maxDpr: 2,
	},
	balanced: {
		particleScale: 0.56,
		fogOpacity: 0.78,
		snowOpacity: 0.76,
		gustOpacity: 0.7,
		speed: 1.12,
		maxDpr: 1.5,
	},
	performance: {
		particleScale: 0.24,
		fogOpacity: 0.5,
		snowOpacity: 0.42,
		gustOpacity: 0.36,
		speed: 1.28,
		maxDpr: 1,
	},
};

function randomBetween(min, max) {
	return min + Math.random() * (max - min);
}

function createNoiseTexture() {
	const texture = document.createElement("canvas");
	const size = 256;
	const context = texture.getContext("2d");

	texture.width = size;
	texture.height = size;

	if (!context) {
		return texture;
	}

	const imageData = context.createImageData(size, size);

	for (let index = 0; index < imageData.data.length; index += 4) {
		const value = Math.floor(randomBetween(120, 255));
		const alpha = Math.floor(randomBetween(10, 44));
		imageData.data[index] = value;
		imageData.data[index + 1] = value;
		imageData.data[index + 2] = value;
		imageData.data[index + 3] = alpha;
	}

	context.putImageData(imageData, 0, 0);
	context.globalAlpha = 0.65;
	context.drawImage(texture, -12, -12, size + 24, size + 24);

	return texture;
}

function getCoverTransform(containerWidth, containerHeight, mapSize) {
	const scale = Math.max(
		containerWidth / mapSize.width,
		containerHeight / mapSize.height,
	);
	const width = mapSize.width * scale;
	const height = mapSize.height * scale;

	return {
		scale,
		x: (containerWidth - width) / 2,
		y: (containerHeight - height) / 2,
		width,
		height,
	};
}

function wrap(value, max) {
	if (value < 0) {
		return value + max;
	}

	if (value > max) {
		return value - max;
	}

	return value;
}

function createSnowParticles(config, mapSize, particleScale) {
	const count = Math.max(1, Math.round(config.count * particleScale));

	return Array.from({ length: count }, () => ({
		x: randomBetween(0, mapSize.width),
		y: randomBetween(0, mapSize.height),
		size:
			config.largeSize && Math.random() < config.largeChance
				? randomBetween(config.largeSize[0], config.largeSize[1])
				: randomBetween(config.size[0], config.size[1]),
		speedX: randomBetween(config.speedX[0], config.speedX[1]),
		speedY: randomBetween(config.speedY[0], config.speedY[1]),
		opacity: randomBetween(config.opacity[0], config.opacity[1]),
		phase: randomBetween(0, Math.PI * 2),
		wobble: randomBetween(config.wobble[0], config.wobble[1]),
		stretch: randomBetween(config.stretch[0], config.stretch[1]),
	}));
}

function createGustParticles(mapSize, particleScale) {
	const count = Math.max(1, Math.round(GUSTS.count * particleScale));

	return Array.from({ length: count }, () => ({
		x: randomBetween(0, mapSize.width),
		y: randomBetween(0, mapSize.height),
		length: randomBetween(GUSTS.length[0], GUSTS.length[1]),
		speedX: randomBetween(GUSTS.speedX[0], GUSTS.speedX[1]),
		speedY: randomBetween(GUSTS.speedY[0], GUSTS.speedY[1]),
		opacity: randomBetween(GUSTS.opacity[0], GUSTS.opacity[1]),
		delay: randomBetween(0, GUSTS.burstGap),
	}));
}

function SpindelWeatherVolume({
	mapSize,
	opacity = 1,
	quality = "cinematic",
	zIndex = 2,
}) {
	const canvasRef = useRef(null);
	const frameRef = useRef(null);
	const stateRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas) {
			return undefined;
		}

		const context = canvas.getContext("2d", { alpha: true });

		if (!context) {
			return undefined;
		}

		let isMounted = true;
		let lastTime = performance.now();
		const qualitySettings =
			QUALITY_SETTINGS[quality] ?? QUALITY_SETTINGS.cinematic;

		const state = {
			width: 0,
			height: 0,
			dpr: 1,
			transform: getCoverTransform(1, 1, mapSize),
			noise: createNoiseTexture(),
			fogOffset: { x: 0, y: 0 },
			farSnow: createSnowParticles(
				FAR_SNOW,
				mapSize,
				qualitySettings.particleScale,
			),
			midSnow: createSnowParticles(
				MID_SNOW,
				mapSize,
				qualitySettings.particleScale,
			),
			nearSnow: createSnowParticles(
				NEAR_SNOW,
				mapSize,
				qualitySettings.particleScale,
			),
			gusts: createGustParticles(mapSize, qualitySettings.particleScale),
		};

		stateRef.current = state;

		const resizeCanvas = () => {
			const parent = canvas.parentElement;
			const bounds = parent?.getBoundingClientRect() ?? canvas.getBoundingClientRect();
			const width = Math.max(1, Math.round(bounds.width));
			const height = Math.max(1, Math.round(bounds.height));
			const dpr = Math.min(window.devicePixelRatio || 1, qualitySettings.maxDpr);

			if (width === state.width && height === state.height && dpr === state.dpr) {
				return;
			}

			state.width = width;
			state.height = height;
			state.dpr = dpr;
			state.transform = getCoverTransform(width, height, mapSize);

			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			context.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const applyWorldTransform = (layerParallax = 0) => {
			const { transform, width, height, dpr } = state;
			const visibleCenterX = ((width / 2) - transform.x) / transform.scale;
			const visibleCenterY = ((height / 2) - transform.y) / transform.scale;
			const cameraOffsetX = (visibleCenterX - mapSize.width / 2) * layerParallax;
			const cameraOffsetY = (visibleCenterY - mapSize.height / 2) * layerParallax;

			context.setTransform(
				dpr * transform.scale,
				0,
				0,
				dpr * transform.scale,
				dpr * (transform.x - cameraOffsetX * transform.scale),
				dpr * (transform.y - cameraOffsetY * transform.scale),
			);
		};

		const drawFog = (deltaSeconds) => {
			state.fogOffset.x = wrap(
				state.fogOffset.x + FAR_FOG.speedX * qualitySettings.speed * deltaSeconds,
				256,
			);
			state.fogOffset.y = wrap(
				state.fogOffset.y + FAR_FOG.speedY * qualitySettings.speed * deltaSeconds,
				256,
			);

			applyWorldTransform(FAR_FOG.parallax);
			context.globalAlpha = FAR_FOG.opacity * qualitySettings.fogOpacity * opacity;
			context.fillStyle = context.createPattern(state.noise, "repeat");
			context.translate(state.fogOffset.x - 256, state.fogOffset.y - 256);
			context.fillRect(-256, -256, mapSize.width + 512, mapSize.height + 512);
			context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
		};

		const drawSnowLayer = (particles, config, deltaSeconds) => {
			applyWorldTransform(config.parallax);
			context.fillStyle = "#f7fbff";

			particles.forEach((particle) => {
				particle.phase += deltaSeconds * 1.8;
				particle.x = wrap(
					particle.x +
						particle.speedX * qualitySettings.speed * deltaSeconds +
						Math.sin(particle.phase) * 0.42,
					mapSize.width,
				);
				particle.y = wrap(
					particle.y + particle.speedY * qualitySettings.speed * deltaSeconds,
					mapSize.height,
				);

				context.globalAlpha =
					particle.opacity * qualitySettings.snowOpacity * opacity;
				const x = particle.x + Math.sin(particle.phase) * particle.wobble;
				const width = Math.max(0.7, particle.size * particle.stretch);
				const height = Math.max(0.45, particle.size * 0.78);
				context.fillRect(x, particle.y, width, height);
			});

			context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
		};

		const drawGusts = (elapsed, deltaSeconds) => {
			const burstTime = elapsed % (GUSTS.burstDuration + GUSTS.burstGap);

			if (burstTime > GUSTS.burstDuration) {
				return;
			}

			const burstStrength = Math.sin((burstTime / GUSTS.burstDuration) * Math.PI);

			applyWorldTransform(GUSTS.parallax);
			context.lineCap = "round";
			context.strokeStyle = "#f8fcff";

			state.gusts.forEach((particle) => {
				const localBurst =
					((burstTime + particle.delay) % GUSTS.burstDuration) /
					GUSTS.burstDuration;

				if (localBurst > GUSTS.activeWindow) {
					return;
				}

				particle.x = wrap(
					particle.x + particle.speedX * qualitySettings.speed * deltaSeconds,
					mapSize.width,
				);
				particle.y = wrap(
					particle.y + particle.speedY * qualitySettings.speed * deltaSeconds,
					mapSize.height,
				);
				const localStrength = Math.sin((localBurst / GUSTS.activeWindow) * Math.PI);
				context.globalAlpha =
					particle.opacity *
					qualitySettings.gustOpacity *
					Math.max(burstStrength, 0.35) *
					localStrength *
					opacity;
				context.lineWidth = 0.72;
				context.beginPath();
				context.moveTo(particle.x, particle.y);
				context.lineTo(particle.x - particle.length, particle.y - particle.length * 0.13);
				context.stroke();
			});

			context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
		};

		const draw = (timestamp) => {
			if (!isMounted) {
				return;
			}

			const deltaSeconds = Math.min((timestamp - lastTime) / 1000, 0.05);
			const elapsed = timestamp;
			lastTime = timestamp;

			context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
			context.clearRect(0, 0, state.width, state.height);
			context.globalCompositeOperation = "source-over";
			context.globalAlpha = 1;

			drawFog(deltaSeconds);
			drawSnowLayer(state.farSnow, FAR_SNOW, deltaSeconds);
			drawSnowLayer(state.midSnow, MID_SNOW, deltaSeconds);
			drawSnowLayer(state.nearSnow, NEAR_SNOW, deltaSeconds);
			drawGusts(elapsed, deltaSeconds);

			frameRef.current = window.requestAnimationFrame(draw);
		};

		resizeCanvas();

		const observer =
			typeof ResizeObserver !== "undefined"
				? new ResizeObserver(resizeCanvas)
				: null;

		if (observer && canvas.parentElement) {
			observer.observe(canvas.parentElement);
		}

		window.addEventListener("resize", resizeCanvas);
		frameRef.current = window.requestAnimationFrame(draw);

		return () => {
			isMounted = false;

			if (frameRef.current) {
				window.cancelAnimationFrame(frameRef.current);
			}

			observer?.disconnect();
			window.removeEventListener("resize", resizeCanvas);
			context.clearRect(0, 0, canvas.width, canvas.height);
			stateRef.current = null;
		};
	}, [mapSize, opacity, quality]);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			style={{
				position: "absolute",
				inset: 0,
				zIndex,
				display: "block",
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				background: "transparent",
			}}
		/>
	);
}

export default SpindelWeatherVolume;
