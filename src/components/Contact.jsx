import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../firebase';
import { toast } from 'react-toastify';

export default function Contact({userRef, listing}) {
    const [landlord, setLandlord] = useState(null);
    const [message, setMessage] = useState('');
 
    // 집주인 데이터 가져오기
    useEffect(()=>{
        async function getLandlord(){
            const docRef = doc(db, 'users', userRef)
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()){
                setLandlord(docSnap.data())
            }else{
                toast.error('집주인 정보를 가져오지 못했습니다.')
            }
        }
        getLandlord();
    },[userRef])

    function onChange(e){
        setMessage(e.target.value)
    }

  return (
    <>
    {/* 데이터를 받아오기 전에 페이지가 로드 될 수 있기 때문에 바로 데이터를 받아오는 것이 아니라,
    'landlord !== null'로 한번 필터링을 해 줘야 정상 작동한다. */}
      {landlord !== null && (
        <div className='flex flex-col w-full'>
            <p> 집주인 {landlord.name}님에게 연락해 보세요!</p>
            <div className='mt-3 mb-6'>
                <textarea className='w-full px-4 py2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600'
                 name="message" id="message" rows="2" value={message} onChange={onChange}></textarea>
            </div>
            <a href={`mailto: ${landlord.email}?Subject=${listing.name}&body=${message}`}>
                <button className='mb-6 px-7 py-3 bg-blue-600 text-white rounded text-sm shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-150 ease-in-out w-full text-center' type='button'>메세지 보내기</button>
            </a>
        </div>
      )}
    </>
  )
}
