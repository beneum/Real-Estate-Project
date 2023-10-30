import React, { useState } from 'react'
import {AiFillEyeInvisible, AiFillEye} from 'react-icons/ai'
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import {getAuth, createUserWithEmailAndPassword, updateProfile} from 'firebase/auth'
import { db } from '../firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name:'',
    email:'',
    password:'',
  });
  const navigate = useNavigate();
  const {name, email, password} = formData; // 구조분해할당으로 formData에서 email과 password만 빼온다
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password) 
      // createUserWith~는 promise를 리턴하기 때문에 await를 붙여줘야 한다
      updateProfile(auth.currentUser, { // updateProfile메서드로 displayName에 formData에 있는 name을 추가한다
        displayName: name
      })
      const user = userCredential.user
      const formDataCopy = {...formData}
      delete formDataCopy.password // formDataCopy에서 password 삭제
      formDataCopy.timestamp = serverTimestamp(); // formDataCopy에서 timestamp 추가

      // formDataCopy에서 password를 제거하고, timestamp를 추가한 후 firebase의 데이터베이스에 저장한다.
      await setDoc(doc(db, 'users', user.uid), formDataCopy) // 'users'는 firebase데이터베이스 collection의 이름이다
      navigate('/')
    } catch (error) {
      toast.error('형식에 맞게 작성하지 않았습니다.')
    }
  }

  return (
    <section>
      <h1 className='text-3xl text-center mt-6 font-bold'>회원가입</h1>
      <div className='flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto'>
        <div className='md:w-[67%] lg:w-[50%] md:mb-6 mb-12 '>
          <img className='w-full rounded-2xl' 
          src="https://images.unsplash.com/flagged/photo-1561023367-50a6e054d890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80" 
          alt="key" />
        </div>
        <div className='w-full md:w-[67%] lg:w-[40%] lg:ml-20'>
          <form onSubmit={onSubmit}>
            <input className='w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out mb-6' 
              type="text" id='name' value={name} onChange={onChange} placeholder='아이디'/>
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
                <p className='mb-6'>계정을 이미 가지고 계신가요?
                <Link 
                className='text-red-600 hover:text-red-700 duration-200 ease-in-out ml-1' to='/sign-in'>로그인</Link></p>
                <p><Link
                className='text-blue-600 hover:text-blue-800 duration-200 ease-in-out' to='/forgot-password'>비밀번호 찾기</Link></p>
              </div>
              <button className='
                w-full bg-blue-600 text-white 
                px-7 py-3 text-sm 
                font-medium uppercase rounded 
                shadow-md hover:bg-blue-700
                transition duration-150 ease-in-out
                hover:shadow-lg active:bg-blue-800' type='submit'>회원가입
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
