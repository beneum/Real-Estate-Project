import React from 'react'
import {SiBloglovin} from 'react-icons/si'
import {RxGithubLogo} from 'react-icons/rx'

export default function Footer() {
  return (
    <>
      <div className="flex flex-col items-center justify-center bg-slate-50 h-32 w-full text-center text-l text-azure font-sans mt-24">
        <div className="archive flex">
            <a href="https://blog.naver.com/beneum11" target="_blank">
                <button className="w-12 h-12 text-2xl rounded-lg flex items-center justify-center cursor-pointer">
                    <SiBloglovin />
                </button>
            </a>
            <a href="https://github.com/beneum/Realestate-Project" target="_blank">
                <button className="w-12 h-12 text-2xl rounded-lg flex items-center justify-center cursor-pointer">
                    <RxGithubLogo />
                </button>
            </a>
        </div>
        <div className="copyright">Copyright © 2023 Taeheon Eum</div>
      </div>

    </>
  )
}
