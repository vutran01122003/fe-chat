import axios from "axios";
import React, {useEffect, useState } from "react";

export const UserContext = React.createContext({});

export function UserContextProvider({ children }) {
    const [usernameLogged, setUsernameLogged] = useState('');
    const [id, setId] = useState('');

    useEffect(() => {
        axios.get('/profile').then((response) => {
            setUsernameLogged(response.data.username);
            setId(response.data.id)
        }).catch(e => {
            // console.log(e);
        })
    }, [id])

   return (
        <UserContext.Provider value={{usernameLogged, setUsernameLogged, id, setId}}>
            {children}
        </UserContext.Provider>
    )
}