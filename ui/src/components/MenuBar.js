import moment from "moment";
import { useContext } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { Link } from "react-router-dom";
import { MenuContext, UserContext } from "../App";
import { SetUserRunningCourse } from "../services/CourseService";
import { logout } from "../services/LearnerService";

const MenuBar = (props) => {
  const userContext = useContext(UserContext);
  const { menuContext, setMenuContext } = useContext(MenuContext);

  const handleLogout = () => {
    logout(userContext)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        //setError("apiError", { message: error });
        console.log(error);
      });
    window.location.reload(false);
  };

  const handleExit = () => {
    SetUserRunningCourse()
    window.location.reload(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark row">
      <div className="container-fluid">
        <Link to="/">
          <img
            id="logo"
            role="button"
            src={process.env.PUBLIC_URL + "/logo.png"}
            alt="logo"
            height={"35"}
            style={{ marginRight: "2%" }}
          />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              {userContext.profile && (
                <span className="nav-link parallelogram">
                  &nbsp;&nbsp;
                  {userContext.profile === "teacher"?
                    <span>Teacher Module</span>:
                  userContext.profile === "learner"? 
                    <span>Learner Module</span>:<span>Not active profile</span>
                  }
                  {!userContext.profile && <span>Welcome</span>}
                  &nbsp;&nbsp;
                </span>
              )}
            </li>
          </ul>
          <form class="d-flex">
            {/* <span className="info-menu me-3">
              {moment().format("DD/MM/YYYY - HH:MM")}
            </span> */}
            {menuContext.course &&<span className="info-menu me-1">
              <b>Course</b>: {menuContext.course}
            </span>}
            {menuContext.session &&<span className="info-menu me-1">
              <b>Session</b>: {menuContext.session}
            </span>}
            {!userContext.username && (
              <button className="btn btn-outline-secondary">
                Not connected
              </button>
            )}
            {userContext.username && (
              <DropdownButton
                title={userContext.username}
                variant="success"
                className="btn"
              >
                <Dropdown.Item eventKey="2" onClick={handleExit}>
                  Exit course
                </Dropdown.Item>
                <Dropdown.Item eventKey="1" onClick={handleLogout}>
                  Logout
                </Dropdown.Item>
              </DropdownButton>
            )}
          </form>
        </div>
      </div>
    </nav>

    // <>
    //     <nav>
    //         <ul className="nav__links">
    //         <img className='logo' src={process.env.PUBLIC_URL + '/logo.png'} alt="logo" width={'80px'}/>
    //             <MenuItem>Module</MenuItem>
    //             <MenuItem>Date</MenuItem>
    //             <MenuItem>Title</MenuItem>
    //         </ul>
    //     </nav>
    //     <button className="connect">Connect</button>
    // </>
  );
};

export default MenuBar;
