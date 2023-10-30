import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { toast } from 'react-toastify';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  function onChange(e){ 
    setEmail(e.target.value)
  }

  async function onSubmit(e){
    e.preventDefault()
    try {
      const auth = getAuth()
      await sendPasswordResetEmail(auth, email)
      setEmail('')
      toast.success('이메일이 전송되었습니다.')
    } catch (error) {
      toast.error('이메일 형식에 맞게 작성해 주세요.')
    }
  }

  return (
    <section>
      <h1 className='text-3xl text-center mt-6 font-bold'>비밀번호 찾기</h1>
      <div className='flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto'>
        <div className='md:w-[67%] lg:w-[50%] md:mb-6 mb-12 '>
          <img className='w-full rounded-2xl' 
          src="https://images.unsplash.com/flagged/photo-1561023367-50a6e054d890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80" 
          alt="key" />
        </div>
        <div className='w-full md:w-[67%] lg:w-[40%] lg:ml-20'>
          <form onSubmit={onSubmit}>
            <input className='w-full px-4 py-2 text-xl text-gray-700 bg-whit border-gray-300 rounded transition ease-in-out mb-6' 
            type="email" id='email' value={email} onChange={onChange} placeholder='이메일 주소'/>
        
            <div className='flex justify-between whitespace-nowrap text-sm sm:text-lg'>
              <p className='mb-6'>계정이 없으신가요?
              <Link 
              className='text-red-600 hover:text-red-700 duration-200 ease-in-out ml-1' to='/sign-up'>회원가입</Link></p>
              <p><Link
               className='text-blue-600 hover:text-blue-800 duration-200 ease-in-out' to='/sign-in'>로그인</Link></p>
            </div>
            <button className='
          w-full bg-blue-600 text-white 
          px-7 py-3 text-sm 
          font-medium uppercase rounded 
          shadow-md hover:bg-blue-700
          transition duration-150 ease-in-out
          hover:shadow-lg active:bg-blue-800' type='submit'>이메일로 비밀번호 보내기
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
