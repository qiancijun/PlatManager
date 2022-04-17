import React, { Component } from 'react'

export default class DisplayDataModal extends Component {

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
        this.setVisible(false);
        this.setConfirmLoading(false);
    }

    render() {

        const style = {
        
        }

        return (
            <div>
                
            </div>
        )
    }
}
