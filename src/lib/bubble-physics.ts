import { type BubbleStyle } from "~/styles/themes"

export interface Bubble {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    targetRadius: number
    symbol: string
    name: string
    change: number
    price: number
    changes: { h: number; d: number; w: number; m: number; y: number }
    isDragging: boolean
    dragOffsetX: number
    dragOffsetY: number
    directionChangeTimer: number
    targetVx: number
    targetVy: number
}

export interface TickerData {
    symbol: string
    name: string
    price: number
    h: number
    d: number
    w: number
    m: number
    y: number
}


export type TimePeriod = "1H" | "1D" | "1W" | "1M" | "1Y"

export class BubblePhysics {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    bubbles: Bubble[] = []
    draggedBubble: Bubble | null = null
    mouseX = 0
    mouseY = 0
    timePeriod: TimePeriod
    private canvasWidth: number
    private canvasHeight: number
    private bubbleStyle: BubbleStyle
    private onBubbleDoubleClick?: (bubble: Bubble) => void
    private lastClickTime = 0
    private lastClickedBubble: Bubble | null = null
    private tickerData: TickerData[] = []
    private obstacle: { x: number, y: number, width: number, height: number } | null = null

    constructor(
        canvas: HTMLCanvasElement,
        timePeriod: TimePeriod = "1D",
        bubbleStyle: BubbleStyle,
        onBubbleDoubleClick?: (bubble: Bubble) => void,
        initialData?: TickerData[]
    ) {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")!
        this.timePeriod = timePeriod
        this.canvasWidth = canvas.width
        this.canvasHeight = canvas.height
        this.bubbleStyle = bubbleStyle
        this.onBubbleDoubleClick = onBubbleDoubleClick
        if (initialData && initialData.length > 0) {
            this.tickerData = initialData
        }
        this.initializeBubbles()
        this.setupEventListeners()
    }

    updateBubbleStyle(newStyle: BubbleStyle) {
        this.bubbleStyle = newStyle
    }

    private calculateScore(changePercent: number): number {
        // Aggressive scoring: weighting larger changes much more heavily
        // Base score ensures 0% change still has visibility
        const absChange = Math.abs(changePercent)
        // Power of 1.2 makes the difference between 1% and 10% more dramatic than linear
        return Math.pow(absChange + 2, 1.2)
    }

    private initializeBubbles() {
        this.bubbles = []

        const centerX = this.canvas.width / 2
        const centerY = this.canvas.height / 2

        // Use live data if available, otherwise fallback to hardcoded data
        let data: Array<{ symbol: string; name: string; price: number; change: number; changes: { h: number; d: number; w: number; m: number; y: number } }>

        if (this.tickerData.length > 0) {
            data = this.tickerData.map(t => ({
                symbol: t.symbol,
                name: t.name,
                price: t.price,
                change: this.getChangeForPeriod(t),
                changes: { h: t.h, d: t.d, w: t.w, m: t.m, y: t.y }
            }))
        } else {
            // No live data available yet — skip bubble creation (loading state handles UI)
            return
        }

        // 1. Calculate scores
        const scores = data.map(item => this.calculateScore(item.change))
        const totalScore = scores.reduce((a, b) => a + b, 0)

        // 2. Calculate available area (Adaptive: 1.75% per bubble, max 60% of canvas)
        const totalArea = this.canvasWidth * this.canvasHeight
        // Reaches 60% coverage at ~34 bubbles
        const coverageRatio = Math.min(0.60, Math.max(0.10, data.length * 0.0175))
        const targetArea = totalArea * coverageRatio

        // 3. Area per score unit
        const areaPerScore = targetArea / totalScore

        data.forEach((item, index) => {
            const angle = (index / data.length) * Math.PI * 2
            const distance = 250 + Math.random() * 450

            // 4. Calculate radius from score
            const score = scores[index] ?? 0
            const bubbleArea = score * areaPerScore
            const radius = Math.sqrt(bubbleArea / Math.PI)

            const velocityScale = 1.5 / (1 + radius / 30)
            const initialAngle = Math.random() * Math.PI * 2
            const initialSpeed = (Math.random() * 1.5 + 0.5) * velocityScale

            this.bubbles.push({
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                vx: Math.cos(initialAngle) * initialSpeed,
                vy: Math.sin(initialAngle) * initialSpeed,
                radius: radius, // Start at full size
                targetRadius: radius,
                symbol: item.symbol,
                name: item.name,
                price: item.price,
                change: item.change,
                changes: item.changes,
                isDragging: false,
                dragOffsetX: 0,
                dragOffsetY: 0,
                directionChangeTimer: Math.random() * 60 + 60,
                targetVx: Math.cos(initialAngle) * initialSpeed,
                targetVy: Math.sin(initialAngle) * initialSpeed,
            })
        })
    }

