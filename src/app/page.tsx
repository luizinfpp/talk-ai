'use client'

import FooterButton from '@/components/footerButton'
import { getAnswer, getSpeak, getTranscription } from '@/server/getTranscription'
import { useState } from 'react'
import { Howl } from 'howler'
import AudioRecorder from "../components/audioRecorder"
import { Button } from '@/components/ui/button'

type PhrasesType = {
  phrase: string
  user: boolean
  loading?: boolean
}[]

export default function Home() {
  const [textFromVoice, setTextFromVoice] = useState('Example')
  const [speechFile, setSpeechFile] = useState(false)

  const [phrases, setPhrases] = useState<PhrasesType>([])

  const [audio, setAudio] = useState<Blob|null>(null);

  const sound = new Howl({
    src: ['hello.mp3'],
  })

  const transcribe = async () => {
    // const text = await getTranscription()
    // setTextFromVoice(text)
    setPhrases((old) => [...old, { phrase: 'Carregando...', user: true, loading: true }])
    const text = await new Promise<string>((resolve) => setTimeout(() => resolve('Hello'), 2500))
    setPhrases((old) => [...old.slice(0, -1), { phrase: text, user: true }])
  }

  const transcribeAudio = async (audio: Blob) => {
    // const audioBlob = new Blob(audio)
    const audioBuffer = await audio.arrayBuffer()
    const buffer = Buffer.from(audioBuffer)
    const text = await getTranscription(buffer)
    setTextFromVoice(text)
    // setPhrases((old) => [...old, { phrase: 'Carregando...', user: true, loading: true }])
    // const text = await new Promise<string>((resolve) => setTimeout(() => resolve('Hello'), 2500))
    // setPhrases((old) => [...old.slice(0, -1), { phrase: text, user: true }])
  }

  const answer = async () => {
    // const text = await getAnswer(textFromVoice)
    // setTextFromVoice(text)
    setPhrases((old) => [...old, { phrase: 'Carregando...', user: false, loading: true }])
    const text = await new Promise<string>((resolve) => setTimeout(() => resolve('Hello you'), 2000))
    setPhrases((old) => [...old.slice(0, -1), { phrase: text, user: false }])
  }

  const speak = async () => {
    // const result = await getSpeak(textFromVoice)
    // setSpeechFile(result)
    sound.play()
  }

  const conversation = async () => {
    await transcribe()
    await answer()
    await speak()
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-slate-100 gap-6">
      <div className="bg-slate-50 rounded-md flex-grow w-full h-full flex flex-col justify-end gap-4 p-8">
        {phrases.map((item) => (
          <div
            className={`px-4 py-2 rounded-3xl 
              ${item.user ? 'bg-indigo-500 text-white self-end' : 'bg-slate-300 text-black self-start'} 
              ${item.loading !== undefined && item.loading ? 'italic opacity-80' : ''}`}
            key={item.phrase}
          >
            <p>{item.phrase}</p>
          </div>
        ))}
      </div>
      <FooterButton onClick={conversation} />
      <AudioRecorder setAudio={setAudio}/>

      {
        audio? 
        <div className='flex flex-col'>
          {/* <audio src={audio} controls></audio> */}
          <Button onClick={() => transcribeAudio(audio)}>Transcript</Button>
        </div>:
        <></>
      }

      <h1>{textFromVoice}</h1>

      {/* <Button onClick={transcribe}>Transcript</Button>
      <Button onClick={answer}>Answer</Button>
      <Button onClick={speak}>Speak</Button>
      {speechFile && (
        <div>
          <audio src="speech.mp3" autoPlay>
            <a href="speech.mp3" download="speech.mp3">
              Baixar áudio
            </a>
          </audio>
        </div>
      )}
      <div>
        <audio src="hello.mp3" autoPlay>
          <a href="hello.mp3" download="hello.mp3">
            Baixar áudio
          </a>
        </audio>
      </div> */}
    </main>
  )
}
