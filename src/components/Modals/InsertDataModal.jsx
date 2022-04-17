/**
 * 插入数据接口的对话框
 */
import React, { PureComponent } from 'react'
import { Modal, Form, Input, Button, Checkbox } from 'antd';
import { insertDataUrl } from "@/interfaces/data"

export default class InsertDataModal extends PureComponent {
    urlRef = React.createRef();
    formRef = React.createRef();

    state = {
        visible: false,
        confirmLoading: false,
        extraData: {},
        modalText: "Example Modal",
    }
    setVisible = (visible) => {
        this.setState({ visible });
    }

    setConfirmLoading = (confirmLoading) => {
        this.setState({ confirmLoading });
    }

    showModal = (extraData = null) => {
        this.setVisible(true);
        this.setState({ extraData });
    }

    handleOk = () => {
        this.setConfirmLoading(true);
        // TODO: 修改数据库
        const { id, marker } = this.state.extraData;
        insertDataUrl(id, this.urlRef.current.state.value, () => {
            const ext = marker.getExtData();
            ext.DataUrl = this.urlRef.current.state.value;
            marker.setExtData(ext);
            console.log(marker);
        });
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
                        label="Url"
                        name="url"
                        rules={[{ required: true, message: '输入接口url' }]}
                    >
                        <Input ref={this.urlRef} />
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}
