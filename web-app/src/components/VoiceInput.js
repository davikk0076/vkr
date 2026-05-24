import { useState, useEffect, useRef } from "react"

function VoiceInput({ onText }) {
    const [recording, setRecording] = useState(false)
    const mediaRecorderRef = useRef(null)
    const chunks = useRef([])
    const [devices, setDevices] = useState([])
    const [selectedMic, setSelectedMic] = useState("")

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
            navigator.mediaDevices.enumerateDevices().then((list) => {
                const mics = list.filter(d => d.kind === "audioinput")
                setDevices(mics)
                setSelectedMic(mics[0]?.deviceId)
            })
        })
    }, [])
    
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({audio: {deviceId: { exact: selectedMic }}})
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm; codecs=opus" })
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (e) => {
            chunks.current.push(e.data)
        }

        mediaRecorder.onstop = async () => {
            const blob = new Blob(chunks.current, { type: "audio/webm" })
            chunks.current = []

            const formData = new FormData()
            formData.append("file", blob)

            const res = await fetch("http://localhost:3001/voice", {
                method: "POST",
                body: formData
            })

            const data = await res.json()
            onText(data.text)
        }

        mediaRecorder.start()
        setRecording(true)
    }

    const stopRecording = () => {
        mediaRecorderRef.current.stop()
        setRecording(false)
    }

    return (
        <div className="d-flex align-items-center gap-2">
        <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={recording ? stopRecording : startRecording}
        >
            {recording ? "🔴" : "🎤"}
        </button>
        <select
            className="form-select"
            value={selectedMic}
            onChange={(e) => setSelectedMic(e.target.value)}
        >
            {devices.map((mic) => (
                <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || "Микрофон"}
                </option>
            ))}
        </select>
        </div>
    )
}

export default VoiceInput