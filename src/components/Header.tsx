import { Logo } from './Logo'

interface HeaderProps {
  title: string
  onBack?: () => void
}

export function Header({ title, onBack }: HeaderProps) {
  return (
    <header className="app-header">
      <Logo size="compact" className="header-logo" />
      <h1 className="header-title">{title}</h1>
      {onBack && (
        <button type="button" className="btn-voltar" onClick={onBack}>
          Voltar
        </button>
      )}
    </header>
  )
}
