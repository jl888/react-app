import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './Home';
import PopulationTable from './PopulationTable'

const Main = () => (
    <main>
        <Switch>
            <Route exact path='/' component={Home} />
            <Route path="/population/:country/:year" component={PopulationTable} />
        </Switch>
    </main>
);

export default Main;

