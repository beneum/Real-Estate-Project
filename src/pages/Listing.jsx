import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import { db } from '../firebase';
import Spinner from '../components/Spinner';
import {Swiper, SwiperSlide} from 'swiper/react';
import SwiperCore, {EffectFade, Autoplay, Navigation, Pagination} from "swiper";
import 'swiper/css/bundle';
import {AiOutlineCopy} from 'react-icons/ai'
import {FaMapMarkerAlt, FaBath, FaParking, FaChair} from 'react-icons/fa'
import {BiSolidBed} from 'react-icons/bi'
import { getAuth } from 'firebase/auth';
import Contact from '../components/Contact';
import Kakao from '../components/Kakao';



export default function Listing() {
    const auth = getAuth();
    const params = useParams();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shareLinkCopied, setShareLinkCopied] = useState(false);
    const [contactLandlord, setContactLandlord] = useState(false);
    SwiperCore.use([Autoplay, Navigation, Pagination])

    // params로 현재 페이지에 해당하는 uid를 가져온다
    useEffect(()=>{
        async function fetchListing(){
            const docRef = doc(db, 'listing', params.listingId);
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()){
                setListing(docSnap.data());
                setLoading(false);
                console.log(listing);
            }
        }
        fetchListing();        
    },[params.listingId]);

    if(loading){
        return <Spinner></Spinner>;
    }

    
    return (
        <main>

        {/* Swiper(현재 버전이 제대로 작동을 안해서 구 버전 설치) */}
        <Swiper slidesPerView={1} navigation pagination={{type: 'progressbar'}} effect='fade' modules={[EffectFade]} autoplay={{delay: 3000}}>
            {listing.imgUrls.map((url, index)=>(
                <SwiperSlide key={index}>
                    <div className='relative w-full overflow-hidden h-[300px]' style={{background: `url(${listing.imgUrls[index]}) center no-repeat`, backgroundSize:'cover'}}>

                    </div>
                </SwiperSlide>
            ))}
        </Swiper>

        {/* 링크복사 버튼 */}
        <div 
        onClick={()=>{
            navigator.clipboard.writeText(window.location.href) // navigator: 클립보드에 해당 href 저장하는 함수
            setShareLinkCopied(true)
            setTimeout(() => {
                setShareLinkCopied(false)
            }, 2000);
        }}
        className='fixed top-[13%] right-[3%] z-10 bg-white cursor-pointer border-2
         border-gray-400 rounded-full w-12 h-12 flex justify-center items-center'> 
                                              {/* flex justify-center items-center를 사용해서 상하좌우 가운데 정렬 */}                                             
            <AiOutlineCopy className='text-lg text-slate-500'></AiOutlineCopy>
        </div>

        {/* 2초 후 사라지는 '링크복사 완료!' UI */}
        {shareLinkCopied && <p className='fixed top-[23%] right-[5%] font-semibold text-sm border-2 border-gray-400 rounded-md bg-white z-10 p-2'>링크복사 완료!</p>}

        <div className='m-4 p-4 rounded-lg shadow-lg flex flex-col bg-white md:flex-row max-w-6xl lg:mx-auto lg:space-x-5'>
            <div className='w-full'>
                <p className='text-2xl font-bold mb-3 text-blue-900'>
                    {listing.name} - ₩ {listing.offer ? 
                    listing.discountedPrice
                    .toString()
                    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 
                    listing.regularPrice
                    .toString()
                    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}
                    {listing.type === 'rent' ? ' 월세' : ''}
                </p>
                <p className='flex items-center mt-6 mb-3 font-semibold'>
                    <FaMapMarkerAlt className='text-green-700 mr-1'></FaMapMarkerAlt>
                    {listing.address}
                </p>
                <div className='flex justify-start items-center space-x-4 w-[75%]'>
                    <p className='bg-red-800 w-full max-w-[200px] rounded-md p-1 text-white text-center font-semibold shadow-md'>{listing.type === 'rent' ? '월세' : '매매'} </p>
                    {listing.offer &&(
                        <p className='w-full max-w-[200px] bg-green-800 rounded-md p-1 text-white text-center font-semibold shadow-md'>
                            {(listing.regularPrice - listing.discountedPrice).toString()
                    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} 원 할인</p>
                    )}
                </div>
                <p className='mt-3 mb-3'>
                    <span className='font-semibold'>특이사항 - </span>{listing.description}
                </p>
                <ul className='flex items-center space-x-2 sm:space-x-10 text-sm font-semibold mb-6'>
                    <li className='flex items-center whitespace-nowrap'>
                        <BiSolidBed className='text-lg mr-1'></BiSolidBed>
                        방 {listing.bedrooms}
                    </li>
                    <li className='flex items-center whitespace-nowrap'>
                        <FaBath className='text-lg mr-1'></FaBath>
                        화장실 {listing.bathrooms}
                    </li>
                    <li className='flex items-center whitespace-nowrap'>
                        <FaParking className='text-lg mr-1'></FaParking>
                        {listing.parking ? '주차가능' : '주차불가'}  
                    </li>
                    <li className='flex items-center whitespace-nowrap'>
                        <FaChair className='text-lg mr-1'></FaChair>
                        {listing.furnished ? '옵션 O' : '옵션 X'}  
                    </li>
                </ul>
                {/* auth.currentUser?.uid는 현재 로그인된 사용자가 있을 경우 
                'currentUser' 객체의 'uid' 프로퍼티에 접근하며, 
                사용자가 로그인되어 있지 않을 경우에는 undefined를 반환한다. 
                이를 통해 데이터를 받아 오기 전에 페이지가 먼저 로드 되는 것을 막을 수 있다.*/}
                {listing.userRef !== auth.currentUser?.uid && !contactLandlord && ( // listing.userRef !== auth.currentUser?.uid 이고 contactLandlord가 false이면
                <div className='mt-6'>
                    <button onClick={()=>setContactLandlord(true)}
                    className='px-7 py-3 bg-blue-600 text-white font-medium text-sm rounded shadow-md 
                    hover:bg-blue-700 hover:shadow-lg w-full text-center transition duration-150 ease-in-out'>
                    집주인에게 연락하기
                    </button>
                </div>
                )}
                {contactLandlord && (
                    <Contact 
                    userRef={listing.userRef}
                    listing={listing}
                    >
                    </Contact>
                )}
                
                                                
            </div>
            <div className='z-1 w-full mt-6 h-[200px] md:h-[400px] md:mt-0 md:ml-2'>
                {/* 카카오맵 api로 지도 데이터 받아와서 표시하기 */}
                <Kakao listing={listing} />
            </div>
        </div>
    </main>
    );
}
