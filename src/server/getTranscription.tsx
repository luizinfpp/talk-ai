'use server'

import { Readable } from "stream"
import path from 'path'
import OpenAI, { toFile } from 'openai'
import { base64ToBuffer, bufferToBase64 } from "@/lib/base64"

const openai = new OpenAI()

export const getTranscription = async (audio: string) => {
  const aBuffer = await base64ToBuffer(audio)
  const buffer = await Buffer.from(aBuffer)
  const audioToFile = await toFile(Readable.from(buffer), 'audio.mp3');

  const transcription = await openai.audio.transcriptions.create({
    file: audioToFile,
    model: 'whisper-1',
    language: 'en'
  })

  return transcription.text

  // With file created on local server
  // await fs.createWriteStream('./public/file.mp3').write(buffer)

  // const transcription = await openai.audio.transcriptions.create({
  //   file: fs.createReadStream('./public/file.mp3'),
  //   model: 'whisper-1',
  // })
}

export const getAnswer = async (text: string) => {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'system', content: 'Use always English language to answer.' },
      { role: 'user', content: 'Who won the world series in 2020?' },
      { role: 'assistant', content: 'The Los Angeles Dodgers won the World Series in 2020.' },
      { role: 'user', content: text },
    ],
    model: 'gpt-3.5-turbo',
  })

  console.log(completion.choices[0])
  return completion.choices[0].message.content!
}

export const getSpeak = async (text: string) => {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
  })

  const speakStr = bufferToBase64(await mp3.arrayBuffer())
  return speakStr
}
