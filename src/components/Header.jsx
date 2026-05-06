import { Radar } from 'lucide-react'

export default function Header() {
  return (
    <header className="navbar bg-base-200 border-b border-base-300 px-4 lg:px-8 sticky top-0 z-50">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-xl p-2">
            <Radar className="w-5 h-5 text-primary-content" />
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
      <div className="flex-none">
        <div className="hidden sm:flex badge badge-success badge-outline text-xs font-medium gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
          Gratuit &amp; Open Source
        </div>
      </div>
    </header>
  )
}
