import React, { useEffect, useState } from 'react'
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from 'firebase/auth';
import {v4 as uuidv4} from 'uuid'; 
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate, useParams } from 'react-router';

  
export default function EditListing() {
    const navigate = useNavigate();
    const auth = getAuth();
    const [geolocationEnabled, setGeolocationEnabled] = useState(true);
    const [loading, setLoading] = useState(false)
    const [listing, setListing] = useState(null)
    const [formData, setFormData] = useState({
        type: 'rent',
        name: '',
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: '',
        description: '',
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        latitude: 0,
        longitude: 0,
        images: {},
    });

    // formData 구조분해할당
    const {type, name, bedrooms, bathrooms, parking, furnished, address, description,
         offer, regularPrice, discountedPrice, latitude, longitude, images} = formData;

    const params = useParams();

    // listing이 해당 유저의 것인지 체크하고 아니면 에러
    useEffect(()=>{
        if(listing && listing.userRef !== auth.currentUser.uid){
            toast.error('해당 매물을 수정할 수 있는 권한이 없습니다.');
            navigate('/')
        }
    },[auth.currentUser.uid, listing, navigate]); // dependency로 'listing'을 빼면 작동 x


    // 해당 uid와 일치하는 데이터 fetch
    useEffect(()=>{
        setLoading(true);

        // 매물 수정 페이지로 들어왔을 때, 자동으로 해당 uid와 일치하는 데이터를 채워 넣는 함수
        async function fetchListing(){
            const docRef = doc(db, 'listing', params.listingId) 
            // listingId는 App.js의 <Route path='/edit-listing/:listingId' ~ > 여기의 :listingId 이 부분이다
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()){
                setListing(docSnap.data());
                setFormData({...docSnap.data()}); // setFormData(docSnap.data()); 이렇게 해도 동작은 한다
                // setFormData를 사용하여 상태를 업데이트할 때, React는 이전 상태와 새로운 상태를 비교하여 불필요한 리렌더링을 방지하려고 한다.
                // 객체의 경우, 이전 상태와 새로운 상태의 참조가 다르지 않으면 React는 변경사항이 없다고 간주하고 리렌더링하지 않을 수 있다.

                // 그래서 스프레드 연산자인 {...} 를 사용하여 docSnap.data()에서 반환된 객체의 얕은 복사본을 만든다.
                // 이렇게 하는 이유는 상태 업데이트가 리렌더링을 트리거하도록 하기 위함이다.
                // React는 객체 참조를 기반으로 변경 사항을 감지한다.
                setLoading(false)
            }else{
                navigate('/')
                toast.error('매물이 존재하지 않습니다.')
            }
        }
        fetchListing();
        console.log(params.listingId);
    },[navigate, params.listingId]);

    

    function onChange(e){
        let boolean = null;
        if(e.target.value === 'true'){             
            boolean = true
            // value값이 boolean타입이면 위에 있는 변수 'boolean'을 true로 바꾼다
        }
        if(e.target.value === 'false'){
            boolean = false
        }

        // files
        if(e.target.files){ // input안에 file이 있는 경우
            setFormData((prev)=>({
                ...prev,
                images: e.target.files
            }));
        }

        // text/boolean/number
        if(!e.target.files){ // input안에 file이 없는 경우
            setFormData((prev)=>({
                ...prev,
                [e.target.id]: boolean ?? e.target.value 
        // boolean이 null이 아니면 변수 boolean의 값으로 적용, null이면  ?? 뒤에 있는 e.target.value를 적용
            }))
        }
    }


    // onSubmit 함수
    async function onSubmit(e){
        e.preventDefault();
        setLoading(true);
        if(+discountedPrice >= +regularPrice){ // useState객체로부터 숫자를 가져올 때 숫자가 문자열로 변환된다. 변수 앞에 +를 붙이면 숫자로 변환해준다.
            setLoading(false);
            toast.error('할인가격은 기본가격보다 낮아야합니다.')
            return;
        }
        if(images.length > 6){
            setLoading(false);
            toast.error('이미지는 최대 6개까지 업로드 가능합니다.')
            return;
        }

        let geolocation = {};
        let location;
        if(geolocationEnabled){
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`);

            const data = await response.json();
            console.log(data);
            // ?? 0은 nullish coalescing 연산자로, 왼쪽 피연산자가 null 또는 undefined인 경우 오른쪽 피연산자를 반환한다. 
            // 따라서 위 코드에서는 위도(lat)를 가져오는 것이 실패한 경우 0을 사용하게 된다.
            geolocation.lat = data.results[0]?.geometry.location.lat ?? 0; // geolocation객체에 추가
            geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

            // data의 상태가 'ZERO_RESULTS'이면 location의 값은 undefined가 된다.
            location = data.status === 'ZERO_RESULTS' && undefined; 
            
            if(location === undefined){
                setLoading(false);
                toast.error('주소를 찾지 못하였습니다.');
                return;
            }
        }else{
            geolocation.lat = latitude;
            geolocation.lng = longitude;
        }

        
        async function storeImage(image){
            return new Promise((resolve, reject)=>{
                const storage = getStorage();
                const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}` 
                const storageRef = ref(storage, filename);
                const uploadTask = uploadBytesResumable(storageRef, image);

                uploadTask.on('state_changed', 
                    (snapshot) => {
                        // Observe state change events such as progress, pause, and resume
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                        }
                    }, 
                    (error) => {
                        // Handle unsuccessful uploads
                        reject(error);
                    }, 
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            resolve(downloadURL);
                        });
                    }
                    );
                })
        }

        const imgUrls = await Promise.all(
            [...images].map((image)=>storeImage(image))) 
            .catch((error)=>{
                setLoading(false);
                toast.error('이미지가 업로드 되지 않았습니다.');
                return;
            }
        );
        
        const formDataCopy = {
            ...formData,
            imgUrls,
            geolocation,
            timestamp: serverTimestamp(),
            userRef: auth.currentUser.uid,
        };
        delete formDataCopy.images;
        !formDataCopy.offer && delete formDataCopy.discountedPrice;

        // **firestore에서 'listing'의 id와 params.listingId과 일치하는 문서에 formDataCopy를 업데이트한다.
        const docRef = doc(db, 'listing', params.listingId);        
        await updateDoc(docRef, formDataCopy);
        setLoading(false);
        toast.success('매물이 수정되었어요!');
        navigate(`/category/${formDataCopy.type}/${docRef.id}`)
    }

    
    // 로딩 스피너
    if(loading){
        return <Spinner></Spinner>
    }
  return (
    <main className='max-w-md px-2 mx-auto'>
      <h1 className='text-3xl text-center mt-6 font-bold'>매물 수정하기</h1>
      <form onSubmit={onSubmit}>
        <p className='text-lg mt-6 font-semibold'>매도 / 임대</p>
        <div className='flex'>
            <button className={`mr-3 px-7 py-3 font-medium text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full 
            ${type === 'sale' ? 'bg-slate-600 text-white':'bg-white text-black' }`} 
            type='button' id='type' value='sale' onClick={onChange}>
                매도
            </button>
            <button className={`ml-3 px-7 py-3 font-medium text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full 
            ${type === 'rent' ? 'bg-slate-600 text-white': 'bg-white text-black'}`} 
            type='button' id='type' value='rent' onClick={onChange}>
                임대
            </button>
        </div>
        <p className='text-lg mt-6 font-semibold'>매물 이름</p>
        <input className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6' 
        type="text" id='name' value={name} onChange={onChange} placeholder='매물 이름' maxLength='32' minLength='10' required/>
        {/* maxLength가 32로 설정되어 있으므로 사용자가 32자 이상의 텍스트를 입력할 수 없다. 
        또한 minLength가 10으로 설정되어 있으므로 사용자는 10자 이상의 텍스트를 입력해야 양식을 제출할 수 있다. */}

        <div className='flex space-x-6 mb-6'>
            <div>
                <p className='text-lg font-semibold '>방</p>
                <input className='w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center' 
                type="number" id='bedrooms' value={bedrooms} onChange={onChange} min='1' max='50' required />
            </div>
            <div>
                <p className='text-lg font-semibold '>화장실</p>
                <input className='w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center' 
                type="number" id='bathrooms' value={bathrooms} onChange={onChange} min='1' max='50' required />
            </div>
        </div>

        <p className='text-lg mt-6 font-semibold'>주차가능 여부</p>
        <div className='flex'>
            <button className={`mr-3 px-7 py-3 font-medium text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full 
            ${!parking ? 'bg-white text-black':'bg-slate-600 text-white' }`} 
            type='button' id='parking' value={true} onClick={onChange}>
                O
            </button>
            <button className={`ml-3 px-7 py-3 font-medium text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full 
            ${parking ? 'bg-white text-black':'bg-slate-600 text-white'}`} 
            type='button' id='parking' value={false} onClick={onChange}>
                X
            </button>
        </div>

        <p className='text-lg mt-6 font-semibold'>옵션 여부</p>
        <div className='flex'>
            <button className={`mr-3 px-7 py-3 font-medium text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full 
            ${!furnished ? 'bg-white text-black' : 'bg-slate-600 text-white'}`} 
            type='button' id='furnished' value={true} onClick={onChange}>
                O
            </button>
            <button className={`ml-3 px-7 py-3 font-medium text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full 
            ${furnished  ? 'bg-white text-black' : 'bg-slate-600 text-white'}`} 
            type='button' id='furnished' value={false} onClick={onChange}>
                X
            </button>
        </div>
        <p className='text-lg mt-6 font-semibold'>주소</p>
        <textarea className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6' 
        type="text" id='address' value={address} onChange={onChange} placeholder='주소' required/>
 

        {/* 위도 경도 구하기 */}
        {!geolocationEnabled && (
            <div className='flex space-x-6 justify-start mb-6'>
                <div>
                    <p className='text-lg font-semibold'>Latitude</p>
                    <input className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border-slate-600 text-center'
                    type="number" id='latitude' value={latitude} onChange={onChange} required min='-90' max='90' /> 
                                                                                          {/* min='-90' max='90' 이렇게 하니까 해당 요소 width가 작아짐 */}
                </div>
                <div>
                    <p className='text-lg font-semibold'>Longitude</p>
                    <input className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border-slate-600 text-center'
                    type="number" id='longitude' value={longitude} onChange={onChange} required min='-180' max='180'  />
                </div>
            </div>
        )}


        <p className='text-lg font-semibold'>세부사항</p>
        <textarea className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6' 
        type="text" id='description' value={description} onChange={onChange} placeholder='세부사항' required/>
        
        <p className='text-lg font-semibold'>할인 가능</p>
        <div className='flex mb-6'>
            <button className={`mr-3 px-7 py-3 font-medium text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full 
            ${!offer ? 'bg-white text-black' : 'bg-slate-600 text-white'}`} 
            type='button' id='offer' value={true} onClick={onChange}>
                O
            </button>
            <button className={`ml-3 px-7 py-3 font-medium text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full 
            ${offer  ? 'bg-white text-black' : 'bg-slate-600 text-white'}`} 
            type='button' id='offer' value={false} onClick={onChange}>
                X
            </button>
        </div>

        <div className='flex items-center mb-6'>
            <div>
                <p className='text-lg font-semibold'>기본가격</p>
                <div className='flex w-full justify-center items-center space-x-6'>
                    <input className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus: bg-white focus:border-slate-600 text-center' 
                    type="number" step='10000' id='regularPrice' value={regularPrice} onChange={onChange} min='100,000' max='400,000,000' required/>
                    {type === 'rent' && (
                    <div>
                        <p className='text-md w-full whitespace-nowrap'>원 / 월세</p>                        
                    </div>
                )}
                </div>
                
            </div>
        </div>
        {offer && 
        <div className='flex items-center mb-6'>
        <div>
            <p className='text-lg font-semibold'>할인가격</p>
            <div className='flex w-full justify-center items-center space-x-6'>
                <input className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus: bg-white focus:border-slate-600 text-center' 
                type="number" step='10000' id='discountedPrice' value={discountedPrice} onChange={onChange} min='100,000' max='400,000,000' required={offer}/>
                {type === 'rent' && (
                <div>
                    <p className='text-md w-full whitespace-nowrap'>원 / 월세</p>                        
                </div>
            )}
            </div>
            
        </div>
        </div>
        }
        
        <div className='mb-6'>
            <p className='text-lg font-semibold'>이미지</p>
            <p className='text-gray-600'>첫번째 이미지가 커버 이미지입니다. (최대 6개까지 업로드 가능)</p>
            <input className='w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600' 
            type="file" id='images' onChange={onChange} accept='.jpg, .png, .jpeg' multiple required />            
        </div>
        <button className='mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-800 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out' 
        type='submit'>매물 수정 완료</button>
      </form>
    </main>
  )
}
