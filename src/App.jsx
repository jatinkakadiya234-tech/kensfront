import DashboardLayout from './Admin/Layout/Layout'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginForm from './common/Auth/Login';
import RegisterForm from './common/Auth/Register';
import Landing from './common/Auth/Landing';
import MovieComingSoon from './common/Page/MovieComingSoon';
import MovieAnalytics from './Admin/page/HomePage';
import MoviesList from './Admin/page/MoviesList';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PremiumPlans from './Admin/page/PremiumPlans';
import Orders from './Admin/page/Orders';
import Withdrawals from './Admin/page/Withdrawals';
import Trials from './Admin/page/Trials';
import HomeScreen from './user/Homescreen';
import Header from './common/Navbar/Navbar';
import TrialScreen from './common/Navbar/TrialScreen';
import SubscriptionsScreen from './user/SubscriptionsScreen';
import VideoUploadPreview from './user/VideoUploadPreview';
import Footer from './common/Navbar/Footer';
import UserScreen from './common/Auth/UserProfile';
import MovieDetailsScreen from './user/MovieDetailsScreen';
import Historys from './common/Navbar/History';
import OtpVerification from './common/Auth/OtpVerification';

import PrivateRoute from './common/Auth/PrivateRoute';
import ScrollToTop from './common/Page/ScrollToTop';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WebSeriesManagement from './Admin/page/WebSeriesManagement';


function App() {
  // Auto-logout when the user leaves/closes the site (including refresh)

  const DeshbordLayouts = ({ children }) => (
    <>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </>
  );

  const Userpage = ({children}) =>(
    <div className='bg-[#37353E] min-h-screen'>
    <Header/>
    {children}
    <TrialScreen/>
    <Footer/>
    </div>
  )
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <BrowserRouter>
        <ScrollToTop/>
        <ToastContainer position="top-center" autoClose={1500} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnHover theme="colored" />
        <Routes>
          <Route path='/admin' element={<PrivateRoute><DeshbordLayouts>
            <MovieAnalytics/>
          </DeshbordLayouts></PrivateRoute>} />
          <Route path='/login' element={<LoginForm/>}/>
          <Route path='/register' element={<RegisterForm/>}/>
          <Route path='/verify-otp' element={<OtpVerification/>}/>
          <Route path='*' element={<PrivateRoute><DeshbordLayouts>
            <MovieComingSoon/>
          </DeshbordLayouts></PrivateRoute>} /> 
          <Route path='/movies' element={<PrivateRoute><DeshbordLayouts>
            <MoviesList/>
          </DeshbordLayouts></PrivateRoute>} /> 
         
          
          <Route path="/premium" element={<PrivateRoute><DeshbordLayouts>
            <PremiumPlans/>
          </DeshbordLayouts></PrivateRoute>}/>
          <Route path="/order" element={<PrivateRoute><DeshbordLayouts>
            <Orders/>
          </DeshbordLayouts></PrivateRoute>}/>
          <Route path="/withdrawals" element={<PrivateRoute><DeshbordLayouts>
            <Withdrawals/>
          </DeshbordLayouts></PrivateRoute>}/>
          <Route path="/webseries" element={<PrivateRoute><DeshbordLayouts>
            <WebSeriesManagement/>
          </DeshbordLayouts></PrivateRoute>}/>
          <Route path='/' element={<Landing/>} />
          <Route path='/home' element={<PrivateRoute><Userpage>
            <HomeScreen/>
          </Userpage></PrivateRoute>} />
         
          <Route path='/subscription' element={<PrivateRoute><Userpage>
            <SubscriptionsScreen/>
          </Userpage></PrivateRoute>} />
          <Route path='/video-upload' element={<PrivateRoute><Userpage>
            <VideoUploadPreview/>
          </Userpage></PrivateRoute>} />
          <Route path='/userprofile' element={<PrivateRoute><Userpage>
            <UserScreen/>
          </Userpage></PrivateRoute>} />
          <Route path='/watch' element={<PrivateRoute><Userpage>
            <MovieDetailsScreen/>
          </Userpage></PrivateRoute>} />
          <Route path='/history' element={<PrivateRoute><Userpage>
            <Historys/>
          </Userpage></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </LocalizationProvider>
  )
}

export default App
