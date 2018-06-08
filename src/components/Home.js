import React, { Component } from 'react';
import axios from 'axios';
import './Home.css';
import Countries from '../countries';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            year: 2018,
            country: '',
            countries: [],  // Original list of countries (objects)
            displayCountries: [],
            notFound: false,
            isLoaded: false
        };

        this.onSelectOptions = this.onSelectOptions.bind(this);
        this.onClickResetFilters = this.onClickResetFilters.bind(this);
        this.handleInputCountryChange = this.handleInputCountryChange.bind(this);
    }

    async componentWillMount() {
        await this.getCountries();
    }

    async getCountries() {
        let countries = [];
        const countriesLength = Countries.length;

        for (let i = 0; i < countriesLength; i++) {
            let country = Countries[i];
            const result = await this.getCountry(country);
            if (result !== null) {
                countries.push(result);
            }
        }

        if (countries.length === 0) {
            this.setState({
                notFound: true,
                isLoaded: true
            });
        } else {
            this.setState({
                countries: countries,
                displayCountries: countries.slice(0),
                isLoaded: true
            });
        }
    }

    async getCountry(country) {
        let population = null;

        await axios.get('http://api.population.io/1.0/population/' + country + '/today-and-tomorrow/')
            .then(
                res => {
                    population = res.data['total_population'][0]['population'];
                })
            .catch(
                err => {}
            );

        if (population !== null) {
            return {country: country, population: population};
        }
        return population;
    }

    search(word) {
        let searchCountries = [];

        for (let i = 0; i < this.state.countries.length; i++) {
            let search = this.state.countries[i].country.toLowerCase().search(word.toLowerCase());
            if (search !== -1) {
                searchCountries.push(this.state.countries[i])
            }
        }

        this.setState({displayCountries: searchCountries});
    }

    onSelectOptions(event) {
        switch (event.target.value) {
            case "countriesAscending":
                const countriesAscendingList = this.state.displayCountries.sort(function (a, b) {
                    if (a.country < b.country) return -1;
                    if (a.country > b.country) return 1;
                    return 0;
                });
                this.setState({displayCountries: countriesAscendingList});
                break;
            case "countriesDescending":
                const countriesDescendingList = this.state.displayCountries.sort(function (a, b) {
                    if (a.country < b.country) return 1;
                    if (a.country > b.country) return -1;
                    return 0;
                });
                this.setState({displayCountries: countriesDescendingList});
                break;
            case "populationAscending":
                const populationAscendingList = this.state.displayCountries.sort(function (a, b) {
                    if (a.population < b.population) return 1;
                    if (a.population > b.population) return -1;
                    return 0;
                });
                this.setState({displayCountries: populationAscendingList});
                break;
            case "populationDescending":
                const populationDescendingList = this.state.displayCountries.sort(function (a, b) {
                    if (a.population < b.population) return -1;
                    if (a.population > b.population) return 1;
                    return 0;
                });
                this.setState({displayCountries: populationDescendingList});
                break;
            default:
                break;
        }
    }

    onClickResetFilters() {
        this.setState({country: '', displayCountries: this.state.countries.slice(0)})
    }

    onClickOpenWindow(country) {
        window.open('/population/' + country + '/' + this.state.year, country, 'toolbar=0,status=0,width=1220,height=420');
    }

    handleInputCountryChange(event) {
        this.setState({country: event.target.value});
        this.search(event.target.value);
    }

    render() {
        let status = '';
        if (this.state.isLoaded === true && this.state.notFound === true) {
            status = 'Countries not found: Please reload your page'
        } else if (this.state.isLoaded === false) {
            status = 'Loading...'
        }

        return (
            <div id="main-div">
                <h1>Population</h1>
                <hr />

                <form id="filter-form">
                    <div className="form-group">
                        <input type="text" className="form-control" id="input-country" placeholder="Search for countries, continents, regions..." value={this.state.country} onChange={this.handleInputCountryChange} />
                    </div>
                    <div className="form-group">
                        <select className="form-control" id="filter-select" onChange={this.onSelectOptions}>
                            <option default>Filters</option>
                            <option value="countriesAscending">Countries - Ascending</option>
                            <option value="countriesDescending">Countries - Descending</option>
                            <option value="populationAscending">Population - Ascending</option>
                            <option value="populationDescending">Population - Descending</option>
                        </select>
                        <input type="reset" id="reset-input" className="btn btn-primary btn-md" value="Reset" onClick={this.onClickResetFilters} />
                    </div>
                </form>

                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Country <span className="label label-default">{this.state.displayCountries.length} found</span></th>
                            <th scope="col">Population</th>
                            <th scope="col">Table (from Ages 0 - 100 in {this.state.year})</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.displayCountries.map(country =>
                            <tr key={country.country}>
                                <td>{country.country}</td>
                                <td>{country.population}</td>
                                <td>
                                    <button type="button" className="btn btn-link" onClick={() => this.onClickOpenWindow(country.country)}>View</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <p>{status}</p>
            </div>
        )
    }
}

export default Home;