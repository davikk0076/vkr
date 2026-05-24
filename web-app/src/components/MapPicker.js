import { useEffect, useRef } from "react"

function MapPicker({ onSelect }) {
    const mapRef = useRef(null)
    const mapInstance = useRef(null)

    useEffect(() => {
        if (!window.ymaps) return

        window.ymaps.ready(() => {
            if (mapInstance.current) return

            mapInstance.current = new window.ymaps.Map(mapRef.current, {
                center: [57.62, 39.89],
                zoom: 10
            })

            mapInstance.current.events.add("click", (e) => {
                const coords = e.get("coords")

                mapInstance.current.geoObjects.removeAll()

                const placemark = new window.ymaps.Placemark(coords)
                mapInstance.current.geoObjects.add(placemark)

                window.ymaps.geocode(coords).then(res => {
                    const firstGeoObject = res.geoObjects.get(0)
                    if (!firstGeoObject) return

                    const address = firstGeoObject.getAddressLine()

                    const district =
                        firstGeoObject.getLocalities()?.[0] ||
                        firstGeoObject.getAdministrativeAreas()?.[0] ||
                        "Не определён"

                    onSelect({
                        coords: coords,
                        address: address,
                        district: district
                    })
                }).catch(err => {
                    console.error("Geocode error:", err)
                })
            })
        })
    }, [])

    return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />
}

export default MapPicker