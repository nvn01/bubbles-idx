import { type BubbleStyle } from "~/styles/themes";

export interface StockData {
    id: number;
    symbol: string;
    name: string;
    price: number;
    change: number; // Based on selected timeframe
}

interface Bubble {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    targetRadius: number;
    symbol: string;
    name: string;
    price: number;
    change: number;
    isDragging: boolean;
    dragOffsetX: number;
    dragOffsetY: number;
    directionChangeTimer: number;
    targetVx: number;
    targetVy: number;
}

export class BubblePhysics {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    bubbles: Bubble[] = [];
    draggedBubble: Bubble | null = null;
    mouseX = 0;
    mouseY = 0;
    private canvasWidth: number;
    private canvasHeight: number;
    private bubbleStyle: BubbleStyle;

    constructor(
        canvas: HTMLCanvasElement,
        initialData: StockData[],
        bubbleStyle: BubbleStyle
    ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.bubbleStyle = bubbleStyle;
        this.initializeBubbles(initialData);
        this.setupEventListeners();
    }

    updateBubbleStyle(newStyle: BubbleStyle) {
        this.bubbleStyle = newStyle;
    }

    private calculateRadius(changePercent: number): number {
        const absChange = Math.abs(changePercent);
        const minDimension = Math.min(this.canvasWidth, this.canvasHeight);

        let sizeMultiplier = 1.0;
        if (minDimension < 600) {
            sizeMultiplier = 0.5 + (minDimension / 600) * 0.25;
        } else if (minDimension < 1000) {
            sizeMultiplier = 0.75 + ((minDimension - 600) / 400) * 0.25;
        }

        const baseRadius = 20 * sizeMultiplier;
        const radiusVariation = 25 * sizeMultiplier;

        const scaleFactor = Math.min(absChange / 20, 1.5);
        return baseRadius + radiusVariation * scaleFactor;
    }

    private initializeBubbles(data: StockData[]) {
        this.bubbles = [];

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        data.forEach((item, index) => {
            const angle = (index / data.length) * Math.PI * 2;
            const distance = 250 + Math.random() * 450;
            const radius = this.calculateRadius(item.change);

            const velocityScale = 1.5 / (1 + radius / 30);
            const initialAngle = Math.random() * Math.PI * 2;
            const initialSpeed = (Math.random() * 1.5 + 0.5) * velocityScale;

            this.bubbles.push({
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                vx: Math.cos(initialAngle) * initialSpeed,
                vy: Math.sin(initialAngle) * initialSpeed,
                radius: radius,
                targetRadius: radius,
                symbol: item.symbol,
                name: item.name,
                price: item.price,
                change: item.change,
                isDragging: false,
                dragOffsetX: 0,
                dragOffsetY: 0,
                directionChangeTimer: Math.random() * 60 + 60,
                targetVx: Math.cos(initialAngle) * initialSpeed,
                targetVy: Math.sin(initialAngle) * initialSpeed,
            });
        });
    }

