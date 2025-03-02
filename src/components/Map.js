import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAirports } from '../services/metarService';

const Map = () => {
    useEffect(() => {
        const map = L.map('map').setView([64.9631, 25.3356], 5); // Centered on Finland

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);

        const addMarker = (airport) => {
            const marker = L.marker([airport.latitude, airport.longitude]).addTo(map);
            marker.bindPopup(`<a href="/airport/${airport.iata}">${airport.name}</a>`);
        };

        const loadAirports = async () => {
            const airports = await fetchAirports();
            airports.forEach(addMarker);
        };

        loadAirports();

        return () => {
            map.remove();
        };
    }, []);

    return <div id="map" style={{ height: '100vh' }}></div>;
};

export default Map;