import React, { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import Spinner from '../components/Spinner';
import { Swiper, SwiperSlide, Swiperslide } from 'swiper/react';
import SwiperCore, {EffectFade, Autoplay, Navigation, Pagination} from 'swiper'
import 'swiper/css/bundle'
import { useNavigate } from 'react-router';

export default function Slider() {
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    SwiperCore.use([Autoplay, Navigation, Pagination]);
  
    // 홈에서 쓸 데이터 받아오기
    useEffect(()=>{
      async function fetchListings(){
        // collection(db, 'listing')은 Firestore 데이터베이스 db에서 'listing'이라는 컬렉션을 참조하고 있는 것이다.
        // 이 참조를 통해 'listing' 컬렉션 내의 문서들을 검색하거나 조작할 수 있다.
  
        // 이 코드에서는 q 변수를 사용하여 컬렉션 내의 문서들을 내림차순으로 정렬하고 최대 5개의 문서만 가져오는 쿼리를 생성하고 있다.
        const listingsRef = collection(db, 'listing');
        const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5));
  
        // await getDocs(q)는 쿼리 q에 해당하는 문서들을 가져오는 비동기 작업을 실행하고, 그 결과로 "snapshot"을 얻게 된다. 
        // 이 "snapshot"을 이용하여 쿼리 결과에 해당하는 문서들의 데이터를 활용하거나 조작할 수 있다.
        const querySnap = await getDocs(q); // 현재 쿼리로 조작한대로 5개의 데이터가 들어있다.
        let listings = [];
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data()
          });
        });
        setListing(listings);
        setLoading(false);
        console.log(listing);
      } 
      fetchListings()
    },[]);
  
    if(loading){
      return <Spinner></Spinner>
    }
    if(listing.length === 0){
      return <></>
    }

  return listing && 
    <>     
        <Swiper slidesPerView={1} navigation pagination={{type: 'progressbar'}} effect='fade' modules={[EffectFade]} autoplay={{delay: 3000}}>
            {listing.map(({data, id})=>( // 여기서도 구조분해 할당으로 데이터를 가져올 수 있다
                <SwiperSlide key={id} onClick={()=>navigate(`/category/${data.type}/${id}`)}>
                    <div                     
                    style={{background: `url(${data.imgUrls[0]}) center, no-repeat`, backgroundSize: 'cover'}}
                    className='relative w-full h-[700px] overflow-hidden'
                    >
                    </div>
                    <p className='absolute left-1 top-3 text-yellow-50 font-medium max-w-[90%] bg-slate-500 shadow-lg opacity-90 p-2 rounded-br-xl'>{data.name}</p>
                    <p className='absolute left-1 bottom-1 text-yellow-50 font-semibold max-w-[90%] bg-red-500 shadow-lg opacity-90 p-2 rounded-tr-xl'>
                       ₩{data.discountedPrice ? 
                       data.discountedPrice
                        .toString()
                        .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 
                        data.regularPrice
                        .toString()
                        .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
                        } 
                        
                        {data.type === 'rent' && ' / 월세'}
                    </p>
                </SwiperSlide>
            ))}
        </Swiper>
    </>;
}


        {/* 
        이렇게 하면 제대로 작동 x
        {listing.map((data)=>{
            <h1 key={data.id}>{data.data.imgUrls[0]}</h1>
        })}         
        중괄호를 쓰려면 반드시 안에 return값이 있어야 한다!
        */}