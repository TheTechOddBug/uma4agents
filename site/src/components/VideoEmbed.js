import React, { useState } from "react";

/**
 * A video, loaded only if someone asks for it.
 *
 * Until it is clicked this is a local poster image and a button — no request
 * leaves the origin. That matters here for a specific reason: the rest of the
 * site fetches nothing third-party, and dropping an iframe into the page would
 * quietly retire that property on the busiest page in the documentation.
 *
 * The player, once summoned, is youtube-nocookie.com, which does not set
 * tracking cookies until playback starts.
 */
const VideoEmbed = ({ id, title = "Demo video", poster }) => {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="video-embed video-embed--playing">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="video-embed">
      <button
        type="button"
        className="video-embed__play"
        onClick={() => setPlaying(true)}
        aria-label={`Play: ${title}`}
      >
        {poster && <img src={poster} alt="" loading="lazy" />}
        <span className="video-embed__badge" aria-hidden="true">
          ▶ Play
        </span>
      </button>
    </div>
  );
};

export default VideoEmbed;
