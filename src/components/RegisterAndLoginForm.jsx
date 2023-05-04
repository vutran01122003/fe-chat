import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "./Usercontext";
import { Backdrop, CircularProgress} from '@material-ui/core';
function RegisterAndLoginForm() {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('register');
    const {setId, setUsernameLogged} = useContext(UserContext);
    const [pedding, setPedding] = useState(false);
    const registerUser = (e) => {
        e.preventDefault();
        setPedding(true);
        axios.post('/register', {
            username,
            password
        }).then((response) => {
            setPedding(false);
            setUsernameLogged(response.data.result.username);
            setId(response.data.result.id)
        }).catch(e => {
            console.log(e);
            alert('Đăng ký thất bại');
        })
    }

    const loginUser = (e) => {
        e.preventDefault();
        setPedding(true);
        axios.post('/login', {
            username,
            password
        }).then((response) => {
            setPedding(false);
            setUsernameLogged(response.data.result.username);
            setId(response.data.result.id)
        }).catch(e => {
            console.log(e);
            alert('Đăng nhập thất bại');
        })
    }

    return ( 
        <div className="bg-blue-50 h-screen  w-full flex items-center">
            { pedding &&
                <Backdrop
                    sx={{ color: '#fff'}}
                    open={true}
                    style={{zIndex: 999}}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>     
            }
           <form className="w-64 mx-auto" onSubmit={(e) => {
                if(isLoginOrRegister === 'register') {
                    registerUser(e) 
                } else { 
                    loginUser(e)
                }
           }}>
                <h1 className="text-2xl font-bold text-center mb-3">{isLoginOrRegister === 'register' ? 'Register' : 'Login'}</h1>
                <input 
                    type="text" 
                    className="w-full mb-3 p-2" 
                    placeholder="username"
                    value={username}
                    onChange={(e) => {setUserName(e.target.value)}}
                />
                <input 
                    type="password" 
                    className="w-full mb-3 p-2" 
                    placeholder="password"
                    value={password}
                    onChange={(e) => {setPassword(e.target.value)}}
                />
                <button className="bg-blue-500 w-full p-2 text-white" >{isLoginOrRegister === 'register' ? 'register' : 'login'}</button>
                <div className="text-center">
                    {isLoginOrRegister === 'register' && (
                            <>
                            Already a member?{' '}
                            <button className="text-blue-500" onClick={(e) => {
                                setIsLoginOrRegister('login')
                            }}>Login here</button>
                            </>
                    )}
                    
                    {isLoginOrRegister === 'login' && (
                    <>
                        Not a member yet?{' '}
                        <button className="text-blue-500" onClick={(e) => {
                            setIsLoginOrRegister('register')
                        }}>Register here</button>
                    </>
                   )}
                </div>
                    
           </form>
        </div>
     );
}

export default RegisterAndLoginForm;