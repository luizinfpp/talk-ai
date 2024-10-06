import MicOnIcon from './icons/mic_on'
import PlayIcon from './icons/play'
import { Button } from './ui/button'

const FooterButton = ({ ...params }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <div className="flex gap-4 items-center">
      <Button
        size="variable"
        className="p-5 rounded-full bg-indigo-500 hover:bg-indigo-700 transition-colors duration-300"
        {...params}
        // className="p-5 rounded-full bg-gradient-to-tr from-indigo-500 from-0% via-sky-500 via-30% to-emerald-400 to-90% hover:from-indigo-400 hover:via-sky-400 hover:to-emerald-300 "
      >
        <MicOnIcon className={`fill-white w-8 h-8`} />
      </Button>
      <Button
        size="variable"
        className="p-3 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors duration-300"
        {...params}
        // className="p-5 rounded-full bg-gradient-to-tr from-indigo-500 from-0% via-sky-500 via-30% to-emerald-400 to-90% hover:from-indigo-400 hover:via-sky-400 hover:to-emerald-300 "
      >
        <PlayIcon className={`fill-slate-700 w-6 h-6`} />
      </Button>
    </div>
  )
}

export default FooterButton
