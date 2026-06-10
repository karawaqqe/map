import { useEffect, useRef } from "react";

const INTENSITY_CONFIG = {
	light: {
		density: 0.00018,
		maxParticles: 900,
		speed: [28, 74],
		size: [0.65, 1.8],
		turbulence: 8,
		windMultiplier: 0.75,
		haze: 0,
	},
	medium: {
		density: 0.00042,
		maxParticles: 1700,
		speed: [44, 118],
		size: [0.8, 2.5],
		turbulence: 14,
		windMultiplier: 1,
		haze: 0,
	},
	storm: {
		density: 0.0009,
		maxParticles: 3200,
		speed: [72, 178],
		size: [0.9, 3.4],
		turbulence: 28,
		windMultiplier: 1.85,
		haze: 0.18,
	},
};

const MIN_PARTICLES = {
	light: 240,
	medium: 700,
	storm: 1800,
};

function randomBetween(min, max) {
	return min + Math.random() * (max - min);
}

function getConfig(intensity) {
	return INTENSITY_CONFIG[intensity] ?? INTENSITY_CONFIG.medium;
}

function getParticleCount(width, height, intensity) {
	const config = getConfig(intensity);
	const area = width * height;

	return Math.min(
		config.maxParticles,
		Math.max(
			MIN_PARTICLES[intensity] ?? MIN_PARTICLES.medium,
			area * config.density,
		),
	);
}

function SnowOverlay({
	intensity = "medium",
	wind = 0,
	opacity = 1,
	zIndex = 2,
}) {
	const canvasRef = useRef(null);
	const animationFrameRef = useRef(null);
	const particlesRef = useRef(null);
	const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas) {
			return undefined;
		}

		const context = canvas.getContext("2d", { alpha: true });

		if (!context) {
			return undefined;
		}

		const config = getConfig(intensity);
		const particleState = {
			x: new Float32Array(0),
			y: new Float32Array(0),
			size: new Float32Array(0),
			speed: new Float32Array(0),
			drift: new Float32Array(0),
			phase: new Float32Array(0),
			turbulence: new Float32Array(0),
		};
		particlesRef.current = particleState;

		const resetParticle = (index, width, height, placeAbove = false) => {
			particleState.x[index] = randomBetween(-width * 0.12, width * 1.12);
			particleState.y[index] = placeAbove
				? randomBetween(-height * 0.26, -8)
				: randomBetween(0, height);
			particleState.size[index] = randomBetween(config.size[0], config.size[1]);
			particleState.speed[index] = randomBetween(
				config.speed[0],
				config.speed[1],
			);
			particleState.drift[index] = randomBetween(-16, 16);
			particleState.phase[index] = randomBetween(0, Math.PI * 2);
			particleState.turbulence[index] = randomBetween(
				config.turbulence * 0.35,
				config.turbulence,
			);
		};

		const seedParticles = (width, height) => {
			const count = Math.round(getParticleCount(width, height, intensity));

			particleState.x = new Float32Array(count);
			particleState.y = new Float32Array(count);
			particleState.size = new Float32Array(count);
			particleState.speed = new Float32Array(count);
			particleState.drift = new Float32Array(count);
			particleState.phase = new Float32Array(count);
			particleState.turbulence = new Float32Array(count);

			for (let index = 0; index < count; index += 1) {
				resetParticle(index, width, height);
			}
		};

		const resizeCanvas = () => {
			const parent = canvas.parentElement;
			const bounds =
				parent?.getBoundingClientRect() ?? canvas.getBoundingClientRect();
			const width = Math.max(1, Math.round(bounds.width));
			const height = Math.max(1, Math.round(bounds.height));
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const hasSizeChanged =
				width !== sizeRef.current.width ||
				height !== sizeRef.current.height ||
				dpr !== sizeRef.current.dpr;

			if (!hasSizeChanged) {
				return;
			}

			sizeRef.current = { width, height, dpr };
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			context.setTransform(dpr, 0, 0, dpr, 0, 0);
			seedParticles(width, height);
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

		let lastTime = performance.now();

		const draw = (timestamp) => {
			const { width, height } = sizeRef.current;

			if (!width || !height) {
				animationFrameRef.current = window.requestAnimationFrame(draw);
				return;
			}

			const deltaSeconds = Math.min((timestamp - lastTime) / 1000, 0.05);
			lastTime = timestamp;

			context.clearRect(0, 0, width, height);

			if (config.haze > 0) {
				const hazeGradient = context.createLinearGradient(0, 0, width, height);
				hazeGradient.addColorStop(
					0,
					`rgba(220, 239, 255, ${config.haze * opacity})`,
				);
				hazeGradient.addColorStop(
					0.52,
					`rgba(242, 249, 255, ${config.haze * 0.48 * opacity})`,
				);
				hazeGradient.addColorStop(
					1,
					`rgba(192, 219, 238, ${config.haze * opacity})`,
				);
				context.fillStyle = hazeGradient;
				context.fillRect(0, 0, width, height);
			}

			context.fillStyle = `rgba(245, 250, 255, ${Math.min(1, opacity)})`;

			const count = particleState.x.length;
			const windForce = wind * config.windMultiplier;

			for (let index = 0; index < count; index += 1) {
				particleState.phase[index] += deltaSeconds * 2.1;

				const turbulence =
					Math.sin(particleState.phase[index]) *
					particleState.turbulence[index] *
					deltaSeconds;
				const horizontalVelocity = windForce + particleState.drift[index];

				particleState.x[index] +=
					horizontalVelocity * deltaSeconds + turbulence;
				particleState.y[index] += particleState.speed[index] * deltaSeconds;

				if (
					particleState.y[index] > height + 12 ||
					particleState.x[index] < -width * 0.18 ||
					particleState.x[index] > width * 1.18
				) {
					resetParticle(index, width, height, true);
				}

				context.beginPath();
				context.arc(
					particleState.x[index],
					particleState.y[index],
					particleState.size[index],
					0,
					Math.PI * 2,
				);
				context.fill();
			}

			// Future weather systems can branch here: rain streaks, rolling fog,
			// sandstorm grit, or ashstorm embers can reuse the same canvas lifecycle.
			animationFrameRef.current = window.requestAnimationFrame(draw);
		};

		animationFrameRef.current = window.requestAnimationFrame(draw);

		return () => {
			if (animationFrameRef.current) {
				window.cancelAnimationFrame(animationFrameRef.current);
			}

			observer?.disconnect();
			window.removeEventListener("resize", resizeCanvas);
			context.clearRect(0, 0, canvas.width, canvas.height);
			particlesRef.current = null;
		};
	}, [intensity, opacity, wind]);

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

export default SnowOverlay;
