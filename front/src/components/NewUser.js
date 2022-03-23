import { useState } from 'react';
import Patients from './Patients';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Layout, Menu, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { Form, Input,Select,  Button, Checkbox } from 'antd';



const NewUser = ({}) => {

    const onFinish = (values) => {
        console.log('Success:', values);
      };
    
      const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
      };

    return (
        <div>
                <br/><br/><h3>Sign Up to fabric Healthcare</h3> <br/><br/>

                <Form
                    name="basic"
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    >
                              <Form.Item
                                    name={['user', 'email']}
                                    label="Email"
                                    rules={[
                                    {
                                        type: 'email',
                                    },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                    <Form.Item
                        label="Lastname"
                        name="lastname"
                        rules={[
                        {
                            required: true,
                            message: 'Please input your lastname!',
                        },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                        {
                            required: true,
                            message: 'Please input your password!',
                        },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirm_password"
                        rules={[
                        {
                            required: true,
                            message: 'Please reenter your password!',
                        },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item label="Select your organization">
                        <Select placeholder="Select your organization" >
                        <Select.Option value="demo">Laboratory</Select.Option>
                        <Select.Option value="demo">Hospital</Select.Option>
                        <Select.Option value="demo">Ins-Provider</Select.Option>
                        <Select.Option value="demo">Pharmacy</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="remember"
                        valuePropName="checked"
                        wrapperCol={{
                        offset: 8,
                        span: 16,
                        }}
                    >
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>

                    <Form.Item
                        wrapperCol={{
                        offset: 8,
                        span: 16,
                        }}
                    >
                        <Button type="primary" htmlType="submit">
                        Signup
                        </Button>
                    </Form.Item>
                    </Form>
        </div>
    )


}

export default NewUser