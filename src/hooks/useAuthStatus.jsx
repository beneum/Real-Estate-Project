import { getAuth, onAuthStateChanged } from 'firebase/auth'
import React, { useEffect, useState } from 'react'

export function useAuthStatus() {
    const [loggedIn, setLoggedIn]= useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    // onAuthStateChanged 함수는 Firebase Authentication에서 제공하는 기능 중 하나로, 
    // 사용자의 인증 상태 변경을 감지하고 처리할 수 있는 함수이다. 
    // 이 함수를 사용하면 사용자가 로그인하거나 로그아웃할 때마다, 
    // 웹 애플리케이션에서 이에 대한 동작을 수행할 수 있다.
    useEffect(()=>{
        const auth = getAuth();
        onAuthStateChanged(auth, (user)=>{
            if(user){ // 사용자가 로그인 상태이면
                setLoggedIn(true);
            }
            setCheckingStatus(false); // 로그인이 완료되면 로딩상태를 false로 변경
        })
    },[]) // 화면이 처음 로드 되거나 새로고침시 checkingStatus는 잠깐의 로딩 후 바로 false가 된다

  return {loggedIn, checkingStatus};
}
