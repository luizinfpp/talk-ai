'use server'

import { Readable } from "stream"
import * as fs from 'fs'
import path from 'path'
import OpenAI, { toFile } from 'openai'

const openai = new OpenAI()

export const getTranscription = async (audio: Buffer) => {
  console.log(audio)
  const audioToFile = await toFile(Readable.from(audio), 'audio.mp3');

  const transcription = await openai.audio.transcriptions.create({
    file: audioToFile,
    model: 'whisper-1',
  })

  // const transcription = await openai.audio.transcriptions.create({
  //   file: fs.createReadStream('./public/hello.mp3'),
  //   model: 'whisper-1',
  // })

  console.log(transcription)
  return transcription.text
}

export const getAnswer = async (text: string) => {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
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
  const speechFile = path.resolve('./public/speech.mp3')

  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
  })

  const buffer = Buffer.from(await mp3.arrayBuffer())
  await fs.promises.writeFile(speechFile, buffer)
  return true
}

export const saveFile = () => {
  
}