    private getChangeForPeriod(ticker: TickerData): number {
        switch (this.timePeriod) {
            case "1H": return ticker.h
            case "1D": return ticker.d
            case "1W": return ticker.w
            case "1M": return ticker.m
            case "1Y": return ticker.y
            default: return ticker.d
        }
    }

    updateTickerData(newData: TickerData[]) {
        this.tickerData = newData

        // Add new bubbles for stocks that don't exist yet
        const existingSymbols = new Set(this.bubbles.map(b => b.symbol))
        const centerX = this.canvas.width / 2
        const centerY = this.canvas.height / 2

        newData.forEach((ticker, index) => {
            if (!existingSymbols.has(ticker.symbol)) {
                const change = this.getChangeForPeriod(ticker)
                // Initial radius will be fixed by recalculateTargetRadii immediately after
                const radius = 10
                const angle = Math.random() * Math.PI * 2
                const distance = 250 + Math.random() * 450
                const velocityScale = 1.5 / (1 + radius / 30)
                const initialAngle = Math.random() * Math.PI * 2
                const initialSpeed = (Math.random() * 1.5 + 0.5) * velocityScale

                this.bubbles.push({
                    x: centerX + Math.cos(angle) * distance,
                    y: centerY + Math.sin(angle) * distance,
                    vx: Math.cos(initialAngle) * initialSpeed,
                    vy: Math.sin(initialAngle) * initialSpeed,
                    radius: radius,
                    targetRadius: radius,
                    symbol: ticker.symbol,
                    name: ticker.name,
                    price: ticker.price,
                    change: change,
                    changes: { h: ticker.h, d: ticker.d, w: ticker.w, m: ticker.m, y: ticker.y },
                    isDragging: false,
                    dragOffsetX: 0,
                    dragOffsetY: 0,
                    directionChangeTimer: Math.random() * 60 + 60,
                    targetVx: Math.cos(initialAngle) * initialSpeed,
                    targetVy: Math.sin(initialAngle) * initialSpeed,
                })
            }
        })

        this.recalculateTargetRadii()
    }

    // New method to recalculate all radii based on current canvas size and data
    private recalculateTargetRadii() {
        if (this.bubbles.length === 0) return

        // 1. Re-calculate scores for all bubbles (in case data changed)
        // Also map bubbles to their scores to avoid re-finding them
        const bubbleScores = this.bubbles.map(bubble => {
            // Update the bubble's internal change value if new data is available
            // (This is partly redundant with updateTickerData loop below but ensures consistency)
            const ticker = this.tickerData.find(t => t.symbol === bubble.symbol)
            if (ticker) {
                bubble.change = this.getChangeForPeriod(ticker)
                bubble.price = ticker.price
                bubble.changes = { h: ticker.h, d: ticker.d, w: ticker.w, m: ticker.m, y: ticker.y }
            }
            return this.calculateScore(bubble.change)
        })

        const totalScore = bubbleScores.reduce((a, b) => a + b, 0)

        // 2. Target Area (Adaptive: 1.75% per bubble, max 60% of canvas)
        const totalArea = this.canvasWidth * this.canvasHeight
        // Reaches 60% coverage at ~34 bubbles
        const coverageRatio = Math.min(0.60, Math.max(0.10, this.bubbles.length * 0.0175))
        const targetArea = totalArea * coverageRatio
        const areaPerScore = targetArea / totalScore

        // 3. Apply new target radii
        this.bubbles.forEach((bubble, index) => {
            const score = bubbleScores[index] ?? 0
            const bubbleArea = score * areaPerScore
            bubble.targetRadius = Math.sqrt(bubbleArea / Math.PI)
        })
    }

