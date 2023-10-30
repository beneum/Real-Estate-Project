import { useEffect, useState } from 'react'
import Slider from '../components/Slider'
import { collection, doc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Home() {
  // Offers
  const [offerListings, setOfferListings] = useState(null);
  useEffect(()=>{
    async function fetchListings(){
      try {
        // collection으로 참조값 가져오기
        const listingsRef = collection(db, 'listing')

        // 쿼리 만들기
        const q = query(listingsRef, where('offer', '==', true), orderBy('timestamp', 'desc'), limit(4));

        // 쿼리 실행시키기
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id, // 여기서 id는 userRef에 있는 uid가 아니라 listing 각각의 id
            data: doc.data(),
          });
        });
        setOfferListings(listings);

      } catch (error) {
        console.log(error); 
      }
    }
    fetchListings();
  },[])

  // rent
  const [rentListings, setRentListings] = useState(null);
  useEffect(()=>{
    async function fetchListings(){
      try {
        // collection으로 참조값 가져오기
        const listingsRef = collection(db, 'listing')

        // 쿼리 만들기
        const q = query(listingsRef, where('type', '==', 'rent'), orderBy('timestamp', 'desc'), limit(4));

        // 쿼리 실행시키기
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id, // 여기서 id는 userRef에 있는 uid가 아니라 listing 각각의 id
            data: doc.data(),
          });
        });
        setRentListings(listings);

      } catch (error) {
        console.log(error); 
      }
    }
    fetchListings();
  },[])

  // sale ** rent와 sale은 index가 유사하기 때문에 따로 index를 추가하지는 않는다
  const [saleListings, setSaleListings] = useState(null);
  useEffect(()=>{
    async function fetchListings(){
      try {
        // collection으로 참조값 가져오기
        const listingsRef = collection(db, 'listing')

        // 쿼리 만들기
        const q = query(listingsRef, where('type', '==', 'sale'), orderBy('timestamp', 'desc'), limit(4));

        // 쿼리 실행시키기
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id, // 여기서 id는 userRef에 있는 uid가 아니라 listing 각각의 id
            data: doc.data(),
          });
        });
        setSaleListings(listings);

      } catch (error) {
        console.log(error); 
      }
    }
    fetchListings();
  },[])
  return (
    <div>
      <Slider></Slider>
      <div className='max-w-6xl mx-auto pt-4 space-y-6'>
        {/* offer */}
        {/* offerListings이 존재하고, offerListings의 length가 0보다 크면 */}
        {offerListings && offerListings.length > 0 &&(
          <div className='m-2 mb-6'>
            <h2 className='px-3 text-2xl mt-6 font-semibold'>특가 매물</h2>
            <Link to='/offers'>
              <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>더 많은 특가 매물들 보러가기</p>
            </Link>

            {/* grid로 반응형 디자인 만들기 */}
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {offerListings.map((listing)=>(
                <ListingItem key={listing.id} listing={listing.data} id={listing.id}></ListingItem>
              ))}
            </ul>
          </div>
        )} 

        {/* rent */}
        {rentListings && rentListings.length > 0 &&(
          <div className='m-2 mb-6'>
            <h2 className='px-3 text-2xl mt-6 font-semibold'>임대 매물</h2>
            <Link to='/category/rent'>
              <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>더 많은 임대 매물들 보러가기</p>
            </Link>

            {/* grid로 반응형 디자인 만들기 */}
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {rentListings.map((listing)=>(
                <ListingItem key={listing.id} listing={listing.data} id={listing.id}></ListingItem>
              ))}
            </ul>
          </div>
        )} 

        {/* sale */}
        {rentListings && rentListings.length > 0 &&(
          <div className='m-2 mb-6'>
            <h2 className='px-3 text-2xl mt-6 font-semibold'>판매 매물</h2>
            <Link to='/category/sale'>
              <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>더 많은 판매 매물들 보러가기</p>
            </Link>

            {/* grid로 반응형 디자인 만들기 */}
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {saleListings.map((listing)=>(
                <ListingItem key={listing.id} listing={listing.data} id={listing.id}></ListingItem>
              ))}
            </ul>
          </div>
        )} 
      </div>
    </div>
  )
}
