import React, { useCallback, useEffect, useState } from 'react';

export const usePrevNextButtons = (emblaApi) => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  };
};

export const PrevButton = (props) => {
  const { children, className = '', ...restProps } = props;

  return (
    <button
      className={`embla__button embla__button--prev ${className}`}
      type="button"
      {...restProps}
    >
      <svg className="embla__button__svg" viewBox="0 0 24 24">
        <path fill="currentColor" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
      </svg>
      {children}
    </button>
  );
};

export const NextButton = (props) => {
  const { children, className = '', ...restProps } = props;

  return (
    <button
      className={`embla__button embla__button--next ${className}`}
      type="button"
      {...restProps}
    >
      <svg className="embla__button__svg" viewBox="0 0 24 24">
        <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
      </svg>
      {children}
    </button>
  );
};
