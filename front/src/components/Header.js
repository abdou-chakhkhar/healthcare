import { useState } from 'react';
import Patients from './Patients';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Layout, Menu, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';


const Header = ({}) => {

    const { Header, Content, Footer } = Layout;


    return (
        <Layout className="layout">
            <Header>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
                    <Menu.Item key={`1`}>
                        <Link to="/signup">User signup</Link>
                    </Menu.Item>
                    <Menu.Item key={`2`}>Generate Token</Menu.Item>
                    <Menu.Item key={`3`}>Add patient info</Menu.Item>
                    <Menu.Item key={`4`}>Patient records</Menu.Item>

                </Menu>
            </Header>
        </Layout>
    )


}

export default Header