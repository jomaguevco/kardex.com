'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function AuthDebug() {
  const { user, isAuthenticated, isLoading, token } = useAuthStore()
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      setLocalStorageData({ token: token ? 'present' : 'null', user: user ? 'present' : 'null' })
    }
  }, [user, isAuthenticated])
  
  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">DEBUG INFO:</div>
      <div>isAuthenticated: {isAuthenticated ? '✅ true' : '❌ false'}</div>
      <div>isLoading: {isLoading ? '⏳ true' : '✅ false'}</div>
      <div>user: {user ? `✅ ${user.nombre_completo}` : '❌ null'}</div>
      <div>token: {token ? '✅ present' : '❌ null'}</div>
      <div className="mt-2 border-t pt-2">
        <div className="font-bold">localStorage:</div>
        <div>token: {localStorageData?.token || 'loading...'}</div>
        <div>user: {localStorageData?.user || 'loading...'}</div>
      </div>
    </div>
  )
}

