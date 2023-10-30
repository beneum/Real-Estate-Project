import React, { useEffect, useState } from 'react'
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from 'firebase/auth';
import {v4 as uuidv4} from 'uuid'; 
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router';


export default function CreateListing() {
    const navigate = useNavigate();
    const auth = getAuth();
    const [geolocationEnabled, setGeolocationEnabled] = useState(true);
    const [loading, setLoading] = useState(false)
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
    console.log(images);


    // onSubmit 함수
    async function onSubmit(e){
        e.preventDefault();
        setLoading(true);
        if(+discountedPrice >= +regularPrice){ // useState객체로부터 숫자를 가져올 때 숫자가 문자열로 변환된다. 변수 앞에 +를 붙이면 숫자로 변환해준다.
            setLoading(false);
            toast.error('가격을 올바르게 입력해 주세요.')
            return;
        }
        if(images.length > 6){
            setLoading(false);
            toast.error('이미지는 최대 6개까지 업로드 가능합니다.')
            return;
        }

        // 구글 api를 fetch해서 경도, 위도값 구하기
        let geolocation = {}; 
        let location;
        if(geolocationEnabled){
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`);

            const data = await response.json();
            console.log(data);
            // ?? 0은 nullish coalescing 연산자로, 왼쪽 피연산자가 null 또는 undefined인 경우 오른쪽 피연산자를 반환한다. 
            // 따라서 위 코드에서는 위도(lat)를 가져오는 것이 실패한 경우 0을 사용하게 된다.

            // data.results[0]?: 여기 물음표는 data.results[0]이 존재하면, ~
            geolocation.lat = data.results[0]?.geometry.location.lat ?? 0; // geolocation객체에 추가 'ex)const geolocation = {lat:34.22}' 이런 형태로 추가된다.
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

        // firebase에 이미지 업로드
        async function storeImage(image){
            return new Promise((resolve, reject)=>{ // resolve: 성곡적으로 데이터를 가져왔을 때 reject: 에러가 났을 때                
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
        // Promise.all:
        // Promise.all()은 여러 개의 Promise들을 비동기적으로 실행하여 처리할 수 있다.
        // Promise.all()은 여러 개의 Promise들 중 하나라도 reject 를 반환하거나 에러가 날 경우, 모든 Promise 들을 reject 시킨다.
            [...images].map((image)=>storeImage(image))) 
            .catch((error)=>{
                setLoading(false);
                toast.error('이미지가 업로드 되지 않았습니다.');
                return;
            }
        );
        

        // formData의 복사본 만들기(기존 데이터를 삭제하려면 복사본을 만드는게 좋다)
        const formDataCopy = { 
            ...formData,
            imgUrls,
            geolocation,
            timestamp: serverTimestamp(),
            userRef: auth.currentUser.uid,
        };
        delete formDataCopy.images;
        !formDataCopy.offer && delete formDataCopy.discountedPrice;

        // **새로운 formDataCopy문서를 가진 'listing' 이라는 이름의 collection을 추가
        const docRef = await addDoc(collection(db, 'listing'), formDataCopy); 
        setLoading(false);
        toast.success('매물이 올려졌어요!');
        navigate(`/category/${formDataCopy.type}/${docRef.id}`)// 여기서 docRef.id는 userRef id가 아니라 'listing'의 아이디
    }

    
    // 로딩 스피너
    if(loading){
        return <Spinner></Spinner>
    }
  return (
    <main className='max-w-md px-2 mx-auto'>
      <h1 className='text-3xl text-center mt-6 font-bold'>매물을 올려보세요!</h1>
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
        type='submit'>매물 올리기</button>
      </form>
    </main>
  )
}
