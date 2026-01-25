import React from 'react'
import { css } from '../../styled-system/css'

interface ProgressiveBlurProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Direction of the blur progression. */
  direction?: 'to right' | 'to left' | 'to top' | 'to bottom' | 'to bottom right' | 'to bottom left' | 'to top right' | 'to top left'
  /** Maximum blur radius in pixels. */
  maxBlur?: number
  /** Minimum blur radius in pixels (applied to all layers). */
  minBlur?: number
  /** Number of discrete blur layers. */
  layers?: number
  /** Width override. */
  width?: string | number
}

/**
 * A highly optimized, stabilized progressive blur component.
 * Uses a multi-layered slice technique with GPU acceleration hints
 * to prevent flickering and visual artifacts during animation.
 */
const ProgressiveBlur = ({
  direction = 'to right',
  maxBlur = 32,
  minBlur = 0,
  layers = 8,
  width = '100%',
  className,
  ...props
}: ProgressiveBlurProps) => {
  const blurLayers = Array.from({ length: layers }).map((_, i) => {
    // Blur radius follows a quadratic curve for a more natural look.
    // We add the minBlur as a constant baseline.
    const radius = minBlur + Math.pow((layers - i) / layers, 2) * (maxBlur - minBlur)
    
    // Each layer covers a specific slice with a generous overlap (feather) to ensure smoothness.
    const start = (i / layers) * 100
    const end = ((i + 1) / layers) * 100
    const feather = (100 / layers) * 2 // Double feather for smoother blending
    
    return { radius, start, end, feather }
  })

  return (
    <div
      {...props}
      className={css({
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        isolation: 'isolate',
        transformStyle: 'preserve-3d',
      }) + (className ? ` ${className}` : '')}
      style={{ width, ...props.style }}
    >
      {blurLayers.map((layer, i) => (
        <div
          key={i}
          className={css({
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.01)', // Stabilizes backdrop-filter in Chromium
          })}
          style={{
            backdropFilter: `blur(${layer.radius.toFixed(2)}px)`,
            WebkitBackdropFilter: `blur(${layer.radius.toFixed(2)}px)`,
            
            // GPU acceleration and stability hints
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            willChange: 'transform, backdrop-filter, mask-image',

            // Sliced mask with overlap (feather)
            maskImage: `linear-gradient(${direction}, transparent ${layer.start - layer.feather}%, black ${layer.start}%, black ${layer.end}%, transparent ${layer.end + layer.feather}%)`,
            WebkitMaskImage: `linear-gradient(${direction}, transparent ${layer.start - layer.feather}%, black ${layer.start}%, black ${layer.end}%, transparent ${layer.end + layer.feather}%)`,
          }}
        />
      ))}
    </div>
  )
}

export { ProgressiveBlur }
export default ProgressiveBlur
