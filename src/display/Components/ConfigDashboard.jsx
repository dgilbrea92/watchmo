import React, { useState, useContext, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import { ProjectContext } from './Context/ProjectContext';
import '../stylesheets/style.scss';
import 'bootstrap/dist/css/bootstrap.css';
import CategoriesContainer from './CategoriesContainer';
// import { GraphqlCodeBlock } from 'graphql-syntax-highlighter-react';

const ConfigDashboard = props => {
  const [origConfig, setOrigConfig] = useState({});
  const [dataFromConfig, setDataFromConfig] = useState({});
  const [endpointConfig, setEndpointConfig] = useState('');
  const [typedCat, setTypedCat] = useState('');
  const { project } = useContext(ProjectContext);

  async function fetchData() {
    const response = await fetch(`${project.projects}/config.json`);
    const result = await response
      .json()
      .then(res => {
        setOrigConfig(res);
        setDataFromConfig(res);
        setEndpointConfig(res.endpoint);
      })
      .catch(err => console.log(JSON.stringify(err)));
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleEndpointChange = e => {
    const url = e.target.value;
    const JSONified = JSON.stringify(dataFromConfig);
    const newDataFromConfig = JSON.parse(JSONified);
    newDataFromConfig.endpoint = url;
    setDataFromConfig(newDataFromConfig);
    setEndpointConfig(url);
  };

  const addTypedCat = e => {
    setTypedCat(e.target.value);
  };

  const addCategory = e => {
    const JSONified = JSON.stringify(dataFromConfig);
    const newDataFromConfig = JSON.parse(JSONified);
    newDataFromConfig.categories[typedCat] = {};
    newDataFromConfig.categories[typedCat].queries = [''];
    newDataFromConfig.categories[typedCat].frequency = '';
    setTypedCat('');
    setDataFromConfig(newDataFromConfig);
  };

  const delCategory = e => {
    const JSONified = JSON.stringify(dataFromConfig);
    const newDataFromConfig = JSON.parse(JSONified);
    delete newDataFromConfig.categories[typedCat];
    setTypedCat('');
    setDataFromConfig(newDataFromConfig);
  };

  const queryChange = e => {
    const catName = e.target.id.split('-')[0];
    const queryIdx = e.target.id.split('-')[1];
    const JSONified = JSON.stringify(dataFromConfig);
    const newDataFromConfig = JSON.parse(JSONified);
    console.log(e.target.key);
    newDataFromConfig.categories[catName].queries[queryIdx] = e.target.value;
    setDataFromConfig(newDataFromConfig);
  };

  const addQuery = e => {
    const catName = e.target.id.split('-')[0];
    const JSONified = JSON.stringify(dataFromConfig);
    const newDataFromConfig = JSON.parse(JSONified);
    newDataFromConfig.categories[catName].queries.push('');
    setDataFromConfig(newDataFromConfig);
  };

  const deleteQuery = e => {
    const catName = e.target.id.split('-')[0];
    const queryIdx = e.target.id.split('-')[1];
    const JSONified = JSON.stringify(dataFromConfig);
    const newDataFromConfig = JSON.parse(JSONified);
    newDataFromConfig.categories[catName].queries.splice(queryIdx, 1);
    setDataFromConfig(newDataFromConfig);
  };

  const frequencyChange = e => {
    const catName = e.target.id.split('-')[0];
    const JSONified = JSON.stringify(dataFromConfig);
    const newDataFromConfig = JSON.parse(JSONified);
    newDataFromConfig.categories[catName].frequency = e.target.value;
    setDataFromConfig(newDataFromConfig);
  };

  // func to update data within config file
  async function handleSubmit(event) {
    event.preventDefault();
    const confMsg =
      'This will overwrite your current config details. Are you sure you want to save this configuration?';
    const result = window.confirm(confMsg);
    const data = { project: project.projects, data: dataFromConfig };
    // control flow to ensure user confirms the choice to save config details
    if (result) {
      await fetch('/api/configDash', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      window.alert('Config details saved!');
    }
  }

  return (
    <div id="configDashboard">
      <div id="navBtn">
        <Link to="/userDashBoard">
          <Button id="navUserDash" type="button" color="secondary" className="btnSecondary">
            Back to User Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button id="navProjSelect" type="button" color="secondary" className="btnSecondary">
            Back to Project Select
          </Button>
        </Link>
      </div>
      <div id="configHeader">
        <br />
        <h1>Config Dashboard</h1>
        <hr />
        <Form id="configForm">
          <div id="categories">
            <FormGroup>
              <Label for="endpointLabel">
                <h4 id="endpointHeader">Endpoint</h4>
              </Label>
              <Input
                type="text"
                name="endpoint"
                id="endpoint"
                placeholder="Input your GraphQL endpoint"
                value={endpointConfig}
                onChange={handleEndpointChange}
              />
              <hr />
              <Label for="categories">
                <h4 id="categoriesHeader">Categories</h4>
              </Label>
              <CategoriesContainer
                configData={dataFromConfig}
                addCategory={addCategory}
                delCategory={delCategory}
                addTypedCat={addTypedCat}
                typedCat={typedCat}
                queryChange={queryChange}
                addQuery={addQuery}
                deleteQuery={deleteQuery}
                freqChange={frequencyChange}
              />
            </FormGroup>
          </div>
          <span>
            <Button color="primary" type="button" onClick={handleSubmit}>
              Save
            </Button>
            <Button
              color="secondary"
              onClick={() => {
                setDataFromConfig(origConfig);
                setEndpointConfig(origConfig.endpoint);
                props.history.push('/configDash');
              }}
            >
              Cancel
            </Button>
          </span>
        </Form>
      </div>
    </div>
  );
};

export default ConfigDashboard;
