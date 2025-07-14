import { useEffect, useRef } from "react";

export default function HyperSpeed() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Star class for hyperspace effect
    class Star {
      x: number;
      y: number;
      z: number;
      prevX: number;
      prevY: number;

      constructor() {
        this.x = (Math.random() - 0.5) * 2000;
        this.y = (Math.random() - 0.5) * 2000;
        this.z = Math.random() * 1000;
        this.prevX = this.x / (this.z * 0.001);
        this.prevY = this.y / (this.z * 0.001);
      }

      update(speed: number) {
        this.z -= speed;
        if (this.z <= 0) {
          this.x = (Math.random() - 0.5) * 2000;
          this.y = (Math.random() - 0.5) * 2000;
          this.z = 1000;
        }
      }

      draw() {
        const x = (this.x / this.z) * canvas.width * 0.5 + canvas.width * 0.5;
        const y = (this.y / this.z) * canvas.height * 0.5 + canvas.height * 0.5;
        
        const prevX = this.prevX * canvas.width * 0.5 + canvas.width * 0.5;
        const prevY = this.prevY * canvas.height * 0.5 + canvas.height * 0.5;

        this.prevX = (this.x / this.z) * 0.5;
        this.prevY = (this.y / this.z) * 0.5;

        const size = (1 - this.z / 1000) * 2;
        const opacity = 1 - this.z / 1000;

        ctx.globalAlpha = opacity;
        ctx.strokeStyle = "#6366F1";
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // Create stars
    const stars: Star[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push(new Star());
    }

    let speed = 20;

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(15, 15, 35, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        star.update(speed);
        star.draw();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
