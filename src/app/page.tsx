"use client";

import {
  getAnswer,
  getSpeak,
  getTranscription,
} from "@/server/getTranscription";
import { useEffect, useState } from "react";
import AudioRecorder from "../components/audioRecorder";
import { Button } from "@/components/ui/button";
import { base64ToBuffer } from "@/lib/base64";
import { TalkingType } from "@/lib/types";
import PlayIcon from "@/components/icons/play";
import { twMerge } from "tailwind-merge";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Howl } from "howler";

const messages = {
  unregistered: "Please enter the password.",
  unable:
    "Enable your microphone to start speaking by clicking the mic button below - and type the password.",
  ready: "Click the mic button below to start talking.",
  wait: "We will start the recording any moment.",
  recording: "Recording! Click the mic button when you stop.",
  fetching: "We are thinking about your answer.",
  answering: "Here you go!",
};

const messageStyles = {
  unregistered: "text-gray-600",
  unable: "text-orange-600",
  ready: "text-indigo-500",
  wait: "text-gray-600",
  recording: "text-red-600",
  fetching: "text-gray-600",
  answering: "text-teal-500",
};

export default function Home() {
  const [textFromVoice, setTextFromVoice] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState<string | null>(null);

  const [audio, setAudio] = useState<string | null>(null);
  const [audioAnswer, setAudioAnswer] = useState<string | null>(null);

  const [talkingStatus, setTalkingStatus] =
    useState<TalkingType>("unregistered");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const formSchema = z.object({
    password: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const transcribe = async () => {
    if (!audio) return; // TODO: better handling
    setAudioAnswer(null);
    setTextFromVoice(null);
    setTextAnswer(null);

    const text = await getTranscription(audio);
    setTextFromVoice(text);
  };

  const answer = async () => {
    if (!textFromVoice) return; // TODO: better handling

    const answer = await getAnswer(textFromVoice);
    setTextAnswer(answer);
  };

  const speak = async () => {
    if (!textAnswer) return; // TODO: better handling

    const result = await getSpeak(textAnswer);

    const buffer = base64ToBuffer(result);
    const audioBlob = new Blob([buffer], { type: 'audio/mp4' });
    const audioUrl = URL.createObjectURL(audioBlob);

    setAudio(null);
    setTalkingStatus("answering");
    setAudioAnswer(audioUrl);
  };

  const playAudio = () => {
    if (!audioAnswer) return; // TODO: better handling

    const audioSpeechHowl = new Howl({
      src: [audioAnswer],
      format: ['ogg'],
      onend: function() {
        setIsAudioPlaying(false);
      }
    })

    setIsAudioPlaying(true);
    audioSpeechHowl.play()

    // const audioSpeech = new Audio(audioAnswer);
    // setIsAudioPlaying(true);
    // audioSpeech.play();
    // audioSpeech.onended = function () {
    //   setIsAudioPlaying(false);
    // };
    setTalkingStatus("ready");
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.password === process.env.NEXT_PUBLIC_ACCESS_PW)
      setTalkingStatus("unable");
    else
      form.setError("password", {
        type: "custom",
        message: "Password is wrong.",
      });
  }

  useEffect(() => {
    if (audio) transcribe();
  }, [audio]);

  useEffect(() => {
    if (textFromVoice) answer();
  }, [textFromVoice]);

  useEffect(() => {
    if (textAnswer) speak();
  }, [textAnswer]);

  useEffect(() => {
    if (audioAnswer) playAudio();
  }, [audioAnswer]);

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-slate-100 gap-6">
      <div className="bg-slate-50 rounded-md flex-grow w-full h-full flex flex-col justify-evenly items-center gap-4 p-8">
        <div>
          {talkingStatus === "unregistered" && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 items-end"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <label>Password</label>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Submit</Button>
              </form>
            </Form>
          )}
        </div>
        <p className={twMerge(messageStyles[talkingStatus], "select-none")}>
          {messages[talkingStatus]}
        </p>
        <div>
          {talkingStatus === "ready" && audioAnswer ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <Button
                  size="variable"
                  className="p-3 rounded-full bg-teal-500 hover:bg-teal-600 transition-colors duration-300"
                  onClick={playAudio}
                  disabled={isAudioPlaying}
                  // className="p-5 rounded-full bg-gradient-to-tr from-indigo-500 from-0% via-sky-500 via-30% to-emerald-400 to-90% hover:from-indigo-400 hover:via-sky-400 hover:to-emerald-300 "
                >
                  <PlayIcon className={`fill-white w-6 h-6`} />
                </Button>
              </div>
              {!isAudioPlaying && (
                <p className="text-slate-400 text-sm">{textFromVoice}</p>
              )}
              {!isAudioPlaying && (
                <p className="text-indigo-400 text-sm">{textAnswer}</p>
              )}
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <AudioRecorder
        setAudio={setAudio}
        talkingStatus={talkingStatus}
        setTalkingStatus={setTalkingStatus}
      />

      {/* {
        audio ? 
        <div className='flex flex-col'>
          <audio src={audio} controls></audio>
          <Button onClick={speak}>Speak</Button>
        </div>:
        <></>
      } */}
    </main>
  );
}
