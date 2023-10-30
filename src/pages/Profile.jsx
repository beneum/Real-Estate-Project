import { getAuth, updateProfile } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify';
import { db } from '../firebase';
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import {FcHome} from 'react-icons/fc'
import { Link } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Profile() {
  const auth = getAuth(); // 파이어베이스에서 데이터를 받아오기 전에 화면이 렌더링돼서 에러가 나는 문제 해결법
  const navigate = useNavigate();
  const [listings, setListings] = useState(null);
  const [loading , setLoading] = useState(true);
  const [changeDetail, setChangeDetail] = useState(true);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,    
  })
  const {name, email} = formData;

  function onLogout(){
    auth.signOut();
    navigate('/');
  }

  function onChange(e){
    setFormData((prev)=>({
      ...prev, 
      [e.target.id]: e.target.value,
    }))
  }

  async function onSubmit(){
    try {
      // firebase authentication에서 displayName 업데이트
      if(auth.currentUser.displayName !== name){ // 현재 firebase에 로그인 된 유저의 displayName이 name과 다르면,
        await updateProfile(auth.currentUser, { // updateProfile 함수로 유저의 displayName을 formData의 name으로 변경
          displayName: name,
        });
      
      // firebase firestore에서 displayName 업데이트
        const docRef = doc(db, 'users', auth.currentUser.uid) // db = getFirestore()
        await updateDoc(docRef, {
          name: name, // name이 같기 때문에 name,이렇게만 해도 동작
        });        
      }
      toast.success('프로필 수정이 완료되었습니다')
        
    } catch (error) {
      toast.error('프로필 이름 변경에 실패했습니다')
    }
  }

  useEffect(()=>{
    async function fetchUserListings(){
      
      const listingRef = collection(db, 'listing');
      const q = query(
        // Firestore 쿼리는 Google의 Firebase Firestore 데이터베이스에서 데이터를 검색하고 조작하기 위해 사용되는 구조화된 요청이다. 
        listingRef, 
        where('userRef', '==', auth.currentUser.uid), 
        // where: 필드의 값을 특정 조건과 비교하여 문서를 필터링한다. 
        // 예를 들어, where('age', '>', 18)는 'age' 필드가 18보다 큰 문서들을 반환한다.

        // 여기서는 firestore에서 현재 로그인된 사용자의 UID와 일치하는 userRef 값을 가진 물건 정보 문서들을 가져올 수 있다. 
        // 이렇게 함으로써 사용자가 등록한 물건들을 확인하거나 관리할 수 있게 된다.
        
        
        orderBy('timestamp', 'desc'));        
        // orderBy: 지정한 필드를 기준으로 결과를 정렬한다. 
        // 오름차순(asc) 또는 내림차순(desc)으로 정렬할 수 있다.
        // 위 코드는 쿼리 결과를 'timestamp' 필드를 기준으로 내림차순으로 정렬하도록 지정
        const querySnap = await getDocs(q);
        // getDocs: 컬렉션 내의 모든 문서를 가져오는 쿼리이다.
        // 여기서 getDocs 함수는 q 쿼리를 실행하여 해당 쿼리 조건에 맞는 문서들을 가져오는 비동기 함수이다.
        let listings = [];
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        
        setListings(listings);
        console.log(listings);
        setLoading(false);
    }
    fetchUserListings();
  }, [auth.currentUser.uid]) // 사용자가 바뀔 때 마다 실행

  // 매물 삭제 함수
  async function onDelete(listingID){
    if(window.confirm('매물을 삭제 하시겠습니까?')){ // '확인'누르면 실행되는 코드
      await deleteDoc(doc(db, 'listing', listingID)) // 1. firestore에서 삭제
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingID // 2. listings배열에서 삭제: listings배열에 있는 id중 listingID와 다른것들만 필터링
        );
        setListings(updatedListings);
        toast.success('삭제가 완료 되었습니다.')
    }
  }

  // 매물 수정 함수
  function onEdit(listingID){
    navigate(`/edit-listing/${listingID}`)
  }

  return (
    <>
      <section className='max-w-6xl mx-auto flex justify-center items-center flex-col'>
        <h1 className='text-3xl text-center mt-6 font-bold'>프로필</h1>
        <div className='w-full md:w-[50%] mt-6 px-3'>
          <form>
            {/* name input */}
            <input type="text" id='name' value={name} disabled={changeDetail} 
            onChange={onChange}
            className={`mb-6 w-full px-4 py-2 text-xl text-gray-700 
            bg-white border border-gray-300 rounded transition ease-in-out ${!changeDetail && '!bg-blue-200 focus:bg-blue-200'}`}/>

            {/* email input */}
            <input type="text" id='email' value={email} disabled 
            className='mb-6 w-full px-4 py-2 text-xl text-gray-700 
            bg-white border border-gray-300 rounded transition ease-in-out'/>

            <div className='flex justify-between whitespace-nowrap text-sm sm:text-lg'>
              <p className='flex items-center mb-6'>프로필 이름을 변경하시겠습니까?
                <span onClick={() => {
                  !changeDetail && onSubmit(); // onClick했을 때, changeDetail이 false면 onSubmit()함수 실행
                  setChangeDetail((prev)=>!prev);
                 }} className='text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer'>
                  {/* onClick={setChangeDetail((prev)=>!prev)} 이렇게 하면 제대로 동작 x */}
                  {changeDetail ? '수정' : '변경사항 저장'}
                </span>
              </p>
              <p onClick={onLogout} className='text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out cursor-pointer'>
                로그아웃</p>
            </div>
          </form>
          <button type='submit' className='w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800'>
            <Link to='/create-listing' className='flex justify-center items-center'>
              <FcHome className='mr-2 text-3xl bg-red-200 rounded-full p-1 border-2'></FcHome>
              매도 또는 임대하기
            </Link>            
          </button>
        </div>
      </section>
      <div className='max-w-6xl px-3 mt-6 mx-auto'>
        {/* loading이 false이고 listings의 length가 1보다 크면 아래 ui가 보인다. */}
        {!loading && listings.length > 0 && (
          <>
            <h2 className='text-2xl text-center font-semibold mb-6'>나의 매물 목록</h2>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-6 mb-6'>
              {listings.map((listing)=>(
                <ListingItem // props 전달
                key={listing.id} 
                id={listing.id} 
                listing={listing.data}
                onDelete={() => onDelete(listing.id)} // props로 함수도 보낼 수 있다
                onEdit={() => onEdit(listing.id)}
                ></ListingItem>
              ))}
            </ul>
          </>
        )}         
      </div>
    </>
  )
}
