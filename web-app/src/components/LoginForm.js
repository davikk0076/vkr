import { useState } from "react"

function LoginForm({ show, onClose, onLogin, roles }) {
    const [isRegister, setIsRegister] = useState(false)
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [selectedRole, setSelectedRole] = useState(null)

    if (!show) return null

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (isRegister && (password == confirmPassword)) {
            let response = await fetch("http://localhost:3001/users", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'username': username,
                    'email': email,
                    'password': password,
                    'role_id': Number(selectedRole)
                })})
            let data = await response.json()
            const user_id = data[0].create_user

            if (selectedRole == '1') {
                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    response = fetch("http://localhost:3001/volunteers", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'user_id': user_id,
                        'is_available': true,
                        'location': [lat, lon]
                    })})}, 
                    (err) => console.log(err),
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    });
            }
            onLogin(user_id)
            onClose()
        }
        else {
            const response = await fetch(`http://localhost:3001/login?email=${email}&password=${password}`)
            const data = await response.json()
            const user_id = data[0].user_id
            onLogin(user_id)
            onClose()
        }
    }

    return (
    <>
    <div className="modal-backdrop fade show"></div>

    <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog">
            <div className="modal-content">

                <div className="modal-header">
                    <h5 className="modal-title">{isRegister ? "Регистрация" : "Вход в систему"}</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                    ></button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>

                        {isRegister && (
                        <div className="mb-3">
                            <label className="form-label">Имя пользователя</label>
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>)}

                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Пароль</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {isRegister && (
                        <div className="mb-3">
                            <label className="form-label">Подтверждение пароля</label>
                            <input
                                type="password"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>)}

                        {isRegister && (
                        <div className="mb-3">
                            <label className="form-label">Выберите роль</label>

                            <div className="row mx-1">
                            {roles.map((role) => (
                                <div className="col-6 form-check" key={role.role_id}>
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        checked={selectedRole === role.role_id}
                                        onChange={() => setSelectedRole(role.role_id)}
                                    />
                                    <label
                                        className="form-check-label"
                                    >
                                        {role.description}
                                    </label>
                                </div>
                            ))}
                            </div>
                        </div>)}

                        <button type="submit" className="btn btn-primary w-100">
                            {isRegister ? "Зарегистрироваться" : "Войти"}
                        </button>

                    </form>
                </div>

                <div className="modal-footer">
                    {isRegister ? (
                        <>
                            Уже есть аккаунт?{" "}
                            <button className="btn btn-link" onClick={() => setIsRegister(false)}>
                                Войти
                            </button>
                        </>
                    ) : (
                        <>
                            Нет аккаунта?{" "}
                            <button className="btn btn-link" onClick={() => setIsRegister(true)}>
                                Регистрация
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    </div>
    </>
    )
}

export default LoginForm