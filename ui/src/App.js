import "./App.css";
import Routes from "./Routes";
import { useState, useEffect, createContext } from "react";
import MenuBar from "./components/MenuBar";

export const UserContext = createContext({});
export const MenuContext = createContext({});
function App() {
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState(true);
  const [menuContext, setMenuContext] = useState({course:null, order: null, session: null});

  useEffect(() => {
    // console.log('fetchUserAuth')
    const fetchUserAuth = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/isAuth");
        if (!res.ok) return setLoading(false);

        setUserSession(await res.json());
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("There was an error fetch auth", error);
        return;
      }
    };
    fetchUserAuth();
  }, []);

  const [currentView, setCurrentView] = useState("welcome");

  const changeCurrentView = (view) => {
    setCurrentView(view);
  };
  return (
    <UserContext.Provider value={userSession}>
      <MenuContext.Provider  value={{ menuContext, setMenuContext }}>
        <div className="container-fluid ">
          <MenuBar />
          <Routes />
        </div>
      </MenuContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
