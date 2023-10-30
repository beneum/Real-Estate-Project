import React from 'react'
import { Navigate, Outlet } from 'react-router';
import {useAuthStatus} from '../hooks/useAuthStatus';
import Spinner from './Spinner';

export default function PrivateRoute() {
    const {loggedIn, checkingStatus} = useAuthStatus();

    if(checkingStatus){ 
    // checkingStatus가 true이면 loading을 표시하고 로딩이 끝나면 값이 false가 되면서
    // 다음 코드를 실행    
        // 이 부분이 없으면 loggedIn데이터(true값)를 받기도 전에 컴포넌트가 렌더링된다.
        return <Spinner></Spinner>  
    }

        return loggedIn ? <Outlet></Outlet> : <Navigate to='/sign-in'></Navigate>
        // loggedIn데이터는 비동기로 받아오는 것이기 때문에, 시간이 걸림으로 중간에 로딩 조건문이 없으면, 
        // loggedIn이 false라고 보고 sign-in 페이지로 넘어간다
        
  // Outlet: 라우트가 중첩되는 구조에서 자식 경로 컴포넌트를 렌더링할 때 사용된다 
  // 이 컴포넌트 내부에 중첩된 자식 경로 컴포넌트가 렌더링된다.
}