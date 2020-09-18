import React, { Component } from 'react';
import './App.css';
import axios from 'axios';


class App extends Component {
  state = {
    records: [],
    districtDetails: [],
    stateCases: [],

    searchInput: '',
    searchedState: [],
    isVisible: false

  }

  countCases = () => {
    const stateCases = [];
    const stateDetail = this.state && this.state.records.map(a => Object.values(a[1]));
    const districtDetails = stateDetail.map(i => Object.values(i[0]));

    const totalActive = districtDetails.map(d => d.map(ed => ed.active)).map(i => i.reduce((a, b) => a + b));
    const totalConfirmed = districtDetails.map(d => d.map(ed => ed.confirmed)).map(i => i.reduce((a, b) => a + b));
    const totalRecovered = districtDetails.map(d => d.map(ed => ed.recovered)).map(i => i.reduce((a, b) => a + b));
    const totalDeceased = districtDetails.map(d => d.map(ed => ed.deceased)).map(i => i.reduce((a, b) => a + b));

    const stateKeys = this.state.records.map(a => a[0]);
    for (let i = 0; i < stateKeys.length; i++) {
      stateCases[i] = { state: stateKeys[i], active: totalActive[i], confirmed: totalConfirmed[i], recovered: totalRecovered[i], deceased: totalDeceased[i] }
    }

    this.setState({ stateCases: stateCases })
  }

  showDistrict = (state) => {
    const districtDetail = [];
    if (this.state.selectedState != state) {
      const foundedRecord = this.state.records.filter(a => a[0] === state);
      const district = foundedRecord[0][1]['districtData'];
      for (const item of Object.entries(district)) {
        const districtName = item[0];
        const { active, recovered, deceased, confirmed } = item[1];
        districtDetail.push({ districtName, active, recovered, deceased, confirmed, });
      }
      this.setState({ selectedState: state, districtDetails: districtDetail, isVisible: true })
    }
    else {
      const isToggle = this.state.isVisible
      this.setState({ isVisible: !isToggle })
    }
  }

  componentDidMount() {
    axios.get('https://api.covid19india.org/state_district_wise.json').then(
      res => {
        this.setState({ records: Object.entries(res.data) })
        this.countCases();
      })
  }

  handleSearch = (e) => {
    this.setState({ searchInput: e.target.value })
    const search = this.state.stateCases.filter(a => a.state.toLowerCase().includes(e.target.value.toLowerCase()));
    this.setState({ searchedState: search })
  }

  render() {
    console.log('this.state--->', this.state);
    return (
      <div className="container" >
        <div className="state-container">
        <div>
          <table>
            <tbody>
              <tr><th>State Name
              <span>
                  <label> :::: <input style={{width:110, borderRadius:5, paddingLeft:8}} type="text" onChange={this.handleSearch} placeholder="Search here..." /> </label>
                </span>
              </th><th>Active</th><th>Confirmed</th><th>Recovered</th><th>Deceased</th></tr>
              {this.state.searchInput.length == 0 ? this.state.stateCases.map(stateItem => <StateDetails key={stateItem.state} item={stateItem} showDistrict={this.showDistrict} />) : null}
              {this.state.searchInput.length >= 0 ? this.state.searchedState.map(stateItem => <StateDetails key={stateItem.state} item={stateItem} showDistrict={this.showDistrict} />) : null}
            </tbody>
          </table>
        </div>
        </div>
        <div className="district-container">
        {this.state.districtDetails.length > 0 && this.state.isVisible ?
          <div>
            <table>
              <tbody>
                <tr><th>District Name</th><th>Active</th><th>Confirmed</th><th>Recovered</th><th>Deceased</th></tr>
                {this.state.districtDetails.map(districtItem => <DistrictDetails key={districtItem.districtName} item={districtItem} />)}
              </tbody>
            </table>
          </div>
          : null}
          </div>
      </div>
    )
  }
}

export default App;

const StateDetails = (props) => {
  const { state, active, confirmed, recovered, deceased } = props.item
  return (
    <tr>
      <td onClick={() => props.showDistrict(state)} className="table-row-title" >{state}</td>
      <td>{active}</td>
      <td>{confirmed}</td>
      <td>{recovered}</td>
      <td>{deceased}</td>
    </tr>
  )
}

const DistrictDetails = (props) => {
  const { districtName, active, confirmed, recovered, deceased } = props.item
  return (
    <tr>
      <td className="table-row-title">{districtName}</td>
      <td>{active}</td>
      <td>{confirmed}</td>
      <td>{recovered}</td>
      <td>{deceased}</td>
    </tr>
  )
}