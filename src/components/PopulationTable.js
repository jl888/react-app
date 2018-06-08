import React, { Component } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import './PopulationTable.css';

class Chart extends Component {
    constructor(props) {
        super(props);
        this.chartContainer = React.createRef();
    }

    componentDidMount() {
        this.chart = new Highcharts[this.props.type || 'Chart'](
            this.chartContainer.current,
            this.props.options
        );
    }

    componentWillUnmount() {
        this.chart.destroy();
    }

    render() {
        return <div ref={this.chartContainer} />;
    }
}

class Population extends Component {
    constructor(props) {
        super(props);
        this.state = {
            routeParamCountry: '',
            routeParamYear: 0,
            options: [],
            ages: [],
            males: [],
            females: [],
            year: '',
            notFound: false,
            isLoaded: false
        };

        this.handleYearChange = this.handleYearChange.bind(this);
        this.handleYearSubmit = this.handleYearSubmit.bind(this);
    }

    async componentWillMount() {
        await this.setState({
            routeParamYear: this.props.match.params.year,
            routeParamCountry: this.props.match.params.country
        });

        await this.getPopulation(this.state.routeParamYear);
        await this.options();
        this.setState({isLoaded: true})
    }

    async getPopulation(year) {
        let ages = [];
        let males = [];
        let females = [];

        await axios.get('http://api.population.io/1.0/population/' + year + '/' + this.state.routeParamCountry  + '/?format=json')
            .then(
                res => {
                    const population = res.data;
                    for (let i = 0; i < population.length; i++) {
                        ages.push(population[i]['age']);
                        males.push(population[i]['males']);
                        females.push(population[i]['females']);
                    }
            })
            .catch(
                err => {
                    this.setState({notFound: true})
                }
            );

        this.setState({age: ages, males: males, females: females});
    }

    options() {
        const options = {
            title: {
                text: this.state.routeParamCountry + ' Population (from Ages 0 - 100) in ' + this.state.routeParamYear,
            },
            subtitle: {
                text: 'Source: api.population.io'
            },
            xAxis: {
                title: {
                    text: 'Age'
                },
                categories: this.state.ages
            },
            yAxis: {
                title: {
                    text: 'Population'
                },
            },
            chart: {
                type: 'line'
            },
            series: [
                {
                    name: 'Males',
                    data: this.state.males,
                    color: '#87CEFA'
                },
                {
                    name: 'Females',
                    data: this.state.females,
                    color: '#FFC0CB'
                }
            ],
        };

        this.setState({options: options});
    }

    handleYearChange(event) {
        this.setState({year: event.target.value});
    }

    handleYearSubmit(event) {
        if (isNaN(this.state.year) === false && this.state.year.length === 4) {
            this.props.history.push('/population/' + this.state.routeParamCountry + '/' + this.state.year);
        } else {
            event.preventDefault();
        }
    }

    render() {
        let chart = <h3>Loading...</h3>;
        let search = '';

        if (this.state.notFound) {
            chart = <h3>Country, continent, or region not found. Please check your URL parameter.</h3>;
        } else if (this.state.isLoaded) {
            chart = <Chart options={this.state.options} />;
            search = (
                <div id="submit-year-div">
                    <hr />

                    <small id="submit-year-help-small" className="form-text text-muted">Enter another year from {this.state.routeParamCountry} to view</small>
                    <form onSubmit={this.handleYearSubmit}>
                        <input type="text" className="form-control" id="year-input" placeholder="Year" value={this.state.year} onChange={this.handleYearChange} />
                        <input type="submit" id="input-go" className="btn btn-primary btn-md" value="Go" />
                    </form>
                </div>
            );
        }

        return (
            <div id="population-table-div">
                { chart }
                { search }
            </div>
        )
    }
}

export default Population;