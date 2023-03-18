import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { createLearner } from "../../services/LearnerService";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

const LearnerRegistration = (props) => {
  const { show, toggleShow } = props;

  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState({
    username: "",
    password: "",
    email: "",
    confirmPassword: "",
  });
  const onInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateInput(e);
  };

  const validateInput = (e) => {
    let { name, value } = e.target;
    setError((prev) => {
      const stateObj = { ...prev, [name]: "" };

      switch (name) {
        case "username":
          if (!value) {
            stateObj[name] = "Please enter Username.";
          }
          break;

        case "password":
          if (!value) {
            stateObj[name] = "Please enter Password.";
          } else if (input.confirmPassword && value !== input.confirmPassword) {
            stateObj["confirmPassword"] =
              "Password and Confirm Password does not match.";
          } else {
            stateObj["confirmPassword"] = input.confirmPassword
              ? ""
              : error.confirmPassword;
          }
          break;

        case "confirmPassword":
          if (!value) {
            stateObj[name] = "Please enter Confirm Password.";
          } else if (input.password && value !== input.password) {
            stateObj[name] = "Password and Confirm Password does not match.";
          }
          break;

        default:
          break;
      }

      return stateObj;
    });
  };

  const { register, handleSubmit } = useForm();

  const handleSubmitWithoutPropagation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };

  const onSubmit = (data, e) => {
    //data.profile = data.teacheraccount? "teacher_req" : "learner";
    data.profile = data.teacheraccount? "teacher" : "learner";
    createLearner(data)
      .then((response) => {
        if (response.msg === "ok") {
          Swal.fire({
            title: "Congratulations",
            text: "You can now use your credentials to access the running courses",
            icon: "success",
            confirmButtonText: "Close",
          });
          toggleShow();
        } else
          Swal.fire({
            title: "Error",
            text: "There is an error when trying to register a new account. Please try again later",
            icon: "error",
            confirmButtonText: "Close",
          });
      })
      .catch((error) => {
        Swal.fire({
          title: "Error",
          text: "There is an error when trying to register a new account. Please try again later",
          icon: "error",
          confirmButtonText: "Close",
        });
        console.log(error);
      });
  };

  return (
    <Modal show={show} onHide={toggleShow}>
      <Modal.Header closeButton>
        <Modal.Title>Create an account</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmitWithoutPropagation}>
        <Modal.Body>
          <span className="invisible">
            <b className="text-danger" visible={false}>
              ERROR:
            </b>
          </span>
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Pick a username"
              onChange={onInputChange}
              onBlur={validateInput}
              {...register("username")}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              onChange={onInputChange}
              onBlur={validateInput}
              {...register("email")}
              required
            />

            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              onChange={onInputChange}
              onBlur={validateInput}
              {...register("password")}
              required
            ></Form.Control>
            {error.password && <span className="err">{error.password}</span>}
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Confirm password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              name="confirmPassword"
              value={input.confirmPassword}
              onChange={onInputChange}
              onBlur={validateInput}
              required
            />
            {/* {error.confirmPassword && (
              <span className="err">{error.confirmPassword}</span>
            )} */}
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check
              type="checkbox"
              label="Teacher account (requires validation by the admin)"
              onChange={onInputChange}
              onBlur={validateInput}
              {...register("teacheraccount")}
              
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" type="submit">
            Proceed
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default LearnerRegistration;
