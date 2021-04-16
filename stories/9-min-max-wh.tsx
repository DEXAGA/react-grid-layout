import _ from "lodash";
import React from "react";
import RGL from '../lib/ReactGridLayout';

const ReactGridLayout = RGL;

const MinMaxLayout = (props) => {
  return (
          <div style={{
            height: `100%`
          }}>
            <ReactGridLayout onLayoutChange={(layout) => {
              props.onLayoutChange(layout);
            }} {...props}>
              {_.map(_.map(new Array(props.items), (item, i) => {
                const minW = _.random(1, 6),
                        minH = _.random(1, 6);
                const maxW = _.random(minW, 6),
                        maxH = _.random(minH, 6);
                const w = _.random(minW, maxW);
                const y = _.random(minH, maxH);
                return {
                  x: (i * 2) % 12,
                  y: Math.floor(i / 6) * y,
                  w,
                  h: y,
                  i: i.toString(),
                  minW,
                  maxW,
                  minH,
                  maxH
                };
              }), l => {
                const mins = [l.minW, l.minH],
                        maxes = [l.maxW, l.maxH];
                return (
                        <div key={l.i}
                             data-grid={l}>
                          <span className="text">{l.i}</span>
                          <div className="minMax">{"min:" + mins + " - max:" + maxes}</div>
                        </div>
                );
              })}
            </ReactGridLayout>
          </div>
  );
}

MinMaxLayout.defaultProps = {
  isDraggable: true,
  isResizable: true,
  items: 20,
  rowHeight: 30,
  onLayoutChange: function() {
  },
  cols: 12
};


export default MinMaxLayout
