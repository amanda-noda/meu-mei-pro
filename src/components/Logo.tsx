import './Logo.css'

interface LogoProps {
  /** Tamanho: 'compact' (header) | 'medium' | 'large' (home) */
  size?: 'compact' | 'medium' | 'large'
  /** Se true, usa versão clara (texto branco) sem caixa, para fundos escuros alternativos */
  variant?: 'default' | 'light'
  className?: string
}

export function Logo({ size = 'compact', variant = 'default', className = '' }: LogoProps) {
  return (
    <div
      className={`logo-marca ${variant === 'light' ? 'logo-light' : ''} logo-${size} ${className}`}
      aria-label="MEU MEI PRO"
    >
      <span className="logo-line">MEU</span>
      <span className="logo-line">MEI</span>
      <span className="logo-line">PRO</span>
    </div>
  )
}
