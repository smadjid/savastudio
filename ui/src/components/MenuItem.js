import React from 'react';

import './MenuItem.css';

const MenuItem = (props) => {
  const classes = 'menu-item ' + props.className;

  return <li className={classes}>{props.children}</li>;
};

export default MenuItem;
