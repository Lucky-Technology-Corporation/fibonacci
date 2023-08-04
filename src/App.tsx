import './App.css'
import { AuthProvider } from 'react-auth-kit'
import Dashboard from './Dashboard'
import { GlobalContextProvider } from './Utilities/GlobalContext'


function App() {

  return (
    <AuthProvider authType = {'cookie'}
      authName={'_auth'}
      cookieDomain={window.location.hostname}
      cookieSecure={window.location.protocol === "https:"}>

      <GlobalContextProvider>
        <Dashboard />
      </GlobalContextProvider>

    </AuthProvider>
  )
}

export default App
