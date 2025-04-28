import React from 'react';

const TikTokEmbed = ({
  videoUrl,
  aspectRatio = '177%' // 9:16 en padding-bottom
}) => {
  const videoId = videoUrl.split('/video/')[1];

  const src = `https://www.tiktok.com/player/v1/${videoId}`
    + `?autoplay=1`
    + `&loop=1`
    + `&controls=1`
    + `&progress_bar=0`
    + `&play_button=0`
    + `&fullscreen_button=0`
    + `&volume_control=1`;

  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
      <div style={{ paddingBottom: aspectRatio }} />
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={src}
        allow="autoplay; fullscreen; encrypted-media"
        frameBorder="0"
        allowFullScreen
        title={`TikTok ${videoId}`}
      />
    </div>
  );
};

export default TikTokEmbed;
