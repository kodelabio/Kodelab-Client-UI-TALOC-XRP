import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation, useLoaderData } from 'react-router-dom'
import { useSessionStorage } from 'usehooks-ts'


const useUserMangement = () => {
  const [user, setUser] = useSessionStorage("selectedUser",null)
  const router = useNavigate()


  const logout = () =>{
    sessionStorage.clear();
    setUser(null);
  }
  const login = (user:any) =>{
    // sessionStorage.setItem('selectedUser', JSON.stringify(user))

    setUser(user);
  }
  
  const checkLogin = () =>{
    let userLocal = sessionStorage.getItem('selectedUser')
     if(userLocal){
      setUser(JSON.parse(userLocal))
    }else{
      //  home
      // router('/users')
    }
  }

  const isObjectEmpty = (objectName:any) => {
    return Object.keys(objectName).length === 0
  }


  return {
    login:login,
    logout: logout,
    checkLogin:checkLogin,
    user:user,

  }
}

export default useUserMangement
