import React from 'react'
import { Card, Typography, Table, Button, Popconfirm, Icon, Divider, Form, Input, InputNumber, Modal, message } from 'antd'
import { Link } from 'react-router-dom'
import '../../styles/checkout.scss'
import jsPDF from 'jspdf'
import 'jspdf-autotable';
import callAPI from '../../utils/apiCaller'

const { Title } = Typography
function handleToString(value) {
    var num = 0
    num = `${Number(value).toString()} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return num
}
var data = []

const FormItem = Form.Item;
const EditableContext = React.createContext();
class EditableCell extends React.Component {
    getInput = () => {
        if (this.props.inputType === 'number') {
            return <InputNumber min={1000} step={1000} />;
        }
        return <Input />;
    };

    render() {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            ...restProps
        } = this.props;
        return (
            <EditableContext.Consumer>
                {(form) => {
                    const { getFieldDecorator } = form;
                    return (
                        <td {...restProps}>
                            {editing ? (
                                <FormItem style={{ margin: 0 }}>
                                    {getFieldDecorator(dataIndex, {
                                        rules: [{
                                            required: true,
                                            message: `Hãy nhập ${title}!`,
                                        }],
                                        initialValue: record[dataIndex],
                                    })(this.getInput())}
                                </FormItem>
                            ) : restProps.children}
                        </td>
                    );
                }}
            </EditableContext.Consumer>
        );
    }
}
class CheckoutTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            datasource: [],
            loading: false,
            editingKey: '',
            visible: false,
            name: '',
            quant: 0,
            price: 0,
            id: localStorage.getItem("ID")
        }

        this.columns = [{
            align: 'center',
            title: 'STT',
            dataIndex: 'ID_Product',
            width: '5%',
        }, {
            align: 'center',
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            editable: true,
        },
        {
            align: 'center',
            title: 'Số lượng',
            dataIndex: 'quantityInStock',
            sorter: (a, b) => a.quantityInStock - b.quantityInStock, sortDirections: ['ascend', 'descend'],
            editable: true,
        },
        {
            align: 'center',
            title: 'Giá',
            dataIndex: 'buyPrice',
            sorter: (a, b) => a.buyPrice - b.buyPrice, sortDirections: ['ascend', 'descend'],
            render: (value) => (<div>{handleToString(value)}</div>),
            editable: true,
        },
        {
            align: 'center',
            title: 'Hành động',
            dataIndex: 'action',
            render: (text, record) => {
                const { editingKey } = this.state;
                const editable = this.isEditing(record);
                return (
                    <div>
                        {editable || this.state.datasource.length === 1 ? (
                            <span>
                                <EditableContext.Consumer>
                                    {form => (
                                        <Link
                                            onClick={() => this.save(form, record.key)}
                                            style={{ marginRight: 8 }}
                                        >
                                            Lưu
                                        </Link>
                                    )}
                                </EditableContext.Consumer>
                                <Popconfirm
                                    title="Chắc chắc muốn hủy?"
                                    onConfirm={() => this.cancel(record.key)}
                                    okText='Có'
                                    cancelText='Không'
                                    icon={<Icon type="stop" theme="filled" style={{ color: '#ec3b3b' }} />}>

                                    <Link>Hủy</Link>
                                </Popconfirm>
                            </span>
                        ) : (
                                <span>
                                    <Link disabled={editingKey !== ''} onClick={() => this.edit(record.key)}>Sửa</Link>
                                    <Divider type="vertical" />
                                    <Popconfirm title="Chắc chắn muốn xóa?"
                                        placement='topRight'
                                        onConfirm={() => this.handleDelete(record.key)}
                                        icon={<Icon type='rest' theme='filled' style={{ color: '#0077ff' }} />}
                                        okText='Có'
                                        cancelText='Không'>
                                        <Link disabled={editingKey !== ''}>Xóa</Link>
                                    </Popconfirm>
                                </span>
                            )}
                    </div>
                );
            },
        },
        ]
    }
    componentDidMount() {
        let infoRequest = `/Products/KiemHangTrongKho?ID_Employee=${this.state.id}`
        callAPI(infoRequest, 'POST', null).then(res => {
            if (res !== undefined) {
                if (res.data.code === 200) {
                    var getData = res.data.data
                    data = []
                    for (let i = 0; i < getData.length; i++) {
                        data.push({
                            key: getData[i].ID_Product,
                            ID_Product: `${i + 1}`,
                            productName: getData[i].productName,
                            quantityInStock: getData[i].quantityInStock,
                            buyPrice: getData[i].buyPrice,
                        })
                    }
                    this.setState({ datasource: data })
                }
            }
            else console.log(res)
        })
    }
    handleDelete = (key) => {
        const datasource = [...this.state.datasource];
        this.setState({ loading: true })
        setTimeout(() => {
            this.setState({
                datasource: datasource.filter(item => item.key !== key),
                loading: false
            });
        }, 1000);
        let infoRequest = `/Products/DeleteProduct?ID_Employee=${this.state.id}&ID_Product=${key}`
        callAPI(infoRequest, 'POST', null).then(res => {
            if (res !== undefined)
                if (res.data.code === 400) {
                    message.error("Đã có lỗi xảy ra")
                }
                else console.log(res)
        })
    }
    showModal = () => {
        this.setState({
            visible: true,
        });
    }
    handleOk = (e) => {
        const { datasource, name, quant, price } = this.state
        var newData = this.state.datasource
        if (name !== '' && quant !== 0 && price !== 0) {
            newData.push({
                key: `${datasource.length >= 1 ? Number(datasource[datasource.length - 1].key) + 1 : 1}`,
                ID_Product: `${datasource.length >= 1 ? Number(datasource[datasource.length - 1].ID_Product) + 1 : 1}`,
                productName: name,
                quantityInStock: quant,
                buyPrice: price,

            })
            this.setState({
                visible: false,
                datasource: newData
            });
            let infoRequest = `/Products/AddNewProduct?ID_Employee=${this.state.id}&PRODUCTNAME=${name}&QUANTITY=${quant}&BUYPRICE=${price}`
            callAPI(infoRequest, 'POST', null).then(res => {
                if (res !== undefined)
                    if (res.data.code === 400) {
                        message.error("Đã có lỗi xảy ra")
                    }
                    else console.log(res)
            })
        }
        else message.warn('Hãy nhập đủ thông tin!')

    }

    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    }
    changeName = (e) => {
        this.setState({ name: e.target.value })
    }
    changeQuant = (value) => {
        this.setState({ quant: value })
    }
    changePrice = value => {
        this.setState({ price: value })
    }
    isEditing = record => record.key === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    save(form, key) {
        console.log(key)
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.datasource];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                this.setState({ datasource: newData, editingKey: '' });
            } else {
                newData.push(row);
                this.setState({ datasource: newData, editingKey: '' });
            }
            console.log(row.productName)
            let infoRequest = `/Products/UpdateQuantityExistedProduct?ID_Employee=${this.state.id}&ID_Product=${key}&QUANTITY=${row.quantityInStock}`
            callAPI(infoRequest, 'POST', null).then(res => {
                if (res !== undefined)
                    if (res.data.code === 400) {
                        message.error("Đã có lỗi xảy ra")
                    }
                    else console.log(res)
            })

            let infoRequest2 = `/Products/EditProduct?ID_Employee=${this.state.id}&ID_Product=${key}&PRODUCTNAME=${row.productName}&BUYPRICE=${row.buyPrice}`
            callAPI(infoRequest2, 'POST', null).then(res => {
                if (res !== undefined)
                    if (res.data.code === 400) {
                        message.error("Đã có lỗi xảy ra")
                    }
                    else console.log(res)
            })


        });
    }

    edit(key) {
        this.setState({ editingKey: key });
    }

    generatepdf = () => {
        const { datasource } = this.state
        var doc = new jsPDF();
        var databody = []
        for (let i = 0; i < datasource.length; i++) {
            databody.push([[datasource[i].ID_Product], [datasource[i].productName], [datasource[i].quantityInStock + ' đ'], [datasource[i].buyPrice]])
        }
        doc.addFont('Roboto-Regular.ttf', 'Roboto-Regular', 'normal');
        doc.setFont('Roboto-Regular');
        doc.autoTable({
            font: '[Base64-encoded string of your font]',
            styles: { halign: 'center', font: 'Arimo' },
            head: [['STT', 'Tên sản phẩm', 'Số lượng', 'Giá']],
            body: databody
        });

        doc.save('table.pdf');

    }
    render() {
        const { datasource, name } = this.state
        const components = {
            body: {
                cell: EditableCell,
            },
        };
        const columns = this.columns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: col.dataIndex === 'price' ? 'number' : 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            };
        });
        return (
            <Card className='checkout-card' >
                <Modal
                    className='modal-add'
                    title="Thêm sản phẩm mới"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    cancelText="Hủy"
                    okText='Thêm'

                >
                    <p>Tên sản phẩm: <span><Input value={name} onChange={this.changeName} placeholder='Nhập tên sản phẩm' style={{ width: '200px' }} /></span></p>
                    <p>Số lượng: <span><InputNumber onChange={this.changeQuant} placeholder='Nhập số' /></span></p>
                    <p>Giá: <span><InputNumber onChange={this.changePrice} min={1000} step={1000} placeholder='Nhập giá' /></span></p>

                </Modal>
                <Title level={3} style={{ textAlign: 'center' }}>Bảng thống kê hàng hóa</Title>
                <EditableContext.Provider value={this.props.form}>
                    <Table
                        className='productTable'
                        components={components}
                        dataSource={datasource}
                        loading={this.state.loading}
                        columns={columns}
                        rowClassName="editable-row"
                        pagination={{
                            onChange: this.cancel,
                        }}
                        bordered />
                </EditableContext.Provider>
                <div className='btns'>
                    <Button icon='plus-circle' onClick={this.showModal}>Nhập hàng</Button>
                    <Button icon='file-pdf' onClick={this.generatepdf}>Xuất PDF</Button>
                </div>
            </Card>
        );
    }
}
const Checkout = Form.create()(CheckoutTable);
export default Checkout