import { type BubbleStyle } from "~/styles/themes"

interface Bubble {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    targetRadius: number
    symbol: string
    change: number
    isDragging: boolean
    dragOffsetX: number
    dragOffsetY: number
    directionChangeTimer: number
    targetVx: number
    targetVy: number
}

// IDX Indonesian Stocks
const IDX_DATA = {
    "1H": [
        { symbol: "AADI", change: 8.5 },
        { symbol: "ACES", change: -4.8 },
        { symbol: "ADMR", change: 2.1 },
        { symbol: "ADRO", change: 6.3 },
        { symbol: "AKRA", change: -5.2 },
        { symbol: "AMMN", change: 10.4 },
        { symbol: "AMRT", change: -1.5 },
        { symbol: "ANTM", change: 4.9 },
        { symbol: "ARTO", change: -7.2 },
        { symbol: "ASII", change: 3.2 },
        { symbol: "AVIA", change: 6.8 },
        { symbol: "BBCA", change: 1.3 },
        { symbol: "BBNI", change: -3.6 },
        { symbol: "BBRI", change: 2.4 },
        { symbol: "BBTN", change: -8.1 },
        { symbol: "BMRI", change: 5.7 },
        { symbol: "BRMS", change: -4.2 },
        { symbol: "BRPT", change: 9.8 },
        { symbol: "BSDE", change: 3.6 },
        { symbol: "BTPS", change: -6.7 },
        { symbol: "BUKA", change: 7.1 },
        { symbol: "BUMI", change: -11.5 },
        { symbol: "CMRY", change: 2.1 },
        { symbol: "CPIN", change: 4.2 },
        { symbol: "CTRA", change: 6.8 },
        { symbol: "DSNG", change: -3.3 },
        { symbol: "DSSA", change: 5.4 },
        { symbol: "ELSA", change: -7.8 },
        { symbol: "EMTK", change: 8.2 },
        { symbol: "ENRG", change: 1.1 },
        { symbol: "ERAA", change: 9.7 },
        { symbol: "ESSA", change: -2.1 },
        { symbol: "EXCL", change: 4.5 },
        { symbol: "GOTO", change: 6.2 },
        { symbol: "HEAL", change: -4.8 },
        { symbol: "HRUM", change: 3.8 },
        { symbol: "ICBP", change: 2.3 },
        { symbol: "INCO", change: 7.6 },
        { symbol: "INDF", change: -3.2 },
        { symbol: "INDY", change: 3.7 },
        { symbol: "INKP", change: -6.4 },
        { symbol: "INTP", change: 10.1 },
        { symbol: "ISAT", change: 2.1 },
        { symbol: "ITMG", change: 7.9 },
        { symbol: "JPFA", change: -5.3 },
        { symbol: "JSMR", change: 4.8 },
        { symbol: "KIJA", change: 6.5 },
        { symbol: "KLBF", change: -3.1 },
        { symbol: "KPIG", change: 3.4 },
        { symbol: "LSIP", change: 7.2 },
        { symbol: "MAPA", change: -4.6 },
        { symbol: "MAPI", change: 2.7 },
        { symbol: "MBMA", change: 4.9 },
        { symbol: "MDKA", change: 8.5 },
        { symbol: "MEDC", change: -2.8 },
        { symbol: "MIKA", change: 6.3 },
        { symbol: "MTEL", change: 4.6 },
        { symbol: "MYOR", change: -5.1 },
        { symbol: "NCKL", change: 7.8 },
        { symbol: "PANI", change: 2.4 },
        { symbol: "PGAS", change: 3.8 },
        { symbol: "PGEO", change: -6.2 },
        { symbol: "PNBN", change: 5.7 },
        { symbol: "PNLF", change: 9.1 },
        { symbol: "PTBA", change: -1.8 },
        { symbol: "PTRO", change: 4.3 },
        { symbol: "PWON", change: 8.2 },
        { symbol: "RAJA", change: 3.2 },
        { symbol: "RATU", change: -7.5 },
        { symbol: "SCMA", change: 7.6 },
        { symbol: "SIDO", change: 2.5 },
        { symbol: "SMGR", change: 9.3 },
        { symbol: "SMRA", change: -4.8 },
        { symbol: "SSIA", change: 5.2 },
        { symbol: "TAPG", change: 6.1 },
        { symbol: "TLKM", change: 3.7 },
        { symbol: "TOWR", change: -3.4 },
        { symbol: "UNTR", change: 7.5 },
        { symbol: "UNVR", change: 4.2 },
        { symbol: "WIFI", change: -6.8 },
    ],
    "1D": [
        { symbol: "AADI", change: 12.3 },
        { symbol: "ACES", change: -8.6 },
        { symbol: "ADMR", change: 3.4 },
        { symbol: "ADRO", change: 10.2 },
        { symbol: "AKRA", change: -9.7 },
        { symbol: "AMMN", change: 14.5 },
        { symbol: "AMRT", change: -2.1 },
        { symbol: "ANTM", change: 7.8 },
        { symbol: "ARTO", change: -11.3 },
        { symbol: "ASII", change: 4.9 },
        { symbol: "AVIA", change: 11.2 },
        { symbol: "BBCA", change: 6.7 },
        { symbol: "BBNI", change: -5.4 },
        { symbol: "BBRI", change: 8.1 },
        { symbol: "BBTN", change: -10.5 },
        { symbol: "BMRI", change: 9.3 },
        { symbol: "BRMS", change: -6.8 },
        { symbol: "BRPT", change: 13.2 },
        { symbol: "BSDE", change: 6.2 },
        { symbol: "BTPS", change: -9.1 },
        { symbol: "BUKA", change: 11.4 },
        { symbol: "BUMI", change: -14.2 },
        { symbol: "CMRY", change: 4.3 },
        { symbol: "CPIN", change: 8.6 },
        { symbol: "CTRA", change: 10.3 },
        { symbol: "DSNG", change: -4.2 },
        { symbol: "DSSA", change: 7.8 },
        { symbol: "ELSA", change: -10.2 },
        { symbol: "EMTK", change: 12.1 },
        { symbol: "ENRG", change: 2.7 },
        { symbol: "ERAA", change: 13.8 },
        { symbol: "ESSA", change: -3.2 },
        { symbol: "EXCL", change: 7.1 },
        { symbol: "GOTO", change: 9.5 },
        { symbol: "HEAL", change: -6.4 },
        { symbol: "HRUM", change: 5.6 },
        { symbol: "ICBP", change: 3.8 },
        { symbol: "INCO", change: 11.3 },
        { symbol: "INDF", change: -4.7 },
        { symbol: "INDY", change: 6.2 },
        { symbol: "INKP", change: -8.9 },
        { symbol: "INTP", change: 15.2 },
        { symbol: "ISAT", change: 3.5 },
        { symbol: "ITMG", change: 10.7 },
        { symbol: "JPFA", change: -7.2 },
        { symbol: "JSMR", change: 7.4 },
        { symbol: "KIJA", change: 9.1 },
        { symbol: "KLBF", change: -2.3 },
        { symbol: "KPIG", change: 5.1 },
        { symbol: "LSIP", change: 10.6 },
        { symbol: "MAPA", change: -5.8 },
        { symbol: "MAPI", change: 4.2 },
        { symbol: "MBMA", change: 7.8 },
        { symbol: "MDKA", change: 12.3 },
        { symbol: "MEDC", change: -3.5 },
        { symbol: "MIKA", change: 9.7 },
        { symbol: "MTEL", change: 7.1 },
        { symbol: "MYOR", change: -8.3 },
        { symbol: "NCKL", change: 10.5 },
        { symbol: "PANI", change: 3.8 },
        { symbol: "PGAS", change: 6.4 },
        { symbol: "PGEO", change: -7.8 },
        { symbol: "PNBN", change: 8.2 },
        { symbol: "PNLF", change: 12.7 },
        { symbol: "PTBA", change: -1.2 },
        { symbol: "PTRO", change: 6.8 },
        { symbol: "PWON", change: 11.5 },
        { symbol: "RAJA", change: 5.3 },
        { symbol: "RATU", change: -10.1 },
        { symbol: "SCMA", change: 10.2 },
        { symbol: "SIDO", change: 4.1 },
        { symbol: "SMGR", change: 12.8 },
        { symbol: "SMRA", change: -7.2 },
        { symbol: "SSIA", change: 8.5 },
        { symbol: "TAPG", change: 9.3 },
        { symbol: "TLKM", change: 5.8 },
        { symbol: "TOWR", change: -4.6 },
        { symbol: "UNTR", change: 10.2 },
        { symbol: "UNVR", change: 7.3 },
        { symbol: "WIFI", change: -9.4 },
    ],
    "1W": [
        { symbol: "AADI", change: 25.8 },
        { symbol: "ACES", change: -14.3 },
        { symbol: "ADMR", change: 6.7 },
        { symbol: "ADRO", change: 18.5 },
        { symbol: "AKRA", change: -16.2 },
        { symbol: "AMMN", change: 22.1 },
        { symbol: "AMRT", change: -3.8 },
        { symbol: "ANTM", change: 12.4 },
        { symbol: "ARTO", change: -18.9 },
        { symbol: "ASII", change: 8.1 },
        { symbol: "AVIA", change: 19.3 },
        { symbol: "BBCA", change: 11.2 },
        { symbol: "BBNI", change: -9.7 },
        { symbol: "BBRI", change: 14.3 },
        { symbol: "BBTN", change: -17.6 },
        { symbol: "BMRI", change: 15.8 },
        { symbol: "BRMS", change: -11.5 },
        { symbol: "BRPT", change: 21.6 },
        { symbol: "BSDE", change: 10.2 },
        { symbol: "BTPS", change: -14.2 },
        { symbol: "BUKA", change: 18.7 },
        { symbol: "BUMI", change: -22.3 },
        { symbol: "CMRY", change: 7.4 },
        { symbol: "CPIN", change: 13.2 },
        { symbol: "CTRA", change: 16.1 },
        { symbol: "DSNG", change: -6.8 },
        { symbol: "DSSA", change: 12.5 },
        { symbol: "ELSA", change: -15.3 },
        { symbol: "EMTK", change: 19.4 },
        { symbol: "ENRG", change: 4.2 },
        { symbol: "ERAA", change: 21.5 },
        { symbol: "ESSA", change: -5.1 },
        { symbol: "EXCL", change: 11.3 },
        { symbol: "GOTO", change: 15.2 },
        { symbol: "HEAL", change: -10.1 },
        { symbol: "HRUM", change: 8.9 },
        { symbol: "ICBP", change: 6.2 },
        { symbol: "INCO", change: 17.9 },
        { symbol: "INDF", change: -7.5 },
        { symbol: "INDY", change: 9.8 },
        { symbol: "INKP", change: -13.7 },
        { symbol: "INTP", change: 23.8 },
        { symbol: "ISAT", change: 5.6 },
        { symbol: "ITMG", change: 16.8 },
        { symbol: "JPFA", change: -11.2 },
        { symbol: "JSMR", change: 11.6 },
        { symbol: "KIJA", change: 14.2 },
        { symbol: "KLBF", change: -3.7 },
        { symbol: "KPIG", change: 8.1 },
        { symbol: "LSIP", change: 16.9 },
        { symbol: "MAPA", change: -9.2 },
        { symbol: "MAPI", change: 6.8 },
        { symbol: "MBMA", change: 12.3 },
        { symbol: "MDKA", change: 19.4 },
        { symbol: "MEDC", change: -5.5 },
        { symbol: "MIKA", change: 15.2 },
        { symbol: "MTEL", change: 11.2 },
        { symbol: "MYOR", change: -13.1 },
        { symbol: "NCKL", change: 16.7 },
        { symbol: "PANI", change: 6.1 },
        { symbol: "PGAS", change: 10.1 },
        { symbol: "PGEO", change: -12.3 },
        { symbol: "PNBN", change: 13.1 },
        { symbol: "PNLF", change: 20.1 },
        { symbol: "PTBA", change: -1.8 },
        { symbol: "PTRO", change: 10.7 },
        { symbol: "PWON", change: 18.2 },
        { symbol: "RAJA", change: 8.4 },
        { symbol: "RATU", change: -15.8 },
        { symbol: "SCMA", change: 16.1 },
        { symbol: "SIDO", change: 6.6 },
        { symbol: "SMGR", change: 20.3 },
        { symbol: "SMRA", change: -11.5 },
        { symbol: "SSIA", change: 13.3 },
        { symbol: "TAPG", change: 14.8 },
        { symbol: "TLKM", change: 9.2 },
        { symbol: "TOWR", change: -7.3 },
        { symbol: "UNTR", change: 16.1 },
        { symbol: "UNVR", change: 11.5 },
        { symbol: "WIFI", change: -14.9 },
    ],
    "1M": [
        { symbol: "AADI", change: 35.2 },
        { symbol: "ACES", change: -18.5 },
        { symbol: "ADMR", change: 12.3 },
        { symbol: "ADRO", change: 28.7 },
        { symbol: "AKRA", change: -24.1 },
        { symbol: "AMMN", change: 38.5 },
        { symbol: "AMRT", change: -8.2 },
        { symbol: "ANTM", change: 21.3 },
        { symbol: "ARTO", change: -27.5 },
        { symbol: "ASII", change: 15.8 },
        { symbol: "AVIA", change: 32.7 },
        { symbol: "BBCA", change: 19.2 },
        { symbol: "BBNI", change: -14.8 },
        { symbol: "BBRI", change: 24.6 },
        { symbol: "BBTN", change: -28.3 },
        { symbol: "BMRI", change: 27.9 },
        { symbol: "BRMS", change: -18.2 },
        { symbol: "BRPT", change: 35.4 },
        { symbol: "BSDE", change: 18.7 },
        { symbol: "BTPS", change: -22.5 },
        { symbol: "BUKA", change: 31.8 },
        { symbol: "BUMI", change: -35.1 },
        { symbol: "CMRY", change: 14.2 },
        { symbol: "CPIN", change: 23.4 },
        { symbol: "CTRA", change: 27.6 },
        { symbol: "DSNG", change: -11.3 },
        { symbol: "DSSA", change: 21.5 },
        { symbol: "ELSA", change: -25.8 },
        { symbol: "EMTK", change: 33.2 },
        { symbol: "ENRG", change: 8.5 },
        { symbol: "ERAA", change: 36.7 },
        { symbol: "ESSA", change: -9.3 },
        { symbol: "EXCL", change: 19.8 },
        { symbol: "GOTO", change: 26.3 },
        { symbol: "HEAL", change: -16.2 },
        { symbol: "HRUM", change: 15.3 },
        { symbol: "ICBP", change: 11.5 },
        { symbol: "INCO", change: 29.7 },
        { symbol: "INDF", change: -13.5 },
        { symbol: "INDY", change: 17.2 },
        { symbol: "INKP", change: -22.4 },
        { symbol: "INTP", change: 39.6 },
        { symbol: "ISAT", change: 10.2 },
        { symbol: "ITMG", change: 28.5 },
        { symbol: "JPFA", change: -19.5 },
        { symbol: "JSMR", change: 20.3 },
        { symbol: "KIJA", change: 24.8 },
        { symbol: "KLBF", change: -6.8 },
        { symbol: "KPIG", change: 14.1 },
        { symbol: "LSIP", change: 28.4 },
        { symbol: "MAPA", change: -14.6 },
        { symbol: "MAPI", change: 12.5 },
        { symbol: "MBMA", change: 21.2 },
        { symbol: "MDKA", change: 32.8 },
        { symbol: "MEDC", change: -10.1 },
        { symbol: "MIKA", change: 26.3 },
        { symbol: "MTEL", change: 19.4 },
        { symbol: "MYOR", change: -21.7 },
        { symbol: "NCKL", change: 28.2 },
        { symbol: "PANI", change: 10.9 },
        { symbol: "PGAS", change: 17.3 },
        { symbol: "PGEO", change: -20.5 },
        { symbol: "PNBN", change: 22.7 },
        { symbol: "PNLF", change: 33.8 },
        { symbol: "PTBA", change: -3.2 },
        { symbol: "PTRO", change: 18.2 },
        { symbol: "PWON", change: 30.5 },
        { symbol: "RAJA", change: 14.7 },
        { symbol: "RATU", change: -25.2 },
        { symbol: "SCMA", change: 27.3 },
        { symbol: "SIDO", change: 11.8 },
        { symbol: "SMGR", change: 34.2 },
        { symbol: "SMRA", change: -18.5 },
        { symbol: "SSIA", change: 23.1 },
        { symbol: "TAPG", change: 25.6 },
        { symbol: "TLKM", change: 16.2 },
        { symbol: "TOWR", change: -12.8 },
        { symbol: "UNTR", change: 27.3 },
        { symbol: "UNVR", change: 20.1 },
        { symbol: "WIFI", change: -24.1 },
    ],
    "1Y": [
        { symbol: "AADI", change: 48.5 },
        { symbol: "ACES", change: -32.1 },
        { symbol: "ADMR", change: 22.3 },
        { symbol: "ADRO", change: 52.8 },
        { symbol: "AKRA", change: -45.3 },
        { symbol: "AMMN", change: 65.2 },
        { symbol: "AMRT", change: -18.7 },
        { symbol: "ANTM", change: 38.5 },
        { symbol: "ARTO", change: -48.2 },
        { symbol: "ASII", change: 35.1 },
        { symbol: "AVIA", change: 58.2 },
        { symbol: "BBCA", change: 42.3 },
        { symbol: "BBNI", change: -28.6 },
        { symbol: "BBRI", change: 48.7 },
        { symbol: "BBTN", change: -52.1 },
        { symbol: "BMRI", change: 51.2 },
        { symbol: "BRMS", change: -35.8 },
        { symbol: "BRPT", change: 62.3 },
        { symbol: "BSDE", change: 45.5 },
        { symbol: "BTPS", change: -38.2 },
        { symbol: "BUKA", change: 55.8 },
        { symbol: "BUMI", change: -61.3 },
        { symbol: "CMRY", change: 32.1 },
        { symbol: "CPIN", change: 46.8 },
        { symbol: "CTRA", change: 51.5 },
        { symbol: "DSNG", change: -22.5 },
        { symbol: "DSSA", change: 42.1 },
        { symbol: "ELSA", change: -40.2 },
        { symbol: "EMTK", change: 54.3 },
        { symbol: "ENRG", change: 18.5 },
        { symbol: "ERAA", change: 58.5 },
        { symbol: "ESSA", change: -25.1 },
        { symbol: "EXCL", change: 38.2 },
        { symbol: "GOTO", change: 48.6 },
        { symbol: "HEAL", change: -32.3 },
        { symbol: "HRUM", change: 36.2 },
        { symbol: "ICBP", change: 28.7 },
        { symbol: "INCO", change: 52.4 },
        { symbol: "INDF", change: -28.1 },
        { symbol: "INDY", change: 38.5 },
        { symbol: "INKP", change: -48.5 },
        { symbol: "INTP", change: 68.2 },
        { symbol: "ISAT", change: 32.1 },
        { symbol: "ITMG", change: 51.3 },
        { symbol: "JPFA", change: -35.8 },
        { symbol: "JSMR", change: 42.7 },
        { symbol: "KIJA", change: 48.5 },
        { symbol: "KLBF", change: -18.2 },
        { symbol: "KPIG", change: 38.1 },
        { symbol: "LSIP", change: 51.2 },
        { symbol: "MAPA", change: -28.3 },
        { symbol: "MAPI", change: 32.5 },
        { symbol: "MBMA", change: 42.3 },
        { symbol: "MDKA", change: 55.8 },
        { symbol: "MEDC", change: -22.1 },
        { symbol: "MIKA", change: 48.2 },
        { symbol: "MTEL", change: 41.5 },
        { symbol: "MYOR", change: -38.2 },
        { symbol: "NCKL", change: 51.3 },
        { symbol: "PANI", change: 28.5 },
        { symbol: "PGAS", change: 38.2 },
        { symbol: "PGEO", change: -32.1 },
        { symbol: "PNBN", change: 44.2 },
        { symbol: "PNLF", change: 55.3 },
        { symbol: "PTBA", change: -8.5 },
        { symbol: "PTRO", change: 38.2 },
        { symbol: "PWON", change: 52.3 },
        { symbol: "RAJA", change: 35.2 },
        { symbol: "RATU", change: -45.1 },
        { symbol: "SCMA", change: 51.2 },
        { symbol: "SIDO", change: 32.3 },
        { symbol: "SMGR", change: 55.8 },
        { symbol: "SMRA", change: -32.5 },
        { symbol: "SSIA", change: 45.3 },
        { symbol: "TAPG", change: 48.1 },
        { symbol: "TLKM", change: 38.5 },
        { symbol: "TOWR", change: -25.2 },
        { symbol: "UNTR", change: 51.2 },
        { symbol: "UNVR", change: 42.1 },
        { symbol: "WIFI", change: -38.5 },
    ],
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

    constructor(
        canvas: HTMLCanvasElement,
        timePeriod: TimePeriod = "1D",
        bubbleStyle: BubbleStyle
    ) {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")!
        this.timePeriod = timePeriod
        this.canvasWidth = canvas.width
        this.canvasHeight = canvas.height
        this.bubbleStyle = bubbleStyle
        this.initializeBubbles()
        this.setupEventListeners()
    }

    updateBubbleStyle(newStyle: BubbleStyle) {
        this.bubbleStyle = newStyle
    }

    private calculateRadius(changePercent: number): number {
        const absChange = Math.abs(changePercent)
        const minDimension = Math.min(this.canvasWidth, this.canvasHeight)

        let sizeMultiplier = 1.0
        if (minDimension < 600) {
            sizeMultiplier = 0.5 + (minDimension / 600) * 0.25
        } else if (minDimension < 1000) {
            sizeMultiplier = 0.75 + ((minDimension - 600) / 400) * 0.25
        }

        const baseRadius = 20 * sizeMultiplier
        const radiusVariation = 25 * sizeMultiplier

        const scaleFactor = Math.min(absChange / 20, 1.5)
        return baseRadius + radiusVariation * scaleFactor
    }

    private initializeBubbles() {
        this.bubbles = []

        const centerX = this.canvas.width / 2
        const centerY = this.canvas.height / 2

        const data = IDX_DATA[this.timePeriod]

        data.forEach((item, index) => {
            const angle = (index / data.length) * Math.PI * 2
            const distance = 250 + Math.random() * 450
            const radius = this.calculateRadius(item.change)

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
                symbol: item.symbol,
                change: item.change,
                isDragging: false,
                dragOffsetX: 0,
                dragOffsetY: 0,
                directionChangeTimer: Math.random() * 60 + 60,
                targetVx: Math.cos(initialAngle) * initialSpeed,
                targetVy: Math.sin(initialAngle) * initialSpeed,
            })
        })
    }

    private setupEventListeners() {
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect()
            this.mouseX = e.clientX - rect.left
            this.mouseY = e.clientY - rect.top

            if (this.draggedBubble) {
                this.draggedBubble.x = this.mouseX - this.draggedBubble.dragOffsetX
                this.draggedBubble.y = this.mouseY - this.draggedBubble.dragOffsetY
            }
        })

        this.canvas.addEventListener("mousedown", (e) => {
            const rect = this.canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            for (let i = this.bubbles.length - 1; i >= 0; i--) {
                const bubble = this.bubbles[i]
                if (!bubble) continue
                const dx = x - bubble.x
                const dy = y - bubble.y
                if (dx * dx + dy * dy <= bubble.radius * bubble.radius) {
                    this.draggedBubble = bubble
                    bubble.isDragging = true
                    bubble.dragOffsetX = dx
                    bubble.dragOffsetY = dy
                    break
                }
            }
        })

        this.canvas.addEventListener("mouseup", () => {
            if (this.draggedBubble) {
                this.draggedBubble.isDragging = false
            }
            this.draggedBubble = null
        })

        this.canvas.addEventListener("mouseleave", () => {
            if (this.draggedBubble) {
                this.draggedBubble.isDragging = false
            }
            this.draggedBubble = null
        })
    }

    private calculateAvailableSpace() {
        const canvasArea = this.canvasWidth * this.canvasHeight
        const totalBubbleArea = this.bubbles.reduce((sum, bubble) => sum + Math.PI * bubble.radius * bubble.radius, 0)
        const filledPercentage = totalBubbleArea / canvasArea
        const targetFillPercentage = 0.75

        if (filledPercentage < targetFillPercentage) {
            const scaleNeeded = Math.sqrt(targetFillPercentage / Math.max(filledPercentage, 0.01))

            this.bubbles.forEach((bubble) => {
                const newRadius = bubble.radius * scaleNeeded
                const maxPossible = Math.min(this.canvasWidth, this.canvasHeight) * 0.25
                bubble.radius = Math.min(newRadius, maxPossible)
            })
        }
    }

    update() {
        const friction = 0.993
        const minDimension = Math.min(this.canvasWidth, this.canvasHeight)
        const velocityDamping = minDimension < 600 ? 0.97 : 0.98

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
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = b1.radius + b2.radius + 2

        if (distance < minDistance) {
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
        const newData = IDX_DATA[newTimePeriod]

        newData.forEach((item) => {
            const bubble = this.bubbles.find((b) => b.symbol === item.symbol)
            if (bubble) {
                bubble.change = item.change
                bubble.targetRadius = this.calculateRadius(item.change)
            }
        })
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
            bubble.targetRadius = this.calculateRadius(bubble.change)
        })

        // Recalculate space only on resize
        this.calculateAvailableSpace()
    }
}
