import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'

import Home from './screens/HomeScreen/Home'
import CartaScreen from './screens/CartaScreen/CartaScreen'

import axios from 'axios'
import Logo from './assets/Logo.png'
import CheckoutScreen from './screens/CheckoutScreen/CheckoutScreen'
import ReservaModal from './components/ReservaModal/ReservaModal'
import ConsultaScreen from './screens/ConsultaScreen/ConsultaScreen'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout/AdminLayout'
import DashboardScreen from './screens/Admin/DashboardScreen/DashboardScreen'
import LoginScreen from './screens/LoginScreen/LoginScreen'
import MenuAdmin from './screens/Admin/MenuAdmin/MenuAdmin'
import ReservasAdmin from './screens/Admin/ReservasAdmin/ReservasAdmin'
import PedidosAdmin from './screens/Admin/PedidosAdmin/PedidosAdmin'
import ConfigAdmin from './screens/Admin/ConfigAdmin/ConfigAdmin'


function App() {

  axios.defaults.baseURL = "http://localhost:3000"
  const [isReservaOpen, setIsReservaOpen] = useState(false);
  const openReserva = () => setIsReservaOpen(true);

  return (
    <div>
      <Routes>
        <Route path='/' element={<> <Navbar logo={Logo} onOpenReserva={openReserva} /> <Home onOpenReserva={openReserva}/> <Footer logo={Logo}/></>} />
        <Route path='/carta' element={<> <Navbar logo={Logo} onOpenReserva={openReserva} /> <CartaScreen/> <Footer logo={Logo}/></>} />
        <Route path='/checkout' element={<> <CheckoutScreen /> </>} />
        <Route path='/consulta' element={<> <Navbar logo={Logo} onOpenReserva={openReserva}/> <ConsultaScreen/> <Footer logo={Logo}/></>} />
        <Route path='/admin/login' element={<LoginScreen />} />
        <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
                <Route path='/admin/dashboard' element={<DashboardScreen />} />
                <Route path='/admin/pedidos' element={<PedidosAdmin/>} />
                <Route path='/admin/reservas' element={<ReservasAdmin />} />
                <Route path='/admin/menu' element={<MenuAdmin />} />
                <Route path='/admin/config' element={<ConfigAdmin/>} />
            </Route>
        </Route>
      </Routes>

      <ReservaModal isOpen={isReservaOpen} onClose={() => setIsReservaOpen(false)} />
    </div>
  )
}

export default App
