"use server";

import { Readable } from "stream";
import OpenAI, { toFile } from "openai";
import { base64ToBuffer, bufferToBase64 } from "@/lib/base64";

const openai = new OpenAI();

export const getTranscription = async (audio: string) => {
  const aBuffer = await base64ToBuffer(audio);
  const buffer = await Buffer.from(aBuffer);
  const audioToFile = await toFile(Readable.from(buffer), "audio.mp3");

  const transcription = await openai.audio.transcriptions.create({
    file: audioToFile,
    model: "whisper-1",
    language: "en",
  });

  return transcription.text;

  // With file created on local server
  // await fs.createWriteStream('./public/file.mp3').write(buffer)

  // const transcription = await openai.audio.transcriptions.create({
  //   file: fs.createReadStream('./public/file.mp3'),
  //   model: 'whisper-1',
  // })
};

export const getAnswer = async (text: string) => {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a language teacher. You are helpful, but use a casual vocabulary.",
      },
      {
        role: "system",
        content:
          "Try to engage in the conversation, staying in the topic or starting a new one when the conversation is nearing a dead end. On these situations you can bring topics like sports, music or movies.",
      },
      {
        role: "system",
        content:
          "At the end of the answer you can add a small phrase pointing out some grammar errors or tips to improve the language learning of the user.",
      },
      { role: "system", content: "Use always English language to answer." },
      { role: "user", content: "Who won the world series in 2020?" },
      {
        role: "assistant",
        content: "The Los Angeles Dodgers! Nice team. Do you like baseball?",
      },
      { role: "user", content: "No, baseball not one of my favorite sports." },
      {
        role: "assistant",
        content:
          'Got it. So, what sports do you like? By the way, it would be better if you said "baseball is not one of my favorite sports", ok?',
      },
      { role: "user", content: text },
    ],
    model: "gpt-4o",
  });

  return completion.choices[0].message.content!;
};

export const getSpeak = async (text: string) => {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    response_format: 'opus',
    input: text,
  });

  const speakStr = bufferToBase64(await mp3.arrayBuffer());
  return speakStr;
};
