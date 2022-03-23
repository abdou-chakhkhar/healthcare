import React, { useCallback } from 'react';
import Button from './Button';
import { useState } from 'react';
import { render } from '@testing-library/react';
import moment from 'moment';



const Reports = ({ showPrivate, publicData, privateData, patientID, onReportAdd, onLoadStatChange }) => {

    const [refNumber, setRefNumber] = useState('');
    const [reportName, setReportName] = useState('');    
    const [introduction, setIntroduction] = useState('');
    const [procedure, setProcedure] = useState('');
    const [result, setResult] = useState('');
    const [upload, setUpload] = useState('');
    const [showAdd, setShowAdd] = useState(false);


    const onSubmit = (e) => {
        e.preventDefault();
        const pateintId = patientID.id;

        onReportAdd({
            pateintId,
            refNumber,
            reportName,
            introduction,
            procedure,
            result,
            upload
        });

        setRefNumber('');
        setReportName('');
        setIntroduction('');
        setProcedure('');
        setResult('');
        setUpload('');

    }

    const handleStatChange = useCallback(e => {
        onLoadStatChange(true);
    }, [onLoadStatChange]);

    const bufferToText = (buffer) => {
        const bufferByteLength = buffer.byteLength;
        const bufferUint8Array = new Uint8Array(buffer, 0, bufferByteLength);
        return new TextDecoder().decode(bufferUint8Array);
    }

    const addPath = async (event) => {
        const file = event.target.files[0];
        const buffer = await file.arrayBuffer();
        setUpload(buffer);
    }

    const onAddReport = (e) => {
        e.preventDefault();
        setShowAdd(true);
    }

    const renderTableData = () => {

    }

    const renderTableHeader = () => {
        
    }

    const addReportButton = (hash) => {
        
    }

    const getImage = () => {
        
    }

    handleStatChange()

    if(showAdd){
        return (
            <div className='row h-100'>
            <div className='col-12 my-auto'>
                <div id='signup-secure-rec' className='row'>
                    <div className='col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3'>
                    <h5 className='mb-5 text-center'><b>Add health record {patientID.name} </b></h5>
                    <form onSubmit={onSubmit}>
                        <div className='form-row mb-2'>
                            <div className='form-group col-12 mb-4' >
                                <label className='service-form-label mb-2'>Report Ref Number</label>
                                <input type='text' className='form-control service-form-input' placeholder='Ref number' value={refNumber} onChange= {e => setRefNumber(e.target.value) }/>
                            </div>
                        
                        </div>

                    </form>
                    </div>
                </div>

            </div>
        </div>
        )
    }else{

    }
}

export default Reports;