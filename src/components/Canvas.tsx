import React from "react";
import PropTypes from "prop-types";
import {  useState } from 'react'

const Canvas = ({ draw, height, width, mortgageSumm ,creditSumm, borrowedSumm }) => {
  const canvas = React.useRef();
  React.useEffect(() => {
    const context = canvas.current.getContext("2d");
    draw(context);
  },[]);

  return <canvas ref={canvas} height={height} width={width} />;
};

Canvas.propTypes = {
  draw: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired
};

export default Canvas;
