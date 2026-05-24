import { useEffect, useRef, useState } from "react"

function YandexMap({ helpRequests, helpTypes, userLocation }) {
    const mapContainer = useRef(null)
    const mapInstance = useRef(null)
    const [mapReady, setMapReady] = useState(false)

    useEffect(() => {
        if (!window.ymaps || !mapContainer.current) return

        window.ymaps.ready(() => {
            if (mapInstance.current) return

            mapInstance.current = new window.ymaps.Map(mapContainer.current, {
                center: userLocation || [57.62, 39.89],
                zoom: 10
            })

            setMapReady(true)
        })



        return () => {
            if (mapInstance.current) {
                mapInstance.current.destroy()
                mapInstance.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (!mapInstance.current || !mapReady) return

        const map = mapInstance.current

        map.geoObjects.removeAll()

        if (userLocation.length != 0) {
            console.log(userLocation.length)
            const userPlacemark = new window.ymaps.Placemark(
                userLocation,
                { balloonContent: "Ваше местоположение" },
                { preset: "islands#blueDotIcon" }
            )

            map.geoObjects.add(userPlacemark)
        }

        let referencePoints = userLocation.length != 0 ? [userLocation] : null
        helpRequests.forEach(request => {
            if (referencePoints) {
                referencePoints.push(request.coords)
            } 

            const type = helpTypes.find(t => t.type_id == request.type_id)

            const color =
                request.priority >= 7 ? "red" :
                request.priority >= 4 ? "orange" :
                "green"

            const placemark = new window.ymaps.Placemark(
                request.coords,
                {
                    balloonContentHeader: `<strong>Заявка #${request.request_id}</strong>`,
                    balloonContentBody: `
                        <b>Тип:</b> ${type?.description}<br/>
                        <b>Описание:</b> ${request.description}<br/>
                        <b>Адрес:</b> ${request.address}<br/>
                        <b>Район:</b> ${request.district}<br/>
                        <b>Приоритет:</b> ${request.priority}
                    `
                },
                { preset: `islands#${color}Icon` }
            )

            map.geoObjects.add(placemark)
        })

        if (referencePoints && window.location.href.includes('myRequests')) {
            const route = new window.ymaps.multiRouter.MultiRoute({referencePoints: referencePoints}, {boundsAutoApply: true})
            map.geoObjects.add(route)
        }
    }, [mapReady, helpRequests, helpTypes, userLocation])

    return <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />
}

export default YandexMap