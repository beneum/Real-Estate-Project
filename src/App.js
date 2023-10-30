import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Offers from "./pages/Offers";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from "./components/PrivateRoute";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Listing from "./pages/Listing";
import Category from "./pages/Category";
import Footer from "./components/Footer";




function App() {
  return (
   <>
    <BrowserRouter>
      <div className="flex flex-col h-screen">
        <div className="flex-1">
          <Header></Header>        
            <Routes>
              <Route path='/' element={<Home></Home>}></Route>
              <Route path='/profile' element = {<PrivateRoute></PrivateRoute>}>
                <Route path='/profile' element= {<Profile></Profile>}></Route>          
              </Route>
              <Route path='/sign-in' element={<SignIn></SignIn>}></Route>
              <Route path='/sign-up' element={<SignUp></SignUp>}></Route>
              <Route path='/forgot-password' element={<ForgotPassword></ForgotPassword>}></Route>
              <Route path='/offers' element={<Offers></Offers>}></Route>
              <Route path='/create-listing' element={<PrivateRoute></PrivateRoute>}>
                <Route path='/create-listing' element={<CreateListing></CreateListing>}></Route>
              </Route>
              <Route path='/edit-listing' element={<PrivateRoute></PrivateRoute>}>
                <Route path='/edit-listing/:listingId' element={<EditListing></EditListing>}></Route>
              </Route>
              <Route path='/category/:categoryName/:listingId' element={<Listing></Listing>}></Route> 
              {/* CreateListing.jsx 177번째 줄 참고 */}
              <Route path='/category/:categoryName' element={<Category></Category>}></Route>        
            </Routes>
        </div>       
        <Footer></Footer>
      </div>      
    </BrowserRouter> 
    <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        />

   </>
  );
}  

export default App;
