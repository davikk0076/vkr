import { useState } from "react"
import VoiceInput from "./VoiceInput"
import MapPicker from "./MapPicker"

function getUrgencyBonus(description) {
    const urgentWords = ["срочно", "экстренно", "нет еды", "боль", "лекарства закончились"]
    const text = description.toLowerCase()

    let bonus = 0

    urgentWords.forEach(word => {
        if (text.includes(word)) {
            bonus += 1
        }
    })

    return Math.min(bonus, 3)
}

function calculatePriority(type, description) {
    const typePriority = {2: 7, 1: 5, 3: 4, 4: 0}
    let priority = typePriority[type]

    priority += getUrgencyBonus(description)

    return Math.max(1, Math.min(priority, 10))
}

function RequestForm({ show, onClose, helpTypes, user_id }) {
    const [description, setDescription] = useState("")
    const [selectedType, setSelectedType] = useState(null)
    const [showMap, setShowMap] = useState(false)
    const [location, setLocation] = useState(null)
    const [address, setAddress] = useState(null)
    const [district, setDistrict] = useState(null)

    if (!show) return null

    const handleSubmit = async (e) => {
        e.preventDefault()

        const priority = calculatePriority(selectedType, description)
        const response = await fetch("http://localhost:3001/requests", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'user_id': user_id,
                'status_id': 1,
                'type_id': selectedType,
                'description': description,
                'priority': priority,
                'location': location,
                'address': address,
                'district': district
            })})
        const data = await response.json()
        onClose()
        
    }

    return (
    <>
    <div className="modal-backdrop fade show"></div>

    <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog">
            <div className="modal-content">

                <div className="modal-header">
                    <h5 className="modal-title">Создание запроса</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                    ></button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">
                            <label className="form-label">Выберите тип помощи</label>

                            <div className="row mx-1">
                            {helpTypes.map((type) => (
                                <div className="col-6 form-check" key={type.type_id}>
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        checked={selectedType === type.type_id}
                                        onChange={() => setSelectedType(type.type_id)}
                                    />
                                    <label
                                        className="form-check-label"
                                    >
                                        {type.description}
                                    </label>
                                </div>
                            ))}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Опишите вашу проблему</label>
                            <textarea
                                type="text"
                                className="form-control"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                            <VoiceInput onText={(text) => setDescription((prev) => prev + " " + text)} />
                        </div>

                        <button
                            type="button"
                            className="mb-3 btn btn-outline-primary"
                            onClick={() => setShowMap(true)}
                        >
                            Выбрать локацию
                        </button>
                        <div className="mt-2">
                            <strong>Адрес:</strong> {address} <br />
                            <strong>Район:</strong> {district}
                        </div>

                        <button type="submit" className="btn btn-primary w-100">Создать запрос</button>

                    </form>
                </div>

            </div>
        </div>
    </div>

    {showMap && (
    <>
    <div className="modal-backdrop fade show"></div>

    <div className="modal d-block">
        <div className="modal-dialog modal-lg">
            <div className="modal-content">

                <div className="modal-header">
                    <h5>Выбор локации</h5>
                    <button className="btn-close" onClick={() => setShowMap(false)} />
                </div>

                <div className="modal-body">
                    <MapPicker onSelect={(e) => {
                        setLocation(e.coords)
                        setAddress(e.address)
                        setDistrict(e.district)
                        setShowMap(false)
                    }} />
                </div>

            </div>
        </div>
    </div>
    </>)}
    </>
    )
}

export default RequestForm