    private setupEventListeners() {
        const handleStart = (x: number, y: number) => {
            const rect = this.canvas.getBoundingClientRect()
            const mouseX = x - rect.left
            const mouseY = y - rect.top

            for (let i = this.bubbles.length - 1; i >= 0; i--) {
                const bubble = this.bubbles[i]
                if (!bubble) continue
                const dx = mouseX - bubble.x
                const dy = mouseY - bubble.y
                if (dx * dx + dy * dy <= bubble.radius * bubble.radius) {
                    // Double-click/tap detection
                    const now = Date.now()
                    if (this.lastClickedBubble === bubble && now - this.lastClickTime < 300) {
                        // Double-click detected!
                        this.onBubbleDoubleClick?.(bubble)
                        this.lastClickTime = 0
                        this.lastClickedBubble = null
                        return // Don't start dragging on double-click
                    }
                    this.lastClickTime = now
                    this.lastClickedBubble = bubble

                    this.draggedBubble = bubble
                    bubble.isDragging = true
                    bubble.dragOffsetX = dx
                    bubble.dragOffsetY = dy
                    break
                }
            }
        }

        const handleMove = (x: number, y: number) => {
            const rect = this.canvas.getBoundingClientRect()
            this.mouseX = x - rect.left
            this.mouseY = y - rect.top

            if (this.draggedBubble) {
                this.draggedBubble.x = this.mouseX - this.draggedBubble.dragOffsetX
                this.draggedBubble.y = this.mouseY - this.draggedBubble.dragOffsetY
            }
        }

        const handleEnd = () => {
            if (this.draggedBubble) {
                this.draggedBubble.isDragging = false
            }
            this.draggedBubble = null
        }

        // Mouse Events
        this.canvas.addEventListener("mousedown", (e) => {
            handleStart(e.clientX, e.clientY)
        })

        this.canvas.addEventListener("mousemove", (e) => {
            handleMove(e.clientX, e.clientY)
        })

        this.canvas.addEventListener("mouseup", handleEnd)
        this.canvas.addEventListener("mouseleave", handleEnd)

        // Touch Events (Mobile Support)
        this.canvas.addEventListener("touchstart", (e) => {
            e.preventDefault() // Prevent scrolling while tapping canvas
            const touch = e.touches[0]
            if (touch) {
                handleStart(touch.clientX, touch.clientY)
            }
        }, { passive: false })

        this.canvas.addEventListener("touchmove", (e) => {
            e.preventDefault() // Prevent scrolling while dragging
            const touch = e.touches[0]
            if (touch) {
                handleMove(touch.clientX, touch.clientY)
            }
        }, { passive: false })

        this.canvas.addEventListener("touchend", handleEnd)
        this.canvas.addEventListener("touchcancel", handleEnd)
    }

    update() {
        const friction = 0.993
        const minDimension = Math.min(this.canvasWidth, this.canvasHeight)
        const velocityDamping = minDimension < 600 ? 0.97 : 0.98

        // Smoothly animate radius changes
        this.bubbles.forEach((bubble) => {
            const radiusDifference = bubble.targetRadius - bubble.radius
            if (Math.abs(radiusDifference) > 0.1) {
                bubble.radius += radiusDifference * 0.05
            } else {
                bubble.radius = bubble.targetRadius
            }

            if (bubble.isDragging) {
                bubble.vx *= 0.95
                bubble.vy *= 0.95
                return
            }

            const sizeInfluence = Math.min(bubble.radius / 50, 1)
            const adaptiveDamping = velocityDamping - (sizeInfluence * 0.04)

            bubble.directionChangeTimer--
            if (bubble.directionChangeTimer <= 0) {
                const newAngle = Math.random() * Math.PI * 2
                const newSpeed = Math.random() * 1.5 + 0.5
                bubble.targetVx = Math.cos(newAngle) * newSpeed
                bubble.targetVy = Math.sin(newAngle) * newSpeed
                bubble.directionChangeTimer = Math.random() * 60 + 60
            }

            const directionLerpSpeed = 0.02
            bubble.vx += (bubble.targetVx - bubble.vx) * directionLerpSpeed
            bubble.vy += (bubble.targetVy - bubble.vy) * directionLerpSpeed

            bubble.vx *= adaptiveDamping
            bubble.vx *= friction
            bubble.vy *= adaptiveDamping
            bubble.vy *= friction

            bubble.x += bubble.vx
            bubble.y += bubble.vy

            if (bubble.x - bubble.radius < 0) {
                bubble.x = bubble.radius
                bubble.vx *= -0.8
            }
            if (bubble.x + bubble.radius > this.canvasWidth) {
                bubble.x = this.canvasWidth - bubble.radius
                bubble.vx *= -0.8
            }
            if (bubble.y - bubble.radius < 0) {
                bubble.y = bubble.radius
                bubble.vy *= -0.8
            }
            if (bubble.y + bubble.radius > this.canvasHeight) {
                bubble.y = this.canvasHeight - bubble.radius
                bubble.vy *= -0.8
            }

            // Obstacle collision (Bottom Right corner specific optimization)
            if (this.obstacle) {
                const obs = this.obstacle
                if (bubble.x + bubble.radius > obs.x && bubble.y + bubble.radius > obs.y) {
                    const overlapX = (bubble.x + bubble.radius) - obs.x
                    const overlapY = (bubble.y + bubble.radius) - obs.y

                    if (overlapX < overlapY) {
                        // Push Left
                        bubble.x = obs.x - bubble.radius
                        bubble.vx *= -0.8
                    } else {
                        // Push Up
                        bubble.y = obs.y - bubble.radius
                        bubble.vy *= -0.8
                    }
                }
            }
        })

        for (let i = 0; i < this.bubbles.length; i++) {
            for (let j = i + 1; j < this.bubbles.length; j++) {
                const b1 = this.bubbles[i]
                const b2 = this.bubbles[j]
                if (b1 && b2) {
                    this.collide(b1, b2)
                }
            }
        }
    }