    private setupEventListeners() {
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;

            if (this.draggedBubble) {
                this.draggedBubble.x = this.mouseX - this.draggedBubble.dragOffsetX;
                this.draggedBubble.y = this.mouseY - this.draggedBubble.dragOffsetY;
            }
        });

        this.canvas.addEventListener("mousedown", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            for (let i = this.bubbles.length - 1; i >= 0; i--) {
                const bubble = this.bubbles[i];
                if (!bubble) continue;
                const dx = x - bubble.x;
                const dy = y - bubble.y;
                if (dx * dx + dy * dy <= bubble.radius * bubble.radius) {
                    this.draggedBubble = bubble;
                    bubble.isDragging = true;
                    bubble.dragOffsetX = dx;
                    bubble.dragOffsetY = dy;
                    break;
                }
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            if (this.draggedBubble) {
                this.draggedBubble.isDragging = false;
            }
            this.draggedBubble = null;
        });

        this.canvas.addEventListener("mouseleave", () => {
            if (this.draggedBubble) {
                this.draggedBubble.isDragging = false;
            }
            this.draggedBubble = null;
        });

        // Touch support
        this.canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            if (!touch) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            for (let i = this.bubbles.length - 1; i >= 0; i--) {
                const bubble = this.bubbles[i];
                if (!bubble) continue;
                const dx = x - bubble.x;
                const dy = y - bubble.y;
                if (dx * dx + dy * dy <= bubble.radius * bubble.radius) {
                    this.draggedBubble = bubble;
                    bubble.isDragging = true;
                    bubble.dragOffsetX = dx;
                    bubble.dragOffsetY = dy;
                    break;
                }
            }
        });

        this.canvas.addEventListener("touchmove", (e) => {
            e.preventDefault();
            if (this.draggedBubble) {
                const touch = e.touches[0];
                if (!touch) return;
                const rect = this.canvas.getBoundingClientRect();
                this.draggedBubble.x = touch.clientX - rect.left - this.draggedBubble.dragOffsetX;
                this.draggedBubble.y = touch.clientY - rect.top - this.draggedBubble.dragOffsetY;
            }
        });

        this.canvas.addEventListener("touchend", () => {
            if (this.draggedBubble) {
                this.draggedBubble.isDragging = false;
            }
            this.draggedBubble = null;
        });
    }

    private calculateAvailableSpace() {
        const canvasArea = this.canvasWidth * this.canvasHeight;
        const totalBubbleArea = this.bubbles.reduce(
            (sum, bubble) => sum + Math.PI * bubble.radius * bubble.radius,
            0
        );
        const filledPercentage = totalBubbleArea / canvasArea;
        const targetFillPercentage = 0.75;

        if (filledPercentage < targetFillPercentage) {
            const scaleNeeded = Math.sqrt(targetFillPercentage / Math.max(filledPercentage, 0.01));

            this.bubbles.forEach((bubble) => {
                const newRadius = bubble.radius * scaleNeeded;
                const maxPossible = Math.min(this.canvasWidth, this.canvasHeight) * 0.25;
                bubble.radius = Math.min(newRadius, maxPossible);
            });
        }
    }

    update() {
        const friction = 0.993;
        const minDimension = Math.min(this.canvasWidth, this.canvasHeight);
        const velocityDamping = minDimension < 600 ? 0.97 : 0.98;

        this.calculateAvailableSpace();

        this.bubbles.forEach((bubble) => {
            const radiusDifference = bubble.targetRadius - bubble.radius;
            if (Math.abs(radiusDifference) > 0.1) {
                bubble.radius += radiusDifference * 0.05;
            } else {
                bubble.radius = bubble.targetRadius;
            }

            if (bubble.isDragging) {
                bubble.vx *= 0.95;
                bubble.vy *= 0.95;
                return;
            }

            const sizeInfluence = Math.min(bubble.radius / 50, 1);
            const adaptiveDamping = velocityDamping - sizeInfluence * 0.04;

            bubble.directionChangeTimer--;
            if (bubble.directionChangeTimer <= 0) {
                const newAngle = Math.random() * Math.PI * 2;
                const newSpeed = Math.random() * 1.5 + 0.5;
                bubble.targetVx = Math.cos(newAngle) * newSpeed;
                bubble.targetVy = Math.sin(newAngle) * newSpeed;
                bubble.directionChangeTimer = Math.random() * 60 + 60;
            }

            const directionLerpSpeed = 0.02;
            bubble.vx += (bubble.targetVx - bubble.vx) * directionLerpSpeed;
            bubble.vy += (bubble.targetVy - bubble.vy) * directionLerpSpeed;

            bubble.vx *= adaptiveDamping;
            bubble.vx *= friction;
            bubble.vy *= adaptiveDamping;
            bubble.vy *= friction;

            bubble.x += bubble.vx;
            bubble.y += bubble.vy;

            if (bubble.x - bubble.radius < 0) {
                bubble.x = bubble.radius;
                bubble.vx *= -0.8;
            }
            if (bubble.x + bubble.radius > this.canvasWidth) {
                bubble.x = this.canvasWidth - bubble.radius;
                bubble.vx *= -0.8;
            }
            if (bubble.y - bubble.radius < 0) {
                bubble.y = bubble.radius;
                bubble.vy *= -0.8;
            }
            if (bubble.y + bubble.radius > this.canvasHeight) {
                bubble.y = this.canvasHeight - bubble.radius;
                bubble.vy *= -0.8;
            }
        });

        for (let i = 0; i < this.bubbles.length; i++) {
            for (let j = i + 1; j < this.bubbles.length; j++) {
                const b1 = this.bubbles[i];
                const b2 = this.bubbles[j];
                if (b1 && b2) {
                    this.collide(b1, b2);
                }
            }
        }
    }

    private collide(b1: Bubble, b2: Bubble) {
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = b1.radius + b2.radius + 2;

        if (distance < minDistance) {
            const overlap = minDistance - distance;
            const angle = Math.atan2(dy, dx);
            const pushX = Math.cos(angle) * overlap * 0.5;
            const pushY = Math.sin(angle) * overlap * 0.5;

            if (!b1.isDragging) {
                b1.x -= pushX;
                b1.y -= pushY;
            }
            if (!b2.isDragging) {
                b2.x += pushX;
                b2.y += pushY;
            }

            const minDimension = Math.min(this.canvasWidth, this.canvasHeight);
            const collisionForce = minDimension < 600 ? 1 : 2;

            if (b1.isDragging && !b2.isDragging) {
                b2.vx += (dx / distance) * collisionForce;
                b2.vy += (dy / distance) * collisionForce;
            } else if (!b1.isDragging && b2.isDragging) {
                b1.vx -= (dx / distance) * collisionForce;
                b1.vy -= (dy / distance) * collisionForce;
            }
        }
    }

    render() {
        // Clear canvas with transparent background (theme handles the bg color)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw bubbles
        this.bubbles.forEach((bubble) => {
            const isPositive = bubble.change >= 0;
            const borderColor = isPositive
                ? this.bubbleStyle.positiveColor
                : this.bubbleStyle.negativeColor;
            const glowColor = isPositive
                ? this.bubbleStyle.positiveGlow
                : this.bubbleStyle.negativeGlow;
            const changeColor = isPositive
                ? this.bubbleStyle.positiveColor
                : this.bubbleStyle.negativeColor;

            // Draw glow
            const gradient = this.ctx.createRadialGradient(
                bubble.x,
                bubble.y,
                0,
                bubble.x,
                bubble.y,
                bubble.radius * 1.5
            );
            gradient.addColorStop(0, glowColor);
            gradient.addColorStop(1, "transparent");
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                bubble.x - bubble.radius * 1.5,
                bubble.y - bubble.radius * 1.5,
                bubble.radius * 3,
                bubble.radius * 3
            );

            // Draw bubble border
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = this.bubbleStyle.borderWidth;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Draw bubble fill
            this.ctx.fillStyle = this.bubbleStyle.fillColor;
            this.ctx.beginPath();
            this.ctx.arc(
                bubble.x,
                bubble.y,
                bubble.radius - this.bubbleStyle.borderWidth,
                0,
                Math.PI * 2
            );
            this.ctx.fill();

            // Draw text
            this.ctx.fillStyle = this.bubbleStyle.textColor;
            this.ctx.font = "bold 18px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(bubble.symbol, bubble.x, bubble.y - 8);

            // Draw change percentage
            this.ctx.fillStyle = changeColor;
            this.ctx.font = "12px Arial";
            this.ctx.fillText(
                `${bubble.change > 0 ? "+" : ""}${bubble.change.toFixed(2)}%`,
                bubble.x,
                bubble.y + 12
            );
        });
    }

    // Update data from WebSocket/API
    updateData(newData: StockData[]) {
        newData.forEach((item) => {
            const bubble = this.bubbles.find((b) => b.symbol === item.symbol);
            if (bubble) {
                bubble.change = item.change;
                bubble.price = item.price;
                bubble.targetRadius = this.calculateRadius(item.change);
            } else {
                // New stock added - create bubble
                const angle = Math.random() * Math.PI * 2;
                const distance = 250 + Math.random() * 450;
                const radius = this.calculateRadius(item.change);
                const velocityScale = 1.5 / (1 + radius / 30);
                const initialAngle = Math.random() * Math.PI * 2;
                const initialSpeed = (Math.random() * 1.5 + 0.5) * velocityScale;

                this.bubbles.push({
                    x: this.canvasWidth / 2 + Math.cos(angle) * distance,
                    y: this.canvasHeight / 2 + Math.sin(angle) * distance,
                    vx: Math.cos(initialAngle) * initialSpeed,
                    vy: Math.sin(initialAngle) * initialSpeed,
                    radius: radius,
                    targetRadius: radius,
                    symbol: item.symbol,
                    name: item.name,
                    price: item.price,
                    change: item.change,
                    isDragging: false,
                    dragOffsetX: 0,
                    dragOffsetY: 0,
                    directionChangeTimer: Math.random() * 60 + 60,
                    targetVx: Math.cos(initialAngle) * initialSpeed,
                    targetVy: Math.sin(initialAngle) * initialSpeed,
                });
            }
        });
    }

    updateCanvasBounds(width: number, height: number) {
        const oldCenterX = this.canvasWidth / 2;
        const oldCenterY = this.canvasHeight / 2;
        const newCenterX = width / 2;
        const newCenterY = height / 2;

        this.canvasWidth = width;
        this.canvasHeight = height;

        this.bubbles.forEach((bubble) => {
            bubble.x = newCenterX + (bubble.x - oldCenterX);
            bubble.y = newCenterY + (bubble.y - oldCenterY);
            bubble.targetRadius = this.calculateRadius(bubble.change);
        });
    }
}
