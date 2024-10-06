import { saveFile } from "@/server/getTranscription";
import { useState, useRef, Dispatch, SetStateAction } from "react";
const AudioRecorder = ({setAudio}: {setAudio: Dispatch<SetStateAction<string | null>>}) => {
  const mimeType = "audio/webm";

  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef<MediaRecorder|null>(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err) {
        alert(err);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    if (!stream) return

    setRecordingStatus("recording");
    //create new Media recorder instance using the stream
    const media = new MediaRecorder(stream, { mimeType });
    //set the MediaRecorder instance to the mediaRecorder ref
    mediaRecorder.current = media;
    //invokes the start method to start the recording process
    mediaRecorder.current.start();
    let localAudioChunks : Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
       if (typeof event.data === "undefined") return;
       if (event.data.size === 0) return;
       localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    if (!mediaRecorder.current) return

    setRecordingStatus("inactive");
    //stops the recording instance
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      //creates a blob file from the audiochunks data
       const audioBlob = new Blob(audioChunks, { type: mimeType });
      //creates a playable URL from the blob file.
       const audioUrl = URL.createObjectURL(audioBlob);
       console.log(audioUrl)
       setAudio(audioUrl);
       saveFile()
       setAudioChunks([]);
    };
  };

  return (
    <div>
      <h2>Audio Recorder</h2>
      <main>
        <div className="audio-controls">
          {!permission ? (
          <button onClick={getMicrophonePermission} type="button">
              Get Microphone
          </button>
          ) : null}
          {permission && recordingStatus === "inactive" ? (
          <button onClick={startRecording} type="button">
              Start Recording
          </button>
          ) : null}
          {recordingStatus === "recording" ? (
          <button onClick={stopRecording} type="button">
              Stop Recording
          </button>
          ) : null}
          
        </div>
      </main>
    </div>
  );
};
export default AudioRecorder;