"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  curveType = "auto", // "auto" | "linear" | "orthogonal" | "bezier"
  reverse = false,
  duration = 3.5,
  delay = 0,
  pathColor = "#2c427f",
  pathWidth = 1.5,
  pathOpacity = 0.8,
  gradientStartColor = "#38bdf8",
  gradientStopColor = "#2563eb",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) {
  const id = useId().replace(/:/g, "_");
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updatePath = () => {
      if (containerRef?.current && fromRef?.current && toRef?.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        setSvgDimensions({
          width: containerRect.width,
          height: containerRect.height,
        });

        // Center coordinates relative to container
        const centerAX = rectA.left - containerRect.left + rectA.width / 2;
        const centerAY = rectA.top - containerRect.top + rectA.height / 2;
        const centerBX = rectB.left - containerRect.left + rectB.width / 2;
        const centerBY = rectB.top - containerRect.top + rectB.height / 2;

        const dx = centerBX - centerAX;
        const dy = centerBY - centerAY;

        let startX = centerAX;
        let startY = centerAY;
        let endX = centerBX;
        let endY = centerBY;

        // Auto-detect optimal edge contact points based on relative orientation
        if (Math.abs(dx) > Math.abs(dy) * 1.2) {
          // Primarily horizontal alignment
          if (dx > 0) {
            startX = rectA.right - containerRect.left;
            endX = rectB.left - containerRect.left;
          } else {
            startX = rectA.left - containerRect.left;
            endX = rectB.right - containerRect.left;
          }
        } else {
          // Primarily vertical alignment
          if (dy > 0) {
            startY = rectA.bottom - containerRect.top;
            endY = rectB.top - containerRect.top;
          } else {
            startY = rectA.top - containerRect.top;
            endY = rectB.bottom - containerRect.top;
          }
        }

        // Apply custom offsets
        startX += startXOffset;
        startY += startYOffset;
        endX += endXOffset;
        endY += endYOffset;

        let d = "";

        if (curveType === "orthogonal" || (curvature === 0 && Math.abs(dx) > 20 && Math.abs(dy) > 20)) {
          // Smooth orthogonal S-curve / step curve
          const midY = (startY + endY) / 2;
          d = `M ${startX},${startY} C ${startX},${midY} ${endX},${midY} ${endX},${endY}`;
        } else if (curvature !== 0) {
          // Quadratic bezier curve
          const controlY = startY - curvature;
          d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`;
        } else {
          // Pure straight line
          d = `M ${startX},${startY} L ${endX},${endY}`;
        }

        setPathD(d);
      }
    };

    updatePath();

    const resizeObserver = new ResizeObserver(() => updatePath());
    if (containerRef?.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener("resize", updatePath);

    const timer = setTimeout(updatePath, 40);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePath);
      clearTimeout(timer);
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    curveType,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  const animKey = reverse ? `beamRev_${id}` : `beamFwd_${id}`;

  return (
    <svg
      fill="none"
      width={svgDimensions.width || "100%"}
      height={svgDimensions.height || "100%"}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible",
        className
      )}
    >
      <style>{`
        @keyframes ${animKey} {
          0% {
            stroke-dashoffset: ${reverse ? "-100" : "100"};
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      <defs>
        <linearGradient id={`grad_${id}`} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="30%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="70%" stopColor={gradientStopColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>

        <filter id={`glow_${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 1. Base Thin Dotted Track Path matching Stripe reference */}
      {pathD && (
        <path
          d={pathD}
          stroke={pathColor}
          strokeWidth={pathWidth}
          strokeDasharray="2.5 3.5"
          strokeOpacity={pathOpacity}
          fill="none"
        />
      )}

      {/* 2. Dynamic Animated Glowing Blue Beam */}
      {pathD && (
        <path
          d={pathD}
          pathLength="100"
          stroke={`url(#grad_${id})`}
          strokeWidth={pathWidth + 1}
          strokeDasharray="22 78"
          strokeLinecap="round"
          filter={`url(#glow_${id})`}
          fill="none"
          style={{
            animation: `${animKey} ${duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            animationDelay: `${delay}s`,
          }}
        />
      )}
    </svg>
  );
}

export default AnimatedBeam;
