import { useContext, useState } from 'react'
import { Routes, Route } from 'react-router-dom'


import { UserContext } from './App'
import WelcomeScreen from './components/WelcomeScreen'
import StudentBoard from './components/studentComponents/StudentBoard'
import TeacherBoard from './components/teacherComponents/TeacherBoard'
import TeacherHome from './components/teacherComponents/TeacherHome'
import SessionConfigurator from './components/teacherComponents/SessionConfigurator'


function RoutesComp() {

const [currentView, setCurrentView] = useState("welcome");
const changeCurrentView = (view) => {
    setCurrentView(view);
  };
  const userContext = useContext(UserContext)
  return (
    <div className="container-fluid p-4">
      <Routes>
        {userContext.username && (<>
          <Route path='/welcome' element={<>Welcome {userContext.username}-{userContext.teacher}</>} />
          {userContext.profile==='learner' && <Route path="/" element={<StudentBoard  username={userContext.username} />} />}
          {userContext.profile === 'teacher' && <Route path="/" element={<TeacherHome username={userContext.username}  />} />}
          {userContext.profile !== 'teacher' && userContext.profile !== 'learner' && <Route path="/" element={<h2 className='danger'>This account requires an activation action by the system administrator</h2>} />}
          {/* {userContext.profile === 'teacher' && <Route path="/config" element={<SessionConfigurator />} />}
          {userContext.profile === 'teacher' && <Route path="/board" element={<TeacherBoard />} />} */}
          </>
        )}
        {!userContext.email && (
          <>          
          
            <Route
              path="/"
              element={<WelcomeScreen setView={changeCurrentView} />}
            />
            {/* <Route path="/learner" element={<StudentBoard />} />
            <Route path="/teacher" element={<TeacherBoard />} /> */}
          
        
          </>
        )}
      </Routes>
    </div>
  )
}

export default RoutesComp