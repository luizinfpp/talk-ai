'use client'

import { getAnswer, getSpeak, getTranscription } from '@/server/getTranscription'
import { useEffect, useState } from 'react'
import { Howl } from 'howler'
import AudioRecorder from "../components/audioRecorder"
import { Button } from '@/components/ui/button'
import { base64ToBuffer } from '@/lib/base64'
import { TalkingType } from '@/lib/types'
import PlayIcon from '@/components/icons/play'
import { twMerge } from 'tailwind-merge'
import { addIssueToContext } from 'zod'

const messages = {
  unable: "Enable your microphone to start speaking by clicking the mic button below.",
  ready: "Click the mic button below to start talking.",
  wait: "We will start the recording any moment.",
  recording: "Recording! Click the mic button when you stop.",
  fetching: "We are thinking about your answer.",
  answering: "Here you go!",
}

const messageStyles = {
  unable: "text-orange-600",
  ready: "text-indigo-500",
  wait: "text-gray-600",
  recording: "text-red-600",
  fetching: "text-gray-600",
  answering: "text-teal-500",
}

export default function Home() {
  const [textFromVoice, setTextFromVoice] = useState<string|null>(null)
  const [textAnswer, setTextAnswer] = useState<string|null>(null)

  const [audio, setAudio] = useState<string|null>(null);
  const [audioAnswer, setAudioAnswer] = useState<string|null>(null);

  const [talkingStatus, setTalkingStatus] = useState<TalkingType>("unable");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  const transcribe = async () => {
    if (!audio) return // TODO: better handling
    setAudioAnswer(null)
    setTextFromVoice(null)
    setTextAnswer(null)

    const text = await getTranscription(audio)
    setTextFromVoice(text)
  }

  const answer = async () => {
    if (!textFromVoice) return // TODO: better handling

    const answer = await getAnswer(textFromVoice)
    setTextAnswer(answer)
  }

  const speak = async () => {
    if (!textAnswer) return // TODO: better handling

    const result = await getSpeak(textAnswer)

    const buffer = base64ToBuffer(result)
    const audioBlob = new Blob([buffer]);
    const audioUrl = URL.createObjectURL(audioBlob);

    setAudio(null)
    setTalkingStatus('answering')
    setAudioAnswer(audioUrl)
  }

  const playAudio = () => {
    if (!audioAnswer) return // TODO: better handling

    const audioSpeech = new Audio(audioAnswer);
    setIsAudioPlaying(true)
    audioSpeech.play();
    audioSpeech.onended = function () {
      setIsAudioPlaying(false)
    }
    setTalkingStatus('ready')
  }

  useEffect(() => {
    if (audio) transcribe()
  }, [audio]);

  useEffect(() => {
    if (textFromVoice) answer()
  }, [textFromVoice]);

  useEffect(() => {
    if (textAnswer) speak()
  }, [textAnswer]);

  useEffect(() => {
    if (audioAnswer) playAudio()
  }, [audioAnswer]);

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-slate-100 gap-6">
      <div className="bg-slate-50 rounded-md flex-grow w-full h-full flex flex-col justify-evenly items-center gap-4 p-8">
        <div></div>
        <p className={twMerge(messageStyles[talkingStatus], 'select-none')}>{messages[talkingStatus]}</p>
        <div>
          {
            talkingStatus == 'ready' && audioAnswer?
            <Button
              size="variable"
              className="p-3 rounded-full bg-teal-500 hover:bg-teal-600 transition-colors duration-300"
              onClick={playAudio}
              disabled={isAudioPlaying}
              // className="p-5 rounded-full bg-gradient-to-tr from-indigo-500 from-0% via-sky-500 via-30% to-emerald-400 to-90% hover:from-indigo-400 hover:via-sky-400 hover:to-emerald-300 "
            >
              <PlayIcon className={`fill-white w-6 h-6`} />
            </Button>   
            : <></>
          }     
      </div>      
      </div>
      <AudioRecorder setAudio={setAudio} talkingStatus={talkingStatus} setTalkingStatus={setTalkingStatus} />

      {/* {
        audio ? 
        <div className='flex flex-col'>
          <audio src={audio} controls></audio>
          <Button onClick={speak}>Speak</Button>
        </div>:
        <></>
      } */}
    </main>
  )
}
