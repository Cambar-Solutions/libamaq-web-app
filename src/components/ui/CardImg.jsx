import React from 'react';

const CardImg = ({ img, altText = "Imagen" }) => {
  return (
    <div className="w-full h-50 overflow-hidden rounded-lg">
      <img src={img} alt={altText} className="w-full h-full object-contain" />
    </div>
  );
};


export default CardImg;
