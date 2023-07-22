import './App.css'
import { AuthProvider } from 'react-auth-kit'
import Dashboard from './Dashboard'

function App() {

  return (
    <AuthProvider authType = {'cookie'}
      authName={'_auth'}
      cookieDomain={window.location.hostname}
      cookieSecure={window.location.protocol === "https:"}>

      <Dashboard />

    </AuthProvider>
  )
}

export default App
