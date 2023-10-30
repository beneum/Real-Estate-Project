import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import {useLocation, useNavigate} from 'react-router-dom'

export default function Header() {
    const [pageState, setPageState] = useState('로그인')
    const location = useLocation();
    const navigate = useNavigate();
    const auth = getAuth();
    useEffect(()=>{
      onAuthStateChanged(auth, (user)=>{ // 유저의 상태가 변경 될 때 실행할 함수
        if(user){ // user가 인증(로그인)이 되어있으면
          setPageState('프로필')
        }else{
          setPageState('로그인')
        }
      })
    },[auth])
    
    // location.pathname을 통해 현재 페이지를 받아와서 pathMatchRoute(route)와 비교 후 true,false를 반환하는 함수
    function pathMatchRoute(route){
      if (route === location.pathname) {
        return true;
      }
      return false;        
    }
  return (
    <div className='bg-white border-b shadow-sm sticky top-0 z-40'>
      <header className='flex justify-between items-center px-3 max-w-6xl mx-auto'>
        <div>
            <img src={`${process.env.PUBLIC_URL}/logo.png`} 
            alt="logo" 
            className='h-10 cursor-pointer py-1'
            onClick={()=>navigate('/')}/>
        </div>
        <div>
            <ul className='flex space-x-10'>
                <li 
                className={`cursor-pointer py-4 text-sm font-semibold text-gray-400 
                border-b-[3px] border-b-transparent 
                ${
                  pathMatchRoute('/') && '!text-black !border-b-red-500'
                }`}
                onClick={()=>navigate('/')}>홈</li>

                <li className={`cursor-pointer py-4 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent
                ${pathMatchRoute('/offers') && '!text-black !border-b-red-500'}`}
                onClick={()=>navigate('/offers')}>특가</li>

                <li className={`cursor-pointer py-4 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent
                ${pathMatchRoute('/category/rent') && '!text-black !border-b-red-500'}`}
                onClick={()=>navigate('/category/rent')}>임대</li>

                <li className={`cursor-pointer py-4 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent
                ${pathMatchRoute('/category/sale') && '!text-black !border-b-red-500'}`}
                onClick={()=>navigate('/category/sale')}>매매</li>

                <li className={`cursor-pointer py-4 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent
                ${(pathMatchRoute('/sign-in') || pathMatchRoute('/profile')) && '!text-black !border-b-red-500'}`}
                // sign-in페이지에 있거나 profile페이지에 있을 때,
                onClick={()=>navigate('/profile')}>{pageState}</li> 
                {/* React 컴포넌트의 상태(State)가 변경되면 컴포넌트는 다시 렌더링된다. 
                이때, 상태를 변경하는 코드가 렌더링되는 부분에 포함되어 있다면, 
                상태 변경이 발생할 때마다 새로운 렌더링이 계속해서 시작되어 무한한 렌더링 루프가 발생할 수 있다.  */}
            </ul>
        </div>
      </header>
    </div>
  )
}
