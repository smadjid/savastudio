import React, { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';

const LearnerActions = (props)=> {
    const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef();

  const handleClick = (event) => {
    setShow(!show);
    setTarget(event.target);
  };

  return (
    <div ref={ref}>
      {/* <Button onClick={handleClick}>Holy guacamole!</Button> */}

      <Overlay
        show={show}
        target={target}
        placement="bottom"
        container={ref}
        containerPadding={20}
      >
        <Popover id="popover-contained">
          <Popover.Header as="h3">Control your progress</Popover.Header>
          <Popover.Body>
          <div className="btn-group-vertical w-100">
            <button type="button" className="btn btn-success ">Finish</button>
            <br/>
            <button type="button" className="btn btn-danger">Abort</button>
          </div>
          </Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
}


export default LearnerActions;