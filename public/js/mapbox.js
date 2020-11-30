export const displayMap = (locations) => {

    mapboxgl.accessToken = 'pk.eyJ1IjoiZGFtamFuMjciLCJhIjoiY2tnaHd5YWd4MDI1YzJ4bXg5YnpqZm5ybiJ9.EG_0fZrc1oVLmk3Kz-ApMA';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/damjan27/ckghzan0e5pwu19paqw5u0efv',
        scrollZoom: false
        // center: [-118.113491, 34.111745],
        // zoom: 4
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';

        // add Marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map)

        // add popup

        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map)


        // Extend map bounds to include current location
        bounds.extend(loc.coordinates)
    });


    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}
