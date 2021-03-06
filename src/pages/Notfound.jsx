import React from 'react'
import { Exception } from 'ant-design-pro';
import { Button } from 'antd'
import { Link } from 'react-router-dom'
class Notfound extends React.Component {
    render() {
        const actions = (
            <div>
                <Link to='/'>
                    <Button className='submit2'>Trang chủ</Button>
                </Link>
            </div>
        )
        return (
            <div className='wrapper404'>
                <div className='logo'>
                    <div className='osm-logo' />
                </div>
                
                <Exception type='404'
                    redirect='/'
                    desc='Trang bạn tới không tồn tại!'
                    actions={actions} />
                <ul className="bg-bubbles">
                    <li />
                    <li />
                    <li />
                    <li />
                    <li />
                    <li />
                    <li />
                    <li />
                    <li />
                    <li />
                </ul>
            </div>
        );
    }
}
export default Notfound