import { useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { loginLearner } from "../services/LearnerService";
import "./Auth.css";
import LearnerRegistration from "./studentComponents/LearnerRegistration";
const Auth = (props) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const toggleShowRegistrationForm = () => setShowRegistrationForm((p) => !p);
  const [connexionError, setConnexionError] = useState("Error unknown");
  const [connexionStatus, setConnexionStatus] = useState(-1);

  const { register, handleSubmit } = useForm();
  const onSubmit = (data, e) => {
    if (data.email) return;

    setConnexionStatus(0);

    loginLearner(data)
      .then((response) => {
        setConnexionError(response.msg);
        if (response.userSession) {
          setConnexionStatus(1);
          setTimeout(() => {
            window.location.reload(false);
          }, "1000");
        }
      })
      .catch((error) => {
        //setError("apiError", { message: error });
        console.log(error);
      });
  };

  return (
    <Row>
      <Col xs={12} sm={8} md={6} className="form">
        <h3>Login</h3>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                {...register("username")}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                {...register("password")}
              />
            </Form.Group>
            {/* {currentView === "Teacher" && (
            
              <Button variant="success" type="submit"> Log In</Button>
            
          )} */}

            <>
              {" "}
              <Button variant="success" type="submit">
                Log In
              </Button>{" "}
              {/* <Link to="/">
                <Button variant="danger">Log In anyway</Button>
              </Link>{" "} */}
              <Button
                variant="primary"
                className=""
                onClick={toggleShowRegistrationForm}
              >
                Register
              </Button>
              <LearnerRegistration
                show={showRegistrationForm}
                toggleShow={toggleShowRegistrationForm}
              />
            </>

            <hr />
            {connexionStatus === 1 && (
              <Alert key={"success"} variant={"success"}>
                {" "}
                You're now logged in !{" "}
              </Alert>
            )}
            {connexionStatus === 0 && (
              <Alert key={"danger"} variant={"danger"}>
                {" "}
                Connexion error : {connexionError}{" "}
              </Alert>
            )}
            {connexionStatus === -1 && (
              <Alert key={"dark"} variant={"dark"}>
                {" "}
                Please provide <b>your credentials</b> to login, or register a
                new account.{" "}
              </Alert>
            )}
          </Form>
      </Col>
    </Row>
  );
};
export default Auth;
