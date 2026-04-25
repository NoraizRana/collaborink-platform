// import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  const { token } = useAuthStore()
  
  return token ? children : <Navigate to="/auth" />
}