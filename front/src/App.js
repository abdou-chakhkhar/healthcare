import RecoverPwd from './components/RecoverPwd';
import React, { Fragment, useState } from 'react';
import NewUser from './components/NewUser';
import GetToken from './components/AddReports';
import Reports from './components/Reports';

const ipfsClient = require('ipfs-http-client');

const ipfs = ipfsClient({ host: 'localhost', port: '5001', protocol: 'http' });

const App = () => {
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patients, setPatients] = useState([]);
  const [msg, setMsg] = useState('');
  const [styleClass, setStyleClass] = useState('');
  const [mode, setMode] = useState('');
  const [loadData, setLoadData] = useState(false);
  const [patientID, setPatientID] = useState([]);
  const [showRpDetail, setShowRpDetail] = useState(false);
  const [loadReportData, setLoadReportData] = useState(false);
  const [publicReports, setPublicReports] = useState('');
  const [privateReports, setPrivateReports] = useState('');
  const [showPrivate, setShowPrivate] = useState(false);

  const login = async (credential) => {
    const res = await fetch('http://localhost:4000/validateUser', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(credential)
    })

    const data = await res.json();
    if(data.success){
      localStorage.setItem('token', data['token']);
    } else {
      setMsg(data.message);
      setStyleClass('error');
    }
  }

  const signup = async (credential) => {}

  return (
    <div>
      test
    </div>
  );
}

export default App;
