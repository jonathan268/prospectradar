import { memo } from 'react'
import { Radar, Github } from 'lucide-react'

const Header = memo(function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-surface/80 backdrop-blur-xl border-b border-white/[0.06]" />
      <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Radar className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse-soft shadow-lg shadow-emerald-400/50" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-white tracking-tight">
                ProspectRadar
              </h1>
              <p className="text-[11px] text-white/40 font-sans font-normal -mt-0.5 leading-none">
                Trouve tes clients avant tout le monde
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-3" aria-label="Navigation">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              <span className="text-[11px] font-medium text-emerald-300 tracking-wide uppercase">
                Gratuit &bull; Open Source
              </span>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub du projet"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
            >
              <Github className="w-4.5 h-4.5" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
})

export default Header
