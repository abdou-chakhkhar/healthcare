import { useState } from 'react';
import Patients from './Patient';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddReport = ({ onAdd }) => {
    // const [ID, setID] = useState('');
    // const [IdType, setIdType] = useState('Aadhar');
    // const [PatientFirstName, setPatientFirstName] = useState('');
    // const [PatientLastName, setPatientLastName] = useState('');
    // const [DOB, setDOB] = useState('');
    // const [BloodGroup, setBloodGroup] = useState('');
    // const [Donor, setDonor] = useState(false);    
    // const [Mobile, setMobile] = useState('');
    const [refNumber, setRefNumber] = useState('');
    const [upload, setUpload] = useState('');
    
    const onSubmit = (e) => {
        e.preventDefault();

        // onAdd({ ID, IdType, PatientFirstName, PatientLastName, DOB, BloodGroup, Donor, Mobile, Address  });

        // setID('');
        // setIdType('');
        // setPatientFirstName('');
        // setPatientLastName('');
        // setDOB('');
        // setOrigDate('');
        // setBloodGroup('');
        // setDonor('');
        // setMobile('');
        // setAddress('');
    }

    // const addDate = (dte) => {
    //     setOrigDate(dte);
    //     setDOB(dte.toISOString().substring(0, 10));
    // }

    const addPath = async (event) => {
        const file = event.target.files[0];

        const buffer = await file.arrayBuffer();
        setUpload(buffer);
    }

    return (
        <div className='row h-100'>
            <div className='col-12 my-auto'>
                <div id='signup-secure-rec' className='row'>
                    <div className='col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3'>
                    <h5 className='mb-5 text-center'><b>Add patient health record</b></h5>
                    <form onSubmit={onSubmit}>
                        <div className='form-row mb-2'>
                            <div className='form-group col-12 mb-4' >
                                <label className='col-sm-2 col-form-label'>ID</label>
                                <input type='text' className='form-control service-form-input' placeholder='Ref number' value={refNumber} onChange= {e => setRefNumber(e.target.value) }/>
                            </div>
                        </div>

                    </form>
                    </div>
                </div>

            </div>
        </div>
    )


}

export default AddReport