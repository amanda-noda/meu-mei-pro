import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { Lancamentos } from './pages/Lancamentos'
import { PainelFinancas } from './pages/PainelFinancas'
import { CadastroReceitasDespesas } from './pages/CadastroReceitasDespesas'
import type { Lancamento as LancamentoType } from './data/constants'
import { getLancamentos, setLancamentos } from './data/constants'
import './App.css'

type Page = 'home' | 'lancamentos' | 'painel' | 'cadastro'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [lancamentos, setLancamentosState] = useState<LancamentoType[]>(() => getLancamentos())

  const persistLancamentos = useCallback((next: LancamentoType[]) => {
    setLancamentos(next)
    setLancamentosState(next)
  }, [])

  return (
    <div className="app">
      {page !== 'home' && (
        <Header
          title={
            page === 'lancamentos'
              ? 'LANÇAMENTOS'
              : page === 'painel'
                ? 'PAINEL FINANCEIRO'
                : 'CADASTRO DE RECEITAS E DESPESAS'
          }
          onBack={() => setPage('home')}
        />
      )}

      {page === 'home' && (
        <div className="page-enter">
          <Home
          onLancamentos={() => setPage('lancamentos')}
          onPainel={() => setPage('painel')}
          onCadastro={() => setPage('cadastro')}
          />
        </div>
      )}
      {page === 'lancamentos' && (
        <div className="page-enter">
          <Lancamentos
            lancamentos={lancamentos}
            onUpdate={persistLancamentos}
          />
        </div>
      )}
      {page === 'painel' && (
        <div className="page-enter">
          <PainelFinancas lancamentos={lancamentos} />
        </div>
      )}
      {page === 'cadastro' && (
        <div className="page-enter">
          <CadastroReceitasDespesas
            lancamentos={lancamentos}
            onUpdate={persistLancamentos}
          />
        </div>
      )}
    </div>
  )
}
