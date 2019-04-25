import React, { PureComponent } from 'react';
import dog from '../../assets/icons/dog.png'
import cat from '../../assets/icons/cat.png'
import beer from '../../assets/icons/beer.png'
import girafee from '../../assets/icons/girafee.png'
import bee from '../../assets/icons/bee.png'

const ava = [dog, cat, bee, beer, girafee]
class Infor extends PureComponent {
  render() {
    return (
      <div>
        <div className='avatarHolder'>
          <img alt="" src={ava[Math.floor(Math.random() * 5)]} />
          <div className='name'>F.Hiquery</div>
          <div>123@osm.vn</div>
        </div>
        <div className='detail'>
          <p>
            <i className='title' />
            Shop ABC
            </p>
          <p>
            <i className='group' />
            Quản lý
            </p>
          <p>
            <i className='address' />
            Đã bị ẩn
            </p>
        </div>

      </div>
    )
  }
}

export default Infor;