    private collide(b1: Bubble, b2: Bubble) {
        const dx = b2.x - b1.x
        const dy = b2.y - b1.y
        const minDistance = b1.radius + b2.radius + 2

        // Early exit with squared distance (avoids sqrt for non-colliding bubbles)
        const distanceSquared = dx * dx + dy * dy
        if (distanceSquared >= minDistance * minDistance) return

        // Only calculate sqrt when collision detected
        const distance = Math.sqrt(distanceSquared)
        const overlap = minDistance - distance
        const angle = Math.atan2(dy, dx)
        const pushX = Math.cos(angle) * overlap * 0.5
        const pushY = Math.sin(angle) * overlap * 0.5

        if (!b1.isDragging) {
            b1.x -= pushX
            b1.y -= pushY
        }
        if (!b2.isDragging) {
            b2.x += pushX
            b2.y += pushY
        }

        const minDim = Math.min(this.canvasWidth, this.canvasHeight)
        const collisionForce = minDim < 600 ? 1 : 2

        if (b1.isDragging && !b2.isDragging) {
            b2.vx += (dx / distance) * collisionForce
            b2.vy += (dy / distance) * collisionForce
        } else if (!b1.isDragging && b2.isDragging) {
            b1.vx -= (dx / distance) * collisionForce
            b1.vy -= (dy / distance) * collisionForce
        }
    }

    render() {
        // Clear canvas with transparent background (theme handles the bg color)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        // Draw bubbles
        this.bubbles.forEach((bubble) => {
            const isPositive = bubble.change >= 0
            const borderColor = isPositive ? this.bubbleStyle.positiveColor : this.bubbleStyle.negativeColor
            const glowColor = isPositive ? this.bubbleStyle.positiveGlow : this.bubbleStyle.negativeGlow
            const changeColor = isPositive ? this.bubbleStyle.positiveColor : this.bubbleStyle.negativeColor

            // Draw glow
            const gradient = this.ctx.createRadialGradient(bubble.x, bubble.y, 0, bubble.x, bubble.y, bubble.radius * 1.5)
            gradient.addColorStop(0, glowColor)
            gradient.addColorStop(1, "transparent")
            this.ctx.fillStyle = gradient
            this.ctx.fillRect(
                bubble.x - bubble.radius * 1.5,
                bubble.y - bubble.radius * 1.5,
                bubble.radius * 3,
                bubble.radius * 3,
            )

            // Draw bubble border
            this.ctx.strokeStyle = borderColor
            this.ctx.lineWidth = this.bubbleStyle.borderWidth
            this.ctx.beginPath()
            this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2)
            this.ctx.stroke()

            // Draw bubble fill
            this.ctx.fillStyle = this.bubbleStyle.fillColor
            this.ctx.beginPath()
            this.ctx.arc(bubble.x, bubble.y, bubble.radius - this.bubbleStyle.borderWidth, 0, Math.PI * 2)
            this.ctx.fill()

            // Draw text
            this.ctx.fillStyle = this.bubbleStyle.textColor
            this.ctx.font = "bold 18px Arial"
            this.ctx.textAlign = "center"
            this.ctx.textBaseline = "middle"
            this.ctx.fillText(bubble.symbol, bubble.x, bubble.y - 8)

            // Draw change percentage
            this.ctx.fillStyle = changeColor
            this.ctx.font = "12px Arial"
            this.ctx.fillText(`${bubble.change > 0 ? "+" : ""}${bubble.change.toFixed(2)}%`, bubble.x, bubble.y + 12)
        })
    }

    updateTimePeriod(newTimePeriod: TimePeriod) {
        this.timePeriod = newTimePeriod

        // If we have live data, use it
        if (this.tickerData.length > 0) {
            this.bubbles.forEach((bubble) => {
                const ticker = this.tickerData.find(t => t.symbol === bubble.symbol)
                if (ticker) {
                    const newChange = this.getChangeForPeriod(ticker)
                    bubble.change = newChange
                }
            })
        } else {
            // No live data — nothing to update
            return
        }

        this.recalculateTargetRadii()
    }

    updateCanvasBounds(width: number, height: number) {
        const oldCenterX = this.canvasWidth / 2
        const oldCenterY = this.canvasHeight / 2
        const newCenterX = width / 2
        const newCenterY = height / 2

        this.canvasWidth = width
        this.canvasHeight = height

        this.bubbles.forEach((bubble) => {
            bubble.x = newCenterX + (bubble.x - oldCenterX)
            bubble.y = newCenterY + (bubble.y - oldCenterY)
        })

        this.recalculateTargetRadii()
    }

    setObstacle(x: number, y: number, width: number, height: number) {
        this.obstacle = { x, y, width, height }
    }
}
