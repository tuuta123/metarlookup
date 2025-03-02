import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMetarData } from '../services/metarService';

const AirportPage = () => {
    const { airportCode } = useParams();
    const [metarData, setMetarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getMetarData = async () => {
            try {
                const data = await fetchMetarData(airportCode);
                setMetarData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getMetarData();
    }, [airportCode]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>METAR Data for {airportCode}</h1>
            <pre>{JSON.stringify(metarData, null, 2)}</pre>
        </div>
    );
};

export default AirportPage;