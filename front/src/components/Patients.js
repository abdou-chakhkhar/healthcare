import { useCallback } from 'react';
import { FaRProject, FaTimes } from 'react-icons/fa';
import Patient from './Patient';

const Patients = ({ patient, onPatientSelect, onLoadStatChange }) => {


    const handleStatChange = useCallback(e => {
        onLoadStatChange(true);
    }, [onLoadStatChange])

    handleStatChange()


    return (
        <div className='row h-100'>
            <div className='col-12 my-auto'>
                <h5 className='mb-5 text-center'><b>Registered Patients</b></h5>
                    { onPatientSelect.map((patient) => (
                        <div>
                            <Patient key={patient.ID} patient={patient} onPatientSelect={onPatientSelect} />
                        </div>
                    ))}

            </div>
        </div>
    )
}

export default Patients;