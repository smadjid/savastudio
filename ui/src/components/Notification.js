import React, { useState } from 'react';
import Toast from 'react-bootstrap/Toast';

const Notification = (props) => {
  
  return (
   
        <Toast onClose={() => props.setShow(false)} show={props.show} delay={5000} className='notification' autohide>
          <Toast.Header>
            
            <strong className="me-auto">{props.title}</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body>{props.body}</Toast.Body>
        </Toast>
   
  );
}

export default Notification;