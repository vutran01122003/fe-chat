import { useContext } from "react";
import { UserContext } from "./Usercontext";
import RegisterAndLoginForm from "./RegisterAndLoginForm";
import Chat from "./Chat";

function Routes() {
    const {usernameLogged} = useContext(UserContext);
   
    if(usernameLogged) return <Chat />;
    return (<RegisterAndLoginForm />);
}

export default Routes;