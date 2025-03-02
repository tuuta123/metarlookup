import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Map from './components/Map';
import AirportPage from './components/AirportPage';
import './styles.css';

const App = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Map} />
                <Route path="/airport/:icao" component={AirportPage} />
            </Switch>
        </Router>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));