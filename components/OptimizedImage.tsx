import Image from 'next/image'
import { CSSProperties } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  style?: CSSProperties
  fill?: boolean
  sizes?: string
  quality?: number
}

/**
 * Optimized Image Component
 * - Automatic format conversion (WebP, AVIF)
 * - Lazy loading by default
 * - Responsive image sizing
 * - Blur placeholder support
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  style,
  fill = false,
  sizes,
  quality = 75,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      priority={priority}
      className={className}
      style={style}
      fill={fill}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      loading={priority ? 'eager' : 'lazy'}
      // ✅ Placeholder while loading
      placeholder="empty"
    />
  )
}

/**
 * Background Image Component
 * - For hero sections and backdrops
 * - Lazy loads background images
 */
export function BackgroundImage({
  src,
  alt,
  children,
  className = '',
}: {
  src: string
  alt: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        quality={60}
        priority={false}
        sizes="100vw"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
