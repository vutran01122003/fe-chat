import { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Avatar from "./Avatar";
import { UserContext } from "./Usercontext";
import Logo from "./Logo";
import axios from "axios";

function Chat() {
    const [onlineUsers, setOnlineUsers] = useState({});
    const [offlineUsers, setOfflineUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [messageTextValue, setMessageTextValue] = useState('');
    const [socketConnected, setSocketConnected] = useState(null);
    const [messages, setMessages] = useState([]);
    const {id, usernameLogged, setUsernameLogged} = useContext(UserContext);
    const messageBoxRef = useRef();
    const messsageInputRef = useRef();
    const fileInput = useRef();

    const logoutUser = (e) => {
        e.preventDefault();
        axios.post('/logout')
            .then(() => {
                setUsernameLogged('');
            })
            .catch((e) => {
                alert('logout thất bại')
            })
    }

    const sendMessage = (e) => {
        e.preventDefault();
        if (socketConnected && messageTextValue !== '') {
            socketConnected.emit("message", {
                message: messageTextValue.trim(),
                senderId: id,
                receiverId: selectedUserId,
            });
            setMessageTextValue('');
            setMessages(prev => [...prev, {message: messageTextValue, senderId: id, receiverId: selectedUserId}]);
            setTimeout(function () {
                const divMessageBox = messageBoxRef.current;
                const bottom = divMessageBox.scrollHeight - divMessageBox.clientHeight; 
                divMessageBox.scrollTop = bottom;
            }, 100);
        }   
    }

    const sendFile = (e) => {
        socketConnected.emit("file", {
            senderId: id,
            receiverId: selectedUserId,
            file: {
                name: e.target.files[0].name,
                data: e.target.files[0]
            }
        });
    }
    
    useEffect(() => {
       const socket = io(import.meta.env.VITE_API_BASE_URL, {
            withCredentials: true
        });

        setSocketConnected(socket);

        socket.on('user_online', (data) => {
            delete data[id];
            setOnlineUsers(data);
        });

        socket.on("message_user", (data) => {
            setMessages(prev => [...prev, {message: data.message, senderId: data.senderId, receiverId: data.receiverId}]);
        });

        socket.on("file_user", (data) => {
            console.log('send file:::', data);
            setMessages(prev => [...prev, {fileName: data.fileName, senderId: data.senderId, receiverId: data.receiverId}]);
            setTimeout(function () {
                const divMessageBox = messageBoxRef.current;
                const bottom = divMessageBox.scrollHeight - divMessageBox.clientHeight; 
                divMessageBox.scrollTop = bottom;
            }, 100);
        });

        return () => {
            socket.disconnect();
        };
    }, [id]);

    useEffect(() => {
        if(selectedUserId !== null) {
            axios.post(`/message/${selectedUserId}`)
            .then(response => {
                setMessages(response.data)
            })
            .catch(e => {
                console.log(e);
            })
            setTimeout(function () {
                const divMessageBox = messageBoxRef.current;
                const bottom = divMessageBox.scrollHeight - divMessageBox.clientHeight; // Tính chiều cao phần tử cần cuộn tới
                divMessageBox.scrollTop = bottom;
            }, 100);
        }      
    }, [selectedUserId])

    useEffect(() => {
        axios.get('/user')
            .then((response) => {
                let userArr = 
                response.data.filter((user) => {
                    return user._id !== id && !Object.keys(onlineUsers).includes(user._id)
                })
                
                setOfflineUsers(userArr);
            })
    }, [onlineUsers]);

    return ( 
    <div className="flex h-screen">
        <div className="bg-blue-300 w-1/3 border-r-2 border-gray-400 flex flex-col justify-between">
            <div className="text-blue-600 flex gap-1 font-bold p-5 items-center">
                <Logo />
                Messenger
            </div>
            <div className="flex-1 overflow-y-scroll ">
                {Object.keys(onlineUsers).map((userId) => (
                    <div key={userId} className="flex">
                        {
                            userId === selectedUserId &&
                            <div className="h-12 w-1 bg-blue-500 rounded-r-md"></div>
                        }
                        <div
                            key={userId} 
                            onClick={(e) => {setSelectedUserId(userId)}} 
                            className={"flex gap-2 items-center border-b border-gray-400 p-2 font-bold cursor-pointer grow " + (userId === selectedUserId ? 'bg-blue-200' : '')}
                        >
                            <Avatar username={onlineUsers[userId].username} userId={onlineUsers[userId].userId} online={true}/> 
                            <span> {onlineUsers[userId].username} </span>
                        </div>
                    </div>
                ))}

                {offlineUsers.map((user) => (   
                    <div key={user._id} className="flex">
                    {
                        user._id === selectedUserId &&
                        <div className="h-12 w-1 bg-blue-500 rounded-r-md"></div>
                    }
                        <div
                            key={user._id} 
                            onClick={(e) => {setSelectedUserId(user._id)}} 
                            className={"flex gap-2 items-center border-b border-gray-400 p-2 font-bold cursor-pointer grow " + (user._id === selectedUserId ? 'bg-blue-200' : '')}
                        >
                            <Avatar username={user.username} userId={user._id} online={false}/> 
                           <span> {user.username} </span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-2 flex gap-2 items-center">   
                <span className="font-bold text-[#1154E4] flex items-center basis-10 "> 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 inline-block">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                    {usernameLogged}
                </span>
                <span onClick={logoutUser} className="hover:text-black text-gray-200 font-bold cursor-pointer p-1 bg-blue-500 text-sm rounded">
                    Logout
                </span>  
            </div>
        </div>
        <div className="bg-blue-50 w-2/3 flex flex-col">
            <div ref={messageBoxRef} className="flex-grow flex flex-col overflow-y-scroll">
                {!selectedUserId && <span className="font-medium flex items-center justify-center h-full w-full"> No selected person </span>}
                {!!selectedUserId && (
                    messages.map((item, index) => 
                    <div key={index} className="p-2 mb-2">
                        <div className={'p-2 w-1/2 break-words rounded ' + (item.senderId === id ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-300')}>
                            {item.message}
                            {item.fileName && (
                                <a target="_blank" href={import.meta.env.VITE_API_BASE_URL + `/public/uploads/${item.fileName}`} className="underline">{item.fileName}</a>
                            )}
                        </div>
                    </div>) 
                )}
            </div>
           {!!selectedUserId && (
                <div className="form-chat flex">
                    <input 
                        type="text" 
                        ref={messsageInputRef}
                        className="p-2 h-10 border-t-2 border-r-2 border-gray-400 flex-grow outline-0" 
                        placeholder="Type your message here"
                        value={messageTextValue}
                        onChange={(e) => {
                            setMessageTextValue(e.target.value);
                        }}
                    />
                    <label className="bg-blue-300 text-gray-700 p-2 flex justify-center w-10 border-t-2 border-r-2 border-gray-400 hover:text-black"  htmlFor="input-id">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                        </svg>
                    </label>
                    <input 
                        type="file" 
                        name="input-name" 
                        id="input-id" 
                        className="hidden" 
                        onChange={sendFile} 
                        ref={fileInput}
                    />
                    <button 
                        className="bg-blue-500 text-white p-2 flex justify-center w-20 border-t-2 border-gray-400 hover:text-black" 
                        onClick={sendMessage}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
           )}
        </div>
    </div> 
    );
}

export default Chat;