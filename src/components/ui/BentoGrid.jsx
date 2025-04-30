import React from 'react';

const BentoGrid = () => {
  const gridItems = [
    {
      id: 1,
      type: 'image',
      src: '/cipsa-maxi10.jpg',
      alt: 'Imagen principal',
      colSpan: 'col-span-1 md:col-span-2',
      rowSpan: 'row-span-1 md:row-span-1'
    },
    {
      id: 2,
      type: 'image',
      src: '/muelle.jpg',
      alt: 'Detalle 1',
      colSpan: 'col-span-1 md:col-span-1',
      rowSpan: 'row-span-1 md:row-span-1'
    },
    {
      id: 3,
      type: 'image',
      src: '/bosch_start.jpg',
      alt: 'Detalle 2',
      colSpan: 'col-span-1 md:col-span-1',
      rowSpan: 'row-span-1 md:row-span-2'
    },
    {
      id: 4,
      type: 'video',
      src: '/bailarina.mp4',
      alt: 'Demo video',
      colSpan: 'col-span-1 md:col-span-2',
      rowSpan: 'row-span-1 md:row-span-2'
    },
    {
      id: 5,
      type: 'image',
      src: '/gsh27_estante.jpg',
      alt: 'Imagen vertical',
      colSpan: 'col-span-1 md:col-span-1',
      rowSpan: 'row-span-1 md:row-span-2'
    },
    {
      id: 6,
      type: 'image',
      src: '/cortadora.jpg',
      alt: 'Imagen vertical2',
      colSpan: 'col-span-1 md:col-span-1',
      rowSpan: 'row-span-1 md:row-span-1'
    }
  ];

  const renderGridItem = (item) => {
    const classes = [
      'rounded-xl', 
      'overflow-hidden', 
      'shadow-lg', 
      'hover:shadow-xl', 
      'transition-shadow',
      item.colSpan, 
      item.rowSpan
    ].join(' ');

    return (
      <div key={item.id} className={classes}>
        {item.type === 'image' ? (
          <img
            src={item.src}
            alt={item.alt}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        ) : (
          <video controls className="w-full h-full object-cover cursor-pointer">
            <source src={item.src} type="video/mp4" />
            Tu navegador no soporta video.
          </video>
        )}
      </div>
    );
  };

  return (
    <div className="
      grid
        grid-cols-1        /* 1 col en móvil */
        sm:grid-cols-2     /* 2 cols en tablet */
        md:grid-cols-4     /* 4 cols en escritorio */
      md:grid-rows-3       /* 3 filas en escritorio */
      auto-rows-auto       /* filas según contenido en móvil/tablet */
      gap-4 sm:gap-6 md:gap-8
      p-4 sm:p-6 md:p-8
      h-auto               /* altura flexible en móvil/tablet */
      md:h-[90vh]          /* 70vh en escritorio */
      w-full max-w-6xl mx-auto my-16
    ">
      {gridItems.map(renderGridItem)}
    </div>
  );
};

export default BentoGrid;
