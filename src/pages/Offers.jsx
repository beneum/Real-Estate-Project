import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { db } from '../firebase';
import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';

export default function Offers() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);
  useEffect(()=>{
    async function fetchListings(){
      try {
        const listingsRef = collection(db, 'listing');
        const q = query(listingsRef, where('offer', '==', true), orderBy('timestamp', 'desc'), limit(5));
        const querySnap = await getDocs(q);

        // querySnap.docs는 쿼리 스냅샷에 있는 모든 문서들의 배열을 나타내고, 각 문서는 [](인덱스)를 통해 접근 할 수 있다.
        // querySnap.docs.length는 querySnap에 포함된 문서 개수를 나타낸다. 배열의 인덱스는 0부터 시작하기 때문에,
        // 마지막 문서의 인덱스는 'querySnap.docs.length-1'로 구할 수 있다. 
        const lastVisible = querySnap.docs[querySnap.docs.length-1]; 
        setLastFetchedListing(lastVisible);
        console.log(querySnap.docs);
        
        const listing = [];
        querySnap.forEach((doc)=>{
          return listing.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listing); // 여기서는 26번째 줄에서 직접 작성한 배열인 listing을 넣어준다
        setLoading(false);
      } catch (error) {
        toast.error('매물을 받아올 수 없습니다.')
      }
    }
    fetchListings();
  },[]);

  async function onFetchMoreListings(){
    try {
      const listingRef = collection(db, 'listing');

      // startAfter(lastFetchedListing): lastFetchedListing다음에 나오는 데이터들을 가져오는 쿼리. 
      // lastFetchedListing다음에 더이상 값이 없으면, lastVisible이 null이 되면서 lastFetchedListing도 null이 된다.
      const q = query(listingRef, where('offer', '==', true), orderBy('timestamp', 'desc'), startAfter(lastFetchedListing), limit(5));
      const querySnap = await getDocs(q);

      // querySnap.docs는 쿼리 결과에 해당하는 모든 문서(document)를 담은 '배열'을 나타낸다.
      // 코드에서 querySnap.docs[0]은 쿼리 결과의 첫 번째 문서에 접근하며, 
      // querySnap.docs[0].data()는 첫 번째 문서의 데이터를 가져온다.
      const lastVisible = querySnap.docs[querySnap.docs.length-1];
      setLastFetchedListing(lastVisible);
      
      const listing = [];
      querySnap.forEach((doc)=>{
        return listing.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings((prev)=>[...prev, ...listing]); // 여기서는 57번째 줄에서 직접 작성한 배열인 listing을 넣어준다
      setLoading(false);
    } catch (error) {
      toast.error('매물을 받아올 수 없습니다.')
    }
  }

  return (
    <div className='max-w-6xl mx-auto px-3'>
      <h1 className='text-3xl text-center mt-6 mb-6 font-bold'>할인 매물</h1>
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
         <p>현재 할인 매물이 없습니다.</p> // listings이 존재하지 않고 listings의 length가 0이면
      )}
    </div>
  )
}
