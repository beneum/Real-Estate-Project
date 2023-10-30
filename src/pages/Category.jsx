import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { db } from '../firebase';
import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';
import { useParams } from 'react-router';

export default function Category() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);
  const params = useParams(); // Category 라우트에서 params 가져오기
  useEffect(()=>{
    async function fetchListings(){
      try {
        const listingsRef = collection(db, 'listing');
        const q = query(listingsRef, where('type', '==', params.categoryName), orderBy('timestamp', 'desc'), limit(5));
        const querySnap = await getDocs(q);

        // querySnap.docs는 쿼리 스냅샷에 있는 모든 문서들의 배열을 나타내고, 각 문서는 [](인덱스)를 통해 접근 할 수 있다.
        // querySnap.docs.length는 querySnap에 포함된 문서 개수를 나타낸다. 배열의 인덱스는 0부터 시작하기 때문에,
        // 마지막 문서의 인덱스는 'querySnap.docs.length-1'로 구할 수 있다. 
        const lastVisible = querySnap.docs[querySnap.docs.length-1]; 
        setLastFetchedListing(lastVisible);
        // console.log(querySnap.docs);
        
        const listing = [];
        querySnap.forEach((doc)=>{
          return listing.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listing); // 여기서는 28번째 줄에서 직접 작성한 배열인 listing을 넣어준다
        setLoading(false);
      } catch (error) {
        toast.error('매물을 받아올 수 없습니다.')
      }
    }
    fetchListings();
  },[params.categoryName]); 

  async function onFetchMoreListings(){
    try {
      const listingRef = collection(db, 'listing');
      const q = query(listingRef, where('type', '==', params.categoryName), orderBy('timestamp', 'desc'), startAfter(lastFetchedListing), limit(4));
      const querySnap = await getDocs(q);

      const lastVisible = querySnap.docs[querySnap.docs.length-1];
      setLastFetchedListing(lastVisible);
      
      const listing = [];
      querySnap.forEach((doc)=>{
        return listing.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings((prev)=>[...prev, ...listing]); // 여기서는 53번째 줄에서 직접 작성한 배열인 listing을 넣어준다
      setLoading(false);
    } catch (error) {
      toast.error('매물을 받아올 수 없습니다.')
    }
  }

  return (
    <div className='max-w-6xl mx-auto px-3'>
      <h1 className='text-3xl text-center mt-6 mb-6 font-bold'>
        {params.categoryName === 'rent' ? '임대 매물' : '매매 매물'}
      </h1>
      {
      loading ? <Spinner></Spinner> : // loading이 true이면 
      listings && listings.length > 0 ? (
      <> 
      {/* loading이 false이고 listings이 존재하고 listings의 length가 0 보다 크면  */}
        <main>
          <ul className='sm: grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
            {listings.map((listing, i)=>(
              <ListingItem key={i} id={listing.id} listing={listing.data}></ListingItem>
            ))}
          </ul>
        </main>
        {lastFetchedListing && ( // lastFetchedListing이 존재하면
          <div className='flex justify-center items-center'>
            <button 
            onClick={onFetchMoreListings}
            className='bg-white px-3 py-1.5 text-gray-700 border border-gray-300 mb-6 mt-6 hover:border-slate-600 rounded transition duration-150 ease-in-out'>더보기</button>
          </div>
        )}
      </> ): (
         <p>현재 {params.categoryName === 'rent' ? '임대' : '매매'} 매물이 없습니다.</p> // listings이 존재하지 않고 listings의 length가 0이면
      )}
    </div>
  )
}
