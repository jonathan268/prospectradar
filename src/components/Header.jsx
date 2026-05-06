import { Radar, Github, ExternalLink } from 'lucide-react'

export default function Header() {
  return (
    <header className="navbar bg-base-200/90 backdrop-blur-md border-b border-base-300/50 px-4 lg:px-8 sticky top-0 z-50">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-2">
              <Radar className="w-5 h-5 text-primary-content" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full animate-pulse"></div>
          </div>
          <div>
            <span className="text-lg font-bold text-base-content tracking-tight">
              ProspectRadar
            </span>
            <span className="hidden sm:block text-xs text-base-content/50 font-normal -mt-0.5">
              Trouve tes clients avant tout le monde
            </span>
          </div>
        </div>
      </div>
      <div className="flex-none gap-2">
        <div className="hidden sm:flex badge badge-success badge-outline text-xs font-medium gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
          Gratuit &amp; Open Source
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm btn-square"
        >
          <Github className="w-5 h-5" />
        </a>
      </div>
    </header>
  )
}