import RecoverPwd from './components/RecoverPwd';
import React, { Fragment, useEffect, useState } from 'react';
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

  const signup = async (credential) => {
    const res = await fetch('http://localhost:4000/createUser', {
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


  useEffect(() => {
    if(loadData){
      getPatients();
    }
  }, [loadData])

  useEffect(() => {
    if(loadReportData){
      fetchPublicReports();
      fetchPrivateReports();
    }
  }, [loadReportData])

  const getToken = async (userEmail) => {
    const res = await fetch('http://localhost:4000/validateUser', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(userEmail)
    })

    const data = await res.json();
    if(data.success){
      localStorage.setItem('token', data.token);
      localStorage.setItem('org', userEmail.org);
      localStorage.setItem('email', userEmail.emailid);
      setMsg('Your token has been generated successfully');
      setStyleClass('Success')

    } else {
      setMsg(data.message);
      setStyleClass('error');
    }
  }

  const fetchPatients = async () => {
    const jw_token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/channels/patients-info-channel/chaincodes/fab-healthcare?fcn=GetAllPatients&args=[]', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jw_token}`,
        'Content-type': 'application/json',
        Accept: 'application/json'
      }
    })

    if(res.status == 401){
      setMsg('Sorry, you are not authorized to view the records!');
      setStyleClass('error');
      return;
    }
    const data = await res.json();
    if(data.result.includes('failed')){
      setMsg('Sorry, there was an error in the blockchain smart contract! Please check if the blockchain network is up and running.');
      setStyleClass('error');
      return;
    } else if (data.result.includes('access denied')) {
      setMsg('Sorry, you are not authorized to view the records.');
      setStyleClass('error');
      return;
    } else if (data.result.length < 2) {
      setMsg(data.result);
      setStyleClass('error');
      return;
    }
    return data;
  }

  const uploadFile = async (file) => {

    console.log('Submitting file to IPFS...');
    // Add file to the IPFS
    const fileAdded = await ipfs.add(file);
    
    if(fileAdded.path != ''){
      return fileAdded.path;
    } else {
      console.log('Could not upload the file to ipfs network');
    }
  }


  const getPatients = async () => {

    const patientsData = await fetchPatients();
    
    if(typeof patientsData !== 'undefined'){
      let op = patientsData.result.map(item => item.Record);
      setPatients(op);
    }
  }

  const fetchPublicReports = async () => {
    const publicReportData = await getPublicReports();
    setPublicReports(publicReportData.result)
  }

  const fetchPrivateReports = async (file) => {
    const privateReportData = await getPrivateReports();
    
    if(typeof privateReportData.result === 'string'){
      if(privateReportData.result.includes('creator does not have read access')){
        return setShowPrivate(false);
      }
    } else {
      setShowPrivate(true);
      setPrivateReports(privateReportData.result)
    }
  }

  

  // delete patient
  const deletePatient = (id) => {
   
  }

  // add Patient
  const addPatient = async (patient) => {
    const jw_token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/channels/patients-info-channel/chaincodes/fab-healthcare', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jw_token}`,
        'Content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        fcn: 'AddPatient',
        args: Object.values(patient)
      })
    })

    const data = await res.json();
    if(data.success){
      setMsg('New Patient has been added successfully!');
      setStyleClass('Success')

    } else {
      setMsg(data.message);
      setStyleClass('error');
    }
  }

  // Add Patient lab report
  const addMedicalrecord = async (report) => {
    const hash = await uploadFile(report.upload);
    report.upload = hash;
    const jw_token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/channels/patients-info-channel/chaincodes/fab-healthcare', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jw_token}`,
        'Content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        fcn: 'AddReport',
        args: Object.values(report)
      })
    })

    const data = await res.json();
    if(data.success){
      setMsg('Patient medical report has been added successfully!');
      setStyleClass('Success')

    } else {
      setMsg(data.message);
      setStyleClass('error');
    }
  }

  const showPatientDetails = async (patient) => {
    setPatientID(patient);
    setShowRpDetail(true);
  }
  

  return (
    <div>
      test
    </div>
  );
}

export default App;
