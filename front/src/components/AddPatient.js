import { useState } from 'react';
import Patients from './Patients';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddPatient = ({ onAdd }) => {
    const [ID, setID] = useState('');
    const [IdType, setIdType] = useState('Aadhar');
    const [PatientFirstName, setPatientFirstName] = useState('');
    const [PatientLastName, setPatientLastName] = useState('');
    const [DOB, setDOB] = useState('');
    const [BloodGroup, setBloodGroup] = useState('');
    const [Donor, setDonor] = useState(false);    
    const [Mobile, setMobile] = useState('');
    const [Address, setAddress] = useState(false);
    const [OrigDate, setOrigDate] = useState('');
    
    const onSubmit = (e) => {
        e.preventDefault();

        onAdd({ ID, IdType, PatientFirstName, PatientLastName, DOB, BloodGroup, Donor, Mobile, Address  });

        setID('');
        setIdType('');
        setPatientFirstName('');
        setPatientLastName('');
        setDOB('');
        setOrigDate('');
        setBloodGroup('');
        setDonor('');
        setMobile('');
        setAddress('');
    }

    const addDate = (dte) => {
        setOrigDate(dte);
        setDOB(dte.toISOString().substring(0, 10));
    }


    return (
        <div className='row h-100'>
            <div className='col-12 my-auto'>
                <h5 className='mb-5 text-center'><b>Add a new patient details</b></h5>
                <form className='form-horizontal' onSubmit={onSubmit}>
                    <div className='input-group row-left-margin' >
                        <label className='col-sm-2 col-form-label'>ID</label>
                        <div className='col-sm-3'>
                            <input type='text' className='form-control service-form-input' placeholder='Enter ID' value={ID} onChange= {e => setID(e.target.value) }/>
                        </div>
                    </div>
                    <div className='input-group row-left-margin' >
                        <label className='col-sm-2 col-form-label'>ID Type</label>
                        <div className='col-sm-3'>
                            <select className='form-control service-form-input' name='idtype' onChange={e => setIdType(e.target.value)}>
                                <option value='Aadhar' selected>Aadhar</option>
                                <option value='Passport'>Passport</option>
                                <option value='DriverLicence'>Driver Licence</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )


}

export default AddPatient;