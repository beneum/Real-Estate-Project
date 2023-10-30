import React from 'react'
import Moment from 'react-moment'
import 'moment/locale/ko'
import { Link } from 'react-router-dom'
import {MdLocationOn} from 'react-icons/md'
import {BiWon} from 'react-icons/bi'
import {FaTrash} from 'react-icons/fa'
import {BiEditAlt} from 'react-icons/bi'


// 잘 만들어 놓은 컴포넌트는 이곳 저곳에서 유용하게 사용 될 수 있다.
export default function ListingItem({listing, id, onEdit, onDelete}) {
  return (
    <li className='relative bg-white flex flex-col justify-between items-center m-[10px]
    shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150'>
        {/* overflow-hidden이 없으면 rounded가 가려져서 작동을 하지 않는것 처럼 보인다 */}
      <Link className='contents' to={`/category/${listing.type}/${id}`}> 
      {/* display:contents는 해당요소(여기서는 Link태그)가 더이상 컨테이너로 작동하지 않는다. 
      따라서 상위 요소인 li태그가 컨테이너 역할을 한다(li태그의 css가 적용된다) or w-full를 넣어도 작동 o */}
        <img className='h-[170px] w-full object-cover hover:scale-105 
        transition-scale duration-200 ease-in' 
        loading='lazy'
        // loading="lazy"를 사용하면 브라우저는 페이지가 로드되는 동안 화면에 표시되지 않는 이미지나 프레임의 리소스를 바로 로딩하지 않고, 
        // 사용자가 해당 부분을 스크롤하여 화면에 나타낼 때 로딩을 시작한다. 
        // 이렇게 함으로써 초기 페이지 로딩 속도를 향상시킬 수 있으며, 사용자 경험을 더욱 부드럽게 만들 수 있다.
        src={listing.imgUrls[0]} 
        alt="" />
        <Moment className='absolute top-2 left-2 bg-blue-400 text-white text-xs font-semibold rounded-md px-2 py-1 shadow-lg' fromNow> 
        {/* fromNow를 사용하면 ~전 날짜를 보여준다 */}            
            {listing.timestamp?.toDate()} 
            {/* listing에 timestamp가 있으면 date로 변환 */}            
        </Moment> 
        {/* 구글에 react moment 검색하기 */}
        <div className='w-full p-[10px]'>
            <div className='flex items-center space-x-1'>
                <MdLocationOn className='h-4 w-4 text-green-600'></MdLocationOn>
                <p className='font-semibold text-sm mb-[2px] text-gray-600 truncate'>{listing.address}</p>
            </div>
            <p className='font-semibold m-0 text-xl truncate'>{listing.name}</p>
            <p className='flex items-center space-x-1 text-blue-300 mt-2 font-semibold'><BiWon></BiWon>
            {listing.offer 
                ? listing.discountedPrice
                    .toString()
                    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
                : listing.regularPrice
                    .toString()
                    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
            }
            {listing.type === 'rent' && ' / 월세'}
            </p>
            <div className='flex items-center mt-[10px] space-x-3'>
                <div className='flex items-center space-x-1'>
                    <p className='font-bold text-xs'>방 {listing.bedrooms}</p>
                </div>
                <div>
                    <p className='font-bold text-xs'>화장실 {listing.bathrooms}</p>
                </div>
            </div>
        </div>
      </Link>
      {onDelete && ( // onDelet이 존재하면
      <FaTrash className='absolute bottom-2 right-2 h-[14px] cursor-pointer text-red-500'
      onClick={()=>onDelete(listing.id)}
      />
      )}
      {onEdit && ( // onEdit이 존재하면
      <BiEditAlt className='absolute bottom-2 right-7 h-4 cursor-pointer'
      onClick={()=>onEdit(listing.id)}
      />
      )}
    </li>
  )
}


