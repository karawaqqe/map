import { useEffect, useRef } from "react";

const BLIZZARD_CONFIG = {
	density: 0.00115,
	minParticles: 1400,
	maxParticles: 3600,
	speed: [420, 860],
	length: [16, 54],
	width: [0.55, 1.8],
	turbulence: [18, 52],
	hazeOpacity: 0.1,
};

function randomBetween(min, max) {
	return min + Math.random() * (max - min);
}

function getParticleCount(width, height) {
	return Math.min(
		BLIZZARD_CONFIG.maxParticles,
		Math.max(
			BLIZZARD_CONFIG.minParticles,
			width * height * BLIZZARD_CONFIG.density,
		),
	);
}

function BlizzardOverlay({ wind = 360, opacity = 0.78, zIndex = 2 }) {
	const canvasRef = useRef(null);
	const animationFrameRef = useRef(null);
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

		const particles = {
			x: new Float32Array(0),
			y: new Float32Array(0),
			speed: new Float32Array(0),
			length: new Float32Array(0),
			width: new Float32Array(0),
			phase: new Float32Array(0),
			turbulence: new Float32Array(0),
		};

		const resetParticle = (index, width, height, enterFromLeft = false) => {
			particles.x[index] = enterFromLeft
				? randomBetween(-width * 0.42, -12)
				: randomBetween(-width * 0.32, width * 1.08);
			particles.y[index] = randomBetween(-height * 0.12, height * 1.12);
			particles.speed[index] = randomBetween(
				BLIZZARD_CONFIG.speed[0],
				BLIZZARD_CONFIG.speed[1],
			);
			particles.length[index] = randomBetween(
				BLIZZARD_CONFIG.length[0],
				BLIZZARD_CONFIG.length[1],
			);
			particles.width[index] = randomBetween(
				BLIZZARD_CONFIG.width[0],
				BLIZZARD_CONFIG.width[1],
			);
			particles.phase[index] = randomBetween(0, Math.PI * 2);
			particles.turbulence[index] = randomBetween(
				BLIZZARD_CONFIG.turbulence[0],
				BLIZZARD_CONFIG.turbulence[1],
			);
		};

		const seedParticles = (width, height) => {
			const count = Math.round(getParticleCount(width, height));

			particles.x = new Float32Array(count);
			particles.y = new Float32Array(count);
			particles.speed = new Float32Array(count);
			particles.length = new Float32Array(count);
			particles.width = new Float32Array(count);
			particles.phase = new Float32Array(count);
			particles.turbulence = new Float32Array(count);

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

			const haze = context.createLinearGradient(0, 0, width, height);
			haze.addColorStop(
				0,
				`rgba(225, 241, 255, ${BLIZZARD_CONFIG.hazeOpacity * opacity})`,
			);
			haze.addColorStop(
				0.48,
				`rgba(247, 251, 255, ${BLIZZARD_CONFIG.hazeOpacity * 0.56 * opacity})`,
			);
			haze.addColorStop(
				1,
				`rgba(180, 211, 235, ${BLIZZARD_CONFIG.hazeOpacity * opacity})`,
			);
			context.fillStyle = haze;
			context.fillRect(0, 0, width, height);

			context.lineCap = "round";
			context.strokeStyle = `rgba(247, 252, 255, ${Math.min(1, opacity)})`;

			const count = particles.x.length;
			const downwardDrift = Math.max(80, wind * 0.26);

			for (let index = 0; index < count; index += 1) {
				particles.phase[index] += deltaSeconds * 7.5;

				const turbulence =
					Math.sin(particles.phase[index]) *
					particles.turbulence[index] *
					deltaSeconds;
				const xVelocity = wind + particles.speed[index] * 0.42;
				const yVelocity = downwardDrift + particles.speed[index] * 0.18;

				particles.x[index] += xVelocity * deltaSeconds + turbulence;
				particles.y[index] += yVelocity * deltaSeconds;

				if (
					particles.x[index] > width * 1.18 ||
					particles.y[index] > height * 1.16
				) {
					resetParticle(index, width, height, true);
				}

				const streakLength = particles.length[index];
				const angleX = streakLength;
				const angleY = streakLength * 0.38;

				context.lineWidth = particles.width[index];
				context.beginPath();
				context.moveTo(particles.x[index], particles.y[index]);
				context.lineTo(
					particles.x[index] - angleX,
					particles.y[index] - angleY,
				);
				context.stroke();
			}

			// Future high-wind variants can branch here: sideways rain, ash gusts,
			// sand blast bands, or low-visibility fog sheets.
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
		};
	}, [opacity, wind]);

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

export default BlizzardOverlay;
