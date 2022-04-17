import React, { PureComponent } from 'react'
import { Modal, Form, Input, Button, Checkbox } from 'antd';
export default class CreatePlatModal extends PureComponent {
    // const [visible, setVisible] = React.useState(false);
    // const [confirmLoading, setConfirmLoading] = React.useState(false);
    // const [modalText, setModalText] = React.useState('Content of the modal');

    addressRef = React.createRef();
    labelRef = React.createRef();
    formRef = React.createRef();

    state = {
        visible: false,
        confirmLoading: false,
        isUsePoint: false,
        extraData: {},
        modalText: "Example Modal",
    }
    setVisible = (visible) => {
        this.setState({ visible });
    }

    setConfirmLoading = (confirmLoading) => {
        this.setState({ confirmLoading });
    }

    showModal = (isUsePoint, extraData=null) => {
        this.setVisible(true);
        this.setState({ isUsePoint, extraData });
    }

    handleOk = () => {
        this.setConfirmLoading(true);
        // console.log(this.addressRef);
        const address = this.addressRef.current.state.value;
        const label   = this.labelRef.current.state.value;
        // 将该地址交给父组件做 Marker 标记，标记成功之后再保存到数据库
        const { addressMarker, pointMarker } = this.props;
        // 判断是否填写的具体地址
        const { isUsePoint } = this.state;
        if (!isUsePoint) {
            addressMarker(address, label);
        } else {
            pointMarker(label, this.state.extraData);
        }
        // this.props.form.resetFields();
        this.formRef.current.resetFields();
        this.setVisible(false);
        this.setConfirmLoading(false);

    }

    handleCancel = () => {
        this.setVisible(false);
    }
    render() {
        const { visible, confirmLoading, address, label } = this.state;
        return (
            <Modal
                title="创建区块"
                visible={visible}
                onOk={this.handleOk}
                confirmLoading={confirmLoading}
                onCancel={this.handleCancel}
            >
                <Form
                    name="basic"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 20 }}
                    autoComplete="off"
                    ref={this.formRef}
                >
                    <Form.Item
                        hidden={ this.state.isUsePoint }
                        label="Address"
                        name="address"
                        rules={[{ required: true, message: '输入具体地址' }]}
                    >
                        <Input ref={this.addressRef}/>
                    </Form.Item>

                    <Form.Item
                        label="Label"
                        name="label"
                        rules={[{ required: true, message: '输入区块标签' }]}
                    >
                        <Input ref={this.labelRef}/>
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}
