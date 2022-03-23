import React, { useCallback } from 'react';


const Patient = ({ patient, onPatientSelect }) => {


    const getFormValues = () => {
        const id = patient.ID;
        const name = patient.FirstName + '' + patient.LastName;
        onPatientSelect({id, name})
    }

    return (
        <div className='float-child' onClick={e => getFormValues()}>
            <span className='summary_head'> {patient.FirstName} {patient.LastName}</span> <p />
            <span className='summary_key'>Patient ID:</span><span className='summary_val'> {patient.ID} </span> <br />
            <span className='summary_key'>ID Type:</span><span className='summary_val'> {patient.IdType} </span> <br />
            <span className='summary_key'>DOB:</span><span className='summary_val'> {patient.DOB} </span> <br />
            <span className='summary_key'>Mobile Number:</span><span className='summary_val'> {patient.Mobile} </span> <br />
            <span className='summary_key'>Address:</span><span className='summary_val'> {patient.Address} </span> <br />
        </div>
    )
}

export default Patient;