import { Range } from "react-range";

interface RangeSelect {
  value: number;
  label?: string;
  titles: string[];
  titlesShort?: string[];
  onChange: (value: number) => void;
}

export const RangeSelect = (props: RangeSelect) => {
  return (
    <Range
      label={props.label}
      values={[props.value]}
      min={0}
      max={props.titles.length - 1}
      onChange={(v) => props.onChange(v[0])}
      renderTrack={(p) => (
        <div {...p.props} className="range-track">
          <div
            className="range-track-fill"
            style={{ width: `${props.value * (100 / (props.titles.length - 1))}%` }}
          />
          {p.children}
        </div>
      )}
      renderMark={(p) => {
        const isFirst = p.index === 0;
        const isLast = p.index === props.titles.length - 1;
        const cn = `range-mark${isFirst ? " range-mark-first" : ""}${
          isLast ? " range-mark-last" : ""
        }`;
        return (
          <div {...p.props} key={p.props.key} className={cn}>
            <div className="range-mark-label">{props.titles[p.index]}</div>
            {props.titlesShort && (
              <div className="range-mark-label range-mark-label-short">
                {props.titlesShort[p.index]}
              </div>
            )}
          </div>
        );
      }}
      renderThumb={(p) => <div {...p.props} className="range-thumb" />}
    />
  );
};
