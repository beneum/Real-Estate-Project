import React, { useEffect, useState } from 'react'
import {AiFillEyeInvisible, AiFillEye} from 'react-icons/ai'
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { toast } from 'react-toastify';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email:'',
    password:'',
  });
  const {email, password} = formData; // 구조분해할당으로 formData에서 email과 password만 빼온다
  const navigate = useNavigate();
  // 디바운싱 처리
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // console.log('Debounced value:', formData);
      
    }, 2000);

    return () => clearTimeout(debounceTimer); // cleanup 함수를 이용하여 이전 타이머를 제거한다
  }, [formData]);
  // 디바운싱 처리
  
  function onChange(e){ // 다시 한번
    setFormData((prev)=>({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }
  async function onSubmit(e){
    e.preventDefault()
    try {
      const auth = getAuth()
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      if(userCredential.user){
        navigate('/')
      }
    } catch (error) {
      toast.error('이메일 또는 비밀번호가 옳바르지 않습니다')
    }
  }

  return (
    <section>
      <h1 className='text-3xl text-center mt-6 font-bold'>로그인</h1>
      <div className='flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto'>
        <div className='md:w-[67%] lg:w-[50%] md:mb-6 mb-12 '>
          <img className='w-full rounded-2xl' 
          src="https://images.unsplash.com/flagged/photo-1561023367-50a6e054d890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80" 
          alt="key" />
        </div>
        <div className='w-full md:w-[67%] lg:w-[40%] lg:ml-20'>
          <form onSubmit={onSubmit}>
            <input className='w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out mb-6' 
            type="email" id='email' value={email} onChange={onChange} placeholder='이메일 주소'/>
            <div className='relative mb-6'>
              <input className='w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' 
              type={showPassword ? 'text':'password'} id='password' value={password} onChange={onChange} placeholder='비밀번호'
              />
              {showPassword ? ( 
              <AiFillEyeInvisible onClick={()=>{ setShowPassword(false)}}
              className='absolute right-3 top-3 text-xl cursor-pointer'/>):(
              <AiFillEye onClick={()=>{ setShowPassword(true)}}
              className='absolute right-3 top-3 text-xl cursor-pointer'/> )}  
            </div>
            <div className='flex justify-between whitespace-nowrap text-sm sm:text-lg'>
              <p className='mb-6'>계정이 없으신가요?
              <Link 
              className='text-red-600 hover:text-red-700 duration-200 ease-in-out ml-1' to='/sign-up'>회원가입</Link></p>
              <p><Link
               className='text-blue-600 hover:text-blue-800 duration-200 ease-in-out' to='/forgot-password'>비밀번호 찾기</Link></p>
            </div>
            <button className='
              w-full bg-blue-600 text-white 
              px-7 py-3 text-sm 
              font-medium uppercase rounded 
              shadow-md hover:bg-blue-700
              transition duration-150 ease-in-out
              hover:shadow-lg active:bg-blue-800' type='submit'>로그인
            </button>
            <div className='
            flex items-center my-4 
            before:border-t before:flex-1 before:border-gray-300
            after:border-t after:flex-1 after:border-gray-300
            '>
              <p className='text-center font-semibold mx-4'>OR</p>
            </div>
            <OAuth></OAuth>
          </form>
          
        </div>
      </div>
    </section>
  )
}
