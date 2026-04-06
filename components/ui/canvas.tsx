"use client";

type Point = {
  x: number;
  y: number;
};

type CanvasContext = CanvasRenderingContext2D & {
  running?: boolean;
  frame?: number;
};

class Oscillator {
  private phase: number;
  private readonly offset: number;
  private readonly frequency: number;
  private readonly amplitude: number;
  private currentValue: number;

  constructor({
    phase = 0,
    offset = 0,
    frequency = 0.001,
    amplitude = 1,
  }: Partial<{
    phase: number;
    offset: number;
    frequency: number;
    amplitude: number;
  }> = {}) {
    this.phase = phase;
    this.offset = offset;
    this.frequency = frequency;
    this.amplitude = amplitude;
    this.currentValue = offset;
  }

  update() {
    this.phase += this.frequency;
    this.currentValue = this.offset + Math.sin(this.phase) * this.amplitude;

    return this.currentValue;
  }
}

class NodePoint {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
}

const SETTINGS = {
  friction: 0.5,
  trails: 24,
  size: 36,
  dampening: 0.025,
  tension: 0.98,
};

let context: CanvasContext | null = null;
let hueOscillator: Oscillator | null = null;
let pointer: Point = { x: 0, y: 0 };
let lines: Line[] = [];
let animationFrameId: number | null = null;
let hasInteracted = false;

class Line {
  private spring: number;
  private friction: number;
  private readonly nodes: NodePoint[];

  constructor(spring: number) {
    this.spring = spring + 0.1 * Math.random() - 0.05;
    this.friction = SETTINGS.friction + 0.01 * Math.random() - 0.005;
    this.nodes = Array.from({ length: SETTINGS.size }, () => {
      const node = new NodePoint();
      node.x = pointer.x;
      node.y = pointer.y;
      return node;
    });
  }

  update() {
    let spring = this.spring;
    let node = this.nodes[0];

    node.vx += (pointer.x - node.x) * spring;
    node.vy += (pointer.y - node.y) * spring;

    for (let index = 0; index < this.nodes.length; index += 1) {
      node = this.nodes[index];

      if (index > 0) {
        const previous = this.nodes[index - 1];
        node.vx += (previous.x - node.x) * spring;
        node.vy += (previous.y - node.y) * spring;
        node.vx += previous.vx * SETTINGS.dampening;
        node.vy += previous.vy * SETTINGS.dampening;
      }

      node.vx *= this.friction;
      node.vy *= this.friction;
      node.x += node.vx;
      node.y += node.vy;
      spring *= SETTINGS.tension;
    }
  }

  draw(ctx: CanvasContext) {
    let currentNode = this.nodes[0];
    let nextNode = this.nodes[1];
    let x = currentNode.x;
    let y = currentNode.y;

    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let index = 1; index < this.nodes.length - 2; index += 1) {
      currentNode = this.nodes[index];
      nextNode = this.nodes[index + 1];
      x = (currentNode.x + nextNode.x) * 0.5;
      y = (currentNode.y + nextNode.y) * 0.5;
      ctx.quadraticCurveTo(currentNode.x, currentNode.y, x, y);
    }

    const penultimate = this.nodes[this.nodes.length - 2];
    const last = this.nodes[this.nodes.length - 1];
    ctx.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y);
    ctx.stroke();
    ctx.closePath();
  }
}

function seedLines() {
  lines = Array.from(
    { length: SETTINGS.trails },
    (_, index) => new Line(0.45 + (index / SETTINGS.trails) * 0.025),
  );
}

function resizeCanvas() {
  if (!context?.canvas) {
    return;
  }

  context.canvas.width = window.innerWidth;
  context.canvas.height = Math.max(window.innerHeight, document.body.scrollHeight);
}

function drawFrame() {
  if (!context?.running || !hueOscillator) {
    return;
  }

  context.globalCompositeOperation = "source-over";
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = `hsla(${Math.round(hueOscillator.update())}, 100%, 50%, 0.035)`;
  context.lineWidth = 8;

  for (const line of lines) {
    line.update();
    line.draw(context);
  }

  context.frame = (context.frame ?? 0) + 1;
  animationFrameId = window.requestAnimationFrame(drawFrame);
}

function updatePointer(clientX: number, clientY: number) {
  pointer = { x: clientX, y: clientY };

  if (!hasInteracted) {
    hasInteracted = true;
    seedLines();
    drawFrame();
  }
}

function handlePointerMove(event: MouseEvent | TouchEvent) {
  if ("touches" in event) {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    updatePointer(touch.clientX, touch.clientY);
    return;
  }

  updatePointer(event.clientX, event.clientY);
}

function handleFocus() {
  if (!context || context.running) {
    return;
  }

  context.running = true;
  drawFrame();
}

function handleBlur() {
  if (context) {
    context.running = false;
  }

  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

export function renderCanvas() {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
  if (!canvas) {
    return () => undefined;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    return () => undefined;
  }

  const nextContext = canvas.getContext("2d");
  if (!nextContext) {
    return () => undefined;
  }

  context = nextContext as CanvasContext;
  context.running = false;
  context.frame = 0;

  const initialX = window.innerWidth / 2;
  const initialY = Math.min(window.innerHeight * 0.45, 420);
  pointer = { x: initialX, y: initialY };

  hueOscillator = new Oscillator({
    phase: Math.random() * Math.PI * 2,
    amplitude: 60,
    frequency: 0.0015,
    offset: 210,
  });

  hasInteracted = false;
  seedLines();
  resizeCanvas();

  const onMove = (event: MouseEvent) => handlePointerMove(event);
  const onTouchMove = (event: TouchEvent) => handlePointerMove(event);
  const onTouchStart = (event: TouchEvent) => handlePointerMove(event);

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", resizeCanvas);
  window.addEventListener("focus", handleFocus);
  window.addEventListener("blur", handleBlur);

  context.running = true;
  drawFrame();

  return () => {
    handleBlur();
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("orientationchange", resizeCanvas);
    window.removeEventListener("focus", handleFocus);
    window.removeEventListener("blur", handleBlur);
    context = null;
    hueOscillator = null;
    lines = [];
    hasInteracted = false;
  };
}
