import { bufferToBase64 } from "@/lib/base64";
import { useState, useRef, Dispatch, SetStateAction } from "react";
import { Button } from "./ui/button";
import MicOnIcon from "./icons/mic_on";
import { TalkingType } from "@/lib/types";

interface AudioRecorderProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  talkingStatus: TalkingType;
  setAudio: Dispatch<SetStateAction<string | null>>;
  setTalkingStatus: Dispatch<SetStateAction<TalkingType>>;
}

const AudioRecorder = ({
  setAudio,
  talkingStatus,
  setTalkingStatus,
  ...props
}: AudioRecorderProps) => {
  const mimeType = "audio/webm";

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const actionHandler = () => {
    switch (talkingStatus) {
      case "unable":
        getMicrophonePermission();
        break;
      case "ready":
        startRecording();
        break;
      case "recording":
        stopRecording();
        break;
      default:
        break;
    }
  };

  const buttonStyleHandler = ():
    | "disabled"
    | "unabled"
    | "default"
    | "destructive"
    | "unregistered"
    | null
    | undefined => {
    switch (talkingStatus) {
      case "unable":
        return "unabled";
      case "ready":
        return "default";
      case "recording":
        return "destructive";
      default:
        return "disabled";
    }
  };

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setStream(streamData);
        setTalkingStatus("ready");
      } catch (err) {
        alert(err);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    if (!stream) return;

    setTalkingStatus("wait");
    const media = new MediaRecorder(stream, { mimeType });
    mediaRecorder.current = media;
    setTalkingStatus("recording");
    mediaRecorder.current.start();
    const localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    if (!mediaRecorder.current) return;

    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, {
        type: "audio/mp3; codecs=opus",
      });
      audioBlob.arrayBuffer().then((arrayBuffer) => {
        const buffer = Buffer.from(arrayBuffer);
        const base64Audio = bufferToBase64(buffer);
        setAudio(base64Audio);
        setTalkingStatus("fetching");
      });

      setAudioChunks([]);
    };
  };

  return (
    <div>
      <Button
        size="variable"
        className="p-5 rounded-full transition-colors duration-300"
        variant={buttonStyleHandler()}
        onClick={actionHandler}
        disabled={buttonStyleHandler() === "disabled"}
        {...props}
        // className="p-5 rounded-full bg-gradient-to-tr from-indigo-500 from-0% via-sky-500 via-30% to-emerald-400 to-90% hover:from-indigo-400 hover:via-sky-400 hover:to-emerald-300 "
      >
        <MicOnIcon className={`fill-white w-8 h-8`} />
      </Button>
    </div>
  );
};
export default AudioRecorder;
