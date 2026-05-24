import '../styles/App.css'
import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginForm from './LoginForm'
import RequestForm from './RequestForm'
import YandexMap from './YandexMap'
import { getCachedData, setCachedData, isOnlineStatus, setupOfflineListener, offlineFetch } from "../offlineMode"

function App() {
    const navigate = useNavigate()
    const [roles, setRoles] = useState([])
    const [statuses, setStatuses] = useState([])
    const [helpTypes, setHelpTypes] = useState([])
    const [helpRequests, setHelpRequests] = useState([])
    const [userLocation, setUserLocation] = useState([])
    const [showLoginForm, setShowLoginForm] = useState(false)
    const [showRequestForm, setShowRequestForm] = useState(false)
    const [logged, setLogged] = useState(false)
    const [user, setUser] = useState({})
    const [activePage, setActivePage] = useState()

    const initialData = async (tableName, setter) => {
        try {
            const response = await fetch(`http://localhost:3001/${tableName}`)
            const data = await response.json()
            setter(data)
            setCachedData(tableName, data)
        } catch {
            setter(getCachedData(tableName))
        }
        
    }

    const onLogin = async (uid) => {
        const response = await fetch(`http://localhost:3001/users/${uid}`)
        const data = await response.json()
        setUser(data[0])
        localStorage.setItem("user", JSON.stringify(data[0]));
        if (data[0].role_id == 1) {
            const locationResponse = await fetch(`http://localhost:3001/volunteers/location/${uid}`)
            const locationData = await locationResponse.json()
            setUserLocation([locationData.lat, locationData.lon])
            localStorage.setItem("userLocation", JSON.stringify([locationData.lat, locationData.lon]));
        }
        setLogged(true)
    }

    const logout = () => {
        setUser({})
        setUserLocation([])
        setLogged(false)
        localStorage.removeItem("user")
        localStorage.removeItem("userLocation")
        setActivePage(mainPage)
    }

    const acceptRequest = async (request_id) => {
        await offlineFetch(`http://localhost:3001/help_requests/${request_id}/accept`, {method: "POST"})
        initialData("help_requests", setHelpRequests)
    }
    
    const completeRequest = async (request_id) => {
        await offlineFetch(`http://localhost:3001/help_requests/${request_id}/complete`, {method: "POST"})
        initialData("help_requests", setHelpRequests)
    }

    const mainPage = (
        <>
        <section className="bg-light text-center py-5">
            <div className="container">
                <h1 className="display-5 fw-bold">Система распределения помощи</h1>
                <p className="lead">Помогаем людям получать продукты, медикаменты и одежду быстрее</p>
                {user.role_id == 2 && (<button className="btn btn-primary btn-lg mx-5" onClick={() => logged ? setShowRequestForm(true) : setShowLoginForm(true)}>Создать заявку</button>)}
            </div>
        </section>

        <section className="py-5">
            <div className="container">
                <div className="row text-center">

                    <div className="col-6 md-4">
                        <h4>📍 Карта потребностей</h4>
                        <p>Просмотр заявок на карте с геолокацией</p>
                    </div>

                    <div className="col-6 md-4">
                        <h4>📦 Помощь</h4>
                        <p>Продукты, лекарства и одежда для нуждающихся</p>
                    </div>

                </div>
            </div>
        </section>

        
        {isOnlineStatus() ? (
        <YandexMap helpRequests={helpRequests.filter(request => request.status_id == 1)} helpTypes={helpTypes} userLocation={userLocation} />
        ) : (
        <div className="text-center p-5">Нет интернета. Доступен только список заявок</div>
        )}

        <section className="bg-light py-5">
            <div className="container">
                <h3 className="mb-4 text-center">Заявки</h3>

                <div className="row">

                    {helpRequests.filter(request => request.status_id == 1).map((request) => (
                    <div key={request.request_id} className="col-md-4">
                        <div className="card">
                            <div className="card-body">
                                <h5>{helpTypes.find(type => type.type_id == request.type_id).description}</h5>
                                <p>{request.description}</p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className={`badge ${request.priority >= 7 ? "bg-danger" : request.priority >= 4 ? "bg-warning" : "bg-success"}`}>{request.priority}</span>
                                    {user.role_id == 1 && 
                                    <button className="badge bg-success" onClick={() => acceptRequest(request.request_id)}>Принять</button>}
                                </div>
                            </div>
                        </div>
                    </div>))}
                    
                </div>
            </div>
        </section>
        </>)

    const myRequestsPage = (
        <>
        <section className="container bg-light text-center py-5">
            <h1 className="display-5 fw-bold">Мои заявки</h1>
        </section>

        {isOnlineStatus() ? (
        <YandexMap helpRequests={helpRequests.filter(request => request.status_id == 2)} helpTypes={helpTypes} userLocation={userLocation} />
        ) : (
        <div className="text-center p-5">Нет интернета. Доступен только список заявок</div>
        )}

        <section className="bg-light py-5">
            <div className="container">
                <h3 className="mb-4 text-center">Список заявок</h3>

                <div className="row">

                    {helpRequests.filter(request => request.status_id == 2).map((request) => (
                    <div key={request.request_id} className="col-md-4">
                        <div className="card">
                            <div className="card-body">
                                <h5>{helpTypes.find(type => type.type_id == request.type_id)?.description}</h5>
                                <p>{request.description}</p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className={`badge ${request.priority >= 7 ? "bg-danger" : request.priority >= 4 ? "bg-warning" : "bg-success"}`}>{request.priority}</span>
                                    <button className="badge bg-success" onClick={() => completeRequest(request.request_id)}>Выполнить</button>
                                </div>
                            </div>
                        </div>
                    </div>))}
                    
                </div>
            </div>
        </section>
        </>)

    useEffect(() => {
        setupOfflineListener()
    }, [])
    
    useEffect(() => {
        const localUser = localStorage.getItem("user")
        if (localUser) {
            setUser(JSON.parse(localUser))
            setLogged(true)
        }
        const localLocation = localStorage.getItem("userLocation")
        if (localLocation) {
            setUserLocation(JSON.parse(localLocation))
        }
        initialData("roles", setRoles)
        initialData("statuses", setStatuses)
        initialData("help_types", setHelpTypes)
        initialData("help_requests", setHelpRequests)
        setActivePage(mainPage)
    }, [])

    return (
    <>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
            <button className="navbar-brand nav-link" onClick={() => navigate("/")}>Помощь+</button>

            <div className="collapse navbar-collapse" id="nav">
                <ul className="navbar-nav ms-auto">
                    {logged ? (<> 
                    <span className="nav-item nav-link active">{user.username}</span> 
                    <span className="nav-item nav-link active">{roles.find(role => role.role_id == user.role_id)?.description}</span> 
                    {user.role_id == 1 && (
                    <button className="nav-item nav-link" onClick={() => navigate("/myRequests")}>Мои заявки</button>)}
                    {isOnlineStatus() ? (
                        <button className="nav-item nav-link" onClick={logout}>Выйти</button> 
                    ) : <span className="nav-item nav-link disabled">Оффлайн</span>}</>
                ) : <button className="nav-item nav-link" onClick={() => setShowLoginForm(true)}>Вход</button>}
                </ul>
            </div>
        </div>
    </nav>

    <Routes>
        <Route path="/" element={mainPage} />
        <Route path="/myRequests" element={myRequestsPage} />
    </Routes>

    <footer className="bg-dark text-white text-center py-3">
        <div className="container">
            <p className="mb-0">© 2026 Система помощи</p>
        </div>
    </footer>
        
    <LoginForm
        show={showLoginForm}
        onClose={() => setShowLoginForm(false)}
        onLogin={onLogin}
        roles={roles}
    />

    <RequestForm
        show={showRequestForm}
        onClose={() => {setShowRequestForm(false)
                        initialData("help_requests", setHelpRequests)}}
        helpTypes={helpTypes}
        user_id={user.user_id}
    />
    </>
    )
}

export default App
