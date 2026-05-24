export const getCachedData = (key) => {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
}

export const setCachedData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
}

let isOnline = true

const checkOnlineStatus = async () => {
    try {
        await fetch("https://google.com/", { mode: "no-cors" })
        const res = await fetch("http://localhost:3001/help_requests")

        isOnline = res.ok
    } catch {
        isOnline = false
    }
}

checkOnlineStatus()
setInterval(checkOnlineStatus, 5000)

export const isOnlineStatus = () => isOnline

export const addToQueue = (url, options) => {
    const queue = JSON.parse(localStorage.getItem("queue") || "[]")

    queue.push({ url, options })

    localStorage.setItem("queue", JSON.stringify(queue))
}

export const processQueue = async () => {
    const queue = JSON.parse(localStorage.getItem("queue") || "[]")

    for (const item of queue) {
        try {
            await fetch(item.url, item.options)
        } catch {
            return
        }
    }

    localStorage.removeItem("queue")
}

export const setupOfflineListener = () => {
    window.addEventListener("online", processQueue)
}

export const offlineFetch = async (url, options) => {
    if (!isOnlineStatus()) {
        addToQueue(url, options)
        return { offline: true }
    }

    return fetch(url, options)
}
