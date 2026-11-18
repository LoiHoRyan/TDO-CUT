import React from 'react';
import { NEW_YORK_MORNING_IMG, type VisualPreviewSpec } from '../utils/visualCatalog';

interface NyPreviewThumbProps {
  spec: VisualPreviewSpec;
  className?: string;
}

export const NyPreviewThumb: React.FC<NyPreviewThumbProps> = ({ spec, className = '' }) => {
  const { imgStyle, overlayStyle, splitLayout } = spec;

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#0B1220] ${className}`}>
      {splitLayout === '2x2' ? (
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-[1px] bg-black/70">
          {[0, 1, 2, 3].map((idx) => (
            <img
              key={idx}
              src={NEW_YORK_MORNING_IMG}
              alt="NY preview"
              draggable={false}
              style={imgStyle}
              className="w-full h-full object-cover select-none"
            />
          ))}
        </div>
      ) : splitLayout === '1x2' ? (
        <div className="grid grid-cols-2 w-full h-full gap-[1.5px] bg-white/80">
          <img
            src={NEW_YORK_MORNING_IMG}
            alt="NY preview left"
            draggable={false}
            style={imgStyle}
            className="w-full h-full object-cover select-none"
          />
          <img
            src={NEW_YORK_MORNING_IMG}
            alt="NY preview right"
            draggable={false}
            style={{ ...imgStyle, filter: `${imgStyle.filter || ''} brightness(0.82) contrast(1.15)`.trim() }}
            className="w-full h-full object-cover select-none"
          />
        </div>
      ) : (
        <img
          src={NEW_YORK_MORNING_IMG}
          alt="NY preview"
          draggable={false}
          style={imgStyle}
          className="w-full h-full object-cover select-none transition-transform duration-300"
        />
      )}

      {splitLayout === 'cinema_bars' && (
        <>
          <div className="absolute top-0 inset-x-0 h-[18%] bg-black" />
          <div className="absolute bottom-0 inset-x-0 h-[18%] bg-black" />
        </>
      )}

      {splitLayout === 'crt' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 14px 4px rgba(0,0,0,0.85)',
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0 1px, transparent 1px 3px)',
          }}
        />
      )}

      {splitLayout === 'blinds' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent 0 7px, rgba(15,23,42,0.75) 7px 10px)',
          }}
        />
      )}

      {splitLayout === 'iris' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, transparent 42%, rgba(15,23,42,0.85) 45%)',
          }}
        />
      )}

      {splitLayout === 'diagonal' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 48%, rgba(255,255,255,0.75) 50%, transparent 52%)',
          }}
        />
      )}

      {splitLayout === 'wipe' && (
        <div className="absolute inset-y-0 right-0 w-[22%] bg-[#0F172A]/85 border-l-2 border-[#00CAE0]" />
      )}

      {overlayStyle && (
        <div className="absolute inset-0 pointer-events-none" style={overlayStyle} />
      )}
    </div>
  );
};
