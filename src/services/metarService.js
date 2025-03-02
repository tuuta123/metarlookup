import axios from 'axios';

const METAR_API_URL = 'https://api.met.no/weatherapi/metar/1.0/';

export const fetchMetarData = async (airportCode) => {
    try {
        const response = await axios.get(`${METAR_API_URL}?airport=${airportCode}`, {
            headers: {
                'User-Agent': 'YourAppName/1.0 (your.email@example.com)'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching METAR data:', error);
        throw error;
    }
};